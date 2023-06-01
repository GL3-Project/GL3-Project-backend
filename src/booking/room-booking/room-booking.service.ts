import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { UserService } from '@user/user.service';
import {
  CreateRoomBookingDto,
  RoomBookingDocument,
  RoomBookingModel,
} from '@booking/room-booking';
import { UserBookingService } from '@booking/user-booking';
import { AccommodationService } from '@accommodation/accommodation.service';
import { BookingStatus } from '@booking/booking.schema';
import { PopulatedUserDocument } from '@user/schema';

@Injectable()
export class RoomBookingService {
  constructor(
    @InjectModel('RoomBooking', 'default')
    private readonly roomBookingModel: RoomBookingModel,
    private readonly accommodationService: AccommodationService,
    @Inject(forwardRef(() => UserBookingService))
    private readonly userBookingService: UserBookingService,
    private readonly userService: UserService,
  ) {}

  async getRoomBooking(
    bookingId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<RoomBookingDocument> {
    const booking = await this.roomBookingModel
      .findById(bookingId, {}, { session })
      .exec();

    // null safety
    if (booking === null) throw new NotFoundException('Booking not found');
    else return booking;
  }

  // async populateRoomBooking(
  //   booking: RoomBookingDocument,
  //   session?: ClientSession,
  // ): Promise<PopulatedRoomBookingDocument> {
  //   booking.roommates = await this.userService.findAllUsers(
  //     { _id: { $in: booking.roommates } },
  //     session,
  //   );
  //
  //   return booking;
  // }

  async createRoomBooking(
    roomBookingData: CreateRoomBookingDto,
    session?: ClientSession,
  ): Promise<RoomBookingDocument> {
    // integrity check
    const hotel = await this.accommodationService.getHotel(
      roomBookingData.hotelId,
      session,
    );

    if (hotel === undefined)
      throw new BadRequestException('Incorrect hotel id');

    if (
      hotel.rooms[roomBookingData.roomType.name]?.count -
        hotel.rooms[roomBookingData.roomType.name]?.bookings.length <=
      0
    )
      throw new BadRequestException('No more left rooms of that type');

    const room = hotel.rooms[roomBookingData.roomType.name]?.type;

    if (
      room === undefined ||
      room.capacity !== roomBookingData.roomType.capacity ||
      room.price !== roomBookingData.roomType.price
    )
      throw new BadRequestException('Incorrect room info');

    return await this.roomBookingModel
      .create(
        [
          {
            ...roomBookingData,
            status: BookingStatus.in_progress,
            price: roomBookingData.roomType.price,
          },
        ],
        { session },
      )
      .then((roomBooking) => roomBooking[0]);
  }

  async createRoomBookings(
    data: CreateRoomBookingDto[],
    session?: ClientSession,
  ): Promise<RoomBookingDocument[]> {
    const allHotels = await this.accommodationService.getAllHotels(session);

    // integrity check
    for (let i = 0; i < data.length; i++) {
      const hotel = allHotels.find((hotel) =>
        hotel._id.equals(data[i].hotelId),
      );

      if (hotel === undefined)
        throw new BadRequestException('Incorrect hotel id');

      if (hotel.rooms.get(data[i].roomType.name)?.count === 0)
        throw new BadRequestException('No more rooms available');

      const room = hotel.rooms.get(data[i].roomType.name)?.type;

      if (
        room === undefined ||
        room.capacity !== data[i].roomType.capacity ||
        room.price !== data[i].roomType.price
      )
        throw new BadRequestException('Incorrect room info');
    }

    return await this.roomBookingModel.create(
      data.map((roomBookingData) => ({
        ...roomBookingData,
        status: BookingStatus.in_progress,
        price: roomBookingData.roomType.price,
      })),
      {
        session,
      },
    );
  }

  async addRoommate(
    roomBookingId: Types.ObjectId,
    roommate: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    const roommateBooking =
      await this.userBookingService.getUserBookingByUserId(
        roommate._id,
        session,
      );

    if (roommateBooking.roomBooking !== undefined)
      throw new BadRequestException('User already is booked in a room');
    roommateBooking.roomBooking = roomBookingId;

    // add roommate to booking
    const roomBooking = await this.getRoomBooking(roomBookingId, session);
    roomBooking.addRoommate(roommate._id);

    // persist changes
    await roomBooking.save({ session });
    await roommateBooking.save({ session });
  }

  async transferRoommate(
    fromBookingId: Types.ObjectId,
    toBookingId: Types.ObjectId,
    roommate: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    // remove roommate from source booking
    await this.userBookingService
      .getPopulatedUserBooking(fromBookingId, session)
      .then((booking) => {
        if (booking.roomBooking === undefined)
          throw new BadRequestException('One of the users is not booked in');

        booking.roomBooking.removeRoommate(roommate._id);
        booking.roomBooking.save({ session });
        booking.save({ session });
      });

    // add roommate to destination booking
    await this.userBookingService
      .getPopulatedUserBooking(toBookingId, session)
      .then((booking) => {
        if (booking.roomBooking === undefined)
          throw new BadRequestException('One of the users is not booked in');

        booking.roomBooking.addRoommate(roommate._id);
        booking.roomBooking.save({ session });
        booking.save({ session });
      });

    // update roommate's booking
    await this.userService.updateUser(
      { _id: roommate },
      { booking: toBookingId },
      session,
    );
  }

  async exchangeRoommates(
    roommate1: PopulatedUserDocument,
    roommate2: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    const removeRoommate = async (roommateId: Types.ObjectId) => {
      return await this.userBookingService
        .getPopulatedUserBookingByUserId(roommateId, session)
        .then((booking) => {
          if (booking.roomBooking === undefined)
            throw new NotFoundException('One of the users is not booked in');

          booking.roomBooking.removeRoommate(roommateId);
          return {
            saveBooking: booking.save,
            addToBooking: booking.roomBooking.addRoommate,
            bookingId: booking._id,
          };
        });
    };

    // remove roommate 1 from booking 1 and get their already paid money
    const {
      saveBooking: saveBooking1,
      addToBooking: addToBooking1,
      bookingId: bookingId1,
    } = await removeRoommate(roommate1._id);

    // remove roommate 2 from booking 2 and get their already paid money
    const {
      saveBooking: saveBooking2,
      addToBooking: addToBooking2,
      bookingId: bookingId2,
    } = await removeRoommate(roommate2._id);

    // update bookings
    addToBooking1(roommate2._id);
    addToBooking2(roommate1._id);

    // update roommates' bookings
    await this.userService.updateUser(
      { _id: roommate1 },
      { booking: bookingId2 },
      session,
    );
    await this.userService.updateUser(
      { _id: roommate2 },
      { booking: bookingId1 },
      session,
    );

    // persist changes
    // saving parent document also saves populated documents
    await saveBooking1({ session });
    await saveBooking2({ session });
  }

  async removeRoommate(
    roommate: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    // get booking & room booking
    const booking =
      await this.userBookingService.getPopulatedUserBookingByUserId(
        roommate._id,
        session,
      );

    // null safety
    if (booking.roomBooking === undefined)
      throw new BadRequestException('User has left his room');

    // remove roommate from room booking
    if (booking.roomBooking.roommates.length > 1) {
      booking.roomBooking.removeRoommate(roommate._id);
      booking.roomBooking.save({ session });
    } else {
      // remove room booking if no one is left
      await this.roomBookingModel
        .findByIdAndDelete(booking.roomBooking, {
          session,
        })
        .exec();
    }

    // remove room booking from booking
    booking.roomBooking = undefined;

    // persist changes
    await booking.save({ session });
  }

  async removeRoomBooking(
    roomBookingId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    await this.roomBookingModel
      .findByIdAndDelete(roomBookingId, { session })
      .exec();
  }

  async completeRoomBooking(
    roomBooking: RoomBookingDocument,
    session: ClientSession,
  ) {
    await this.accommodationService.addBooking(
      roomBooking._id,
      roomBooking.hotelId,
      roomBooking.roomType.name,
      session,
    );
    roomBooking.complete();
    await roomBooking.save({ session });
  }
}

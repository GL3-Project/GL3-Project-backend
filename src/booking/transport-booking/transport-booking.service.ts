import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import {
  CreateTransportBookingDto,
  ITransportBooking,
  TransportBookingDocument,
  TransportBookingDto,
  TransportBookingModel,
} from '@booking/transport-booking';
import { BookingStatus } from '@booking/booking.schema';
import { UserBookingService } from '@booking/user-booking';
import { TransportService } from '@transport/transport.service';
import { PopulatedUserDocument } from '@user/schema';

@Injectable()
export class TransportBookingService {
  constructor(
    @InjectModel('TransportBooking', 'default')
    private readonly transportBookingModel: TransportBookingModel,
    private readonly transportService: TransportService,
    @Inject(forwardRef(() => UserBookingService))
    private readonly userBookingService: UserBookingService,
  ) {}

  async getTransportBooking(
    bookingId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<TransportBookingDocument> {
    const booking = await this.transportBookingModel
      .findById(bookingId, {}, { session })
      .exec();

    // null safety
    if (booking === null) throw new NotFoundException('Booking not found');
    else return booking;
  }

  async getAllTransportBookings(
    session?: ClientSession,
  ): Promise<TransportBookingDocument[]> {
    return await this.transportBookingModel.find({}, {}, { session }).exec();
  }

  async findTransportBooking(
    conditions: FilterQuery<ITransportBooking>,
    session?: ClientSession,
  ): Promise<TransportBookingDocument> {
    const booking = await this.transportBookingModel
      .findOne(conditions, {}, { session })
      .exec();

    // null safety
    if (booking === null) throw new NotFoundException('Booking not found');
    else return booking;
  }

  async findAllTransportBookings(
    conditions: FilterQuery<ITransportBooking>,
    session?: ClientSession,
  ): Promise<TransportBookingDocument[]> {
    return await this.transportBookingModel
      .find(conditions, {}, { session })
      .exec();
  }

  async createTransportBooking(
    transportBookingData: CreateTransportBookingDto,
    session?: ClientSession,
  ): Promise<TransportBookingDocument> {
    const transport = await this.transportService.getTransport(
      transportBookingData.transportId,
      session,
    );

    // integrity check
    if (transport === undefined)
      throw new BadRequestException('Incorrect transport id');

    return await this.transportBookingModel
      .create(
        [
          {
            ...transportBookingData,
            status: BookingStatus.in_progress,
            price: transport.fees,
          },
        ],
        { session },
      )
      .then((transportBooking) => transportBooking[0]);
  }

  async createTransportBookings(
    data: CreateTransportBookingDto[],
    session?: ClientSession,
  ): Promise<TransportBookingDocument[]> {
    const allTransports = await this.transportService.getAllTransports(session);

    return await this.transportBookingModel.create(
      data.map((transportBookingData) => {
        const transport = allTransports.find((transport) =>
          transport._id.equals(transportBookingData.transportId),
        );

        // integrity check
        if (transport === undefined)
          throw new BadRequestException('Incorrect transport id');

        return {
          ...transportBookingData,
          status: BookingStatus.in_progress,
          price: transport.fees,
        };
      }),
      { session },
    );
  }

  async addPassenger(
    data: TransportBookingDto,
    user: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    const booking =
      await this.userBookingService.getPopulatedUserBookingByUserId(user._id);

    // mark user as booked in
    if (booking.transportBooking !== undefined)
      throw new BadRequestException(
        'User has already booked in for a transport',
      );
    else
      booking.transportBooking = new this.transportBookingModel({
        transportId: data.transportId,
        status: BookingStatus.in_progress,
      });

    // persist changes
    await booking.transportBooking.save({ session });
    await booking.save({ session });
  }

  async transferPassenger(
    passenger: PopulatedUserDocument,
    transportId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    const booking =
      await this.userBookingService.getPopulatedUserBookingByUserId(
        passenger._id,
        session,
      );

    // update passenger transport
    if (
      await this.transportService
        .getTransport(transportId, session)
        .then((transport) => transport.isFull())
    )
      throw new BadRequestException('Transport is full');
    else if (booking.transportBooking === undefined)
      throw new BadRequestException('User did not book in for a transport');
    booking.transportBooking.transportId = transportId;

    // persist changes
    await booking.transportBooking.save({ session });
    await booking.save({ session });
  }

  async exchangePassengers(
    passenger1: PopulatedUserDocument,
    passenger2: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    const populateBooking = async (passengerId: Types.ObjectId) => {
      return await this.userBookingService
        .getPopulatedUserBookingByUserId(passengerId, session)
        .then((booking) => {
          if (booking.transportBooking === undefined)
            throw new BadRequestException(
              'One of the users did not book in for a transport',
            );
          return {
            saveBooking: booking.save,
            updateBooking: (transportId: Types.ObjectId) =>
              (booking.transportBooking!.transportId = transportId),
            transportId: booking.transportBooking.transportId,
          };
        });
    };

    const {
      saveBooking: saveBooking1,
      updateBooking: updateBooking1,
      transportId: transportId1,
    } = await populateBooking(passenger1._id);

    const {
      saveBooking: saveBooking2,
      updateBooking: updateBooking2,
      transportId: transportId2,
    } = await populateBooking(passenger2._id);

    // update transport bookings
    updateBooking1(transportId2);
    updateBooking2(transportId1);

    // persist changes
    await saveBooking1({ session });
    await saveBooking2({ session });
  }

  async removePassenger(
    passenger: PopulatedUserDocument,
    session?: ClientSession,
  ): Promise<void> {
    if (passenger.booking === undefined)
      throw new BadRequestException('User is not booked in');

    // remove transport booking
    await this.transportBookingModel
      .findByIdAndDelete(passenger.booking.transportBooking, { session })
      .exec();

    // remove transport booking from booking
    passenger.booking.transportBooking = undefined;

    // persist changes
    await passenger.booking.save({ session });
    await passenger.save({ session });
  }

  async removeTransportBooking(
    transportBookingId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await this.transportBookingModel
      .findByIdAndDelete(transportBookingId, { session })
      .exec();
  }

  async completeTransportBooking(
    transportBooking: TransportBookingDocument,
    session: ClientSession,
  ) {
    await this.transportService.addPassenger(
      transportBooking.userId,
      transportBooking.transportId,
      session,
    );
    transportBooking.complete();
    await transportBooking.save({ session });
  }
}

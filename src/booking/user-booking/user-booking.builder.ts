import { ClientSession, Types } from 'mongoose';
import { RoomType } from '@accommodation/schema';
import { TransportService } from '@transport/transport.service';
import { UserService } from '@user/user.service';
import { BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PopulatedUserBookingDocument,
  UserBooking,
  UserBookingModel,
} from '@booking/user-booking/schema/user-booking.schema';
import { WorkshopBookingService } from '@booking/workshop-booking';
import { RoomBookingService } from '@booking/room-booking';
import { BookingStatus } from '@booking/booking.schema';
import { TransportBookingService } from '@booking/transport-booking';
import { UserDocument } from '@user/schema';

export class UserBookingBuilder {
  private _user: UserDocument;
  private _userBooking: PopulatedUserBookingDocument;
  private _session: ClientSession;

  constructor(
    @InjectModel(UserBooking.name, 'default')
    private readonly userBookingModel: UserBookingModel,
    @Inject(forwardRef(() => RoomBookingService))
    private readonly roomBookingService: RoomBookingService,
    @Inject(forwardRef(() => TransportBookingService))
    private readonly transportBookingService: TransportBookingService,
    @Inject(forwardRef(() => WorkshopBookingService))
    private readonly workshopBookingService: WorkshopBookingService,
    private readonly transportService: TransportService,
    private readonly userService: UserService,
  ) {}

  async initialize(user: UserDocument, session: ClientSession) {
    this._userBooking = await this.userBookingModel
      .findOneAndUpdate<PopulatedUserBookingDocument>(
        { _id: new Types.ObjectId() },
        {
          userId: user._id,
          price: UserBooking.price,
          status: BookingStatus.in_progress,
        },
        {
          session,
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          populate: [
            { path: 'roomBooking' },
            { path: 'transportBooking' },
            { path: 'workshopBooking' },
          ],
        },
      )
      .exec();
    this._session = session;
    this._user = user;

    return this._userBooking;
  }

  async bookTransport(transportId: Types.ObjectId) {
    this._userBooking.transportBooking =
      await this.transportBookingService.createTransportBooking({
        transportId,
      });

    return this._userBooking;
  }

  async bookWorkshops(workshopIds: (Types.ObjectId | undefined)[]) {
    const [workshopsBooking] =
      await this.workshopBookingService.createWorkshopBookings([
        { workshopIds },
      ]);
    this._userBooking.workshopBooking = workshopsBooking;
    return this._userBooking;
  }

  async bookRoom(
    roommates: Types.ObjectId[],
    hotelId: Types.ObjectId,
    roomType: RoomType,
  ) {
    const populatedRoommates = await this.userService.findAllPopulatedUsers(
      { _id: { $in: roommates } },
      this._session,
    );
    if (populatedRoommates.find((roommate) => !!roommate.booking?.roomBooking))
      throw new BadRequestException(
        'One of the roommates is already in another room',
      );

    this._userBooking.roomBooking =
      await this.roomBookingService.createRoomBooking({
        roommates,
        hotelId,
        roomType,
      });

    return this._userBooking;
  }

  async get(): Promise<PopulatedUserBookingDocument> {
    await this._userBooking.save({ session: this._session });
    this._user.booking = this._userBooking._id;
    await this._user.save({ session: this._session });
    return this._userBooking;
  }
}

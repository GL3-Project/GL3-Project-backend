import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import {
  WorkshopBooking,
  WorkshopBookingDocument,
  WorkshopBookingDto,
  WorkshopBookingModel,
} from '@booking/workshop-booking';
import { UserBookingService } from '@booking/user-booking';
import { BookingStatus } from '@booking/booking.schema';
import { ConfigService } from '@nestjs/config';
import { NcscConfig } from '@config/ncsc.config';
import { WorkshopService } from '@workshop/workshop.service';
import { WorkshopDocument } from '@workshop/schema';
import { PopulatedUserDocument } from '@user/schema';

@Injectable()
export class WorkshopBookingService {
  constructor(
    @InjectModel('WorkshopBooking', 'default')
    private readonly workshopBookingModel: WorkshopBookingModel,
    private readonly workshopService: WorkshopService,
    @Inject(forwardRef(() => UserBookingService))
    private readonly userBookingService: UserBookingService,
    private readonly configService: ConfigService,
  ) {
    WorkshopBooking.price =
      configService.getOrThrow<NcscConfig>('ncsc').pricePool.workshop;
  }

  async getWorkshopBooking(
    bookingId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<WorkshopBookingDocument> {
    const booking = await this.workshopBookingModel
      .findById(bookingId, {}, { session })
      .exec();

    // null safety
    if (booking === null) throw new NotFoundException('Booking not found');
    else return booking;
  }

  async getAllWorkshopBookings(
    session?: ClientSession,
  ): Promise<WorkshopBookingDocument[]> {
    return await this.workshopBookingModel.find({}, {}, { session }).exec();
  }

  async createWorkshopBooking(
    workshopBookingData: WorkshopBookingDto,
    session?: ClientSession,
  ): Promise<WorkshopBookingDocument> {
    const allWorkshops = await this.workshopService.getAllWorkshops(session);

    workshopBookingData.workshopIds.forEach((workshopId, i) => {
      if (workshopId !== undefined) {
        const workshop = allWorkshops.find((workshop) =>
          workshop._id.equals(workshopId),
        );

        if (workshop === undefined)
          throw new BadRequestException('Incorrect workshop id');

        if (workshop.groupId !== i)
          throw new BadRequestException('Incorrect group id');

        if (!workshop._id.equals(workshopId) && workshop.isFull())
          throw new BadRequestException('Workshop is full');
      }
    });

    return await this.workshopBookingModel
      .create(
        [
          {
            ...workshopBookingData,
            status: BookingStatus.in_progress,
            price: WorkshopBooking.price,
          },
        ],
        { session },
      )
      .then((workshopBookings) => workshopBookings[0]);
  }

  async createWorkshopBookings(
    data: WorkshopBookingDto[],
    session?: ClientSession,
  ): Promise<WorkshopBookingDocument[]> {
    const allWorkshops = await this.workshopService.getAllWorkshops(session);

    data.forEach((workshopBookingData) => {
      workshopBookingData.workshopIds.forEach((workshopId, i) => {
        if (workshopId !== undefined) {
          const workshop = allWorkshops.find((workshop) =>
            workshop._id.equals(workshopId),
          );

          if (workshop === undefined)
            throw new BadRequestException('Incorrect workshop id');

          if (workshop.groupId !== i)
            throw new BadRequestException('Incorrect group id');

          if (!workshop._id.equals(workshopId) && workshop.isFull())
            throw new BadRequestException('Workshop is full');
        }
      });
    });

    return await this.workshopBookingModel.create(
      data.map((workshopBookingData) => ({
        ...workshopBookingData,
        status: BookingStatus.in_progress,
        price: WorkshopBooking.price,
      })),
      { session },
    );
  }

  async addParticipant(
    data: WorkshopBookingDto,
    user: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    const booking =
      await this.userBookingService.getPopulatedUserBookingByUserId(user._id);

    // mark user as booked in
    if (booking.workshopBooking !== undefined)
      throw new BadRequestException(
        'User has already booked in for a workshop',
      );
    else {
      const allWorkshops = await this.workshopService.findAllWorkshops(
        {},
        session,
      );

      // todo: verify length of workshopIds

      for (let i = 0; i < data.workshopIds.length; i++) {
        const workshopId = data.workshopIds[i];
        if (workshopId !== undefined) {
          const workshop = allWorkshops.find((workshop) =>
            workshop._id.equals(workshopId),
          );
          if (workshop === undefined)
            throw new BadRequestException('Incorrect workshop id');
          else if (workshop.groupId !== i) {
            throw new BadRequestException('Incorrect workshop group id');
          }
        }
      }

      booking.workshopBooking = new this.workshopBookingModel({
        workshopIds: data.workshopIds,
        status: BookingStatus.in_progress,
        price: WorkshopBooking.price,
      });
    }

    // persist changes
    await booking.workshopBooking.save({ session });
    await booking.save({ session });
  }

  async transfersParticipant(
    passenger: PopulatedUserDocument,
    newWorkshopIds: (Types.ObjectId | undefined)[],
    session?: ClientSession,
  ) {
    const booking =
      await this.userBookingService.getPopulatedUserBookingByUserId(
        passenger._id,
        session,
      );

    // verify if user is booked in
    if (booking.workshopBooking === undefined)
      throw new BadRequestException('User did not book in for a workshop');

    // data integrity check
    if (newWorkshopIds.length !== booking.workshopBooking.workshopIds.length)
      throw new BadRequestException('Incorrect number of chosen workshops');

    const allWorkshops = await this.workshopService.findAllWorkshops(
      {},
      session,
    );

    // check integrity of data & change workshop
    for (let i = 0; i < newWorkshopIds.length; i++) {
      const workshopId = newWorkshopIds[i];

      if (workshopId !== undefined) {
        const newWorkshop = allWorkshops.find((workshop) =>
          workshop._id.equals(workshopId),
        );

        if (newWorkshop === undefined)
          throw new BadRequestException('Incorrect workshop id');

        booking.workshopBooking.changeWorkshop(i, newWorkshop);
      } else {
        booking.workshopBooking.changeWorkshop(i, undefined);
      }

      // persist changes
      await booking.workshopBooking.save({ session });
      await booking.save({ session });
    }
  }

  async transferParticipant(
    passenger: PopulatedUserDocument,
    groupId: number,
    newWorkshopId: Types.ObjectId | undefined,
    session?: ClientSession,
  ): Promise<void> {
    const booking =
      await this.userBookingService.getPopulatedUserBookingByUserId(
        passenger._id,
        session,
      );

    // verify if user is booked in
    if (booking.workshopBooking === undefined)
      throw new BadRequestException('User did not book in for a workshop');

    // check integrity of data & change workshop
    if (newWorkshopId !== undefined) {
      const newWorkshop = await this.workshopService.getWorkshop(
        newWorkshopId,
        session,
      );

      if (newWorkshop === undefined)
        throw new BadRequestException('Incorrect workshop id');

      booking.workshopBooking.changeWorkshop(groupId, newWorkshop);
    } else {
      booking.workshopBooking.changeWorkshop(groupId, undefined);
    }

    // persist changes
    await booking.workshopBooking.save({ session });
    await booking.save({ session });
  }

  async exchangeParticipants(
    participant1: PopulatedUserDocument,
    participant2: PopulatedUserDocument,
    groupId: number,
    session: ClientSession,
  ): Promise<void> {
    const populateBooking = async (participantId: Types.ObjectId) => {
      return await this.userBookingService
        .getPopulatedUserBookingByUserId(participantId, session)
        .then((booking) => {
          if (booking.workshopBooking === undefined)
            throw new BadRequestException(
              'One of the users did not book in for the workshop',
            );

          if (booking.workshopBooking.workshopIds.length <= groupId)
            throw new BadRequestException('Incorrect groupId');

          return booking;
        })
        .then(async (booking) => ({
          saveBooking: () => {
            booking.workshopBooking!.save({ session });
            booking.save({ session });
          },
          workshop: await this.workshopService.getWorkshop(
            booking.workshopBooking!.workshopIds[groupId]!._id,
            session,
          ),
          updateBooking: (newWorkshop: WorkshopDocument | undefined) =>
            booking.workshopBooking!.changeWorkshop(groupId, newWorkshop),
        }));
    };

    const {
      saveBooking: saveBooking1,
      workshop: workshop1,
      updateBooking: updateBooking1,
    } = await populateBooking(participant1._id);
    const {
      saveBooking: saveBooking2,
      workshop: workshop2,
      updateBooking: updateBooking2,
    } = await populateBooking(participant2._id);

    // update participants' workshop bookings
    updateBooking1(workshop2);
    updateBooking2(workshop1);

    // persist changes
    await saveBooking1();
    await saveBooking2();
  }

  async removeParticipant(
    participant: PopulatedUserDocument,
    session?: ClientSession,
  ): Promise<void> {
    if (participant.booking === undefined)
      throw new BadRequestException('User is not booked in');

    // remove workshop booking
    await this.workshopBookingModel
      .findByIdAndDelete(participant.booking.workshopBooking, { session })
      .exec();

    // remove workshop booking from booking
    participant.booking.workshopBooking = undefined;

    // persist changes
    await participant.booking.save({ session });
    await participant.save({ session });
  }

  async removeWorkshopBooking(
    workshopBookingId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<void> {
    await this.workshopBookingModel
      .findByIdAndDelete(workshopBookingId, { session })
      .exec();
  }

  async completeWorkshopBooking(
    workshopBooking: WorkshopBookingDocument,
    session: ClientSession,
  ) {
    workshopBooking.workshopIds.forEach((workshop) => {
      if (workshop)
        this.workshopService.addParticipant(
          workshopBooking.userId,
          workshop,
          session,
        );
    });
    workshopBooking.complete();
    await workshopBooking.save({ session });
  }
}

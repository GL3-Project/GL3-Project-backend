import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import { CreateWorkshopDto } from '@workshop/dto/create-workshop.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  IWorkshop,
  Workshop,
  WorkshopDocument,
  WorkshopModel,
} from '@workshop/schema';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectModel(Workshop.name, 'default')
    private readonly workshopModel: WorkshopModel,
  ) {}

  async findWorkshop(
    conditions: FilterQuery<IWorkshop>,
    session?: ClientSession,
  ): Promise<WorkshopDocument> {
    const workshop = await this.workshopModel
      .findById(conditions, {}, { session })
      .exec();

    // null safety
    if (workshop === null) throw new NotFoundException('Workshop not found');
    else return workshop;
  }

  async findAllWorkshops(
    conditions: FilterQuery<WorkshopDocument>,
    session?: ClientSession,
  ): Promise<WorkshopDocument[]> {
    return await this.workshopModel.find(conditions, {}, { session }).exec();
  }

  async getWorkshop(
    workshopId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<WorkshopDocument> {
    const workshop = await this.workshopModel
      .findById(workshopId, {}, { session })
      .exec();

    // null safety
    if (workshop === null) throw new NotFoundException('Workshop not found');
    else return workshop;
  }

  async getAllWorkshops(session?: ClientSession): Promise<WorkshopDocument[]> {
    return await this.workshopModel.find({}, {}, { session }).exec();
  }

  async addWorkshops(
    workshopData: CreateWorkshopDto[],
    session?: ClientSession,
  ): Promise<WorkshopDocument[]> {
    return await this.workshopModel.create(workshopData, { session });
  }

  async changeWorkshopMetaData(
    workshopId: Types.ObjectId,
    toUpdate: Omit<IWorkshop, 'participants'>,
    session?: ClientSession,
  ): Promise<WorkshopDocument> {
    const updatedWorkshop = await this.workshopModel
      .findByIdAndUpdate(workshopId, toUpdate, { session })
      .exec();

    // null safety
    if (updatedWorkshop === null)
      throw new NotFoundException('Workshop not found');
    else return updatedWorkshop;
  }

  async addParticipant(
    participantId: Types.ObjectId,
    workshopId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<WorkshopDocument> {
    const workshop = await this.getWorkshop(workshopId, session);

    // add participant id to workshop
    workshop.addParticipant(participantId);

    // save changes
    return await workshop.save({ session });
  }

  async removeParticipant(
    participantId: Types.ObjectId,
    workshopId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<WorkshopDocument> {
    const workshop = await this.getWorkshop(workshopId, session);

    // remove participant id from workshop
    const index = workshop.participants.findIndex((id) =>
      id.equals(participantId),
    );
    workshop.participants.splice(index, 1);

    // save changes
    return await workshop.save({ session });
  }

  async transferWorkshop(
    fromWorkshopId: Types.ObjectId,
    toWorkshopId: Types.ObjectId,
    participantId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    // remove participant from source workshop
    const { saveFromWorkshop } = await this.getWorkshop(
      fromWorkshopId,
      session,
    ).then((workshop) => {
      const index = workshop.participants.findIndex((id) =>
        id.equals(participantId),
      );

      // null safety
      if (index === -1) throw new NotFoundException('Workshop not found');

      workshop.participants.splice(index, 1);

      return { saveFromWorkshop: workshop.save };
    });

    // add participant to destination workshop
    const { saveToWorkshop } = await this.getWorkshop(
      toWorkshopId,
      session,
    ).then((workshop) => {
      workshop.addParticipant(participantId);
      return { saveToWorkshop: workshop.save };
    });

    // persist changes
    await saveToWorkshop({ session });
    await saveFromWorkshop({ session });
  }

  async exchangeWorkshops(
    workshopId1: Types.ObjectId,
    participantId1: Types.ObjectId,
    workshopId2: Types.ObjectId,
    participantId2: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    // remove participant 1 from workshop 1 and get their already paid money
    const { saveWorkshop: saveWorkshop1, addToWorkshop: addToWorkshop1 } =
      await this.getWorkshop(workshopId1, session).then((workshop) => {
        const index = workshop.participants.findIndex((id) =>
          id.equals(participantId1),
        );

        // null safety
        if (index === -1) throw new NotFoundException('Workshop not found');

        workshop.participants.splice(index, 1);

        return {
          saveWorkshop: workshop.save,
          addToWorkshop: workshop.addParticipant,
        };
      });

    // remove participant 2 from workshop 2 and get their already paid money
    const { saveWorkshop: saveWorkshop2, addToWorkshop: addToWorkshop2 } =
      await this.getWorkshop(workshopId2, session).then((workshop) => {
        const index = workshop.participants.findIndex((id) =>
          id.equals(participantId2),
        );

        // null safety
        if (index === -1) throw new NotFoundException('Workshop not found');

        workshop.participants.splice(index, 1);

        return {
          saveWorkshop: workshop.save,
          addToWorkshop: workshop.participants.push,
        };
      });

    // update workshops
    addToWorkshop1(participantId2);
    addToWorkshop2(participantId1);

    // persist changes
    await saveWorkshop1({ session });
    await saveWorkshop2({ session });
  }

  async removeWorkshop(
    workshopId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<WorkshopDocument> {
    const workshop = await this.workshopModel
      .findByIdAndDelete(workshopId, { session })
      .exec();

    // null safety
    if (workshop === null) throw new NotFoundException('Workshop not found');
    else return workshop;
  }

  async removeAllWorkshops(session?: ClientSession): Promise<void> {
    await this.workshopModel.deleteMany({}, { session }).exec();
  }
}

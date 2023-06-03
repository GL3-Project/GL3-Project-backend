import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ITransport,
  Transport,
  TransportDocument,
  TransportModel,
} from '@transport/schema';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import { CreateTransportDto } from '@transport/dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TransportService {
  constructor(
    @InjectModel(Transport.name, 'default')
    private readonly transportModel: TransportModel,
  ) {}

  async getAllTransports(
    session?: ClientSession,
  ): Promise<TransportDocument[]> {
    return await this.transportModel.find({}, {}, { session }).exec();
  }

  async getTransport(
    transportId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<TransportDocument> {
    const transport = await this.transportModel
      .findById(transportId, {}, { session })
      .exec();

    // null safety
    if (transport === null) throw new NotFoundException('Transport not found');
    else return transport;
  }

  async findTransport(
    conditions: FilterQuery<ITransport>,
    session?: ClientSession,
  ): Promise<TransportDocument> {
    const transport = await this.transportModel
      .findOne(conditions, {}, { session })
      .exec();

    // null safety
    if (transport === null) throw new NotFoundException('Transport not found');
    else return transport;
  }

  async findAllTransports(
    conditions: FilterQuery<ITransport>,
    session?: ClientSession,
  ): Promise<TransportDocument[]> {
    return await this.transportModel.find(conditions, {}, { session }).exec();
  }

  async addTransports(
    transportData: CreateTransportDto[],
    session?: ClientSession,
  ): Promise<TransportDocument[]> {
    return await this.transportModel.create(transportData, { session });
  }

  async changeTransportMetaData(
    transportId: Types.ObjectId,
    toUpdate: Omit<ITransport, 'passengers'>,
    session?: ClientSession,
  ): Promise<TransportDocument> {
    const updatedTransport = await this.transportModel
      .findByIdAndUpdate(transportId, toUpdate, { session })
      .exec();

    // null safety
    if (updatedTransport === null)
      throw new NotFoundException('Transport not found');
    else return updatedTransport;
  }

  async addPassenger(
    passengerId: Types.ObjectId,
    transportId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<TransportDocument> {
    const transport = await this.getTransport(transportId, session);

    // add passenger id to passengers
    transport.addPassenger(passengerId);

    // save changes
    return await transport.save({ session });
  }

  async removePassenger(
    passengerId: Types.ObjectId,
    transportId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<TransportDocument> {
    const transport = await this.getTransport(transportId, session);

    // remove passenger id from passengers
    transport.removePassenger(passengerId);

    // save changes
    return await transport.save({ session });
  }

  async transferPassenger(
    fromTransportId: Types.ObjectId,
    toTransportId: Types.ObjectId,
    passengerId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    // remove passenger from source transport
    const { saveFromTransport } = await this.getTransport(
      fromTransportId,
      session,
    ).then((transport) => {
      const index = transport.passengers.findIndex((id) =>
        id.equals(passengerId),
      );

      // null safety
      if (index === -1) throw new NotFoundException('Passenger not found');

      transport.passengers.splice(index, 1);

      return { saveFromTransport: transport.save };
    });

    // add passenger to destination transport
    const { saveToTransport } = await this.getTransport(
      toTransportId,
      session,
    ).then((transport) => {
      transport.passengers.push(passengerId);
      return { saveToTransport: transport.save };
    });

    // persist changes
    await saveToTransport({ session });
    await saveFromTransport({ session });
  }

  async exchangePassengers(
    transportId1: Types.ObjectId,
    passengerId1: Types.ObjectId,
    transportId2: Types.ObjectId,
    passengerId2: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    // remove passenger 1 from transport 1 and get their already paid money
    const { saveTransport: saveTransport1, addToTransport: addToTransport1 } =
      await this.getTransport(transportId1, session).then((transport) => {
        const index = transport.passengers.findIndex((id) =>
          id.equals(passengerId1),
        );

        // null safety
        if (index === -1) throw new NotFoundException('Passenger not found');

        transport.passengers.splice(index, 1);

        return {
          saveTransport: transport.save,
          addToTransport: transport.passengers.push,
        };
      });

    // remove passenger 2 from transport 2 and get their already paid money
    const { saveTransport: saveTransport2, addToTransport: addToTransport2 } =
      await this.getTransport(transportId2, session).then((transport) => {
        const index = transport.passengers.findIndex(
          (id) => id === passengerId2,
        );

        // null safety
        if (index === -1) throw new NotFoundException('Passenger not found');

        transport.passengers.splice(index, 1);

        return {
          saveTransport: transport.save,
          addToTransport: transport.passengers.push,
        };
      });

    // update transports
    addToTransport1(passengerId2);
    addToTransport2(passengerId1);

    // persist changes
    await saveTransport1({ session });
    await saveTransport2({ session });
  }

  async removeTransport(
    transportId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<TransportDocument> {
    const transport = await this.transportModel
      .findByIdAndDelete(transportId, { session })
      .exec();

    // null safety
    if (transport === null) throw new NotFoundException('Transport not found');
    else return transport;
  }

  async removeAllTransports(session?: ClientSession): Promise<void> {
    await this.transportModel.deleteMany({}, { session }).exec();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHotelDto } from '@accommodation/dto';
import {
  Hotel,
  HotelDocument,
  HotelModel,
  IHotel,
} from '@accommodation/schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Types } from 'mongoose';

@Injectable()
export class AccommodationService {
  constructor(
    @InjectModel(Hotel.name, 'default') private readonly hotelModel: HotelModel,
  ) {}

  async getAllHotels(session?: ClientSession): Promise<HotelDocument[]> {
    return await this.hotelModel.find({}, {}, { session }).exec();
  }

  async getHotel(
    hotelId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    const hotel = await this.hotelModel
      .findById(hotelId, {}, { session })
      .exec();

    // null safety
    if (hotel === null) throw new NotFoundException('Hotel not found');
    else return hotel;
  }

  async findAllHotels(
    conditions: FilterQuery<IHotel>,
    session?: ClientSession,
  ): Promise<HotelDocument[]> {
    return await this.hotelModel.find(conditions, {}, { session }).exec();
  }

  async findHotel(
    conditions: FilterQuery<IHotel>,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    const hotel = await this.hotelModel
      .findOne(conditions, {}, { session })
      .exec();

    // null safety
    if (hotel === null) throw new NotFoundException('Hotel not found');
    else return hotel;
  }

  async addHotel(
    hotelData: CreateHotelDto,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    return await this.hotelModel
      .create([hotelData], { session })
      .then((hotels) => hotels[0]);
  }

  async addHotels(
    hotelData: CreateHotelDto[],
    session?: ClientSession,
  ): Promise<HotelDocument[]> {
    return await this.hotelModel.create(hotelData, { session });
  }

  async changeHotelMetaData(
    hotelId: Types.ObjectId,
    toUpdate: Omit<IHotel, 'rooms'>,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    const updatedHotel = await this.hotelModel
      .findByIdAndUpdate(hotelId, toUpdate, { session })
      .exec();

    // null safety
    if (updatedHotel === null) throw new NotFoundException('Hotel not found');
    else return updatedHotel;
  }

  async addBooking(
    bookingId: Types.ObjectId,
    hotelId: Types.ObjectId,
    roomType: string,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    const hotel = await this.getHotel(hotelId, session);

    // add booking id to bookings
    hotel.addBooking(bookingId, roomType);

    // save changes
    return await hotel.save({ session });
  }

  async removeBooking(
    bookingId: Types.ObjectId,
    hotelId: Types.ObjectId,
    roomType: string,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    const hotel = await this.getHotel(hotelId, session);

    // remove booking id from bookings
    hotel.removeBooking(bookingId, roomType);

    // save changes
    return await hotel.save({ session });
  }

  async removeHotel(
    hotelId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<HotelDocument> {
    const hotel = await this.hotelModel
      .findByIdAndDelete(hotelId, { session })
      .exec();

    // null safety
    if (hotel === null) throw new NotFoundException('Hotel not found');
    else return hotel;
  }

  async clearHotels(session?: ClientSession): Promise<void> {
    await this.hotelModel.deleteMany({}, { session }).exec();
  }
}

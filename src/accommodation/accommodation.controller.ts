import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateHotelDto, HotelDto } from '@accommodation/dto';
import { AccommodationService } from '@accommodation/accommodation.service';
import { Types } from 'mongoose';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { UserRole } from '@user/schema';
import { Role } from '@auth/decorator/role.decorator';
import { HotelDocument } from '@accommodation/schema';
import { AccommodationInterceptor } from '@accommodation/accommodation.interceptor';

@Controller('accommodation')
@UseJwtAuth()
@UseInterceptors(AccommodationInterceptor)
export class AccommodationController {
  constructor(private readonly accommodationService: AccommodationService) {}

  @Get('all')
  @Role(UserRole.participant)
  async getHotels(): Promise<HotelDto[]> {
    return await this.accommodationService.getAllHotels();
  }

  @Post('add')
  @Role(UserRole.admin)
  async addHotel(
    @Body(new ParseArrayPipe({ items: CreateHotelDto }))
    hotelData: CreateHotelDto[],
  ): Promise<HotelDocument[]> {
    return await this.accommodationService.addHotels(hotelData);
  }

  @Patch('update')
  @Role(UserRole.admin)
  async updateHotel(@Body() data: HotelDto): Promise<void> {
    await this.accommodationService.changeHotelMetaData(data._id, data);
  }

  @Delete('delete')
  @Role(UserRole.admin)
  async deleteHotel(@Body() hotelId: Types.ObjectId): Promise<void> {
    await this.accommodationService.removeHotel(hotelId);
  }

  @Delete('clear')
  @Role(UserRole.admin)
  async clearHotels(): Promise<void> {
    await this.accommodationService.clearHotels();
  }
}

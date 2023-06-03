import { Module } from '@nestjs/common';
import { AccommodationService } from './accommodation.service';
import { AccommodationController } from './accommodation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotel, HotelSchema } from '@accommodation/schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Hotel.name, schema: HotelSchema }],
      'default',
    ),
  ],
  providers: [AccommodationService],
  controllers: [AccommodationController],
  exports: [AccommodationService],
})
export class AccommodationModule {}

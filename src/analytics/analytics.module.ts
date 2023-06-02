import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UserModule } from '@user/user.module';
import { PaymentModule } from '@payment/payment.module';
import { BookingModule } from '@booking/booking.module';
import { AccommodationModule } from '@accommodation/accommodation.module';

@Module({
  imports: [UserModule, AccommodationModule, PaymentModule, BookingModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}

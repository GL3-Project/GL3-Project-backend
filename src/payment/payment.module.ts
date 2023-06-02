import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BookingModule } from '@booking/booking.module';
import { UserModule } from '@user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '@payment/schema/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Payment.name, schema: PaymentSchema }],
      'default',
    ),
    BookingModule,
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

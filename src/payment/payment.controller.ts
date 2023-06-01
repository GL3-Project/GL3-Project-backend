import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { PaymentService } from '@payment/payment.service';
import { Role } from '@auth/decorator/role.decorator';
import { PopulatedUserDocument, UserRole } from '@user/schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CreatePaymentDto } from '@payment/dto/create-payment.dto';

@Controller('payment')
@UseJwtAuth()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  @Get()
  @Role(UserRole.admin)
  async getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Post()
  @Role(UserRole.staff)
  async pay(
    @Body() data: CreatePaymentDto,
    @Req() { user }: { user: PopulatedUserDocument },
  ) {
    const session = await this.connection.startSession();
    let response;
    await session.withTransaction(async (session) => {
      response = await this.paymentService.pay(data, user, session);
    });
    return response;
  }
}

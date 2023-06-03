import { Controller, Get } from '@nestjs/common';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { Role } from '@auth/decorator/role.decorator';
import { UserRole } from '@user/schema';
import { AnalyticsService } from '@analytics/analytics.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('analytics')
@UseJwtAuth()
@Role(UserRole.admin)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  @Get()
  async getAllMetrics() {
    const session = await this.connection.startSession();
    let result = {};
    await session.withTransaction(async (session) => {
      result = {
        users: await this.analyticsService.getUsersMetrics(session),
        bookings: await this.analyticsService.getBookingsMetrics(session),
        payments: await this.analyticsService.getPaymentsMetrics(session),
      };
    });
    return result;
  }
}

import { Module } from '@nestjs/common';
import { AppController } from '@app.controller';
import { AppService } from '@app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  authConfig,
  databaseConfig,
  DatabaseConfig,
  frontConfig,
  messagingConfig,
  MiscConfig,
  miscConfig,
} from '@config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccommodationModule } from '@accommodation/accommodation.module';
import { UserModule } from '@user/user.module';
import { BookingModule } from '@booking/booking.module';
import { TransportModule } from '@transport/transport.module';
import { WorkshopModule } from '@workshop/workshop.module';
import { AuthModule } from '@auth/auth.module';
import { RequestModule } from '@request/request.module';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { insatBookingConfig } from '@config/insatBookingConfig';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PaymentModule } from '@payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnouncementModule } from '@announcement/announcement.module';
import { AnalyticsModule } from '@analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<MiscConfig>('misc').throttler,
    }),
    ConfigModule.forRoot({
      envFilePath: [
        '.env.local.example',
        '.env',
        '.env.development.local',
        '.env.development',
      ],
      load: [
        authConfig,
        databaseConfig,
        frontConfig,
        messagingConfig,
        miscConfig,
        insatBookingConfig,
      ],
      expandVariables: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<MongooseModuleFactoryOptions> => ({
        uri: configService.getOrThrow<DatabaseConfig>('database').uri,
      }),
      connectionName: 'default',
    }),
    AccommodationModule,
    UserModule,
    BookingModule,
    TransportModule,
    WorkshopModule,
    AuthModule,
    RequestModule,
    PaymentModule,
    AnnouncementModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

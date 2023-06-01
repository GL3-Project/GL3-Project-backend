import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportController } from '@transport/transport.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transport, TransportSchema } from '@transport/schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Transport.name, schema: TransportSchema }],
      'default',
    ),
  ],
  controllers: [TransportController],
  providers: [TransportService],
  exports: [TransportService],
})
export class TransportModule {}

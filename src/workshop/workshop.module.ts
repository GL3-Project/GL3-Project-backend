import { Module } from '@nestjs/common';
import { WorkshopController } from './workshop.controller';
import { WorkshopService } from './workshop.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Workshop, WorkshopSchema } from '@workshop/schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Workshop.name,
          schema: WorkshopSchema,
        },
      ],
      'default',
    ),
  ],
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}

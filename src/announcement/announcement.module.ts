import { Module } from '@nestjs/common';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { MessagingModule } from '@messaging/messaging.module';
import { UserModule } from '@user/user.module';

@Module({
  imports: [MessagingModule, UserModule],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
})
export class AnnouncementModule {}

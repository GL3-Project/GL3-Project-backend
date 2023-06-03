import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessagingService, Template } from '@messaging/messaging.service';
import { UserService } from '@user/user.service';
import { AnnouncementDto } from '@announcement/dto/announcement.dto';
import { AnnouncementPreviewDto } from '@announcement/dto/announcement-preview';
import { PopulatedUserDocument, UserDocument } from '@user/schema';
import { chunks } from '@announcement/announcement.utils';

const MAXIMUM_RECIPIENTS_PER_MAIL = 100;

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  constructor(
    private readonly messagingService: MessagingService,
    private readonly userService: UserService,
  ) {}

  async announce({ recipients, message, subject }: AnnouncementDto) {
    const users = await this.userService.findAllUsers({
      email: { $in: recipients },
    });

    if (users.length !== recipients.length)
      throw new NotFoundException('One of the recipients was not found');

    const batches = [...chunks(users, MAXIMUM_RECIPIENTS_PER_MAIL)];
    await Promise.all(
      batches.map(async (batch) => {
        await this.messagingService.sendEmail({
          subject,
          bcc: batch.map((user: UserDocument) => ({
            address: user.email,
            email: user.email,
            name: user.firstName,
          })),
          template: Template.custom_message,
          data: { message },
        });
      }),
    );

    this.logger.log(
      `Sent an announcement to ${users.length} users.\n[Subject]: ${subject}\n[Message]: ${message}`,
    );
  }

  async previewAnnouncement(
    { message, subject }: AnnouncementPreviewDto,
    user: PopulatedUserDocument,
  ) {
    await this.messagingService.sendEmail({
      subject,
      bcc: {
        address: user.email,
        name: user.firstName,
      },
      template: Template.custom_message,
      data: { message },
    });
  }
}

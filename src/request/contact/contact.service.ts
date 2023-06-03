import { Injectable, Logger } from '@nestjs/common';
import { MessagingService, Template } from '@messaging/messaging.service';
import { ContactDto } from '@request/contact/dto/contact.dto';
import { ConfigService } from '@nestjs/config';
import { MessagingConfig } from '@config';

@Injectable()
export class ContactService {
  private readonly defaultReceiver;
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly messagingService: MessagingService,
    private readonly configService: ConfigService,
  ) {
    this.defaultReceiver =
      configService.getOrThrow<MessagingConfig>('messaging').emailing.sender;
  }

  async contactTeam(data: ContactDto) {
    this.logger.log(`new message from ${data.email}: ${data.message}`);

    // send confirmation email of message receipt
    await this.messagingService.sendEmail({
      to: { address: data.email, name: data.name },
      template: Template.successful_message_receipt,
      data: data,
    });

    // send email to NCSC Team i.e. store the message in an email
    await this.messagingService.sendEmail({
      to: this.defaultReceiver,
      template: Template.new_message,
      data: data,
    });
  }
}

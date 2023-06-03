import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagingConfig } from '@config';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

export enum Template {
  account_activation = 'account_activation',
  welcome_on_board = 'welcome_on_board',
  password_reset = 'password_reset',
  successful_password_reset = 'successful_password_reset',
  invitation = 'invitation',
  successful_message_receipt = 'successful_message_receipt',
  new_message = 'new_message',
  successful_pass_registration = 'successful_pass_registration',
  pass_registration_confirmation = 'pass_registration_confirmation',
  successful_booking_registration = 'successful_booking_registration',
  booking_registration_confirmation = 'booking_registration_confirmation',
  custom_message = 'custom_message',
}

const subjects: { [key in Template]?: string } = {
  [Template.account_activation]: 'Successful Account Activation',
  [Template.welcome_on_board]: 'Welcome On Board!',
  [Template.password_reset]: 'Password Reset',
  [Template.successful_password_reset]: 'Successful Password Reset',
  [Template.invitation]: 'New Invitation',
  [Template.successful_message_receipt]: 'Successful Message Receipt',
  [Template.new_message]: 'New Message',
  [Template.successful_booking_registration]: 'Successful Registration',
  [Template.booking_registration_confirmation]: 'Confirmation of Participation',
  [Template.successful_pass_registration]: 'Successful Registration',
  [Template.pass_registration_confirmation]: 'Confirmation of Participation',
};

@Injectable()
export class MessagingService {
  private readonly sender: unknown;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    const { sender } =
      this.configService.getOrThrow<MessagingConfig>('messaging').emailing;

    this.sender = sender;
  }

  /**
   * send messaging using the default sender and a predefined template.
   * the default sender is initialized in ConfigService.
   *
   * @param {Template} template - the template to use. All templates are defined in MessagingService.
   * @param {any} data - any required data to fill in the template on the fly.
   * @param {Partial<ISendMailOptions>} mailData - required and additional props to send an email using nodemailer.
   * if defined, the `mailData.from` will override the default sender configured inside the module.
   * for more info, refer to sendgrid's API reference on `send mail`.
   */
  async sendEmail({
    template,
    data,
    ...mailData
  }: Partial<ISendMailOptions> & {
    template: Template;
    data: any;
  }) {
    await this.mailerService.sendMail({
      template: template,
      subject: subjects[template],
      context: data,
      ...mailData,
    });
  }
}

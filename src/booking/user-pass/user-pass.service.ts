import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { UserService } from '@user/user.service';
import { ConfigService } from '@nestjs/config';
import { NcscConfig } from '@config/insatBookingConfig';
import { PopulatedUserDocument } from '@user/schema';
import { MessagingService, Template } from '@messaging/messaging.service';
import {
  UserPass,
  UserPassDocument,
  UserPassModel,
} from '@booking/user-pass/schema/user-pass.schema';
import { BookingStatus } from '@booking/booking.schema';
import { getDeadline } from '@booking/booking.utils';
import { FrontConfig } from '@config';

@Injectable()
export class UserPassService {
  private readonly logger = new Logger(UserPassService.name);

  constructor(
    @InjectModel(UserPass.name, 'default')
    private readonly userPassModel: UserPassModel,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly messagingService: MessagingService,
  ) {
    UserPass.price =
      configService.getOrThrow<NcscConfig>('insat').pricePool.pass;
  }

  async createUserPass(user: PopulatedUserDocument, session?: ClientSession) {
    return await this.userPassModel
      .create(
        [
          {
            userId: user._id,
            price: UserPass.price,
            status: BookingStatus.in_progress,
          },
        ],
        { session },
      )
      .then((data) => data[0]);
  }

  async addPass(user: PopulatedUserDocument, session?: ClientSession) {
    if (user.booking !== undefined)
      throw new BadRequestException('This user is already booked in');

    const pass = await this.createUserPass(user, session);

    user.booking = pass;
    await user.save({ session });

    this.logger.log(`new pass for ${user.email}: ${pass}`);

    await this.messagingService.sendEmail({
      to: { address: user.email, name: user.firstName },
      template: Template.successful_pass_registration,
      data: {
        first_name: user.firstName,
        deadline: getDeadline(
          this.configService.getOrThrow<NcscConfig>('insat').payment,
        ),
        link: this.configService.getOrThrow<FrontConfig>('front').routes
          .faq_route,
      },
    });
  }

  async getUserPass(userPass: Types.ObjectId, session?: ClientSession) {
    const pass = await this.userPassModel
      .findById(userPass, {}, { session })
      .exec();

    // null safety
    if (pass === null) throw new NotFoundException('Booking not found');
    else return pass;
  }

  async getUserPassByUserId(userId: Types.ObjectId, session?: ClientSession) {
    const user = await this.userService.getUser(userId, session);

    if (user.booking === undefined)
      throw new BadRequestException('User is not booked in');
    const pass = await this.getUserPass(user.booking, session);

    // null safety
    if (pass === null) throw new BadRequestException('User is not booked in');
    else return pass;
  }

  async removeUserPass(
    user: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    await this.userPassModel
      .findByIdAndDelete(user.booking?._id, { session })
      .exec();

    user.booking = undefined;
    await user.save({ session });
  }

  async completeUserPass(userPass: UserPassDocument, session?: ClientSession) {
    userPass.complete();
    await userPass.save({ session });
  }
}

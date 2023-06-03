import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DeeplyPopulatedUserDocument,
  IUser,
  PopulatedUserDocument,
  User,
  UserDocument,
  UserModel,
  UserRole,
} from '@user/schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '@user/dto';
import {
  ClientSession,
  FilterQuery,
  ProjectionType,
  Types,
  UpdateQuery,
} from 'mongoose';
import { UserBookingDocument } from '@booking/user-booking';
import { Blob } from 'buffer';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name, 'default') private userModel: UserModel,
  ) {}

  async getAllUsers(session?: ClientSession): Promise<UserDocument[]> {
    return await this.userModel.find({}, {}, { session }).exec();
  }

  async getAllPopulatedUsers(
    session?: ClientSession,
  ): Promise<PopulatedUserDocument[]> {
    return this.userModel
      .find({}, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .exec();
  }

  async getAllDeeplyPopulatedUsers(
    session?: ClientSession,
  ): Promise<DeeplyPopulatedUserDocument[]> {
    return this.userModel
      .find({}, {}, { session })
      .populate<{ booking?: PopulatedUserDocument }>({
        path: 'booking',
        populate: [
          { path: 'roomBooking' },
          { path: 'transportBooking' },
          { path: 'workshopBooking' },
        ],
      })
      .exec();
  }

  async getUser(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId, {}, { session }).exec();

    // null safety
    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async getPopulatedUser(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<PopulatedUserDocument> {
    const user = await this.userModel
      .findById(userId, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .exec();

    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async findAllUsers(
    conditions: FilterQuery<IUser>,
    projection: ProjectionType<UserDocument> = {},
    session?: ClientSession,
  ): Promise<UserDocument[]> {
    return this.userModel.find(conditions, projection, { session }).exec();
  }

  async findAllPopulatedUsers(
    conditions: FilterQuery<IUser>,
    session?: ClientSession,
  ): Promise<PopulatedUserDocument[]> {
    return this.userModel
      .find(conditions, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .exec();
  }

  async findUser(
    conditions: FilterQuery<IUser>,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .exec();

    // null safety
    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async findPopulatedUser(
    conditions: FilterQuery<IUser>,
    session?: ClientSession,
  ): Promise<PopulatedUserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .exec();

    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async findUserAndVerifyRefreshToken(
    conditions: FilterQuery<IUser>,
    refresh_token: number,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .select('+refreshToken')
      .exec();

    if (user && user.verifyRefreshToken(refresh_token)) {
      return user;
    } else {
      // reset refresh token
      if (user !== null) {
        user.refreshToken = undefined;
        user.accessToken = undefined;
        await user.save({ session });
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findPopulatedUserAndVerifyRefreshToken(
    conditions: FilterQuery<IUser>,
    refresh_token: number,
    session?: ClientSession,
  ): Promise<PopulatedUserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .select('+refreshToken')
      .exec();

    if (user && user.verifyRefreshToken(refresh_token)) {
      return user;
    } else {
      // reset refresh token
      if (user !== null) {
        user.refreshToken = undefined;
        user.accessToken = undefined;
        await user.save({ session });
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findUserAndVerifyAccessToken(
    conditions: FilterQuery<IUser>,
    access_token: number,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .select('+accessToken')
      .exec();

    if (user && user.verifyAccessToken(access_token)) {
      return user;
    } else {
      // reset refresh token
      if (user !== null) {
        user.accessToken = undefined;
        await user.save({ session });
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findPopulatedUserAndVerifyAccessToken(
    conditions: FilterQuery<IUser>,
    access_token: number,
    session?: ClientSession,
  ): Promise<PopulatedUserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .select('+accessToken')
      .exec();

    if (user && user.verifyAccessToken(access_token)) {
      return user;
    } else {
      // reset refresh token
      if (user !== null) {
        user.accessToken = undefined;
        await user.save({ session });
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findUserAndVerifyPassword(
    conditions: FilterQuery<IUser>,
    password: string,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .select('+hashedPassword')
      .exec();

    if (user && (await user.verifyPassword(password))) {
      return user;
    } else {
      throw new UnauthorizedException('Password or handle incorrect');
    }
  }

  async findPopulatedUserAndVerifyPassword(
    conditions: FilterQuery<IUser>,
    password: string,
    session?: ClientSession,
  ): Promise<PopulatedUserDocument> {
    const user = await this.userModel
      .findOne(conditions, {}, { session })
      .populate<{ booking?: UserBookingDocument }>({ path: 'booking' })
      .select('+hashedPassword')
      .exec();

    if (user && (await user.verifyPassword(password))) {
      return user;
    } else {
      throw new UnauthorizedException('Password or handle incorrect');
    }
  }

  async createUser(
    userData: CreateUserDto,
    role: UserRole,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const { password, ...userInfo } = { ...userData, role };
    const user = new this.userModel(userInfo);
    await user.changePassword(password);
    return await user.save({ session });
  }

  async resetUserPassword(
    userId: Types.ObjectId,
    newPassword: string,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.getUser(userId, session);
    await user.changePassword(newPassword);
    return await user.save({ session });
  }

  async updateUser(
    conditions: FilterQuery<IUser>,
    toUpdate: UpdateQuery<IUser> | IUser,
    session?: ClientSession,
  ): Promise<UserDocument> {
    // setting returnOriginal to false ensures that the returned document is the one after update is applied
    const user = await this.userModel
      .findOneAndUpdate(conditions, toUpdate, {
        session,
        returnOriginal: false,
      })
      .exec();

    // null safety
    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async updateUserRefreshToken(
    conditions: FilterQuery<IUser>,
    refresh_token: number,
    session?: ClientSession,
  ): Promise<UserDocument> {
    // setting returnOriginal to false ensures that the returned document is the one after update is applied
    const user = await this.userModel
      .findOneAndUpdate(
        conditions,
        { refreshToken: refresh_token },
        {
          session,
          returnOriginal: false,
        },
      )
      .select('+refreshToken')
      .exec();

    // null safety
    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async updateUserAccessToken(
    conditions: FilterQuery<IUser>,
    access_token: number,
    session?: ClientSession,
  ): Promise<UserDocument> {
    // setting returnOriginal to false ensures that the returned document is the one after update is applied
    const user = await this.userModel
      .findOneAndUpdate(
        conditions,
        { accessToken: access_token },
        {
          session,
          returnOriginal: false,
        },
      )
      .select('+accessToken')
      .exec();

    // null safety
    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async removeUser(
    conditions: FilterQuery<IUser>,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndDelete(conditions, { session })
      .exec();

    // null safety
    if (user === null) throw new NotFoundException('User not found');
    else return user;
  }

  async exportToCSV(userIds: Types.ObjectId[], session?: ClientSession) {
    const users = await this.findAllPopulatedUsers(
      { _id: { $in: userIds } },
      session,
    );

    const stringifier = createObjectCsvStringifier({
      header: [
        { id: '_id', title: 'ID' },
        { id: 'firstName', title: 'First Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'cin', title: 'CIN' },
        { id: 'linkedinProfile', title: 'Linkedin Profile' },
        { id: 'birthDate', title: 'Birth Date' },
        { id: 'address', title: 'Address' },
        { id: 'studyField', title: 'Study Field / Job' },
        { id: 'phone', title: 'Phone Number' },
        { id: 'university', title: 'University / Company' },
      ],
      fieldDelimiter: ',',
      recordDelimiter: '\n',
      alwaysQuote: true,
    });

    const output =
      stringifier.getHeaderString() +
      // @ts-ignore
      stringifier.stringifyRecords(users.map((user) => user._doc));
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8' });
    const bufferArray = await blob.arrayBuffer();
    return Buffer.from(bufferArray);
  }
}

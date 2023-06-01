import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserBookingDocument } from '@booking/user-booking';

const bcrypt = require('bcrypt');

export enum UserRole {
  participant = 'participant',
  staff = 'staff',
  admin = 'administrator',
}

export interface IUser {
  firstName: string;
  lastName: string;
  cin: number;
  linkedinProfile?: string;
  birthDate?: Date;
  address?: string;
  studyField?: string;
  email: string;
  phone: string;
  university: string;
  hashedPassword: string;
  salt: string;
  role: UserRole;
  booking?: Types.ObjectId;
  refreshToken?: number;
  accessToken?: number;
}

export interface IUserMethods {
  generateSalt(): Promise<boolean>;

  hashPassword(password: string): Promise<boolean>;

  changePassword(password: string): Promise<boolean>;

  verifyPassword(password: string): Promise<boolean>;

  verifyRefreshToken(refresh_token: number): boolean;

  verifyAccessToken(access_token: number): boolean;
}

export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

export type UserDocument = InstanceType<UserModel>;

export type PopulatedUserDocument = Omit<UserDocument, 'booking'> & {
  booking?: UserBookingDocument;
};

export type DeeplyPopulatedUserDocument = Omit<UserDocument, 'booking'> & {
  booking?: PopulatedUserDocument;
};

@Schema({
  timestamps: true,
})
export class User implements IUser {
  @Prop({
    type: String,
    trim: true,
    required: true,
    maxlength: 32,
  })
  firstName: string;

  @Prop({
    type: String,
    trim: true,
    required: true,
    maxlength: 32,
  })
  lastName: string;

  @Prop({
    type: Number,
    max: 99999999,
    min: 10000000,
  })
  cin: number;

  @Prop({
    type: String,
  })
  linkedinProfile: string;

  @Prop({
    type: Date,
    max: new Date(Date.now() - 18 * 365 * 24 * 3600 * 1000),
  })
  birthDate: Date;

  @Prop({
    type: String,
  })
  address: string;

  @Prop({
    type: String,
  })
  studyField: string;

  @Prop({
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: true,
  })
  university: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  hashedPassword: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  salt: string;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
    default: UserRole.participant,
  })
  role: UserRole;

  @Prop({
    type: Types.ObjectId,
    ref: 'Booking',
  })
  booking: Types.ObjectId;

  @Prop({
    type: Number,
    select: false,
  })
  refreshToken?: number;

  @Prop({
    type: Number,
    select: false,
  })
  accessToken?: number;

  /* virtuals */

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const UserSchema = SchemaFactory.createForClass<IUser, UserModel>(User);

UserSchema.method('generateSalt', async function (): Promise<void> {
  this.salt = await bcrypt.genSalt(10);
});

UserSchema.method(
  'hashPassword',
  async function (password: string): Promise<void> {
    this.hashedPassword = await bcrypt.hash(password, this.salt);
  },
);

UserSchema.method(
  'changePassword',
  async function (password: string): Promise<void> {
    await this.generateSalt();
    await this.hashPassword(password);
  },
);

UserSchema.method(
  'verifyPassword',
  async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.hashedPassword);
  },
);

UserSchema.method(
  'verifyRefreshToken',
  function (refresh_token: number): boolean {
    return this.refreshToken === refresh_token;
  },
);

UserSchema.method(
  'verifyAccessToken',
  function (access_token: number): boolean {
    return this.accessToken === access_token;
  },
);

import { BaseEntity } from '@base/entities/base.entity';
import { IProfile } from '@user/intefaces/user.interface';
import { Entity } from 'typeorm';

@Entity({ name: 'profile' })
export class Profile extends BaseEntity implements IProfile {}

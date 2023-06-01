import { Module } from '@nestjs/common';
import { PersonnelProfileService } from './personnel-profile.service';
import { PersonnelProfileController } from './personnel-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonnelProfile } from '@personnel-profile/entities/personnel-profile.entity';

@Module({
	controllers: [PersonnelProfileController],
	providers: [PersonnelProfileService],
	imports: [TypeOrmModule.forFeature([PersonnelProfile])],
	exports: [PersonnelProfileService],
})
export class PersonnelProfileModule {}

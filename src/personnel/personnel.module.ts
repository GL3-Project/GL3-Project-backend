import { Module } from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { PersonnelController } from './personnel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonnelProfile } from '@personnel/entities/personnel.entity';

@Module({
	controllers: [PersonnelController],
	providers: [PersonnelService],
	imports: [TypeOrmModule.forFeature([PersonnelProfile])],
})
export class PersonnelModule {}

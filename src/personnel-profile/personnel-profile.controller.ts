import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { PersonnelProfileService } from './personnel-profile.service';
import { CreatePersonnelProfileDto } from './dto/create-personnel-profile.dto';
import { UpdatePersonnelProfileDto } from './dto/update-personnel-profile.dto';
import { PersonnelProfile } from '@personnel-profile/entities/personnel-profile.entity';

@Controller('personnel')
export class PersonnelProfileController {
	constructor(private readonly personnelService: PersonnelProfileService) {}

	@Post()
	async create(@Body() createPersonnelDto: CreatePersonnelProfileDto) {
		return this.personnelService.create(createPersonnelDto);
	}

	@Get()
	async findAll() {
		return this.personnelService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: PersonnelProfile['id']) {
		return this.personnelService.findOne(id);
	}

	@Patch(':id')
	async update(
		@Param('id') id: PersonnelProfile['id'],
		@Body() updatePersonnelDto: UpdatePersonnelProfileDto,
	) {
		const personnel = await this.personnelService.findOne(id);
		return this.personnelService.update(personnel, updatePersonnelDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: PersonnelProfile['id']) {
		return this.personnelService.remove(id);
	}

	// TODO: add restore. Change paths accordingly.
}

import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { PersonnelProfile } from '@personnel/entities/personnel.entity';

@Controller('personnel')
export class PersonnelController {
	constructor(private readonly personnelService: PersonnelService) {}

	@Post()
	async create(@Body() createPersonnelDto: CreatePersonnelDto) {
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
		@Body() updatePersonnelDto: UpdatePersonnelDto,
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

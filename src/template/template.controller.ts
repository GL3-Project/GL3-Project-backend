import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from '@template/entities/template.entity';
import { UseJwtAuth } from '@authentication/decorators/jwt.decorator';

@Controller('template')
@UseJwtAuth()
export class TemplateController {
	constructor(private readonly templateService: TemplateService) {}

	@Post()
	async create(@Body() createTemplateDto: CreateTemplateDto) {
		return this.templateService.create(createTemplateDto);
	}

	@Get()
	async findAll() {
		return this.templateService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: Template['id']) {
		return this.templateService.findOne(id);
	}

	@Patch(':id')
	async update(
		@Param('id') id: Template['id'],
		@Body() updateTemplateDto: UpdateTemplateDto,
	) {
		const template = await this.templateService.findOne(id);
		return this.templateService.update(template, updateTemplateDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: Template['id']) {
		return this.templateService.remove(id);
	}

	// TODO: add restore. Change paths accordingly.
}

import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from '@document/entities/document.entity';

@Controller('document')
export class DocumentController {
	constructor(private readonly documentService: DocumentService) {}

	@Post()
	async create(@Body() createDocumentDto: CreateDocumentDto) {
		return this.documentService.create(createDocumentDto);
	}

	@Get()
	async findAll() {
		return this.documentService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: Document['id']) {
		return this.documentService.findOne(id);
	}

	@Patch(':id')
	async update(
		@Param('id') id: Document['id'],
		@Body() updateDocumentDto: UpdateDocumentDto,
	) {
		const document = await this.documentService.findOne(id);
		return this.documentService.update(document, updateDocumentDto);
	}

	@Delete(':id')
	async remove(@Param('id') id: Document['id']) {
		return this.documentService.remove(id);
	}

	// TODO: add restore. Change paths accordingly.
}

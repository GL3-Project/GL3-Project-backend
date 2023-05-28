import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '@document/entities/document.entity';

@Module({
	controllers: [DocumentController],
	providers: [DocumentService],
	imports: [TypeOrmModule.forFeature([Document])],
})
export class DocumentModule {}

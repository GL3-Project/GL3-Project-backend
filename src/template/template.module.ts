import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from '@template/entities/template.entity';

@Module({
	controllers: [TemplateController],
	providers: [TemplateService],
	imports: [TypeOrmModule.forFeature([Template])],
})
export class TemplateModule {}

import { IDocument } from '@document/interfaces/document.interface';
import { IsString, Length } from 'class-validator';

export class CreateDocumentDto implements IDocument {
	@IsString()
	@Length(3, 50)
	name: string;

	// TODO: complete missing fields. Some fields might not be necessary here. Also, take your time with decorators.
}

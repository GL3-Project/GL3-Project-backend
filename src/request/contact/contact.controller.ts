import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from '@request/contact/contact.service';
import { ContactDto } from '@request/contact/dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async contactTeam(@Body() data: ContactDto) {
    return await this.contactService.contactTeam(data);
  }
}

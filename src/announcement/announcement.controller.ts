import { Body, Controller, Post, Req } from '@nestjs/common';
import { Role } from '@auth/decorator/role.decorator';
import { PopulatedUserDocument, UserRole } from '@user/schema';
import { AnnouncementDto } from '@announcement/dto/announcement.dto';
import { AnnouncementService } from '@announcement/announcement.service';
import { AnnouncementPreviewDto } from '@announcement/dto/announcement-preview';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';

@Controller('announcement')
@UseJwtAuth()
@Role(UserRole.admin)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  async announce(@Body() announcement: AnnouncementDto) {
    return await this.announcementService.announce(announcement);
  }

  @Post('preview')
  async previewAnnouncement(
    @Body() announcement: AnnouncementPreviewDto,
    @Req() { user }: { user: PopulatedUserDocument },
  ) {
    return await this.announcementService.previewAnnouncement(
      announcement,
      user,
    );
  }
}

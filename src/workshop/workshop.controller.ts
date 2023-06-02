import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from '@auth/decorator/role.decorator';
import { UserRole } from '@user/schema';
import { Types } from 'mongoose';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { WorkshopService } from '@workshop/workshop.service';
import { CreateWorkshopDto } from '@workshop/dto/create-workshop.dto';
import { WorkshopDto } from '@workshop/dto';
import { WorkshopInterceptor } from '@workshop/workshop.interceptor';

@Controller('workshop')
@UseJwtAuth()
@UseInterceptors(WorkshopInterceptor)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Get('all')
  @Role(UserRole.participant)
  async getWorkshops(): Promise<WorkshopDto[]> {
    return (await this.workshopService.findAllWorkshops({})) as WorkshopDto[];
  }

  @Post('add')
  @Role(UserRole.admin)
  async addWorkshop(
    @Body(new ParseArrayPipe({ items: CreateWorkshopDto }))
    workshopData: CreateWorkshopDto[],
  ): Promise<WorkshopDto[]> {
    return await this.workshopService.addWorkshops(workshopData);
  }

  @Post('update')
  @Role(UserRole.admin)
  async updateWorkshop(@Body() data: WorkshopDto): Promise<void> {
    await this.workshopService.changeWorkshopMetaData(data._id, data);
  }

  @Delete('delete')
  @Role(UserRole.admin)
  async deleteWorkshop(@Body() workshopId: Types.ObjectId): Promise<void> {
    await this.workshopService.removeWorkshop(workshopId);
  }

  @Delete('clear')
  @Role(UserRole.admin)
  async clearWorkshops(): Promise<void> {
    await this.workshopService.removeAllWorkshops();
  }
}

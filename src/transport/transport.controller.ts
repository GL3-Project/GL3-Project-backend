import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { TransportService } from '@transport/transport.service';
import { Role } from '@auth/decorator/role.decorator';
import { UserRole } from '@user/schema';
import { CreateTransportDto, TransportDto } from '@transport/dto';
import { Types } from 'mongoose';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { TransportInterceptor } from '@transport/transport.interceptor';

@Controller('transport')
@UseJwtAuth()
@UseInterceptors(TransportInterceptor)
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('all')
  @Role(UserRole.participant)
  async getTransports(): Promise<TransportDto[]> {
    return await this.transportService.getAllTransports();
  }

  @Post('add')
  @Role(UserRole.admin)
  async addTransport(
    @Body(new ParseArrayPipe({ items: CreateTransportDto }))
    transportData: CreateTransportDto[],
  ): Promise<TransportDto[]> {
    return await this.transportService.addTransports(transportData);
  }

  @Patch('update')
  @Role(UserRole.admin)
  async updateTransport(@Body() data: TransportDto): Promise<TransportDto> {
    return await this.transportService.changeTransportMetaData(data._id, data);
  }

  @Delete('delete')
  @Role(UserRole.admin)
  async deleteTransport(@Body() transportId: Types.ObjectId): Promise<void> {
    await this.transportService.removeTransport(transportId);
  }

  @Delete('clear')
  @Role(UserRole.admin)
  async clearTransports(): Promise<void> {
    await this.transportService.removeAllTransports();
  }
}

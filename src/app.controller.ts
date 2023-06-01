import { Controller, Get } from '@nestjs/common';
import { AppService } from '@app.service';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Throttle(100, 60)
  getHello(): string {
    return this.appService.getHello();
  }
}

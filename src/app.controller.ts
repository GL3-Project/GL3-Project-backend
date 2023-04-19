import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { TestService } from "./services/TestService";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly testService: TestService) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();

  }

  @Get("/test")
  async test(): Promise<any> {
    return this.testService.selectAll();
  }
}

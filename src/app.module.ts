import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestService } from "./services/TestService";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, TestService],
})
export class AppModule {}

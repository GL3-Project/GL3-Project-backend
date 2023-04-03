import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('Listening on port', process.env.PORT || 80, '...');
  await app.listen( 80);

}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for development
  app.enableCors();

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Brain API is running on: http://localhost:${port}`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for development
  app.enableCors();

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('🤖 Brain API')
    .setDescription('NestJS 기반 Gemini AI 마이크로서비스 - 텍스트 처리 및 AI 응답 생성을 위한 RESTful API')
    .setVersion('1.0.0')
    .addTag('health', '서버 상태 확인')
    .addTag('gemini', 'Gemini AI 기능')
    .addServer('http://localhost:8000', '개발 서버')
    .addServer('https://brain-api.example.com', '프로덕션 서버')
    .setContact('Brain API Team', 'https://github.com/brain-api', 'contact@brain-api.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customfavIcon: '🤖',
    customSiteTitle: 'Brain API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Brain API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}

bootstrap();

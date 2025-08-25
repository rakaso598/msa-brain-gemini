import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // CORS 활성화

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('🤖 Brain API')
    .setDescription('NestJS 기반 Gemini AI 마이크로서비스 - 텍스트 처리 및 AI 응답 생성을 위한 RESTful API')
    .setVersion('1.0.0')
    .addTag('health', '서버 상태 확인')
    .addTag('gemini', 'Gemini AI 기능')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API 키를 헤더에 포함해주세요'
      },
      'x-api-key'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);

  // 실행 성공 시 기본 링크 출력
  console.log('========================================');
  console.log(`msa-brain-gemini API 서버가 성공적으로 실행되었습니다!`);
  console.log(`[Health Check] http://localhost:${port}/health`);
  console.log(`[Swagger Docs] http://localhost:${port}/api`);
  console.log('========================================');
}
bootstrap();

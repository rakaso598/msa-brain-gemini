import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // CORS 활성화

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

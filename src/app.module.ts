import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GeminiModule } from './modules/gemini/gemini.module';
import { ApiKeyGuard } from './guards/api-key.guard';

@ApiTags('health')
@Controller()
class AppController {
  @Get()
  @ApiOperation({ 
    summary: '서비스 정보 조회',
    description: 'Brain API 서비스의 기본 정보와 버전을 확인합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '서비스 정보 반환 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '🤖 Brain API is running!' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2025-08-25T02:30:00.000Z' }
      }
    }
  })
  getHello(): object {
    return { 
      message: '🤖 Brain API is running!', 
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  @ApiOperation({ 
    summary: '헬스체크',
    description: '서버의 상태를 확인합니다. 로드밸런서나 모니터링 시스템에서 사용됩니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '서버 정상 상태',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
        service: { type: 'string', example: 'brain-api' },
        timestamp: { type: 'string', example: '2025-08-25T02:30:00.000Z' }
      }
    }
  })
  getHealth(): object {
    return { 
      status: 'OK', 
      service: 'brain-api',
      timestamp: new Date().toISOString()
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1분 (60초)
        limit: 10, // 1분에 최대 10개 요청
      },
      {
        name: 'medium',
        ttl: 600000, // 10분
        limit: 50, // 10분에 최대 50개 요청
      },
      {
        name: 'long',
        ttl: 3600000, // 1시간
        limit: 100, // 1시간에 최대 100개 요청
      },
    ]),
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

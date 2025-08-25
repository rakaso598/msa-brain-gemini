import { Module, Controller, Get } from '@nestjs/common';
import { GeminiModule } from './modules/gemini/gemini.module';

@Controller()
class AppController {
  @Get()
  getHello(): object {
    return { 
      message: '🤖 Brain API is running!', 
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  getHealth(): object {
    return { 
      status: 'OK', 
      service: 'brain-api',
      timestamp: new Date().toISOString()
    };
  }
}

@Module({
  imports: [GeminiModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService], // 다른 모듈에서 사용할 수 있도록 export
})
export class GeminiModule { }

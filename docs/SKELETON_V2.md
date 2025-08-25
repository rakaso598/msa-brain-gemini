### NestJS 기반 '브레인' 컨테이너 프로젝트 SKELETON\_V2.md

이 문서는 AI 마이크로서비스인 **'브레인' 컨테이너**의 초기 개발을 위한 프로젝트 골격을 정의합니다. NestJS를 사용하여 모듈화되고 확장 가능한 구조를 구축하는 것이 목표입니다. 이 버전에는 **다양한 기능을 위한 새로운 API 엔드포인트**가 추가되었습니다.

### 주요 파일별 코드 골격

#### `src/modules/gemini/dto/gemini.dto.ts`

```typescript
import { IsString, IsArray, IsOptional } from 'class-validator';

export class TextDto {
  @IsString()
  text: string;
}

export class TranslationDto {
  @IsString()
  text: string;

  @IsString()
  targetLang: string;
}

export class StoryDto {
  @IsString()
  theme: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
```

-----

#### `src/modules/gemini/gemini.service.ts`

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { TranslationDto, StoryDto } from './dto/gemini.dto';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  // 텍스트 요약 및 키워드 추출 로직
  async summarizeText(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `다음 글을 핵심 내용 위주로 3줄 요약하고, 관련 키워드 3개를 추출해줘.
    원본 텍스트:
    ${text}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 감정 분석 로직
  async analyzeSentiment(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `다음 글의 감정을 '긍정', '부정', '중립' 중 하나로 분석하고 그 이유를 한 문장으로 설명해줘.
    원본 텍스트:
    ${text}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 응답 생성 로직
  async generateResponse(query: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `다음 요청에 대해 도움이 되는 답변을 생성해줘.
    요청: ${query}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 새로운 기능: 문장 바꾸기/재구성
  async paraphraseText(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `다음 글을 같은 의미를 유지하면서 다른 표현으로 바꿔줘.
    원본 텍스트:
    ${text}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 새로운 기능: 다국어 번역
  async translateText(data: TranslationDto): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `다음 텍스트를 ${data.targetLang}로 번역해줘.
    원본 텍스트:
    ${data.text}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 새로운 기능: 이미지 내용 분석 (멀티모달)
  async analyzeImage(imagePart: Part, query: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    try {
      const result = await model.generateContent([query, imagePart]);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 새로운 기능: 창의적 콘텐츠 생성
  async generateStory(data: StoryDto): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `주제: ${data.theme}\n다음 키워드를 포함하여 500자 이내의 짧은 이야기를 만들어줘.
    키워드: ${data.keywords ? data.keywords.join(', ') : '없음'}`;
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }
}
```

-----

#### `src/modules/gemini/gemini.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TextDto, TranslationDto, StoryDto } from './dto/gemini.dto';

@Controller('gemini')
@UsePipes(new ValidationPipe({ transform: true }))
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('summarize')
  async summarizeText(@Body() data: TextDto) {
    const summary = await this.geminiService.summarizeText(data.text);
    return { summary };
  }

  @Post('analyze_sentiment')
  async analyzeSentiment(@Body() data: TextDto) {
    const sentiment = await this.geminiService.analyzeSentiment(data.text);
    return { sentiment };
  }

  @Post('generate_response')
  async generateResponse(@Body() data: TextDto) {
    const response = await this.geminiService.generateResponse(data.text);
    return { response };
  }

  // 새로운 기능: 문장 바꾸기/재구성
  @Post('paraphrase')
  async paraphraseText(@Body() data: TextDto) {
    const paraphrasedText = await this.geminiService.paraphraseText(data.text);
    return { paraphrasedText };
  }

  // 새로운 기능: 다국어 번역
  @Post('translate')
  async translateText(@Body() data: TranslationDto) {
    const translatedText = await this.geminiService.translateText(data);
    return { translatedText };
  }

  // 새로운 기능: 이미지 내용 분석 (멀티모달)
  @Post('analyze_image')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File, @Body('query') query: string) {
    if (!file || !query) {
      throw new HttpException('이미지와 쿼리 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }
    const imagePart = {
      inlineData: {
        data: Buffer.from(file.buffer).toString('base64'),
        mimeType: file.mimetype,
      },
    };
    const result = await this.geminiService.analyzeImage(imagePart, query);
    return { result };
  }

  // 새로운 기능: 창의적 콘텐츠 생성
  @Post('generate_story')
  async generateStory(@Body() data: StoryDto) {
    const story = await this.geminiService.generateStory(data);
    return { story };
  }
}
```

-----

#### `src/modules/gemini/gemini.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}
```

-----

#### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GeminiModule } from './modules/gemini/gemini.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GeminiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

-----

#### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // CORS 활성화
  await app.listen(8000);
}
bootstrap();
```

-----
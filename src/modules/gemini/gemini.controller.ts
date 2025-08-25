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

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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TextDto, TranslationDto, StoryDto } from './dto/gemini.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('gemini')
@ApiSecurity('x-api-key')
@Controller('gemini')
@UsePipes(new ValidationPipe({ transform: true }))
export class GeminiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly configService: ConfigService
  ) {}

  private validateKey(key: string) {
    const validKey = this.configService.get<string>('MY_API_KEY');
    if (!key || key !== validKey) {
      throw new HttpException('Request body의 key 값이 올바르지 않습니다.', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('summarize')
  @ApiOperation({ summary: '텍스트 요약 및 키워드 추출', description: '긴 텍스트를 3줄로 요약하고 관련 키워드를 추출합니다.' })
  @ApiResponse({ status: 200, description: '요약 성공' })
  async summarizeText(@Body() data: TextDto) {
    this.validateKey(data.key);
    const summary = await this.geminiService.summarizeText(data.text);
    return { summary };
  }

  @Post('analyze_sentiment')
  @ApiOperation({ summary: '감정 분석', description: '텍스트의 감정을 긍정/부정/중립으로 분석합니다.' })
  @ApiResponse({ status: 200, description: '감정 분석 성공' })
  async analyzeSentiment(@Body() data: TextDto) {
    this.validateKey(data.key);
    const sentiment = await this.geminiService.analyzeSentiment(data.text);
    return { sentiment };
  }

  @Post('generate_response')
  @ApiOperation({ summary: 'AI 응답 생성', description: '사용자 질문에 대한 AI 응답을 생성합니다.' })
  @ApiResponse({ status: 200, description: '응답 생성 성공' })
  async generateResponse(@Body() data: TextDto) {
    this.validateKey(data.key);
    const response = await this.geminiService.generateResponse(data.text);
    return { response };
  }

  // 새로운 기능: 문장 바꾸기/재구성
  @Post('paraphrase')
  @ApiOperation({ summary: '문장 재구성', description: '입력 텍스트를 같은 의미로 다른 표현으로 바꿉니다.' })
  @ApiResponse({ status: 200, description: '문장 재구성 성공' })
  async paraphraseText(@Body() data: TextDto) {
    this.validateKey(data.key);
    const paraphrasedText = await this.geminiService.paraphraseText(data.text);
    return { paraphrasedText };
  }

  // 새로운 기능: 다국어 번역
  @Post('translate')
  @ApiOperation({ summary: '다국어 번역', description: '텍스트를 지정된 언어로 번역합니다.' })
  @ApiResponse({ status: 200, description: '번역 성공' })
  async translateText(@Body() data: TranslationDto) {
    this.validateKey(data.key);
    const translatedText = await this.geminiService.translateText(data);
    return { translatedText };
  }

  // 새로운 기능: 이미지 내용 분석 (멀티모달)
  @Post('analyze_image')
  @ApiOperation({ summary: '이미지 분석', description: '업로드된 이미지를 분석하고 질문에 답변합니다.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        query: { type: 'string', example: '이 이미지에서 무엇을 볼 수 있나요?' },
        key: { type: 'string', example: 'your_api_key_here' }
      }
    }
  })
  @ApiResponse({ status: 200, description: '이미지 분석 성공' })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File, @Body('query') query: string, @Body('key') key: string) {
    this.validateKey(key);
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
  @ApiOperation({ summary: '창의적 스토리 생성', description: '주제와 키워드로 창의적인 이야기를 생성합니다.' })
  @ApiResponse({ status: 200, description: '스토리 생성 성공' })
  async generateStory(@Body() data: StoryDto) {
    this.validateKey(data.key);
    const story = await this.geminiService.generateStory(data);
    return { story };
  }
}

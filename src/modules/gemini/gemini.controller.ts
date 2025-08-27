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
import { Throttle } from '@nestjs/throttler';
import { GeminiService } from './gemini.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TextDto, TranslationDto, StoryDto, PortfolioAnalysisDto } from './dto/gemini.dto';

@ApiTags('gemini')
@ApiSecurity('x-api-key')
@Controller('gemini')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // Gemini API는 더 엄격하게: 1분에 5개 요청
@UsePipes(new ValidationPipe({ transform: true }))
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) { }

  @Post('summarize')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 요약: 1분에 3개
  @ApiOperation({ summary: '텍스트 요약 및 키워드 추출', description: '긴 텍스트를 3줄로 요약하고 관련 키워드를 추출합니다.' })
  @ApiResponse({ status: 200, description: '요약 성공' })
  async summarizeText(@Body() data: TextDto) {
    const summary = await this.geminiService.summarizeText(data.text);
    return { summary };
  }

  @Post('analyze_sentiment')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 감정분석: 1분에 5개
  @ApiOperation({ summary: '감정 분석', description: '텍스트의 감정을 긍정/부정/중립으로 분석합니다.' })
  @ApiResponse({ status: 200, description: '감정 분석 성공' })
  async analyzeSentiment(@Body() data: TextDto) {
    const sentiment = await this.geminiService.analyzeSentiment(data.text);
    return { sentiment };
  }

  @Post('generate_response')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // AI 응답생성: 1분에 3개 (비용이 높음)
  @ApiOperation({ summary: 'AI 응답 생성', description: '사용자 질문에 대한 AI 응답을 생성합니다.' })
  @ApiResponse({ status: 200, description: '응답 생성 성공' })
  async generateResponse(@Body() data: TextDto) {
    const response = await this.geminiService.generateResponse(data.text);
    return { response };
  }

  // 새로운 기능: 문장 바꾸기/재구성
  @Post('paraphrase')
  @Throttle({ default: { limit: 4, ttl: 60000 } }) // 문장재구성: 1분에 4개
  @ApiOperation({ summary: '문장 재구성', description: '입력 텍스트를 같은 의미로 다른 표현으로 바꿉니다.' })
  @ApiResponse({ status: 200, description: '문장 재구성 성공' })
  async paraphraseText(@Body() data: TextDto) {
    const paraphrasedText = await this.geminiService.paraphraseText(data.text);
    return { paraphrasedText };
  }

  // 새로운 기능: 다국어 번역
  @Post('translate')
  @Throttle({ default: { limit: 4, ttl: 60000 } }) // 번역: 1분에 4개
  @ApiOperation({ summary: '다국어 번역', description: '텍스트를 지정된 언어로 번역합니다.' })
  @ApiResponse({ status: 200, description: '번역 성공' })
  async translateText(@Body() data: TranslationDto) {
    const translatedText = await this.geminiService.translateText(data);
    return { translatedText };
  }

  // 새로운 기능: 이미지 내용 분석 (멀티모달)
  @Post('analyze_image')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 이미지분석: 1분에 2개 (가장 비용이 높음)
  @ApiOperation({ summary: '이미지 분석', description: '업로드된 이미지를 분석하고 질문에 답변합니다.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        query: { type: 'string', example: '이 이미지에서 무엇을 볼 수 있나요?' }
      }
    }
  })
  @ApiResponse({ status: 200, description: '이미지 분석 성공' })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File, @Body('query') query: string) {
    if (!file || !query) {
      throw new HttpException('이미지와 쿼리 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }
    const result = await this.geminiService.analyzeImage(file, query);
    return { result };
  }

  // 새로운 기능: 창의적 콘텐츠 생성
  @Post('generate_story')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 스토리생성: 1분에 2개 (긴 콘텐츠 생성이므로 비용이 높음)
  @ApiOperation({ summary: '창의적 스토리 생성', description: '주제와 키워드로 창의적인 이야기를 생성합니다.' })
  @ApiResponse({ status: 200, description: '스토리 생성 성공' })
  async generateStory(@Body() data: StoryDto) {
    const story = await this.geminiService.generateStory(data);
    return { story };
  }

  // 새로운 기능: 포트폴리오 분석
  @Post('analyze_portfolio')
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 포트폴리오 분석: 1분에 2개 (복잡한 분석이므로 제한적)
  @ApiOperation({
    summary: '포트폴리오 종합 분석',
    description: '사용자의 GitHub 저장소, 블로그, 이력서를 기반으로 종합적인 포트폴리오 분석을 수행합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 분석 성공',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: '포트폴리오 전반적 평가' },
        strengths: { type: 'array', items: { type: 'string' }, description: '강점 목록' },
        weaknesses: { type: 'array', items: { type: 'string' }, description: '약점 목록' },
        technicalFeedback: {
          type: 'object',
          properties: {
            codeReview: { type: 'string', description: '코드 리뷰 피드백' },
            bestPractices: { type: 'string', description: '베스트 프랙티스 제안' }
          }
        },
        documentationFeedback: {
          type: 'object',
          properties: {
            readmeReview: { type: 'string', description: 'README 문서 피드백' },
            blogReview: { type: 'string', description: '블로그 글 피드백' }
          }
        },
        overallScore: { type: 'number', description: '전체 점수 (0-100)' },
        nextSteps: { type: 'array', items: { type: 'string' }, description: '다음 단계 제안' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (필수 필드 누락 또는 잘못된 URL)' })
  async analyzePortfolio(@Body() data: PortfolioAnalysisDto) {
    try {
      const analysis = await this.geminiService.analyzePortfolio(data);
      return analysis;
    } catch (error) {
      throw new HttpException(
        error.message || '포트폴리오 분석 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

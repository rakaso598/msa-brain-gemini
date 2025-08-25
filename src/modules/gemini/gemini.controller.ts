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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GeminiService } from './gemini.service';
import {
  SummarizeDto,
  AnalyzeSentimentDto,
  GenerateResponseDto,
  SummarizeResponseDto,
  SentimentResponseDto,
  GenerateResponseResponseDto,
  ErrorResponseDto,
  TranslationDto,
  StoryDto,
  ParaphraseDto,
  ImageAnalysisDto
} from './dto/gemini.dto';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) { }

  @Post('summarize')
  @ApiOperation({ 
    summary: '텍스트 요약 및 키워드 추출',
    description: '긴 텍스트를 핵심 내용 위주로 3줄 요약하고, 관련 키워드 3개를 추출합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '텍스트 요약 성공',
    type: SummarizeResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 (텍스트 누락)',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Gemini API 호출 오류',
    type: ErrorResponseDto
  })
  async summarizeText(@Body() body: SummarizeDto): Promise<SummarizeResponseDto> {
    const { text } = body;

    if (!text || text.trim().length === 0) {
      throw new HttpException('텍스트 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const summary = await this.geminiService.summarizeText(text);
      return {
        success: true,
        summary,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        `요약 처리 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('analyze_sentiment')
  @ApiOperation({ 
    summary: '감정 분석',
    description: '텍스트의 감정을 분석하여 긍정, 부정, 중립 중 하나로 분류하고 그 이유를 설명합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '감정 분석 성공',
    type: SentimentResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 (텍스트 누락)',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Gemini API 호출 오류',
    type: ErrorResponseDto
  })
  async analyzeSentiment(@Body() body: AnalyzeSentimentDto): Promise<SentimentResponseDto> {
    const { text } = body;

    if (!text || text.trim().length === 0) {
      throw new HttpException('텍스트 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const sentiment = await this.geminiService.analyzeSentiment(text);
      return {
        success: true,
        sentiment,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        `감정 분석 처리 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate_response')
  @ApiOperation({ 
    summary: '응답 생성',
    description: '사용자의 질문이나 요청에 대해 도움이 되는 답변을 생성합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '응답 생성 성공',
    type: GenerateResponseResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청 (쿼리 누락)',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Gemini API 호출 오류',
    type: ErrorResponseDto
  })
  async generateResponse(@Body() body: GenerateResponseDto): Promise<GenerateResponseResponseDto> {
    const { query } = body;

    if (!query || query.trim().length === 0) {
      throw new HttpException('쿼리 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await this.geminiService.generateResponse(query);
      return {
        success: true,
        response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        `응답 생성 중 오류가 발생했습니다: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 새로운 기능: 문장 바꾸기/재구성
  @Post('paraphrase')
  @ApiOperation({
    summary: '문장 재구성',
    description: '입력된 텍스트를 같은 의미를 유지하면서 다른 표현으로 바꿉니다.'
  })
  @ApiResponse({
    status: 200,
    description: '문장 재구성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        paraphrasedText: { type: 'string', example: '오늘의 기상 상황이 대단히 쾌적합니다.' }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async paraphraseText(@Body() data: ParaphraseDto) {
    try {
      const paraphrasedText = await this.geminiService.paraphraseText(data.text);
      return {
        success: true,
        paraphrasedText
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 새로운 기능: 다국어 번역
  @Post('translate')
  @ApiOperation({
    summary: '다국어 번역',
    description: '입력된 텍스트를 지정된 언어로 번역합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '번역 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        translatedText: { type: 'string', example: 'Hello. The weather is nice today.' }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async translateText(@Body() data: TranslationDto) {
    try {
      const translatedText = await this.geminiService.translateText(data);
      return {
        success: true,
        translatedText
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 새로운 기능: 이미지 내용 분석 (멀티모달)
  @Post('analyze_image')
  @ApiOperation({
    summary: '이미지 분석',
    description: '업로드된 이미지를 분석하고 질문에 답변합니다.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '분석할 이미지 파일'
        },
        query: {
          type: 'string',
          description: '이미지에 대한 질문',
          example: '이 이미지에서 무엇을 볼 수 있나요?'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '이미지 분석 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        result: { type: 'string', example: '이 이미지에서는 푸른 하늘과 흰 구름, 그리고 녹색 잔디밭을 볼 수 있습니다.' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async analyzeImage(@UploadedFile() file: any, @Body('query') query: string) {
    if (!file || !query) {
      throw new HttpException('이미지와 쿼리 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const imagePart = {
        inlineData: {
          data: Buffer.from(file.buffer).toString('base64'),
          mimeType: file.mimetype,
        },
      };
      const result = await this.geminiService.analyzeImage(imagePart, query);
      return {
        success: true,
        result
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 새로운 기능: 창의적 콘텐츠 생성
  @Post('generate_story')
  @ApiOperation({
    summary: '창의적 이야기 생성',
    description: '주제와 키워드를 바탕으로 창의적인 이야기를 생성합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '이야기 생성 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        story: { type: 'string', example: '우주 모험을 떠난 주인공이 우주선을 타고 외계인을 만나며 펼치는 흥미진진한 모험 이야기...' }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateStory(@Body() data: StoryDto) {
    try {
      const story = await this.geminiService.generateStory(data);
      return {
        success: true,
        story
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

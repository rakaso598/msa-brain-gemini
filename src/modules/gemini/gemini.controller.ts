import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import {
  SummarizeDto,
  AnalyzeSentimentDto,
  GenerateResponseDto,
  SummarizeResponseDto,
  SentimentResponseDto,
  GenerateResponseResponseDto,
  ErrorResponseDto
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
}

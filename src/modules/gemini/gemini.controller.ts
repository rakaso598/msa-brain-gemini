import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GeminiService } from './gemini.service';

export interface SummarizeDto {
  text: string;
}

export interface AnalyzeSentimentDto {
  text: string;
}

export interface GenerateResponseDto {
  query: string;
}

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) { }

  @Post('summarize')
  async summarizeText(@Body() body: SummarizeDto) {
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
  async analyzeSentiment(@Body() body: AnalyzeSentimentDto) {
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
  async generateResponse(@Body() body: GenerateResponseDto) {
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

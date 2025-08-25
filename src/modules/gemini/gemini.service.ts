import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // 텍스트 요약 및 키워드 추출 로직
  async summarizeText(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

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
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

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
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

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
}

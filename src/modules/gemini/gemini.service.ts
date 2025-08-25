import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { TranslationDto, StoryDto } from './dto/gemini.dto';

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

  // 새로운 기능: 문장 바꾸기/재구성
  async paraphraseText(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

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
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }
    if (!data.targetLang || data.targetLang.trim().length === 0) {
      throw new Error('Target language cannot be empty');
    }

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
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

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
    if (!data.theme || data.theme.trim().length === 0) {
      throw new Error('Theme cannot be empty');
    }

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

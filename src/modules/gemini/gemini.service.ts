import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { TranslationDto, StoryDto, PortfolioAnalysisDto } from './dto/gemini.dto';

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

  // 새로운 기능: 포트폴리오 분석
  async analyzePortfolio(data: PortfolioAnalysisDto): Promise<any> {
    if (!data.githubUrl) {
      throw new Error('GitHub URL은 필수입니다.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 포트폴리오 분석을 위한 상세한 프롬프트
    const prompt = `다음 포트폴리오 정보를 기반으로 종합적인 분석을 수행하고 JSON 형식으로 응답해주세요.

분석 대상:
- GitHub Repository: ${data.githubUrl}
${data.blogUrl ? `- Blog Post: ${data.blogUrl}` : ''}
${data.resumeText ? `- Resume: ${data.resumeText}` : ''}

다음 형식의 JSON으로 응답해주세요:
{
  "summary": "포트폴리오의 전반적인 평가와 강점 요약 (2-3문장)",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "technicalFeedback": {
    "codeReview": "코드 구조 및 가독성에 대한 구체적인 피드백",
    "bestPractices": "적용하면 좋을 베스트 프랙티스 제안"
  },
  "documentationFeedback": {
    "readmeReview": "README 문서의 내용 및 구성에 대한 피드백",
    "blogReview": "블로그 글의 논리 전개 및 내용에 대한 피드백 (블로그 URL이 제공된 경우만)"
  },
  "overallScore": 85,
  "nextSteps": ["개선사항1", "개선사항2", "개선사항3"]
}

분석 시 고려사항:
1. 코드의 구조, 가독성, 베스트 프랙티스 준수
2. 문서화 품질 (README, 주석 등)
3. 프로젝트의 완성도와 실용성
4. 기술 스택 활용의 적절성
5. 전반적인 개발 역량

JSON 형식만 응답하고 다른 텍스트는 포함하지 마세요.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // JSON 파싱 시도
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // JSON 파싱 실패 시 기본 구조로 응답
        return {
          summary: responseText,
          strengths: ["분석된 내용을 확인해주세요"],
          weaknesses: ["추가 정보가 필요합니다"],
          technicalFeedback: {
            codeReview: "상세 분석을 위해 추가 정보가 필요합니다",
            bestPractices: "프로젝트 구조를 더 자세히 확인해주세요"
          },
          documentationFeedback: {
            readmeReview: "문서화 상태를 확인해주세요",
            blogReview: data.blogUrl ? "블로그 내용을 확인해주세요" : null
          },
          overallScore: 50,
          nextSteps: ["프로젝트 정보를 더 자세히 제공해주세요"]
        };
      }
    } catch (error) {
      throw new InternalServerErrorException(`포트폴리오 분석 중 오류 발생: ${error.message}`);
    }
  }
}

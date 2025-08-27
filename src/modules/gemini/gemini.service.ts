import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { TranslationDto, StoryDto, PortfolioAnalysisDto } from './dto/gemini.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly octokit: Octokit;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);

    // GitHub API 클라이언트 초기화 (토큰 없이도 public repo 접근 가능)
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // 선택사항: rate limit 증가를 위해
    });
  }

  // GitHub 레포지토리 정보를 가져오는 메서드
  private async fetchGitHubRepository(githubUrl: string): Promise<any> {
    try {
      // GitHub URL에서 owner와 repo 추출
      const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
      if (!urlMatch) {
        throw new Error('유효한 GitHub URL이 아닙니다.');
      }

      const [, owner, repo] = urlMatch;

      // 기본 레포지토리 정보 가져오기
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      // README 파일 가져오기
      let readmeContent = '';
      try {
        const { data: readmeData } = await this.octokit.rest.repos.getReadme({
          owner,
          repo,
        });
        readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      } catch (error) {
        console.log('README 파일을 찾을 수 없습니다.');
      }

      // 주요 파일들 가져오기 (package.json, 주요 소스 파일 등)
      let packageJsonContent = '';
      let mainFiles: string[] = [];

      try {
        const { data: contents } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: '',
        });

        if (Array.isArray(contents)) {
          // package.json 찾기
          const packageJson = contents.find(item => item.name === 'package.json');
          if (packageJson && packageJson.type === 'file') {
            const { data: pkgData } = await this.octokit.rest.repos.getContent({
              owner,
              repo,
              path: 'package.json',
            });
            if ('content' in pkgData) {
              packageJsonContent = Buffer.from(pkgData.content, 'base64').toString('utf-8');
            }
          }

          // 주요 소스 파일들 찾기 (최대 5개)
          const sourceFiles = contents
            .filter(item =>
              item.type === 'file' &&
              (item.name.endsWith('.js') ||
                item.name.endsWith('.ts') ||
                item.name.endsWith('.py') ||
                item.name.endsWith('.java') ||
                item.name.endsWith('.go'))
            )
            .slice(0, 5);

          for (const file of sourceFiles) {
            try {
              const { data: fileData } = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path: file.name,
              });
              if ('content' in fileData) {
                const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
                mainFiles.push(`// ${file.name}\n${content.slice(0, 2000)}`); // 파일당 2000자 제한
              }
            } catch (error) {
              console.log(`파일 ${file.name}을 가져올 수 없습니다.`);
            }
          }
        }
      } catch (error) {
        console.log('파일 목록을 가져올 수 없습니다.');
      }

      return {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stargazersCount: repoData.stargazers_count,
        forksCount: repoData.forks_count,
        topics: repoData.topics,
        readme: readmeContent,
        packageJson: packageJsonContent,
        mainFiles: mainFiles,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
      };
    } catch (error) {
      console.error('GitHub API 오류:', error.message);
      throw new Error(`GitHub 레포지토리 정보를 가져올 수 없습니다: ${error.message}`);
    }
  }

  // 블로그 내용을 스크래핑하는 메서드
  private async fetchBlogContent(blogUrl: string): Promise<string> {
    try {
      const response = await axios.get(blogUrl, {
        timeout: 10000, // 10초 타임아웃
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // 다양한 블로그 플랫폼에 대응
      let content = '';

      // Medium, Velog, Tistory, Naver Blog 등 일반적인 선택자들
      const selectors = [
        'article',
        '.post-content',
        '.post-body',
        '.entry-content',
        '.content',
        '.post',
        'main',
        '.markdown-body'
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 100) { // 충분한 내용이 있으면 사용
            break;
          }
        }
      }

      // 내용이 없으면 body 전체 텍스트 사용
      if (!content || content.length < 100) {
        content = $('body').text().trim();
      }

      // 내용 길이 제한 (AI 토큰 제한 고려)
      return content.slice(0, 5000);
    } catch (error) {
      console.error('블로그 스크래핑 오류:', error.message);
      return `블로그 내용을 가져올 수 없습니다: ${error.message}`;
    }
  }

  // 텍스트에서 데이터를 추출하는 헬퍼 메서드
  private extractDataFromText(responseText: string, githubData: any, data: PortfolioAnalysisDto): any {
    // 기본 fallback 구조
    const fallbackData = {
      summary: "실제 데이터를 기반으로 분석을 수행했지만 응답 형식에 문제가 있습니다.",
      strengths: [
        githubData.readme ? "README 문서가 작성되어 있음" : "프로젝트 구조를 확인함",
        githubData.packageJson ? "의존성 관리가 적절히 되어 있음" : "기본적인 프로젝트 설정 확인",
        `${githubData.language || '다양한'} 기술을 활용한 프로젝트`
      ],
      weaknesses: [
        githubData.readme ? null : "README 문서가 부족함",
        githubData.stargazersCount < 5 ? "프로젝트 홍보 및 관심도 부족" : null,
        "더 자세한 분석을 위해 추가 정보 필요"
      ].filter(Boolean),
      technicalFeedback: {
        codeReview: `${githubData.language} 기반 프로젝트로 ${githubData.mainFiles.length}개의 주요 파일을 확인했습니다.`,
        bestPractices: "코드 구조와 문서화를 개선하면 더 좋은 포트폴리오가 될 것입니다.",
        techStack: `${githubData.language} 기술 스택을 사용하고 있습니다.`
      },
      documentationFeedback: {
        readmeReview: githubData.readme ? "README 파일이 존재하여 프로젝트 이해에 도움이 됩니다." : "README 파일 작성이 필요합니다.",
        blogReview: data.blogUrl ? "블로그 내용을 확인했습니다." : null
      },
      projectAnalysis: {
        complexity: githubData.mainFiles.length > 3 ? 7 : 5,
        completeness: githubData.readme && githubData.packageJson ? 8 : 6,
        innovation: 6
      },
      overallScore: 70,
      nextSteps: [
        "README 문서 개선",
        "코드 주석 추가",
        "프로젝트 홍보 및 문서화 강화"
      ]
    };

    // AI 응답에서 점수나 특정 정보 추출 시도
    try {
      const scoreMatch = responseText.match(/(\d+)/);
      if (scoreMatch) {
        const extractedScore = parseInt(scoreMatch[1]);
        if (extractedScore >= 1 && extractedScore <= 100) {
          fallbackData.overallScore = extractedScore;
        }
      }

      // AI가 제공한 텍스트를 summary에 포함
      if (responseText.length > 50 && responseText.length < 1000) {
        fallbackData.summary = `AI 분석: ${responseText.slice(0, 200)}...`;
      }
    } catch (extractError) {
      console.log('텍스트 추출 중 오류:', extractError.message);
    }

    return fallbackData;
  }

  async translate(translationDto: TranslationDto): Promise<string> {
    const { text, targetLang } = translationDto;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 텍스트를 ${targetLang}로 번역해주세요. 번역 결과만 제공하고 다른 설명은 포함하지 마세요.

텍스트: ${text}`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  async generateStory(storyDto: StoryDto): Promise<string> {
    const { theme, keywords } = storyDto;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 조건에 맞는 창의적인 이야기를 작성해주세요:

테마: ${theme}
${keywords && keywords.length > 0 ? `포함할 키워드: ${keywords.join(', ')}` : ''}

이야기는 흥미진진하고 독창적이어야 하며, 독자가 끝까지 몰입할 수 있도록 작성해주세요. 약 1000-1500자 정도의 중간 길이로 작성해주세요.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  async analyzeImage(file: Express.Multer.File, prompt?: string): Promise<string> {
    if (!file) {
      throw new Error('이미지 파일이 필요합니다.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart: Part = {
      inlineData: {
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      },
    };

    const defaultPrompt = '이 이미지를 자세히 분석하고 설명해주세요. 이미지에 보이는 객체, 색상, 구성, 분위기 등을 포함하여 종합적으로 분석해주세요.';
    const analysisPrompt = prompt || defaultPrompt;

    try {
      const result = await model.generateContent([analysisPrompt, imagePart]);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 개선된 포트폴리오 분석 메서드 (웹 스크래핑 포함)
  async analyzePortfolio(data: PortfolioAnalysisDto): Promise<any> {
    if (!data.githubUrl) {
      throw new Error('GitHub URL은 필수입니다.');
    }

    try {
      // 1. GitHub 레포지토리 데이터 수집
      const githubData = await this.fetchGitHubRepository(data.githubUrl);

      // 2. 블로그 내용 수집 (선택사항)
      let blogContent = '';
      if (data.blogUrl) {
        blogContent = await this.fetchBlogContent(data.blogUrl);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // 3. 수집된 실제 데이터를 기반으로 상세한 프롬프트 작성
      const prompt = `다음 포트폴리오 정보를 기반으로 종합적인 분석을 수행하고 JSON 형식으로 응답해주세요.

**중요: 반드시 유효한 JSON 형식으로만 응답하고, 다른 텍스트나 설명은 포함하지 마세요.**

=== 분석 대상 ===

GitHub Repository 정보:
- 프로젝트명: ${githubData.name}
- 설명: ${githubData.description || '설명 없음'}
- 주요 언어: ${githubData.language}
- Stars: ${githubData.stargazersCount}
- Forks: ${githubData.forksCount}
- 토픽: ${githubData.topics?.join(', ') || '없음'}
- 생성일: ${githubData.createdAt}
- 최종 업데이트: ${githubData.updatedAt}

README 내용:
${githubData.readme ? githubData.readme.slice(0, 3000) : 'README 파일이 없습니다.'}

Package.json 정보:
${githubData.packageJson ? githubData.packageJson.slice(0, 1000) : 'package.json 파일이 없습니다.'}

주요 소스 파일들:
${githubData.mainFiles.length > 0 ? githubData.mainFiles.join('\n\n') : '소스 파일을 가져올 수 없습니다.'}

${data.blogUrl ? `블로그 내용:
${blogContent.slice(0, 2000)}` : ''}

${data.resumeText ? `이력서 정보:
${data.resumeText}` : ''}

=== 분석 요구사항 ===

다음 형식의 JSON으로 응답해주세요 (반드시 이 구조를 따라주세요):

{
  "summary": "포트폴리오의 전반적인 평가와 강점 요약 (2-3문장)",
  "strengths": ["구체적인 강점1", "구체적인 강점2", "구체적인 강점3"],
  "weaknesses": ["개선이 필요한 부분1", "개선이 필요한 부분2", "개선이 필요한 부분3"],
  "technicalFeedback": {
    "codeReview": "실제 코드 구조와 품질에 대한 구체적인 피드백",
    "bestPractices": "코드에서 확인된 베스트 프랙티스나 개선 제안",
    "techStack": "사용된 기술 스택의 적절성과 활용도 평가"
  },
  "documentationFeedback": {
    "readmeReview": "README 문서의 내용과 구성에 대한 구체적인 피드백",
    "blogReview": ${data.blogUrl ? '"블로그 글의 논리 전개와 내용에 대한 피드백"' : 'null'}
  },
  "projectAnalysis": {
    "complexity": 7,
    "completeness": 8,
    "innovation": 6
  },
  "overallScore": 85,
  "nextSteps": ["구체적인 개선사항1", "구체적인 개선사항2", "구체적인 개선사항3"]
}

**중요: JSON 형식만 응답하고 다른 텍스트는 포함하지 마세요. 코드블록이나 "json"이라는 단어도 포함하지 마세요.**`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // JSON 파싱 시도 (더 유연한 방식)
      try {
        // 1. 기본 JSON 파싱 시도
        return JSON.parse(responseText);
      } catch (parseError) {
        console.log('기본 JSON 파싱 실패, 정제 후 재시도:', parseError.message);

        // 2. JSON 정제 후 재파싱 시도
        try {
          // 코드블록 제거
          let cleanedText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

          // 앞뒤 불필요한 텍스트 제거
          const jsonStart = cleanedText.indexOf('{');
          const jsonEnd = cleanedText.lastIndexOf('}');

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
          }

          // 단일 따옴표를 쌍따옴표로 변경
          cleanedText = cleanedText.replace(/'/g, '"');

          // 후행 쉼표 제거
          cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1');

          return JSON.parse(cleanedText);
        } catch (secondParseError) {
          console.log('정제 후 JSON 파싱도 실패:', secondParseError.message);
          console.log('원본 응답:', responseText);

          // 3. AI 응답에서 부분적으로 데이터 추출 시도
          const fallbackData = this.extractDataFromText(responseText, githubData, data);
          return fallbackData;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(`포트폴리오 분석 중 오류 발생: ${error.message}`);
    }
  }

  async summarizeText(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 텍스트를 3줄로 요약하고 관련 키워드를 추출해주세요:

텍스트: ${text}

응답 형식:
요약: [3줄 요약]
키워드: [키워드1, 키워드2, 키워드3]`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  async analyzeSentiment(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 텍스트의 감정을 분석해주세요. 긍정, 부정, 중립 중 하나로 분류하고 이유를 설명해주세요:

텍스트: ${text}

응답 형식:
감정: [긍정/부정/중립]
이유: [분석 이유]`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  async generateResponse(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 질문이나 요청에 대해 도움이 되는 답변을 해주세요:

질문/요청: ${text}`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  async paraphraseText(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 텍스트를 같은 의미로 다른 표현으로 바꿔주세요. 원래 의미는 유지하되 문체나 단어 선택을 다르게 해주세요:

원본 텍스트: ${text}`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new InternalServerErrorException(`Gemini API 호출 중 오류 발생: ${error.message}`);
    }
  }

  // 기존 translate 메서드와 호환성을 위한 translateText 메서드
  async translateText(translationDto: TranslationDto): Promise<string> {
    return this.translate(translationDto);
  }
}
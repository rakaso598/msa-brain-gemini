# Portfolio Analysis Endpoint 기술 문서

## 📋 개요

`/gemini/analyze_portfolio` 엔드포인트는 사용자의 GitHub 저장소, 블로그 게시물, 이력서를 종합적으로 분석하여 포트폴리오에 대한 상세한 피드백을 제공하는 AI 기반 분석 서비스입니다.

## 🏗 아키텍처

```
Client Request → Rate Limiting → GitHub API → Web Scraping → Gemini AI → Structured Response
```

## 🛠 기술 스택

### Core Technologies
- **NestJS**: TypeScript 기반 백엔드 프레임워크
- **Google Gemini 2.5 Flash**: AI 텍스트 분석 및 생성
- **GitHub REST API**: 레포지토리 메타데이터 및 소스코드 수집
- **Cheerio**: 서버사이드 HTML 파싱 (웹 스크래핑)
- **Axios**: HTTP 클라이언트

### Dependencies
```json
{
  "@google/generative-ai": "^0.21.0",
  "@octokit/rest": "GitHub API 클라이언트",
  "axios": "HTTP 요청 라이브러리",
  "cheerio": "서버사이드 jQuery"
}
```

## 🔄 데이터 수집 파이프라인

### 1. GitHub API 연동
```typescript
private async fetchGitHubRepository(githubUrl: string): Promise<any> {
  // URL에서 owner/repo 추출
  const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
  
  // 레포지토리 기본 정보
  const { data: repoData } = await this.octokit.rest.repos.get({ owner, repo });
  
  // README 파일 수집
  const { data: readmeData } = await this.octokit.rest.repos.getReadme({ owner, repo });
  
  // package.json 및 주요 소스 파일 수집 (최대 5개)
  // ...
}
```

**수집 데이터:**
- 레포지토리 메타데이터 (이름, 설명, 언어, Stars, Forks, 토픽)
- README 파일 내용 (Base64 디코딩)
- package.json 의존성 정보
- 주요 소스 파일들 (.js, .ts, .py, .java, .go)
- 생성/업데이트 날짜

### 2. 웹 스크래핑 (Cheerio)
```typescript
private async fetchBlogContent(blogUrl: string): Promise<string> {
  const response = await axios.get(blogUrl, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0...' }
  });
  
  const $ = cheerio.load(response.data);
  
  // 다양한 블로그 플랫폼 대응
  const selectors = [
    'article', '.post-content', '.post-body', 
    '.entry-content', '.content', '.post', 'main', '.markdown-body'
  ];
  
  // 최적 콘텐츠 추출
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0 && element.text().length > 100) {
      return element.text().trim().slice(0, 5000);
    }
  }
}
```

**지원 플랫폼:**
- Medium
- Velog
- Tistory
- Naver Blog
- GitHub Pages
- 기타 일반적인 블로그 플랫폼

## 🤖 AI 분석 프로세스

### 1. 데이터 통합
수집된 모든 데이터를 하나의 구조화된 프롬프트로 통합:

```typescript
const prompt = `다음 포트폴리오 정보를 기반으로 종합적인 분석을 수행하고 JSON 형식으로 응답해주세요.

=== 분석 대상 ===
GitHub Repository 정보:
- 프로젝트명: ${githubData.name}
- 설명: ${githubData.description}
- 주요 언어: ${githubData.language}
- Stars: ${githubData.stargazersCount}
...

README 내용:
${githubData.readme.slice(0, 3000)}

Package.json 정보:
${githubData.packageJson.slice(0, 1000)}

주요 소스 파일들:
${githubData.mainFiles.join('\n\n')}

블로그 내용:
${blogContent.slice(0, 2000)}

이력서 정보:
${data.resumeText}
`;
```

### 2. Gemini AI 분석
- **모델**: `gemini-2.5-flash`
- **분석 영역**: 코드 품질, 문서화, 기술 스택, 프로젝트 완성도
- **출력 형식**: 구조화된 JSON

### 3. JSON 파싱 최적화
다단계 파싱 전략으로 안정성 확보:

```typescript
// 1차: 기본 JSON 파싱
try {
  return JSON.parse(responseText);
} catch (parseError) {
  // 2차: 텍스트 정제 후 재파싱
  let cleanedText = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/'/g, '"')
    .replace(/,(\s*[}\]])/g, '$1');
  
  const jsonStart = cleanedText.indexOf('{');
  const jsonEnd = cleanedText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(cleanedText);
  }
} catch (secondParseError) {
  // 3차: Fallback 데이터 생성
  return this.extractDataFromText(responseText, githubData, data);
}
```

## 📊 응답 구조

```json
{
  "summary": "전반적인 평가 요약",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "technicalFeedback": {
    "codeReview": "코드 구조 및 품질 피드백",
    "bestPractices": "베스트 프랙티스 제안",
    "techStack": "기술 스택 평가"
  },
  "documentationFeedback": {
    "readmeReview": "README 문서 피드백",
    "blogReview": "블로그 내용 피드백"
  },
  "projectAnalysis": {
    "complexity": 7,    // 1-10점
    "completeness": 8,  // 1-10점
    "innovation": 6     // 1-10점
  },
  "overallScore": 85,   // 종합 점수
  "nextSteps": ["개선사항1", "개선사항2", "개선사항3"]
}
```

## 🚦 Rate Limiting

### 설정
```typescript
@Throttle({ default: { limit: 1, ttl: 60000 } })
```

### 이유
- **Gemini API 비용**: 대용량 텍스트 분석으로 인한 높은 토큰 사용량
- **GitHub API Rate Limit**: 시간당 5,000 요청 (인증된 경우)
- **웹 스크래핑 부하**: 외부 사이트 서버 부하 최소화
- **서버 리소스**: CPU 집약적인 텍스트 처리

## 🔒 보안 고려사항

### API 키 관리
```typescript
constructor() {
  this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  this.octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // 선택사항
  });
}
```

### 입력 검증
- URL 형식 검증 (`@IsUrl()`)
- 텍스트 길이 제한 (5000자)
- 파일 크기 제한 (2000자/파일)

## ⚡ 성능 최적화

### 데이터 크기 제한
- README: 3,000자
- 소스 파일: 파일당 2,000자, 최대 5개
- 블로그 콘텐츠: 5,000자
- package.json: 1,000자

### 병렬 처리
```typescript
// GitHub API와 블로그 스크래핑을 병렬로 실행 가능
const [githubData, blogContent] = await Promise.all([
  this.fetchGitHubRepository(data.githubUrl),
  data.blogUrl ? this.fetchBlogContent(data.blogUrl) : Promise.resolve('')
]);
```

### 에러 처리
- GitHub API 실패 시 graceful degradation
- 블로그 스크래핑 실패 시 에러 메시지 포함
- JSON 파싱 실패 시 fallback 구조 반환

## 🌐 배포 환경 호환성

### Vercel
- ✅ 메모리 제한: 1GB (충분)
- ✅ 실행 시간: 10초 (최적화 필요)
- ✅ 서버리스 함수 호환

### 환경 변수
```bash
GEMINI_API_KEY=your_gemini_api_key        # 필수
GITHUB_TOKEN=your_github_token            # 선택사항 (rate limit 증가)
MY_API_KEY=your_secure_api_key           # API 보안
```

## 📈 모니터링 및 로깅

### 에러 추적
```typescript
try {
  // API 호출
} catch (error) {
  console.error('GitHub API 오류:', error.message);
  throw new Error(`GitHub 레포지토리 정보를 가져올 수 없습니다: ${error.message}`);
}
```

### 성능 메트릭
- GitHub API 응답 시간
- 웹 스크래핑 시간
- Gemini AI 처리 시간
- 전체 요청 처리 시간

## 🔮 향후 개선 방안

1. **캐싱 시스템**: Redis를 활용한 GitHub 데이터 캐싱
2. **배치 처리**: 여러 레포지토리 동시 분석
3. **실시간 분석**: WebSocket을 통한 진행 상황 실시간 업데이트
4. **ML 모델 통합**: 코드 복잡도 분석을 위한 별도 ML 모델
5. **다국어 지원**: 다양한 언어의 블로그 콘텐츠 분석

## 🧪 테스트

### 단위 테스트 예시
```typescript
describe('PortfolioAnalysisService', () => {
  it('should extract owner and repo from GitHub URL', () => {
    const url = 'https://github.com/owner/repo';
    const result = extractGitHubInfo(url);
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });
  
  it('should handle invalid GitHub URLs', () => {
    expect(() => extractGitHubInfo('invalid-url')).toThrow();
  });
});
```

## 📚 참고 자료

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Cheerio Documentation](https://cheerio.js.org/)
- [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting)

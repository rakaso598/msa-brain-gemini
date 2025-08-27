# MSA Brain Gemini - NestJS 기반 Gemini AI 마이크로서비스

## ✨ [GCP Cloud Run 배포 ### 📊 기능 개요
GitHub 저장소, 블로그 게시물, 이력서를 AI가 종합적으로 분석하여 포트폴리오에 대한 상세한 피드백을 제공합니다. 외부 API와 웹 스크래핑을 통해 데이터를 수집하고, Gemini AI가 이를 종합 분석합니다.

### 🔧 기술적 특징
- **GitHub REST API**: Octokit을 통한 레포지토리 메타데이터, README, 소스코드 자동 수집
- **웹 스크래핑**: Cheerio를 활용한 블로그 콘텐츠 추출 (Medium, Velog, Tistory, 개인 블로그 등 지원)
- **AI 분석**: Gemini 2.5 Flash로 수집된 데이터를 종합 분석
- **구조화된 응답**: 강점, 약점, 개선사항 등 체계적인 피드백 제공
- **보안**: API 키 인증 및 엄격한 레이트 리미팅 (1분 1회)
- **에러 핸들링**: 네트워크 오류, API 제한 등에 대한 견고한 처리API 문서 바로가기](https://msa-brain-gemini-173411279831.asia-northeast3.run.app/api)

<details>
  <summary><h2>📜 GCP 배포 URL로 Swagger 문서 접속</h2></summary>
  
  <img width="600" alt="image" src="docs/GCP배포URL로Swagger문서접속.png" />
  
</details>

<details>
  <summary><h2>📖 배포 Swagger 문서에서 실제 API 요청 보내보기</h2></summary>
  
  <img width="600" alt="image" src="docs/배포Swagger문서에서실제API요청보내보기.png" />
  
</details>

<details>
  <summary><h2>💿 Docker Desktop에서 배포할 이미지 실행시켜보기</h2></summary>
  
  <img width="600" alt="image" src="docs/DockerDesktop에서배포할이미지실행시켜보기.png" />
  
</details>

<details>
  <summary><h2>🧾 GCP에서 이미지 빌드 기록 보기</h2></summary>
  
  <img width="600" alt="image" src="docs/GCP에서이미지빌드기록보기.png" />
  
</details>

<details>
  <summary><h2>☁️ GCP 배포 시 포트 및 환경변수 설정</h2></summary>
  
  <img width="600" alt="image" src="docs/GCP배포시포트및환경변수설정.png" />
  
</details>

<details>
  <summary><h2>🧳 GCP 배포 시 GitHub 레포지토리와 연결하기</h2></summary>
  
  <img width="600" alt="image" src="docs/GCP배포시GitHub레포지토리와연결하기.png" />
  
</details>

<details>
  <summary><h2>💽 포트폴리오 종합 분석 API (GitHub API + Web Scraping)</h2></summary>
  
  <img width="600" alt="image" src="docs/포트폴리오종합분석API.png" />
  
</details>

<details>
  <summary><h2>🏹 포트폴리오 종합 분석 - 실제 요청 및 응답</h2></summary>
  
  <img width="600" alt="image" src="docs/포트폴리오종합분석실제요청및응답.png" />
  
</details>

## 🚀 핵심 기능

- **📝 문장 재구성 (Paraphrase)**: 입력 텍스트를 같은 의미로 다양한 표현으로 바꿔줍니다.
- **🌐 다국어 번역 (Translate)**: 텍스트를 원하는 언어로 번역합니다.
- **🖼️ 이미지 분석 (Analyze Image)**: 이미지를 업로드하고, 원하는 질문에 대해 AI가 이미지 내용을 분석해 답변합니다.
- **📚 창의적 스토리 생성 (Generate Story)**: 주제와 키워드로 창의적인 짧은 이야기를 생성합니다.
- **📄 텍스트 요약 및 키워드 추출**: 긴 텍스트를 3줄로 요약하고, 관련 키워드 3개를 추출합니다.
- **😊 감정 분석**: 텍스트의 감정을 긍정/부정/중립으로 분류하고 이유를 설명합니다.
- **🤖 AI 응답 생성**: 자유로운 쿼리에 대해 도움이 되는 답변을 생성합니다.
- **🎯 포트폴리오 종합 분석**: GitHub 저장소, 블로그, 이력서를 종합 분석하여 상세한 피드백 제공 **(신규 기능!)**

## 🌟 신규 기능: 포트폴리오 종합 분석

### 📊 기능 개요
GitHub 저장소, 블로그 게시물, 이력서를 AI가 종합적으로 분석하여 포트폴리오에 대한 상세한 피드백을 제공합니다.

### �️ 기술적 특징
- **GitHub REST API**: 레포지토리 메타데이터, README, 소스코드 자동 수집
- **웹 스크래핑**: Cheerio를 활용한 블로그 콘텐츠 추출 (Medium, Velog, Tistory 등 지원)
- **AI 분석**: Gemini 2.5 Flash로 수집된 데이터를 종합 분석
- **구조화된 응답**: 강점, 약점, 개선사항 등 체계적인 피드백 제공

### 📈 분석 항목
- **프로젝트 복잡도** (1-10점)
- **완성도** (1-10점)  
- **혁신성** (1-10점)
- **종합 점수** (100점 만점)
- **코드 리뷰 및 기술 스택 평가**
- **문서화 품질 평가**
- **구체적인 개선 방안 제시**

### 🚀 사용법
```json
POST /gemini/analyze_portfolio
{
  "githubUrl": "https://github.com/username/project",
  "blogUrl": "https://blog.example.com/post",
  "resumeText": "이력서 내용..."
}
```

> 📋 **자세한 기술 문서**: [Portfolio Analysis Endpoint 가이드](docs/PORTFOLIO_ANALYSIS_ENDPOINT.md)

## �🛡️ 보안 및 제한 사항

- **API 키 인증**: 모든 Gemini API 엔드포인트는 API 키 인증 필요
- **레이트 리미팅**: 무차별 대입 공격 및 과도한 사용 방지
  - 일반 API: 1분에 5개 요청
  - 고비용 작업(요약, AI응답, 이미지분석, 스토리생성): 1분에 2-3개 요청
  - **포트폴리오 분석: 1분에 1개 요청** (리소스 집약적)
  - 자세한 내용: [Rate Limiting 가이드](docs/RATE_LIMITING.md)

---

## 📡 API 엔드포인트 요약

| 메서드 | 엔드포인트                    | 설명                          | 레이트 제한        | 특징                           |
|--------|-------------------------------|-------------------------------|--------------------|--------------------------------|
| POST   | /gemini/summarize             | 텍스트 요약 및 키워드 추출    | 1분에 3개 요청     | 긴 텍스트 처리                |
| POST   | /gemini/analyze_sentiment     | 감정 분석                     | 1분에 5개 요청     | 감정 분류 + 분석 이유         |
| POST   | /gemini/generate_response     | AI 응답 생성                  | 1분에 3개 요청     | 자유로운 쿼리 응답            |
| POST   | /gemini/paraphrase            | 문장 재구성                   | 1분에 4개 요청     | 의미 보존한 표현 변경         |
| POST   | /gemini/translate             | 다국어 번역                   | 1분에 4개 요청     | 다양한 언어 지원              |
| POST   | /gemini/analyze_image         | 이미지 분석                   | 1분에 2개 요청     | 멀티모달 AI 분석              |
| POST   | /gemini/generate_story        | 창의적 스토리 생성            | 1분에 2개 요청     | 테마 기반 창작                |
| POST   | /gemini/analyze_portfolio     | **포트폴리오 종합 분석**      | **1분에 1개 요청** | **GitHub API + 웹스크래핑**   |
| GET    | /health                       | 헬스체크                      | 제한 없음          | 서버 상태 확인                |

---

## 🛠️ 빠른 시작

### 1. 환경 변수 설정

`.env` 파일에 아래와 같이 설정하세요:
```env
# Gemini AI API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub API Configuration (포트폴리오 분석용)
GITHUB_TOKEN=your_github_token_here

# API Security Configuration
MY_API_KEY=your_secure_api_key_here

# Application Configuration
PORT=8000
NODE_ENV=production
```

> **⚠️ 보안 주의사항**: 
> - `MY_API_KEY`는 API 접근을 제어하는 중요한 키입니다. 강력한 키를 설정하고 외부에 노출되지 않도록 주의하세요.
> - `GITHUB_TOKEN`은 **포트폴리오 분석 기능에 권장**됩니다. GitHub API rate limit을 시간당 60 → 5000 요청으로 증가시킵니다.
> - `GEMINI_API_KEY`는 Google AI Studio에서 발급받으세요.

### 2. Docker로 실행 (권장)

```bash
# 이미지 빌드
npm run docker:build
# 컨테이너 실행
npm run docker:run
```

### 3. 로컬 개발
```bash
npm install
npm run start:dev
```

---

## 📡 주요 API 예시

### 문장 재구성
```http
POST /gemini/paraphrase
Content-Type: application/json
{
  "text": "오늘은 날씨가 매우 좋습니다."
}
```

### 다국어 번역
```http
POST /gemini/translate
Content-Type: application/json
{
  "text": "안녕하세요. 오늘 날씨가 좋네요.",
  "targetLang": "English"
}
```

### 이미지 분석
```http
POST /gemini/analyze_image
Content-Type: multipart/form-data
image=<파일 업로드>, query="이 이미지에서 무엇을 볼 수 있나요?"
```

### 창의적 스토리 생성
```http
POST /gemini/generate_story
Content-Type: application/json
{
  "theme": "우주 모험",
  "keywords": ["우주선", "외계인", "모험"]
}
```

### 텍스트 요약
```http
POST /gemini/summarize
Content-Type: application/json
{
  "text": "요약할 텍스트 내용"
}
```

### 감정 분석
```http
POST /gemini/analyze_sentiment
Content-Type: application/json
{
  "text": "감정을 분석할 텍스트"
}
```

### AI 응답 생성
```http
POST /gemini/generate_response
Content-Type: application/json
{
  "text": "질문 또는 요청 내용"
}
```

### 🎯 포트폴리오 종합 분석 (신규!)
```http
POST /gemini/analyze_portfolio
Content-Type: application/json
{
  "githubUrl": "https://github.com/username/repository",
  "blogUrl": "https://blog.example.com/post",
  "resumeText": "이력서 내용..."
}
```

**응답 예시:**
```json
{
  "summary": "포트폴리오 전반적인 평가 요약",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "technicalFeedback": {
    "codeReview": "코드 구조 및 품질 피드백",
    "bestPractices": "베스트 프랙티스 제안",
    "techStack": "기술 스택 평가"
  },
  "projectAnalysis": {
    "complexity": 7,
    "completeness": 8,
    "innovation": 6
  },
  "overallScore": 85,
  "nextSteps": ["개선사항1", "개선사항2", "개선사항3"]
}
```
```

### 헬스체크
```http
GET /health
```

---

---

## 🔐 API 인증

모든 Gemini API 엔드포인트는 API 키 인증이 필요합니다. 요청 시 헤더에 API 키를 포함해야 합니다.

### API 키 헤더 설정

```bash
# curl 사용 예시
curl -X POST "http://localhost:8000/gemini/summarize" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_secure_api_key_here" \
  -d '{"text": "요약할 텍스트를 입력하세요"}'
```

### Swagger UI에서 인증

1. [Swagger 문서](http://localhost:8000/api)에 접속
2. 우측 상단의 **Authorize** 버튼 클릭
3. API 키 입력 후 **Authorize** 클릭
4. 이제 모든 API를 테스트할 수 있습니다

### 인증이 필요하지 않은 엔드포인트

- `GET /` - 서비스 정보
- `GET /health` - 헬스체크

---

## 🏗️ 프로젝트 구조

```
/msa-brain-gemini
├── src/
│   ├── modules/
│   │   └── gemini/
│   │       ├── gemini.controller.ts  # API 엔드포인트 정의
│   │       ├── gemini.service.ts     # 비즈니스 로직 및 외부 API 연동
│   │       ├── gemini.module.ts      # 모듈 설정
│   │       └── dto/
│   │           └── gemini.dto.ts     # 데이터 전송 객체
│   ├── guards/
│   │   └── api-key.guard.ts          # API 키 인증 가드
│   ├── app.module.ts                 # 루트 모듈
│   └── main.ts                       # 애플리케이션 진입점
├── docs/                             # 기술 문서
│   ├── PORTFOLIO_ANALYSIS_ENDPOINT.md
│   ├── RATE_LIMITING.md
│   └── API_KEY_SECURITY.md
├── Dockerfile                        # Docker 이미지 빌드 설정
├── docker-compose.yml               # Docker Compose 설정
├── package.json                     # 의존성 및 스크립트
└── README.md                        # 프로젝트 개요
```

## 🛠️ 기술 스택

### 🏗️ 핵심 프레임워크
- **Framework**: NestJS
- **Language**: TypeScript
- **Container**: Docker
- **Package Manager**: npm

### 🤖 AI 및 외부 API
- **AI Service**: Google Gemini 2.5 Flash API
- **GitHub Integration**: GitHub REST API via @octokit/rest
- **Web Scraping**: Cheerio.js

### 🔒 보안 및 성능
- **Authentication**: API Key 기반 인증
- **Rate Limiting**: @nestjs/throttler
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

### 🌐 HTTP 클라이언트
- **HTTP Client**: Axios
- **File Upload**: Multer (multipart/form-data)

## 📝 개발 스크립트

```bash
npm run build       # 프로젝트 빌드
npm run start       # 애플리케이션 시작
npm run start:dev   # 개발 모드로 시작 (watch mode)
npm run start:prod  # 프로덕션 모드로 시작
npm run lint        # 코드 린팅
npm run test        # 테스트 실행
```

## 🔧 환경 설정

### 필수 요구사항
- **Node.js**: 18.x 이상
- **npm**: 8.x 이상
- **Gemini API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급

### 선택사항 (권장)
- **GitHub Token**: [GitHub Settings](https://github.com/settings/tokens)에서 발급 (포트폴리오 분석 기능 향상)
- **Docker**: 컨테이너 환경에서 실행 시

### API 키 발급 가이드
1. **Gemini API Key**: Google AI Studio → API Key 생성
2. **GitHub Token**: GitHub Settings → Developer settings → Personal access tokens → Generate new token (public_repo 권한 필요)

## 📞 문의 및 추가 자료

### 📚 상세 문서
- [포트폴리오 분석 엔드포인트 가이드](docs/PORTFOLIO_ANALYSIS_ENDPOINT.md)
- [레이트 리미팅 정책](docs/RATE_LIMITING.md)
- [API 키 보안 가이드](docs/API_KEY_SECURITY.md)

### 🐛 이슈 및 기여
프로젝트에 대한 문의사항, 버그 리포트, 기능 제안은 GitHub Issues를 통해 남겨주세요.

### 📧 연락처
추가적인 문의사항이 있으시면 이슈를 통해 연락해주세요.

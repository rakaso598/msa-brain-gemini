# 🤖 Brain API - NestJS 기반 AI 마이크로서비스

NestJS를 사용한 Gemini AI 기반 브레인 컨테이너 프로젝트입니다.

## 📋 주요 기능

- **텍스트 요약 및 키워드 추출**: 긴 텍스트를 핵심 내용으로 요약하고 관련 키워드를 추출합니다.
- **감정 분석**: 텍스트의 감정을 분석하여 긍정, 부정, 중립으로 분류합니다.
- **응답 생성**: 사용자 쿼리에 대해 도움이 되는 답변을 생성합니다.

## 🚀 시작하기

### 환경 변수 설정

`.env` 파일에 Gemini API 키를 설정해주세요:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
NODE_ENV=development
```

### 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm run start:prod
```

### 🐳 Docker로 실행 (권장)

#### 1. 환경변수 설정
먼저 `.env` 파일에 실제 Gemini API 키를 설정하세요:
```bash
# .env 파일 편집
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
PORT=8000
```

#### 2. Docker Compose 사용 (가장 간단)
```bash
# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f brain-api

# 중지
docker-compose down
```

#### 3. 개별 Docker 명령어
```bash
# 이미지 빌드
docker build -t brain-api .

# 컨테이너 실행 (.env 파일 사용)
docker run -d \
  --name brain-api-container \
  --env-file .env \
  -p 8000:8000 \
  brain-api

# 또는 환경변수 직접 지정
docker run -d \
  --name brain-api-container \
  -e GEMINI_API_KEY=your_key \
  -e NODE_ENV=production \
  -p 8000:8000 \
  brain-api
```

📋 **상세한 Docker 가이드**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) 참조

## 📡 API 문서화

### 🔗 Swagger UI
프로젝트에는 완전한 API 문서화가 포함되어 있습니다:

```
http://localhost:8000/api
```

Swagger UI에서 다음과 같은 기능을 제공합니다:
- 📋 모든 API 엔드포인트 및 스키마 정보
- 🧪 브라우저에서 직접 API 테스트 가능
- 📝 상세한 요청/응답 예시
- 🏷️ API 태그별 분류
- 📊 에러 코드 및 응답 형식 문서화

## 📡 API 엔드포인트

### 1. 텍스트 요약

```http
POST /gemini/summarize
Content-Type: application/json

{
  "text": "요약할 텍스트 내용"
}
```

### 2. 감정 분석

```http
POST /gemini/analyze_sentiment
Content-Type: application/json

{
  "text": "감정을 분석할 텍스트"
}
```

### 3. 응답 생성

```http
POST /gemini/generate_response
Content-Type: application/json

{
  "query": "질문 또는 요청 내용"
}
```

## 🏗️ 프로젝트 구조

```
/brain-api
├── src/
│   ├── modules/
│   │   └── gemini/
│   │       ├── gemini.controller.ts
│   │       ├── gemini.module.ts
│   │       └── gemini.service.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🛠️ 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **AI Service**: Google Gemini API
- **Container**: Docker
- **Package Manager**: npm

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

- **Node.js**: 18.x 이상
- **npm**: 8.x 이상
- **Gemini API Key**: Google AI Studio에서 발급

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 이슈를 통해 남겨주세요.

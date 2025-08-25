### NestJS 기반 '브레인' 컨테이너 프로젝트 SKELETON

이 문서는 AI 마이크로서비스인 **'브레인' 컨테이너**의 초기 개발을 위한 프로젝트 골격을 정의합니다. NestJS를 사용하여 모듈화되고 확장 가능한 구조를 구축하는 것이 목표입니다.

-----

### 1\. 프로젝트 구조

```
/brain-api
├── src/
│   ├── modules/
│   │   ├── gemini/
│   │   │   ├── gemini.controller.ts
│   │   │   ├── gemini.module.ts
│   │   │   └── gemini.service.ts
│   │   └── app.module.ts
│   ├── main.ts
├── Dockerfile
├── docker-compose.yml
├── .env
├── .gitignore
├── package.json
└── README.md
```

  - **`src/`**: 모든 소스 코드가 위치하는 디렉토리입니다.
  - **`src/modules/gemini/`**: '브레인' 컨테이너의 핵심 로직을 담당하는 Gemini 모듈입니다.
      - **`gemini.controller.ts`**: HTTP 요청을 처리하는 엔드포인트를 정의합니다.
      - **`gemini.service.ts`**: 실제 Gemini API 호출 및 프롬프트 엔지니어링과 같은 비즈니스 로직을 담당합니다.
      - **`gemini.module.ts`**: Gemini 컨트롤러와 서비스를 캡슐화하고 의존성을 관리합니다.
  - **`src/main.ts`**: NestJS 애플리케이션의 진입점입니다.
  - **`Dockerfile`**: 애플리케이션을 도커 컨테이너로 빌드하기 위한 파일입니다.
  - **`docker-compose.yml`**: 여러 컨테이너 서비스를 함께 관리하기 위한 파일입니다.
  - **`.env`**: 민감한 환경 변수(예: Gemini API 키)를 저장합니다.
  - **`package.json`**: 프로젝트의 메타데이터와 의존성 목록을 정의합니다.

-----

### 2\. 주요 파일별 코드 골격

아래 코드를 기반으로 각 파일을 채워주세요.

#### `src/modules/gemini/gemini.service.ts`

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  // 텍스트 요약 및 키워드 추출 로직
  async summarizeText(text: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
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
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
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
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
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
```

#### `src/modules/gemini/gemini.controller.ts`

```typescript
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('summarize')
  async summarizeText(@Body('text') text: string) {
    if (!text) {
      throw new HttpException('텍스트 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }
    const summary = await this.geminiService.summarizeText(text);
    return { summary };
  }

  @Post('analyze_sentiment')
  async analyzeSentiment(@Body('text') text: string) {
    if (!text) {
      throw new HttpException('텍스트 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }
    const sentiment = await this.geminiService.analyzeSentiment(text);
    return { sentiment };
  }

  @Post('generate_response')
  async generateResponse(@Body('query') query: string) {
    if (!query) {
      throw new HttpException('쿼리 필드가 필요합니다.', HttpStatus.BAD_REQUEST);
    }
    const response = await this.geminiService.generateResponse(query);
    return { response };
  }
}
```

#### `src/modules/gemini/gemini.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}
```

#### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GeminiModule } from './modules/gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

#### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8000);
}
bootstrap();
```

#### `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=prod

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["node", "dist/main"]
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  brain-api:
    build:
      context: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: always
```

-----

### 3\. Copilot에게 작업 지시

**위 `SKELETON.md` 파일을 기반으로 다음 작업을 수행해줘:**

1.  `package.json` 파일을 생성하고 필요한 의존성(`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@google/generative-ai`, `dotenv`, `typescript` 등)을 추가해줘.
2.  `tsconfig.json` 파일을 NestJS 기본 설정에 맞게 생성해줘.
3.  `.gitignore` 파일에 `node_modules`와 `.env`를 추가해줘.
4.  위에 제시된 코드를 바탕으로 각 파일을 완성하고, 필요한 경우 유효성 검사(validation)를 추가해줘.
5.  모든 코드가 정상적으로 동작하는지 확인하고, 최종적으로 빌드 및 실행 가능한 상태로 만들어줘.
# NestJS 활용 가이드 (msa-brain-gemini)

이 문서는 msa-brain-gemini 프로젝트에서 NestJS가 어떻게 활용되고 있는지, 어떤 계층에서 동작하는지, 그리고 실질적인 활용 방안과 구조적 이점을 상세히 설명합니다.

---

## 1. NestJS란?
NestJS는 Node.js 환경에서 동작하는 진보된 백엔드 프레임워크로, 모듈화, 의존성 주입(DI), 데코레이터 기반 구조, 테스트 용이성 등 엔터프라이즈급 서버 개발에 최적화된 구조를 제공합니다.

---

## 2. 프로젝트 내 NestJS 활용 구조

### 2.1. 계층별 구조
- **Entry Point**: `src/main.ts`에서 Nest 애플리케이션을 부트스트랩합니다.
- **App Module**: `src/app.module.ts`는 모든 모듈의 루트이며, 전체 의존성 트리의 시작점입니다.
- **Modules**: `src/modules/` 폴더 내에 도메인별 모듈(예: gemini)이 존재합니다.
- **Controllers**: 각 모듈의 컨트롤러(예: `gemini.controller.ts`)가 HTTP 요청을 처리합니다.
- **Services**: 비즈니스 로직은 서비스(예: `gemini.service.ts`)에 구현되어 있습니다.
- **DTOs & Entities**: 데이터 전송 객체와 엔티티를 통해 타입 안정성과 계층 분리를 강화합니다.

### 2.2. 주요 파일별 Nest 활용 예시
- `main.ts`: NestFactory로 앱 인스턴스 생성, 미들웨어/글로벌 파이프 설정
- `app.module.ts`: 모듈/컨트롤러/서비스 등록, 의존성 주입
- `modules/gemini/gemini.controller.ts`: 데코레이터(@Controller, @Post 등)로 라우팅 및 요청 처리
- `modules/gemini/gemini.service.ts`: @Injectable 데코레이터로 서비스 선언, DI 활용

---

## 3. NestJS의 계층별 동작 방식

1. **클라이언트 요청** →
2. **Controller**: HTTP 요청을 받아 파라미터/바디를 파싱
3. **Service**: 비즈니스 로직 처리, 외부 API 호출 등
4. **Module**: 관련 컨트롤러/서비스/프로바이더를 묶어 관리
5. **AppModule**: 모든 모듈을 통합
6. **main.ts**: 앱 전체를 실행

---

## 4. 실질적 활용 방안 및 이점
- **모듈화**: 기능별로 코드를 분리해 유지보수성과 확장성 향상
- **의존성 주입(DI)**: 테스트 용이, 코드 재사용성 증가
- **데코레이터 기반 선언적 프로그래밍**: 코드 가독성 및 생산성 향상
- **테스트 친화적 구조**: 각 계층별 단위 테스트 작성이 용이
- **API 문서화**: Swagger 등과 연동해 자동 API 문서 생성 가능

---

## 5. 결론
NestJS는 msa-brain-gemini 프로젝트의 핵심 백엔드 프레임워크로, 모든 API, 비즈니스 로직, 모듈 구조, 의존성 관리가 NestJS 위에서 동작합니다. Nest의 계층적 구조와 모듈화, DI, 데코레이터 패턴을 적극 활용하여 확장성과 유지보수성이 뛰어난 AI 마이크로서비스를 구현할 수 있습니다.

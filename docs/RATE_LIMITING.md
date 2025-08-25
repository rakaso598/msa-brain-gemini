# Rate Limiting (레이트 리미팅) 가이드

## 개요
API 무차별 대입 공격과 과도한 사용을 방지하기 위해 레이트 리미팅을 적용했습니다.

---

## 글로벌 제한 사항
- **기본**: 1분에 최대 10개 요청
- **중간**: 10분에 최대 50개 요청  
- **장기**: 1시간에 최대 100개 요청

---

## Gemini API 엔드포인트별 제한 사항

### 일반 텍스트 처리
- **감정 분석** (`/gemini/analyze_sentiment`): 1분에 5개 요청
- **문장 재구성** (`/gemini/paraphrase`): 1분에 4개 요청
- **번역** (`/gemini/translate`): 1분에 4개 요청

### 고비용 작업 (더 엄격한 제한)
- **텍스트 요약** (`/gemini/summarize`): 1분에 3개 요청
- **AI 응답 생성** (`/gemini/generate_response`): 1분에 3개 요청
- **이미지 분석** (`/gemini/analyze_image`): 1분에 2개 요청
- **스토리 생성** (`/gemini/generate_story`): 1분에 2개 요청

---

## 제한 초과 시 응답
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

---

## 장점
1. **무차별 대입 공격 방지**: API 키를 탈취당해도 단시간 내 대량 요청 불가
2. **서비스 안정성**: 과도한 요청으로 인한 서버 부하 방지  
3. **비용 보호**: Gemini API 사용량 급증으로 인한 예상치 못한 요금 방지
4. **공정한 사용**: 모든 사용자가 안정적으로 API를 이용할 수 있도록 보장

---

## 기술적 구현
- **NestJS Throttler**: `@nestjs/throttler` 패키지 사용
- **IP 기반 추적**: 클라이언트 IP 주소별로 요청 횟수 추적
- **메모리 저장**: 기본적으로 메모리에 요청 횟수 저장 (Redis 등으로 확장 가능)
- **다층 보안**: API 키 인증과 함께 사용하여 이중 보안 효과

# API Key 인증 및 보안 가이드

## 목적
외부에서 무분별하게 API를 호출하여 사용량이 초과되거나 요금이 발생하는 것을 방지하기 위해, 모든 주요 엔드포인트에 대해 API Key 인증을 적용합니다.

---

## 적용 방식
- **글로벌 가드**로 NestJS 미들웨어 레벨에서 모든 요청을 검사합니다.
- 환경 변수(`MY_API_KEY`)에 저장된 값과 요청 헤더의 값을 비교하여 일치할 때만 API를 수행합니다.
- Health check(`/health`, `/`) 엔드포인트는 인증 없이 접근 가능합니다.

---

## 환경 변수 설정 예시
```
MY_API_KEY=7a71af3f8b43dab6ab9a2e94ac92919fccb6ca4ba9391112044d7a0aeccf19e9
```

---

## 요청 예시
### 1. curl 사용
```bash
curl -X POST "http://localhost:8000/gemini/summarize" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 7a71af3f8b43dab6ab9a2e94ac92919fccb6ca4ba9391112044d7a0aeccf19e9" \
  -d '{"text": "요약할 텍스트를 입력하세요"}'
```

### 2. Swagger UI 사용
- [Swagger 문서](http://localhost:8000/api) 접속
- 우측 상단 **Authorize** 클릭 후 API Key 입력

---

## 인증 실패 시 응답 예시
- API 키가 없거나 잘못된 경우:
```json
{
  "statusCode": 401,
  "message": "Invalid API key provided",
  "error": "Unauthorized"
}
```

---

## 보안 권장 사항
- API Key는 외부에 노출되지 않도록 주의하세요.
- 주기적으로 키를 변경하고, 필요시 여러 키를 관리할 수 있도록 확장 가능합니다.

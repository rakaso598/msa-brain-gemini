### **포트폴리오 분석을 위한 새로운 API 설계**

기존의 `Brain API`는 텍스트와 이미지 처리 기능만 가지고 있어, 포트폴리오 분석이라는 복합적인 작업을 수행하기에는 적합하지 않습니다. 따라서 새로운 API를 추가하여 이 기능을 전담하도록 설계하는 것이 합리적입니다.

새로운 API는 기존 API의 기능을 호출하면서도, 포트폴리오 분석에 필요한 고유한 로직을 처리하는 역할을 하게 됩니다.

-----

### **필요한 신규 API: `POST /gemini/analyze_portfolio`**

**1. 엔드포인트**

  * **`POST /gemini/analyze_portfolio`**

**2. API 목적**

  * 사용자의 포트폴리오 정보를 받아, Gemini AI를 활용해 종합적인 분석을 수행하고 체계적인 피드백을 제공합니다.
  * 이 API는 단일 요청으로 복잡한 여러 분석(코드 분석, 문서 평가, 종합 평가)을 처리하게 됩니다.

**3. 요청 (Request) 명세**

`Content-Type: application/json`

```json
{
  "githubUrl": "https://github.com/rakaso598/msa-self-dashboard-gemini",
  "blogUrl": "https://your-blog.tistory.com/post/123",
  "resumeText": "개인 이력서 내용을 텍스트로 붙여넣습니다."
}
```

  * **`githubUrl`** (필수): 분석할 GitHub 저장소 URL입니다.
  * **`blogUrl`** (선택): 분석할 블로그 게시물 URL입니다.
  * **`resumeText`** (선택): 이력서 내용을 직접 입력할 수 있습니다.

**4. 응답 (Response) 명세**

`Content-Type: application/json`

**성공 시 (200 OK)**

```json
{
  "summary": "AI가 요약한 포트폴리오의 전반적인 평가와 강점 요약",
  "strengths": [
    "마이크로서비스 아키텍처에 대한 깊은 이해",
    "명확한 README 문서 작성 능력"
  ],
  "weaknesses": [
    "프로젝트 코드의 테스트 커버리지 부족",
    "특정 기술 스택에 대한 활용 사례 부족"
  ],
  "technicalFeedback": {
    "codeReview": "코드 구조 및 가독성에 대한 구체적인 피드백",
    "bestPractices": "적용하면 좋을 베스트 프랙티스 제안"
  },
  "documentationFeedback": {
    "readmeReview": "README 문서의 내용 및 구성에 대한 피드백",
    "blogReview": "블로그 글의 논리 전개 및 내용에 대한 피드백"
  },
  "overallScore": 85,
  "nextSteps": [
    "테스트 코드를 추가하여 코드 안정성 확보",
    "블로그에 프로젝트 설계 과정을 상세히 기술하기"
  ]
}
```

**실패 시 (400 Bad Request 또는 500 Internal Server Error)**

```json
{
  "error": "요청 URL이 유효하지 않습니다."
}
```

**5. 내부 동작 방식 (논리적 구조)**

1.  **요청 수신:** `analyze_portfolio` 엔드포인트가 요청을 받습니다.
2.  **데이터 수집:** `githubUrl` 및 `blogUrl`을 기반으로 GitHub API나 웹 크롤러를 이용해 필요한 데이터를 수집합니다.
3.  **데이터 통합 및 전처리:** 수집된 데이터와 `resumeText`를 하나의 텍스트로 통합하고, AI가 분석하기 좋게 정제합니다.
4.  **AI 분석 요청:** 정제된 데이터를 \*\*`generate_response`\*\*와 같은 기존 `Brain API`의 기능으로 전달합니다. 이때, **AI 프롬프트 엔지니어링**을 통해 "다음 포트폴리오를 기반으로 강점, 약점, 개선점, 기술 피드백, 문서 피드백을 JSON 형식으로 작성해 줘"와 같이 구체적인 지시를 내립니다.
5.  **응답 파싱 및 재구성:** Gemini AI로부터 받은 응답(JSON 형식)을 파싱하여, 최종 응답 형태에 맞게 재구성합니다.
6.  **최종 응답 전송:** 사용자에게 분석 결과를 JSON 형식으로 전송합니다.

이러한 방식으로 API를 설계하면 기존 시스템의 유연성을 유지하면서도, 복잡한 비즈니스 로직을 명확하게 분리하여 관리할 수 있습니다.
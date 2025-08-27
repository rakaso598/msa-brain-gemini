네, 알겠습니다. 웹 스크래핑 로직 구현에 대한 간단한 마크다운 문서를 작성해 드리겠습니다.

-----

### **웹 스크래핑 및 데이터 수집 로직 구현 가이드**

이 문서는 `analyzePortfolio` 메서드 내에서 Gemini AI에 분석을 요청하기 전, 포트폴리오 데이터를 수집하는 방법에 대한 상세 가이드입니다.

#### **1. GitHub 데이터 수집**

  * **기술**: **GitHub REST API**를 사용합니다.
  * **구현**: `axios`와 같은 HTTP 클라이언트를 사용하여 다음 API 엔드포인트를 호출합니다.
      * `GET /repos/{owner}/{repo}`: 저장소의 기본 정보
      * `GET /repos/{owner}/{repo}/readme`: README.md 파일 내용
      * `GET /repos/{owner}/{repo}/contents/{path}`: 특정 파일의 내용
  * **주의**: GitHub API의 **Rate Limiting**을 고려해야 합니다. 인증 없이 호출 시 제한이 걸릴 수 있으므로,  개인 액세스 토큰(Personal Access Token)을 발급받아 환경 변수로 관리하고 요청 헤더에 포함시키는 것이 좋습니다.

#### **2. 블로그 데이터 수집 (웹 스크래핑)**

  * **기술**: **Cheerio + Axios** 조합을 사용합니다.
  * **구현**:
    1.  `axios`를 사용해 `blogUrl`로 HTTP 요청을 보내 블로그 페이지의 HTML을 가져옵니다.
    2.  `cheerio`를 사용해 HTML을 파싱합니다.
    3.  `.post-body`, `.article-content` 등 블로그 본문 내용을 담는 HTML 요소를 식별하고, 해당 요소의 텍스트를 추출합니다.
  * **주의**: 모든 블로그의 HTML 구조가 동일하지 않으므로, 여러 플랫폼(티스토리, 네이버 블로그 등)을 고려하여 적절한 셀렉터를 사용하거나, 특정 플랫폼에 종속된 스크래핑 로직을 분리하는 것이 좋습니다.

-----

### **3. 데이터 통합 및 AI 프롬프트 구성**

  * **로직**: GitHub API와 웹 스크래핑으로 얻은 데이터를 하나의 문자열로 통합합니다.
  * **예시**:
    ```typescript
    const portfolioData = `
    ### GitHub README
    ${githubReadmeContent}

    ### Blog Post
    ${blogPostContent}

    ### Resume
    ${resumeText}
    `;
    // 이 데이터를 Gemini AI 호출 시 프롬프트에 포함시킵니다.
    const prompt = `다음 포트폴리오 정보를 기반으로 분석해주세요: ${portfolioData}`;
    ```
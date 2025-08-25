# 🐳 Brain API Docker 실행 가이드

## 사전 준비
1. `.env` 파일에 실제 Gemini API 키를 설정하세요
2. Docker와 Docker Compose가 설치되어 있어야 합니다

## 🌟 방법 1: Docker Compose 사용 (권장)

### 빌드 및 실행
```bash
# .env 파일에 API 키 설정 후
docker-compose up -d

# 로그 확인
docker-compose logs -f brain-api

# 상태 확인
docker-compose ps

# 중지
docker-compose down

# 이미지 재빌드
docker-compose up -d --build
```

### 접속
- API: http://localhost:8000
- Swagger: http://localhost:8000/api
- Health: http://localhost:8000/health

## 🔧 방법 2: 개별 Docker 명령어

### 1) 이미지 빌드
```bash
docker build -t brain-api:latest .
```

### 2) 컨테이너 실행 (.env 파일 사용)
```bash
docker run -d \
  --name brain-api-container \
  --env-file .env \
  -p 8000:8000 \
  --restart unless-stopped \
  brain-api:latest
```

### 3) 또는 환경변수 직접 지정
```bash
docker run -d \
  --name brain-api-container \
  -e GEMINI_API_KEY=your_actual_api_key_here \
  -e NODE_ENV=production \
  -e PORT=8000 \
  -p 8000:8000 \
  --restart unless-stopped \
  brain-api:latest
```

### 4) 컨테이너 관리
```bash
# 로그 확인
docker logs -f brain-api-container

# 컨테이너 상태 확인
docker ps

# 컨테이너 중지
docker stop brain-api-container

# 컨테이너 제거
docker rm brain-api-container

# 이미지 제거
docker rmi brain-api:latest
```

## 🔐 환경변수 설정 방법

### A. .env 파일 사용 (권장)
```bash
# .env 파일에 설정
GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here
NODE_ENV=production
PORT=8000
```

### B. Docker 명령어에서 직접 지정
```bash
docker run -e GEMINI_API_KEY=your_key -e NODE_ENV=production ...
```

### C. Docker Compose에서 environment 섹션 사용
```yaml
services:
  brain-api:
    environment:
      - GEMINI_API_KEY=your_key
      - NODE_ENV=production
```

## 🧪 API 테스트

### 1) 헬스체크
```bash
curl http://localhost:8000/health
```

### 2) 텍스트 요약 테스트
```bash
curl -X POST http://localhost:8000/gemini/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"인공지능은 미래 기술의 핵심입니다."}'
```

### 3) 감정 분석 테스트
```bash
curl -X POST http://localhost:8000/gemini/analyze_sentiment \
  -H "Content-Type: application/json" \
  -d '{"text":"오늘 정말 기분이 좋다!"}'
```

## 🚨 문제 해결

### API 키 오류 시
1. `.env` 파일의 GEMINI_API_KEY 확인
2. Google AI Studio에서 새 키 발급: https://aistudio.google.com/app/apikey
3. 컨테이너 재시작: `docker-compose restart`

### 포트 충돌 시
1. `docker-compose.yml`에서 포트 변경: `"8001:8000"`
2. 또는 기존 프로세스 중지

### 빌드 오류 시
1. Docker 캐시 정리: `docker system prune -a`
2. 강제 재빌드: `docker-compose up -d --build --force-recreate`

## 📊 모니터링

### 컨테이너 리소스 사용량
```bash
docker stats brain-api-container
```

### 헬스체크 상태
```bash
docker inspect --format='{{.State.Health.Status}}' brain-api-container
```

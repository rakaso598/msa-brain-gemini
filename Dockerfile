FROM node:18-alpine

# 필요한 패키지 설치 (healthcheck용)
RUN apk add --no-cache wget

WORKDIR /usr/src/app

# Package 파일들 먼저 복사 (캐시 최적화)
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드
RUN npm run build

# 불필요한 개발 파일 제거
RUN rm -rf src tsconfig*.json nest-cli.json

# 사용자 생성 (보안)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# 포트 노출
EXPOSE 8000

# 환경 설정
ENV NODE_ENV=production

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# 애플리케이션 시작
CMD ["node", "dist/main"]

# ===============================================
# 🏗️ Build Stage - 애플리케이션 빌드
# ===============================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Package 파일들 복사
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 모든 의존성 설치 (devDependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드
RUN npm run build

# 프로덕션 의존성만 설치
RUN npm ci --only=production && npm cache clean --force

# ===============================================
# 🚀 Production Stage - 실행 환경
# ===============================================
FROM node:18-alpine AS production

# 필요한 패키지 설치 (healthcheck용)
RUN apk add --no-cache wget dumb-init

# 사용자 생성 (보안)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /usr/src/app

# 빌드된 파일들 복사 (builder stage에서)
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/package*.json ./

# 사용자 전환
USER nestjs

# 포트 노출
EXPOSE 8080

# 환경 설정
ENV NODE_ENV=production

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# 애플리케이션 시작 (dumb-init 사용으로 시그널 처리 개선)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

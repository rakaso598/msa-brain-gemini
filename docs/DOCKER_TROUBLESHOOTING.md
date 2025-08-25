# 🐳 Docker Troubleshooting Guide

This document provides solutions to common Docker-related issues when working with the MSA Brain Gemini project.

## Table of Contents

- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Environment Variable Issues](#environment-variable-issues)
- [Network Issues](#network-issues)
- [Performance Issues](#performance-issues)
- [Development Issues](#development-issues)

## Build Issues

### 🚨 "nest: not found" Error During Build

**Error Message:**
```
> brain-api@1.0.0 build /usr/src/app
> nest build

sh: nest: not found
```

**Cause:** The NestJS CLI is not available during the build process.

**Solutions:**

1. **Ensure devDependencies are installed:**
   ```dockerfile
   # Make sure this is in your Dockerfile
   RUN npm ci  # This installs both dependencies and devDependencies
   ```

2. **Verify @nestjs/cli is in package.json:**
   ```json
   "devDependencies": {
     "@nestjs/cli": "^10.3.0",
     // ... other deps
   }
   ```

3. **Use multi-stage build (recommended):**
   ```dockerfile
   # Build stage - includes devDependencies
   FROM node:18-alpine AS builder
   WORKDIR /usr/src/app
   COPY package*.json ./
   RUN npm ci  # Installs all dependencies including dev
   COPY . .
   RUN npm run build
   
   # Production stage - only production dependencies
   FROM node:18-alpine AS production
   # ... copy built files
   ```

### 🚨 "COPY failed" or "no such file or directory"

**Solutions:**

1. **Check .dockerignore file:**
   ```dockerignore
   # Make sure these are NOT ignored if needed for build:
   # src/
   # package.json
   # tsconfig.json
   ```

2. **Verify file paths in COPY commands:**
   ```dockerfile
   COPY package*.json ./          # ✅ Good
   COPY src ./src                 # ✅ Good
   COPY ./src ./src               # ❌ Avoid leading ./
   ```

### 🚨 Build Context Too Large

**Error Message:**
```
Sending build context to Docker daemon  XXX MB
```

**Solutions:**

1. **Update .dockerignore:**
   ```dockerignore
   node_modules
   dist
   .git
   *.log
   .env
   .env.local
   coverage
   .nyc_output
   ```

2. **Use multi-stage builds to reduce final image size**

## Runtime Issues

### 🚨 Container Exits Immediately

**Debugging Steps:**

1. **Check container logs:**
   ```bash
   docker logs <container-name>
   docker logs msa-brain-gemini
   ```

2. **Run container interactively:**
   ```bash
   docker run -it --rm msa-brain-gemini:latest sh
   ```

3. **Check if main.js exists:**
   ```bash
   docker run -it --rm msa-brain-gemini:latest ls -la dist/
   ```

### 🚨 "Cannot find module" Error

**Solutions:**

1. **Verify node_modules are copied:**
   ```dockerfile
   COPY --from=builder /usr/src/app/node_modules ./node_modules
   ```

2. **Check if production dependencies are installed:**
   ```dockerfile
   RUN npm ci --only=production
   ```

3. **Ensure dist folder exists:**
   ```dockerfile
   COPY --from=builder /usr/src/app/dist ./dist
   ```

### 🚨 Port Not Accessible

**Solutions:**

1. **Check port mapping:**
   ```bash
   docker run -p 8000:8000 msa-brain-gemini:latest
   ```

2. **Verify EXPOSE directive:**
   ```dockerfile
   EXPOSE 8000
   ```

3. **Check application binding:**
   ```typescript
   // In main.ts, ensure app binds to 0.0.0.0, not localhost
   await app.listen(8000, '0.0.0.0');
   ```

## Environment Variable Issues

### 🚨 Environment Variables Not Loading

**Solutions:**

1. **Using docker run:**
   ```bash
   docker run -e GEMINI_API_KEY=your_key_here msa-brain-gemini:latest
   ```

2. **Using .env file:**
   ```bash
   docker run --env-file .env msa-brain-gemini:latest
   ```

3. **Using docker-compose:**
   ```yaml
   services:
     app:
       environment:
         - GEMINI_API_KEY=${GEMINI_API_KEY}
       # or
       env_file:
         - .env
   ```

### 🚨 "API key not found" Error

**Solutions:**

1. **Verify .env file format:**
   ```env
   GEMINI_API_KEY=AIza...your_actual_key_here
   NODE_ENV=production
   PORT=8000
   ```

2. **Check environment loading in code:**
   ```typescript
   import { config } from 'dotenv';
   config(); // Make sure this is called early
   ```

3. **Debug environment variables:**
   ```bash
   docker run -it --rm --env-file .env msa-brain-gemini:latest env | grep GEMINI
   ```

## Network Issues

### 🚨 Cannot Connect to External APIs

**Solutions:**

1. **Check DNS resolution:**
   ```bash
   docker run -it --rm msa-brain-gemini:latest nslookup google.com
   ```

2. **Test network connectivity:**
   ```bash
   docker run -it --rm msa-brain-gemini:latest wget -qO- https://api.google.com
   ```

3. **Check firewall/proxy settings**

### 🚨 Service Discovery Issues (Docker Compose)

**Solutions:**

1. **Use service names for internal communication:**
   ```yaml
   services:
     app:
       # Can connect to 'database:5432' instead of localhost:5432
     database:
       # ...
   ```

2. **Check network configuration:**
   ```yaml
   services:
     app:
       networks:
         - app-network
   networks:
     app-network:
       driver: bridge
   ```

## Performance Issues

### 🚨 Slow Build Times

**Solutions:**

1. **Use .dockerignore to exclude unnecessary files**

2. **Leverage Docker layer caching:**
   ```dockerfile
   # Copy package files first (changes less frequently)
   COPY package*.json ./
   RUN npm ci
   
   # Copy source code last (changes more frequently)
   COPY src ./src
   RUN npm run build
   ```

3. **Use multi-stage builds to reduce final image size**

### 🚨 High Memory Usage

**Solutions:**

1. **Set Node.js memory limits:**
   ```dockerfile
   ENV NODE_OPTIONS="--max-old-space-size=1024"
   ```

2. **Use alpine images:**
   ```dockerfile
   FROM node:18-alpine  # Smaller than ubuntu-based images
   ```

## Development Issues

### 🚨 Hot Reload Not Working

**Solutions:**

1. **Use bind mounts for development:**
   ```bash
   docker run -v $(pwd)/src:/usr/src/app/src msa-brain-gemini:latest
   ```

2. **Use docker-compose for development:**
   ```yaml
   services:
     app:
       volumes:
         - ./src:/usr/src/app/src
       command: npm run start:dev
   ```

### 🚨 File Permission Issues (Linux/macOS)

**Solutions:**

1. **Match user IDs:**
   ```dockerfile
   RUN adduser -S nestjs -u $(id -u)
   USER nestjs
   ```

2. **Fix permissions:**
   ```bash
   sudo chown -R $(id -u):$(id -g) .
   ```

## Debugging Commands

### Useful Docker Commands for Troubleshooting

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-name>

# Execute commands in running container
docker exec -it <container-name> sh

# Inspect container details
docker inspect <container-name>

# View image layers
docker history msa-brain-gemini:latest

# Remove unused containers and images
docker system prune

# View disk usage
docker system df
```

### Health Check Commands

```bash
# Test application health
curl http://localhost:8000/health

# Check if port is listening
netstat -tulpn | grep :8000

# Test from inside container
docker exec -it <container-name> wget -qO- http://localhost:8000/health
```

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the main [Docker Guide](../DOCKER_GUIDE.md)**
2. **Review Docker logs:** `docker logs <container-name>`
3. **Search Docker documentation:** https://docs.docker.com/
4. **Check NestJS documentation:** https://docs.nestjs.com/
5. **Review project issues on GitHub**

## Common Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
NODE_ENV=production
PORT=8000
LOG_LEVEL=info

# Development
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

---

📝 **Note:** This troubleshooting guide is maintained alongside the main project. If you discover additional issues or solutions, please consider updating this document.

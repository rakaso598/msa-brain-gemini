FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=prod

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]

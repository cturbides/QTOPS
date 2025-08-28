# Multi-stage build for API Gateway
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy app-specific package.json and install
COPY apps/api-gateway/package*.json ./apps/api-gateway/
RUN cd apps/api-gateway && npm ci

# Copy source code
COPY apps/api-gateway/src ./apps/api-gateway/src
COPY tsconfig.json ./
COPY apps/api-gateway/tsconfig*.json ./apps/api-gateway/

# Build the application
RUN cd apps/api-gateway && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package*.json ./
COPY --from=builder /app/apps/api-gateway/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
# Multi-stage build for Curso Completo Microservice
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json and install dependencies  
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy app-specific package.json and install
COPY apps/curso-completo-ms/package*.json ./apps/curso-completo-ms/
RUN cd apps/curso-completo-ms && npm ci

# Copy source code
COPY apps/curso-completo-ms/src ./apps/curso-completo-ms/src
COPY tsconfig.json ./
COPY apps/curso-completo-ms/tsconfig*.json ./apps/curso-completo-ms/

# Build the application
RUN cd apps/curso-completo-ms && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/curso-completo-ms/dist ./dist
COPY --from=builder /app/apps/curso-completo-ms/package*.json ./
COPY --from=builder /app/apps/curso-completo-ms/node_modules ./node_modules

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
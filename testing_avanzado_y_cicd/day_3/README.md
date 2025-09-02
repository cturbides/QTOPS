# Microservices Architecture - QTOPS

## Overview

This project demonstrates the conversion of a NestJS monolith to a microservices architecture, extracting the `curso-completo` module into an independent microservice while maintaining all existing functionality.

## Architecture

### Services

1. **API Gateway** (`apps/api-gateway`)
   - Routes traffic to microservices
   - Implements circuit breaker for resilient communication
   - Exposes endpoints: `/cursos/*` and `/curso-completo/*`
   - Port: 3000

2. **Curso Completo Microservice** (`apps/curso-completo-ms`)
   - Handles all curso-completo domain logic
   - Self-registers with Consul
   - Port: 3002

3. **Consul** (Service Discovery)
   - Service registration and discovery
   - Health checks
   - Port: 8500

4. **PostgreSQL** (Database)
   - Shared database for course data
   - Port: 5432

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- PostgreSQL (optional for local development)

### Quick Start

1. **Start the infrastructure:**
   ```bash
   docker compose up consul postgres -d
   ```

2. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

3. **Seed the database:**
   ```bash
   npm run seed:run
   ```

4. **Start the microservices:**
   ```bash
   npm run start-ms
   ```

### Development

1. **Start infrastructure only:**
   ```bash
   docker compose up consul postgres -d
   ```

2. **Run services locally:**
   ```bash
   # Terminal 1 - Start curso-completo microservice
   cd apps/curso-completo-ms
   npm run start:dev
   
   # Terminal 2 - Start API Gateway
   cd apps/api-gateway
   npm run start:dev
   ```

## Endpoints

All endpoints are accessible through the API Gateway at `http://localhost:3000`:

### Course Management
- `POST /cursos` - Create a new course
- `GET /cursos/:id` - Get course by ID
- `GET /cursos/search/advanced` - Advanced course search
- `GET /cursos/estadisticas/promedios` - Get course statistics
- `POST /cursos/:id/evaluaciones` - Add evaluation to course

### Tags and Instructors
- `POST /cursos/etiquetas` - Create tag
- `POST /cursos/instructores` - Create instructor

### Service Discovery
- `GET /curso-completo/ping` - Health check

## Circuit Breaker

The API Gateway implements a circuit breaker pattern for calls to the curso-completo microservice:

- **Closed State**: Normal operation
- **Open State**: Service unavailable, returns 503 immediately
- **Half-Open State**: Testing if service has recovered

## Environment Variables

Key environment variables for microservices:

```env
# API Gateway
API_GATEWAY_PORT=3000

# Curso Completo Microservice
CURSO_COMPLETO_PORT=3002
CURSO_COMPLETO_SERVICE_NAME=curso-completo
CURSO_COMPLETO_HEALTH_PATH=/health
CURSO_COMPLETO_HEALTH_INTERVAL=10s

# Service Discovery
CONSUL_HTTP_ADDR=http://consul:8500
SERVICE_ENV=local

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=elearning_dev
```

## Scripts

- `npm run build-ms` - Build both microservices
- `npm run start-ms` - Start with docker-compose
- `npm run test-ms` - Run tests for both services

## Monitoring

- **Consul UI**: http://localhost:8500
- **API Gateway Health**: http://localhost:3000/health
- **Curso Completo Health**: http://localhost:3002/health

## Testing Circuit Breaker

1. Stop the curso-completo microservice
2. Make requests to `/cursos/*` endpoints
3. Observe 503 responses after circuit opens
4. Restart the microservice
5. Watch circuit close and normal operation resume

## Architecture Benefits

1. **Scalability**: Each service can be scaled independently
2. **Fault Tolerance**: Circuit breaker prevents cascade failures
3. **Technology Diversity**: Services can use different technologies
4. **Team Independence**: Teams can work on services independently
5. **Deployment Flexibility**: Services can be deployed separately

## Migration Notes

- Database remains shared initially (can be split later)
- Existing endpoints are preserved for backward compatibility
- Circuit breaker provides resilience during service outages
- Service discovery allows dynamic scaling and deployment
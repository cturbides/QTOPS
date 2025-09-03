#!/bin/bash

# Health Check Script para Blue-Green Deployment
# Usage: ./health-check.sh [blue|green] [timeout]

set -e

ENVIRONMENT=${1:-blue}
TIMEOUT=${2:-300}
INTERVAL=10
ELAPSED=0

echo "🏥 Starting health check for $ENVIRONMENT environment..."

# URLs de health check
API_GATEWAY_URL="http://api-gateway-$ENVIRONMENT.production.svc.cluster.local/health"
CURSO_COMPLETO_URL="http://curso-completo-$ENVIRONMENT.production.svc.cluster.local/health"

# Función para verificar health endpoint
check_health() {
    local url=$1
    local service_name=$2
    
    echo "Checking $service_name at $url"
    
    if curl -f -s --max-time 5 "$url" > /dev/null; then
        echo "✅ $service_name is healthy"
        return 0
    else
        echo "❌ $service_name is not healthy"
        return 1
    fi
}

# Función para verificar múltiples servicios
check_all_services() {
    local api_healthy=false
    local ms_healthy=false
    
    if check_health "$API_GATEWAY_URL" "API Gateway"; then
        api_healthy=true
    fi
    
    if check_health "$CURSO_COMPLETO_URL" "Curso Completo MS"; then
        ms_healthy=true
    fi
    
    if [ "$api_healthy" = true ] && [ "$ms_healthy" = true ]; then
        return 0
    else
        return 1
    fi
}

# Loop principal de health check
echo "⏱️  Starting health check loop (timeout: ${TIMEOUT}s, interval: ${INTERVAL}s)"

while [ $ELAPSED -lt $TIMEOUT ]; do
    if check_all_services; then
        echo "🎉 All services are healthy in $ENVIRONMENT environment!"
        echo "✨ Health check completed successfully in ${ELAPSED}s"
        exit 0
    fi
    
    echo "⏳ Waiting ${INTERVAL}s before next check... (elapsed: ${ELAPSED}s)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

echo "❌ Health check timed out after ${TIMEOUT}s"
echo "🚨 $ENVIRONMENT environment is not healthy!"
exit 1

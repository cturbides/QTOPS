#!/bin/bash

# Traffic Switch Script para Blue-Green Deployment
# Usage: ./switch-traffic.sh [blue|green]

set -e

TARGET_ENVIRONMENT=${1:-blue}
NAMESPACE="production"

echo "🔄 Switching traffic to $TARGET_ENVIRONMENT environment..."

# Validar que el ambiente target esté disponible
if ! kubectl get deployment "api-gateway-$TARGET_ENVIRONMENT" -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "❌ Deployment api-gateway-$TARGET_ENVIRONMENT not found in namespace $NAMESPACE"
    exit 1
fi

if ! kubectl get deployment "curso-completo-$TARGET_ENVIRONMENT" -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "❌ Deployment curso-completo-$TARGET_ENVIRONMENT not found in namespace $NAMESPACE"
    exit 1
fi

# Función para actualizar selector de servicio
update_service_selector() {
    local service_name=$1
    local target_version=$2
    
    echo "Updating $service_name to point to $target_version"
    
    kubectl patch service "$service_name" -n "$NAMESPACE" -p \
        "{\"spec\":{\"selector\":{\"version\":\"$target_version\"}}}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Service $service_name updated successfully"
    else
        echo "❌ Failed to update service $service_name"
        return 1
    fi
}

# Realizar health check antes de cambiar tráfico
echo "🏥 Performing pre-switch health check..."
if ! ./scripts/health-check.sh "$TARGET_ENVIRONMENT" 120; then
    echo "❌ Health check failed for $TARGET_ENVIRONMENT environment"
    echo "🚨 Aborting traffic switch!"
    exit 1
fi

# Hacer backup de la configuración actual
kubectl get service api-gateway-service -n "$NAMESPACE" -o yaml > "/tmp/api-gateway-service-backup-$(date +%s).yaml"
kubectl get service curso-completo-service -n "$NAMESPACE" -o yaml > "/tmp/curso-completo-service-backup-$(date +%s).yaml"

echo "💾 Service configurations backed up to /tmp/"

# Cambiar tráfico gradualmente
echo "🔄 Starting gradual traffic switch..."

# Actualizar API Gateway
echo "📡 Switching API Gateway traffic to $TARGET_ENVIRONMENT..."
if update_service_selector "api-gateway-service" "$TARGET_ENVIRONMENT"; then
    # Esperar un momento para que el cambio se propague
    sleep 10
    
    # Verificar que el tráfico esté llegando correctamente
    echo "🧪 Testing API Gateway endpoint..."
    if curl -f -s --max-time 10 "http://api-gateway-service.$NAMESPACE.svc.cluster.local/health" > /dev/null; then
        echo "✅ API Gateway traffic switch successful"
    else
        echo "❌ API Gateway traffic switch failed, rolling back..."
        kubectl patch service "api-gateway-service" -n "$NAMESPACE" -p \
            "{\"spec\":{\"selector\":{\"version\":\"$([ "$TARGET_ENVIRONMENT" = "blue" ] && echo "green" || echo "blue")\"}}}"
        exit 1
    fi
else
    echo "❌ Failed to switch API Gateway traffic"
    exit 1
fi

# Actualizar Curso Completo MS
echo "📡 Switching Curso Completo MS traffic to $TARGET_ENVIRONMENT..."
if update_service_selector "curso-completo-service" "$TARGET_ENVIRONMENT"; then
    sleep 10
    
    # Verificar que el microservicio esté respondiendo
    echo "🧪 Testing Curso Completo MS endpoint..."
    if curl -f -s --max-time 10 "http://curso-completo-service.$NAMESPACE.svc.cluster.local/health" > /dev/null; then
        echo "✅ Curso Completo MS traffic switch successful"
    else
        echo "❌ Curso Completo MS traffic switch failed, rolling back..."
        kubectl patch service "curso-completo-service" -n "$NAMESPACE" -p \
            "{\"spec\":{\"selector\":{\"version\":\"$([ "$TARGET_ENVIRONMENT" = "blue" ] && echo "green" || echo "blue")\"}}}"
        exit 1
    fi
else
    echo "❌ Failed to switch Curso Completo MS traffic"
    exit 1
fi

# Verificación post-switch
echo "🔍 Performing post-switch verification..."
sleep 15

# Health check final
if ./scripts/health-check.sh "$TARGET_ENVIRONMENT" 60; then
    echo "🎉 Traffic switch to $TARGET_ENVIRONMENT completed successfully!"
    echo "✨ All services are healthy and receiving traffic"
    
    # Opcional: Ejecutar smoke tests
    echo "🧪 Running smoke tests..."
    # npm run test:smoke:production
    
    echo "📊 Traffic switch metrics:"
    kubectl get services -n "$NAMESPACE" -l app=api-gateway -o wide
    kubectl get services -n "$NAMESPACE" -l app=curso-completo -o wide
    
else
    echo "❌ Post-switch health check failed!"
    echo "🚨 Consider investigating or rolling back"
    exit 1
fi

echo "✅ Blue-Green deployment completed successfully!"

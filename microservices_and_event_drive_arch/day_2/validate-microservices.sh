#!/bin/bash

# Microservices Validation Script

echo "🚀 Validating Microservices Architecture"
echo "========================================"

# Test Consul
echo ""
echo "🔍 Testing Consul Service Discovery..."
CONSUL_STATUS=$(curl -s localhost:8500/v1/status/leader 2>/dev/null || echo "failed")
if [ "$CONSUL_STATUS" != "failed" ]; then
    echo "✅ Consul is running and accessible"
    echo "   Leader: $CONSUL_STATUS"
    echo "   UI: http://localhost:8500"
else
    echo "❌ Consul is not accessible"
    echo "   Please run: docker compose up consul -d"
fi

# Test if services are registered
echo ""
echo "🔍 Checking service registrations..."
SERVICES=$(curl -s localhost:8500/v1/catalog/services 2>/dev/null || echo "{}")
echo "   Registered services: $SERVICES"

# Test API Gateway health
echo ""
echo "🔍 Testing API Gateway..."
GATEWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" localhost:3000/health 2>/dev/null || echo "000")
if [ "$GATEWAY_STATUS" = "200" ]; then
    echo "✅ API Gateway is healthy"
    echo "   Endpoint: http://localhost:3000"
else
    echo "❌ API Gateway is not responding (HTTP $GATEWAY_STATUS)"
fi

# Test Curso Completo Microservice health
echo ""
echo "🔍 Testing Curso Completo Microservice..."
MS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" localhost:3002/health 2>/dev/null || echo "000")
if [ "$MS_STATUS" = "200" ]; then
    echo "✅ Curso Completo Microservice is healthy"
    echo "   Endpoint: http://localhost:3002"
else
    echo "❌ Curso Completo Microservice is not responding (HTTP $MS_STATUS)"
fi

# Test circuit breaker endpoint
echo ""
echo "🔍 Testing Circuit Breaker..."
CB_RESPONSE=$(curl -s localhost:3000/curso-completo/ping 2>/dev/null || echo "failed")
if [ "$CB_RESPONSE" != "failed" ]; then
    echo "✅ Circuit breaker endpoint accessible"
    echo "   Response: $CB_RESPONSE"
else
    echo "❌ Circuit breaker endpoint not accessible"
fi

# Test database connection (if available)
echo ""
echo "🔍 Testing Database Connection..."
if command -v psql &> /dev/null; then
    DB_TEST=$(PGPASSWORD=password psql -h localhost -U postgres -d elearning_dev -c "SELECT 1;" 2>/dev/null | grep -c "1 row" || echo "0")
    if [ "$DB_TEST" = "1" ]; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
    fi
else
    echo "⚠️  psql not available - skipping database test"
fi

echo ""
echo "🏁 Validation complete!"
echo ""
echo "💡 To start the microservices:"
echo "   docker compose up --build"
echo ""
echo "💡 To test endpoints:"
echo "   curl http://localhost:3000/cursos/search/advanced"
echo "   curl http://localhost:3000/curso-completo/ping"
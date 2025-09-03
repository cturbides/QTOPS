#!/bin/bash

# Script para simular incidentes y validar respuesta del sistema
# Uso: ./incident-simulator.sh [scenario]

CURSO_COMPLETO_URL=${CURSO_COMPLETO_URL:-"http://localhost:3002"}
API_GATEWAY_URL=${API_GATEWAY_URL:-"http://localhost:3000"}

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para log con timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🚨 Simulador de Incidentes - Chaos Engineering${NC}"
    echo ""
    echo "Escenarios disponibles:"
    echo "  1. latency-storm     - Tormenta de latencia"
    echo "  2. error-cascade     - Cascada de errores"
    echo "  3. service-overload  - Sobrecarga de servicio"
    echo "  4. mixed-chaos       - Chaos mixto (latencia + errores)"
    echo "  5. recovery-test     - Test de recuperación"
    echo ""
    echo "Uso: $0 [scenario]"
    echo ""
}

# Función para ejecutar requests y medir rendimiento
execute_requests() {
    local endpoint=$1
    local requests=$2
    local description=$3
    
    log "${YELLOW}📊 $description${NC}"
    log "Ejecutando $requests requests a $endpoint"
    
    local start_time=$(date +%s)
    local success_count=0
    local error_count=0
    local total_time=0
    
    for i in $(seq 1 $requests); do
        local req_start=$(date +%s%3N)
        local response=$(curl -s -w "%{http_code}" -o /dev/null "$endpoint")
        local req_end=$(date +%s%3N)
        local req_time=$((req_end - req_start))
        
        total_time=$((total_time + req_time))
        
        if [ "$response" -ge 200 ] && [ "$response" -lt 400 ]; then
            success_count=$((success_count + 1))
            echo -n -e "${GREEN}.${NC}"
        else
            error_count=$((error_count + 1))
            echo -n -e "${RED}x${NC}"
        fi
        
        # Pequeña pausa entre requests
        sleep 0.1
    done
    
    echo ""
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local avg_response_time=$((total_time / requests))
    local success_rate=$(( (success_count * 100) / requests ))
    
    log "${BLUE}📈 Resultados:${NC}"
    log "  ✓ Exitosos: $success_count/$requests ($success_rate%)"
    log "  ✗ Errores: $error_count/$requests"
    log "  ⏱️ Tiempo promedio: ${avg_response_time}ms"
    log "  🕒 Duración total: ${duration}s"
    echo ""
}

# Escenario 1: Tormenta de latencia
latency_storm() {
    log "${RED}🌪️ INICIANDO ESCENARIO: Tormenta de Latencia${NC}"
    
    # Habilitar solo experimento de latencia
    log "Configurando experimentos..."
    curl -s -X PUT "$CURSO_COMPLETO_URL/chaos/experiments/latency-spike/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    curl -s -X PUT "$CURSO_COMPLETO_URL/chaos/experiments/random-errors/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    # Habilitar chaos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    log "${GREEN}✓ Chaos habilitado - Solo latencia${NC}"
    
    # Ejecutar requests durante la tormenta
    execute_requests "$CURSO_COMPLETO_URL/cursos" 20 "Tormenta de Latencia"
    
    # Deshabilitar chaos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    log "${GREEN}✓ Tormenta de latencia completada${NC}"
}

# Escenario 2: Cascada de errores
error_cascade() {
    log "${RED}💥 INICIANDO ESCENARIO: Cascada de Errores${NC}"
    
    # Habilitar solo experimento de errores
    curl -s -X PUT "$CURSO_COMPLETO_URL/chaos/experiments/random-errors/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    curl -s -X PUT "$CURSO_COMPLETO_URL/chaos/experiments/latency-spike/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    # Habilitar chaos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    log "${GREEN}✓ Chaos habilitado - Solo errores${NC}"
    
    # Ejecutar requests durante la cascada
    execute_requests "$CURSO_COMPLETO_URL/cursos" 30 "Cascada de Errores"
    
    # Deshabilitar chaos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    log "${GREEN}✓ Cascada de errores completada${NC}"
}

# Escenario 3: Sobrecarga de servicio
service_overload() {
    log "${RED}🔥 INICIANDO ESCENARIO: Sobrecarga de Servicio${NC}"
    
    # Habilitar todos los experimentos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    log "${GREEN}✓ Chaos habilitado - Todos los experimentos${NC}"
    
    # Ejecutar múltiples requests concurrentes
    log "Iniciando sobrecarga con requests concurrentes..."
    
    # Lanzar múltiples procesos en paralelo
    for i in {1..5}; do
        (execute_requests "$CURSO_COMPLETO_URL/cursos" 10 "Sobrecarga Proceso $i") &
    done
    
    # Esperar a que terminen todos los procesos
    wait
    
    # Deshabilitar chaos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    log "${GREEN}✓ Sobrecarga de servicio completada${NC}"
}

# Escenario 4: Chaos mixto
mixed_chaos() {
    log "${RED}🌀 INICIANDO ESCENARIO: Chaos Mixto${NC}"
    
    # Habilitar chaos con configuración mixta
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    curl -s -X PUT "$CURSO_COMPLETO_URL/chaos/experiments/latency-spike/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    curl -s -X PUT "$CURSO_COMPLETO_URL/chaos/experiments/random-errors/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    log "${GREEN}✓ Chaos habilitado - Latencia + Errores${NC}"
    
    # Ejecutar diferentes tipos de requests
    execute_requests "$CURSO_COMPLETO_URL/cursos" 15 "Chaos Mixto - GET Cursos"
    execute_requests "$CURSO_COMPLETO_URL/cursos/search/advanced?textoBusqueda=test" 10 "Chaos Mixto - Búsqueda"
    
    # Deshabilitar chaos
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    log "${GREEN}✓ Chaos mixto completado${NC}"
}

# Escenario 5: Test de recuperación
recovery_test() {
    log "${RED}🔄 INICIANDO ESCENARIO: Test de Recuperación${NC}"
    
    log "Fase 1: Sistema normal"
    execute_requests "$CURSO_COMPLETO_URL/cursos" 10 "Baseline - Sistema Normal"
    
    log "Fase 2: Activando chaos"
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": true}' > /dev/null
    
    execute_requests "$CURSO_COMPLETO_URL/cursos" 15 "Durante Chaos"
    
    log "Fase 3: Desactivando chaos y midiendo recuperación"
    curl -s -X POST "$CURSO_COMPLETO_URL/chaos/toggle" \
         -H "Content-Type: application/json" \
         -d '{"enabled": false}' > /dev/null
    
    sleep 2 # Tiempo para recuperación
    
    execute_requests "$CURSO_COMPLETO_URL/cursos" 10 "Post-Chaos - Recuperación"
    
    log "${GREEN}✓ Test de recuperación completado${NC}"
}

# Función para mostrar resumen final
show_summary() {
    log "${BLUE}📋 RESUMEN DEL EXPERIMENTO${NC}"
    
    # Obtener métricas finales
    log "Métricas de Chaos:"
    curl -s "$CURSO_COMPLETO_URL/chaos/metrics" | jq . 2>/dev/null
    
    log "${GREEN}✅ Experimento de Chaos Engineering completado${NC}"
}

# Función principal
main() {
    case "$1" in
        "latency-storm"|"1")
            latency_storm
            ;;
        "error-cascade"|"2")
            error_cascade
            ;;
        "service-overload"|"3")
            service_overload
            ;;
        "mixed-chaos"|"4")
            mixed_chaos
            ;;
        "recovery-test"|"5")
            recovery_test
            ;;
        "help"|"")
            show_help
            exit 0
            ;;
        *)
            log "${RED}Escenario desconocido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    show_summary
}

# Ejecutar
main "$@"

#!/bin/bash

# Script para gestionar experimentos de Chaos Engineering
# Uso: ./chaos-manager.sh [enable|disable|status|trigger] [experiment-id]

CURSO_COMPLETO_URL=${CURSO_COMPLETO_URL:-"http://localhost:3002"}
API_GATEWAY_URL=${API_GATEWAY_URL:-"http://localhost:3000"}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🐒 Chaos Engineering Manager${NC}"
    echo ""
    echo "Uso: $0 [comando] [opciones]"
    echo ""
    echo "Comandos:"
    echo "  enable                    - Habilitar chaos globalmente"
    echo "  disable                   - Deshabilitar chaos globalmente"
    echo "  status                    - Mostrar estado de experimentos"
    echo "  metrics                   - Mostrar métricas de chaos"
    echo "  trigger [experiment-id]   - Ejecutar experimento específico"
    echo "  toggle [experiment-id]    - Habilitar/deshabilitar experimento"
    echo "  config                    - Mostrar configuración actual"
    echo "  help                      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 enable"
    echo "  $0 trigger latency-spike"
    echo "  $0 toggle random-errors"
    echo ""
}

# Función para hacer peticiones HTTP
make_request() {
    local method=$1
    local url=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -w "\nHTTP_CODE:%{http_code}\n"
    else
        curl -s -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -d "$data" \
             -w "\nHTTP_CODE:%{http_code}\n"
    fi
}

# Función para parsear respuesta
parse_response() {
    local response=$1
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} Operación exitosa"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "$body" | jq . 2>/dev/null || echo "$body"
        fi
    else
        echo -e "${RED}✗${NC} Error HTTP $http_code"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        return 1
    fi
}

# Habilitar chaos globalmente
enable_chaos() {
    echo -e "${YELLOW}🐒 Habilitando Chaos Engineering...${NC}"
    
    local response=$(make_request "POST" "$CURSO_COMPLETO_URL/chaos/toggle" '{"enabled": true}')
    parse_response "$response"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Chaos Engineering habilitado en curso-completo-ms${NC}"
    fi
    
    # También habilitar en API Gateway
    local response_gw=$(make_request "POST" "$API_GATEWAY_URL/chaos/toggle" '{"enabled": true}')
    parse_response "$response_gw"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Chaos Engineering habilitado en api-gateway${NC}"
    fi
}

# Deshabilitar chaos globalmente
disable_chaos() {
    echo -e "${YELLOW}🐒 Deshabilitando Chaos Engineering...${NC}"
    
    local response=$(make_request "POST" "$CURSO_COMPLETO_URL/chaos/toggle" '{"enabled": false}')
    parse_response "$response"
    
    local response_gw=$(make_request "POST" "$API_GATEWAY_URL/chaos/toggle" '{"enabled": false}')
    parse_response "$response_gw"
    
    echo -e "${GREEN}Chaos Engineering deshabilitado en todos los servicios${NC}"
}

# Mostrar estado de experimentos
show_status() {
    echo -e "${BLUE}🐒 Estado de Experimentos de Chaos${NC}"
    echo ""
    
    echo -e "${YELLOW}📊 Curso Completo MS:${NC}"
    local response=$(make_request "GET" "$CURSO_COMPLETO_URL/chaos/experiments")
    parse_response "$response"
    
    echo ""
    echo -e "${YELLOW}📊 API Gateway:${NC}"
    local response_gw=$(make_request "GET" "$API_GATEWAY_URL/chaos/experiments")
    parse_response "$response_gw"
}

# Mostrar métricas
show_metrics() {
    echo -e "${BLUE}🐒 Métricas de Chaos Engineering${NC}"
    echo ""
    
    echo -e "${YELLOW}📈 Curso Completo MS:${NC}"
    local response=$(make_request "GET" "$CURSO_COMPLETO_URL/chaos/metrics")
    parse_response "$response"
    
    echo ""
    echo -e "${YELLOW}📈 API Gateway:${NC}"
    local response_gw=$(make_request "GET" "$API_GATEWAY_URL/chaos/metrics")
    parse_response "$response_gw"
}

# Ejecutar experimento específico
trigger_experiment() {
    local experiment_id=$1
    
    if [ -z "$experiment_id" ]; then
        echo -e "${RED}Error: Debe especificar el ID del experimento${NC}"
        echo "Experimentos disponibles: latency-spike, random-errors, memory-leak"
        return 1
    fi
    
    echo -e "${YELLOW}🐒 Ejecutando experimento: $experiment_id${NC}"
    
    local response=$(make_request "POST" "$CURSO_COMPLETO_URL/chaos/experiments/$experiment_id/trigger" '{}')
    parse_response "$response"
}

# Habilitar/deshabilitar experimento específico
toggle_experiment() {
    local experiment_id=$1
    
    if [ -z "$experiment_id" ]; then
        echo -e "${RED}Error: Debe especificar el ID del experimento${NC}"
        return 1
    fi
    
    # Obtener estado actual
    local current_state=$(curl -s "$CURSO_COMPLETO_URL/chaos/experiments" | jq -r ".[] | select(.id==\"$experiment_id\") | .enabled")
    
    if [ "$current_state" = "true" ]; then
        local new_state="false"
        echo -e "${YELLOW}🐒 Deshabilitando experimento: $experiment_id${NC}"
    else
        local new_state="true"
        echo -e "${YELLOW}🐒 Habilitando experimento: $experiment_id${NC}"
    fi
    
    local response=$(make_request "PUT" "$CURSO_COMPLETO_URL/chaos/experiments/$experiment_id/toggle" "{\"enabled\": $new_state}")
    parse_response "$response"
}

# Mostrar configuración
show_config() {
    echo -e "${BLUE}🐒 Configuración de Chaos Engineering${NC}"
    echo ""
    
    echo -e "${YELLOW}⚙️ Curso Completo MS:${NC}"
    local response=$(make_request "GET" "$CURSO_COMPLETO_URL/chaos/config")
    parse_response "$response"
    
    echo ""
    echo -e "${YELLOW}⚙️ API Gateway:${NC}"
    local response_gw=$(make_request "GET" "$API_GATEWAY_URL/chaos/config")
    parse_response "$response_gw"
}

# Verificar que jq está instalado
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️ jq no está instalado. Instalando...${NC}"
        apt-get update && apt-get install -y jq
    fi
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl es requerido${NC}"
        exit 1
    fi
}

# Función principal
main() {
    check_dependencies
    
    case "$1" in
        "enable")
            enable_chaos
            ;;
        "disable")
            disable_chaos
            ;;
        "status")
            show_status
            ;;
        "metrics")
            show_metrics
            ;;
        "trigger")
            trigger_experiment "$2"
            ;;
        "toggle")
            toggle_experiment "$2"
            ;;
        "config")
            show_config
            ;;
        "help"|"")
            show_help
            ;;
        *)
            echo -e "${RED}Comando desconocido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal con todos los argumentos
main "$@"

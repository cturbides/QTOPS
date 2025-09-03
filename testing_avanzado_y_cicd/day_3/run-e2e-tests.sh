#!/bin/bash

# Script de orquestación para ejecutar toda la suite E2E
# Incluye validación de servicios, ejecución de pruebas y generación de reportes

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BASE_URL=${BASE_URL:-"http://localhost:3000"}
REPORTS_DIR="reports/e2e"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🚀 INICIANDO SUITE COMPLETA DE PRUEBAS E2E${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo "📅 Timestamp: $TIMESTAMP"
echo "🌐 Base URL: $BASE_URL"
echo ""

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para verificar si los servicios están disponibles
check_services() {
    log_info "Verificando disponibilidad de servicios..."
    
    local retries=30
    local count=0
    
    while [ $count -lt $retries ]; do
        if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
            log_success "Servicios disponibles en $BASE_URL"
            return 0
        fi
        
        count=$((count + 1))
        log_warning "Intento $count/$retries - Esperando servicios..."
        sleep 2
    done
    
    log_error "Servicios no disponibles después de $retries intentos"
    return 1
}

# Función para crear directorio de reportes
setup_reports() {
    log_info "Configurando directorio de reportes..."
    mkdir -p "$REPORTS_DIR"
    mkdir -p "$REPORTS_DIR/playwright"
    mkdir -p "$REPORTS_DIR/cypress"
    mkdir -p "$REPORTS_DIR/performance"
    mkdir -p "$REPORTS_DIR/api"
    log_success "Directorios de reportes creados"
}

# Función para ejecutar pruebas Playwright
run_playwright_tests() {
    log_info "Ejecutando pruebas Playwright..."
    
    if npx playwright test --reporter=html --output-dir="$REPORTS_DIR/playwright"; then
        log_success "Pruebas Playwright completadas exitosamente"
        return 0
    else
        log_error "Algunas pruebas Playwright fallaron"
        return 1
    fi
}

# Función para ejecutar pruebas Cypress
run_cypress_tests() {
    log_info "Ejecutando pruebas Cypress..."
    
    export CYPRESS_BASE_URL="$BASE_URL"
    
    if npx cypress run --reporter mochawesome \
        --reporter-options "reportDir=$REPORTS_DIR/cypress,overwrite=false,html=true,json=true"; then
        log_success "Pruebas Cypress completadas exitosamente"
        return 0
    else
        log_error "Algunas pruebas Cypress fallaron"
        return 1
    fi
}

# Función para ejecutar pruebas de API con Newman
run_newman_tests() {
    log_info "Ejecutando pruebas de API con Newman..."
    
    local collection_file="tests/e2e/api/postman-collection.json"
    
    if [ ! -f "$collection_file" ]; then
        log_warning "Archivo de colección de Postman no encontrado: $collection_file"
        return 1
    fi
    
    if npx newman run "$collection_file" \
        --global-var "baseUrl=$BASE_URL" \
        --reporters cli,html,json \
        --reporter-html-export "$REPORTS_DIR/api/newman-report.html" \
        --reporter-json-export "$REPORTS_DIR/api/newman-report.json"; then
        log_success "Pruebas Newman completadas exitosamente"
        return 0
    else
        log_error "Algunas pruebas Newman fallaron"
        return 1
    fi
}

# Función para ejecutar pruebas de performance con Artillery
run_artillery_tests() {
    log_info "Ejecutando pruebas de performance con Artillery..."
    
    local config_file="tests/e2e/performance/artillery-load-test.yml"
    
    if [ ! -f "$config_file" ]; then
        log_warning "Archivo de configuración Artillery no encontrado: $config_file"
        return 1
    fi
    
    # Modificar temporalmente la URL en el archivo de configuración
    local temp_config="/tmp/artillery-config-$TIMESTAMP.yml"
    sed "s|http://localhost:3000|$BASE_URL|g" "$config_file" > "$temp_config"
    
    if npx artillery run "$temp_config" \
        --output "$REPORTS_DIR/performance/artillery-report.json"; then
        
        # Generar reporte HTML
        npx artillery report "$REPORTS_DIR/performance/artillery-report.json" \
            --output "$REPORTS_DIR/performance/artillery-report.html"
        
        log_success "Pruebas Artillery completadas exitosamente"
        rm -f "$temp_config"
        return 0
    else
        log_error "Pruebas Artillery fallaron"
        rm -f "$temp_config"
        return 1
    fi
}

# Función para ejecutar pruebas de stress con Autocannon
run_autocannon_tests() {
    log_info "Ejecutando pruebas de stress con Autocannon..."
    
    export BASE_URL="$BASE_URL"
    
    if node tests/e2e/performance/autocannon-stress-test.js; then
        log_success "Pruebas Autocannon completadas exitosamente"
        return 0
    else
        log_error "Pruebas Autocannon fallaron"
        return 1
    fi
}

# Función para generar reporte consolidado
generate_consolidated_report() {
    log_info "Generando reporte consolidado..."
    
    local report_file="$REPORTS_DIR/consolidated-report-$TIMESTAMP.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte E2E Consolidado - $TIMESTAMP</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .metric-card { background: #f8f9fa; padding: 10px; border-radius: 3px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Reporte E2E Consolidado</h1>
        <p><strong>Timestamp:</strong> $TIMESTAMP</p>
        <p><strong>Base URL:</strong> $BASE_URL</p>
        <p><strong>Generado:</strong> $(date)</p>
    </div>
    
    <div class="section">
        <h2>📊 Resumen de Ejecución</h2>
        <div class="metrics">
            <div class="metric-card">
                <h3>Playwright</h3>
                <p id="playwright-status">-</p>
            </div>
            <div class="metric-card">
                <h3>Cypress</h3>
                <p id="cypress-status">-</p>
            </div>
            <div class="metric-card">
                <h3>Newman API</h3>
                <p id="newman-status">-</p>
            </div>
            <div class="metric-card">
                <h3>Artillery</h3>
                <p id="artillery-status">-</p>
            </div>
            <div class="metric-card">
                <h3>Autocannon</h3>
                <p id="autocannon-status">-</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📁 Reportes Individuales</h2>
        <ul>
            <li><a href="playwright/index.html">Reporte Playwright</a></li>
            <li><a href="cypress/mochawesome.html">Reporte Cypress</a></li>
            <li><a href="api/newman-report.html">Reporte Newman (API)</a></li>
            <li><a href="performance/artillery-report.html">Reporte Artillery</a></li>
            <li><a href="performance/">Reportes Autocannon</a></li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🔍 Análisis de Resultados</h2>
        <p>Este reporte consolida los resultados de todas las pruebas E2E ejecutadas.</p>
        <p>Revise los reportes individuales para obtener detalles específicos sobre fallos o métricas de performance.</p>
    </div>
</body>
</html>
EOF
    
    log_success "Reporte consolidado generado: $report_file"
}

# Función principal
main() {
    local exit_code=0
    local tests_results=()
    
    # Setup inicial
    setup_reports
    
    # Verificar servicios
    if ! check_services; then
        log_error "No se pueden ejecutar las pruebas sin servicios disponibles"
        exit 1
    fi
    
    echo -e "\n${BLUE}🎯 EJECUTANDO PRUEBAS E2E${NC}"
    echo -e "${BLUE}═══════════════════════${NC}"
    
    # Ejecutar Playwright
    echo -e "\n${YELLOW}1. PRUEBAS PLAYWRIGHT${NC}"
    if run_playwright_tests; then
        tests_results+=("playwright:success")
    else
        tests_results+=("playwright:failed")
        exit_code=1
    fi
    
    # Ejecutar Cypress
    echo -e "\n${YELLOW}2. PRUEBAS CYPRESS${NC}"
    if run_cypress_tests; then
        tests_results+=("cypress:success")
    else
        tests_results+=("cypress:failed")
        exit_code=1
    fi
    
    # Ejecutar Newman
    echo -e "\n${YELLOW}3. PRUEBAS API (NEWMAN)${NC}"
    if run_newman_tests; then
        tests_results+=("newman:success")
    else
        tests_results+=("newman:failed")
        exit_code=1
    fi
    
    # Ejecutar Artillery
    echo -e "\n${YELLOW}4. PRUEBAS PERFORMANCE (ARTILLERY)${NC}"
    if run_artillery_tests; then
        tests_results+=("artillery:success")
    else
        tests_results+=("artillery:failed")
        exit_code=1
    fi
    
    # Ejecutar Autocannon
    echo -e "\n${YELLOW}5. PRUEBAS STRESS (AUTOCANNON)${NC}"
    if run_autocannon_tests; then
        tests_results+=("autocannon:success")
    else
        tests_results+=("autocannon:failed")
        exit_code=1
    fi
    
    # Generar reporte consolidado
    echo -e "\n${YELLOW}📋 GENERANDO REPORTES${NC}"
    generate_consolidated_report
    
    # Resumen final
    echo -e "\n${BLUE}🏁 RESUMEN FINAL${NC}"
    echo -e "${BLUE}═══════════════${NC}"
    
    local successful=0
    local total=${#tests_results[@]}
    
    for result in "${tests_results[@]}"; do
        local test_name=$(echo "$result" | cut -d: -f1)
        local status=$(echo "$result" | cut -d: -f2)
        
        if [ "$status" = "success" ]; then
            log_success "$test_name: EXITOSO"
            ((successful++))
        else
            log_error "$test_name: FALLÓ"
        fi
    done
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        log_success "🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ($successful/$total)"
    else
        log_warning "⚠️  ALGUNAS PRUEBAS FALLARON ($successful/$total exitosas)"
    fi
    
    echo -e "\n📁 Reportes disponibles en: ${REPORTS_DIR}/"
    echo -e "🌐 Abrir reporte consolidado: file://$(pwd)/${REPORTS_DIR}/consolidated-report-${TIMESTAMP}.html"
    
    exit $exit_code
}

# Manejo de señales para cleanup
cleanup() {
    log_info "Limpiando recursos..."
    # Cualquier cleanup necesario
    exit 1
}

trap cleanup SIGINT SIGTERM

# Ejecutar función principal
main "$@"

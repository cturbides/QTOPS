#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configuración
GRAPHQL_URL="http://localhost:3000/graphql"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${WHITE}🚀 Test Suite Completo - Sistema de Chat Extendido${NC}"
echo -e "${WHITE}====================================================${NC}"
echo -e "${CYAN}Testing GraphQL Apollo Server con las nuevas funcionalidades:${NC}"
echo -e "  🏠 Salas Privadas"
echo -e "  🎤 Mensajes de Voz"
echo -e "  🔄 Sincronización de Estado"
echo -e "  💬 Chat Tradicional"
echo -e "  🔒 Seguridad Mejorada"
echo ""

# Función para verificar si el servidor está corriendo
check_server() {
    echo -e "${BLUE}🔍 Verificando que el servidor GraphQL esté corriendo...${NC}"
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$GRAPHQL_URL" || echo "000")
    
    if [ "$response" != "200" ] && [ "$response" != "400" ]; then
        echo -e "${RED}❌ Error: El servidor GraphQL no está respondiendo en $GRAPHQL_URL${NC}"
        echo -e "${YELLOW}💡 Por favor, inicia el servidor con: npm run start:dev${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Servidor GraphQL respondiendo correctamente${NC}"
}

# Función para ejecutar un test con manejo de errores
run_test() {
    local test_name="$1"
    local script_path="$2"
    local emoji="$3"
    
    echo -e "\n${WHITE}${emoji} ===============================================${NC}"
    echo -e "${WHITE}${emoji} Ejecutando: $test_name${NC}"
    echo -e "${WHITE}${emoji} ===============================================${NC}"
    
    if [ ! -f "$script_path" ]; then
        echo -e "${RED}❌ Error: Script no encontrado: $script_path${NC}"
        return 1
    fi
    
    if [ ! -x "$script_path" ]; then
        echo -e "${YELLOW}⚠️  Haciendo ejecutable: $script_path${NC}"
        chmod +x "$script_path"
    fi
    
    start_time=$(date +%s)
    
    if bash "$script_path"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "\n${GREEN}✅ $test_name completado exitosamente en ${duration}s${NC}"
        return 0
    else
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "\n${RED}❌ $test_name falló después de ${duration}s${NC}"
        return 1
    fi
}

# Función para mostrar resumen
show_summary() {
    local passed=$1
    local total=$2
    local failed=$((total - passed))
    
    echo -e "\n${WHITE}📊 RESUMEN DE TESTS${NC}"
    echo -e "${WHITE}===================${NC}"
    echo -e "${GREEN}✅ Tests Exitosos: $passed${NC}"
    echo -e "${RED}❌ Tests Fallidos: $failed${NC}"
    echo -e "${BLUE}📈 Total Ejecutados: $total${NC}"
    
    if [ $failed -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!${NC}"
        echo -e "${GREEN}🚀 El sistema de chat extendido está funcionando perfectamente${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Algunos tests fallaron. Revisa los logs arriba para más detalles.${NC}"
    fi
    
    echo -e "\n${CYAN}📚 Para más información, consulta:${NC}"
    echo -e "  🌐 GraphQL Playground: http://localhost:3000/graphql"
}

# Verificar servidor
check_server

# Contador de tests
passed_tests=0
total_tests=0

# Lista de tests a ejecutar
tests=(
    "Tests de Mutations Básicas|$SCRIPT_DIR/test_mutations.sh|💬"
    "Tests de Salas Privadas|$SCRIPT_DIR/test_salas_privadas.sh|🏠"
    "Tests de Mensajes de Voz|$SCRIPT_DIR/test_mensajes_voz.sh|🎤"
    "Tests de Sincronización|$SCRIPT_DIR/test_sincronizacion.sh|🔄"
    "Tests de Seguridad|$SCRIPT_DIR/test_security.sh|🔒"
    "Tests de Auditoria (logs)|$SCRIPT_DIR/test_audit_logging.sh|📝"
)

echo -e "\n${BLUE}🏃 Iniciando ejecución de ${#tests[@]} suites de tests...${NC}"

# Ejecutar cada test
for test_info in "${tests[@]}"; do
    IFS='|' read -r test_name script_path emoji <<< "$test_info"
    
    total_tests=$((total_tests + 1))
    
    if run_test "$test_name" "$script_path" "$emoji"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Pausa entre tests para evitar sobrecarga
    echo -e "\n${CYAN}⏸️  Pausa de 3 segundos antes del siguiente test...${NC}"
    sleep 3
done

# Mostrar resumen final
show_summary $passed_tests $total_tests

# Test adicional: Verificar estado del schema
echo -e "\n${BLUE}🔍 Verificación Final del Schema GraphQL...${NC}"

introspection_query='{
  "query": "query IntrospectionQuery { __schema { types { name kind } } }"
}'

schema_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$introspection_query" \
    "$GRAPHQL_URL")

if echo "$schema_response" | grep -q '"SalaPrivada"' && \
   echo "$schema_response" | grep -q '"MensajeVoz"' && \
   echo "$schema_response" | grep -q '"SincronizacionEstado"'; then
    echo -e "${GREEN}✅ Schema GraphQL contiene todos los nuevos tipos${NC}"
else
    echo -e "${RED}❌ Faltan algunos tipos en el schema GraphQL${NC}"
fi

# Información adicional
echo -e "\n${WHITE}🔧 INFORMACIÓN TÉCNICA${NC}"
echo -e "${WHITE}======================${NC}"
echo -e "${CYAN}Nuevos Tipos GraphQL agregados:${NC}"
echo -e "  🏠 SalaPrivada, TipoSala, ConfiguracionSala"
echo -e "  🎤 MensajeVoz, EstadoReproduccion, MetadatosAudio"
echo -e "  🔄 SincronizacionEstado, EventoPendiente, TipoEvento, EstadoConexion"

echo -e "\n${CYAN}Nuevas Mutations:${NC}"
echo -e "  🏠 crearSalaPrivada, enviarMensajeSala, abandonarSala"
echo -e "  🎤 enviarMensajeVozSala"
echo -e "  🔄 sincronizarEstado"

echo -e "\n${CYAN}Nuevas Queries:${NC}"
echo -e "  🏠 obtenerSalasUsuario, obtenerMensajesSala"

echo -e "\n${CYAN}Nuevas Subscriptions:${NC}"
echo -e "  🏠 nuevoMensajeSala, usuarioUnidoSala, usuarioAbandonoSala"
echo -e "  🎤 mensajeVozReproduccion"
echo -e "  🔄 sincronizacionEstado, eventosPendientes"

echo -e "\n${CYAN}Nuevos guardrails:${NC}"
echo -e "  🔒 Validación de permisos en resolvers"
echo -e "  📊 Análisis de complejidad de consultas"
echo -e "  ⏱️ Rate limiting por usuario"

echo -e "\n${CYAN}Logs de auditoria:${NC}"
echo -e "  📝 Registro de autenticación/autorización"
echo -e "  📝 Logging de acceso a datos sensibles"
echo -e "  📝 Audit de modificaciones (mutations)"
echo -e "  📝 Rate limiting con audit"
echo -e "  📝 Logs estructurados para compliance"
echo -e "  📝 Niveles de severidad (LOW, MEDIUM, HIGH, CRITICAL)"
echo -e "  📝 Filtrado y consulta de logs por administradores"

echo -e "\n${WHITE}🏁 Test Suite Completado${NC}"
echo -e "${WHITE}========================${NC}"

exit 0

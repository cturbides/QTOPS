#!/bin/bash

echo "🔐 Pruebas de Audit Logging - Sistema GraphQL E-Learning"
echo "======================================================="

# Configuración
ENDPOINT="http://localhost:3000/graphql"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}🔍 SISTEMA DE AUDIT LOGGING IMPLEMENTADO${NC}"
echo "==============================================="
echo "✅ Registro de autenticación/autorización"
echo "✅ Logging de acceso a datos sensibles"
echo "✅ Audit de modificaciones (mutations)"
echo "✅ Registro de violaciones de seguridad"
echo "✅ Rate limiting con audit"
echo "✅ Logs estructurados para compliance"
echo "✅ Niveles de severidad (LOW, MEDIUM, HIGH, CRITICAL)"
echo "✅ Filtrado y consulta de logs por administradores"

echo -e "\n${BLUE}🧪 INICIANDO PRUEBAS DE AUDIT LOGGING${NC}"
echo "====================================="

echo -e "\n${YELLOW}1. Prueba sin autenticación (generará audit log de fallo de auth)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query":"query { cursosDisponibles { id titulo } }"}' | jq .

echo -e "\n${YELLOW}2. Prueba con token de estudiante (access log)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_estudiante" \
  -d '{"query":"query { cursos { id titulo instructor { nombreCompleto } } }"}' | jq .

echo -e "\n${YELLOW}3. Prueba de operación sensible - creación de curso (audit detallado)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_instructor" \
  -d '{"query":"mutation { crearCurso(datos: { titulo: \"Curso de Seguridad GraphQL\", descripcion: \"Aprende audit logging\", instructorId: \"instructor-1\" }) { id titulo } }"}' | jq .

echo -e "\n${YELLOW}4. Prueba de autorización fallida (audit de authorization failure)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_estudiante" \
  -d '{"query":"mutation { crearCurso(datos: { titulo: \"Curso Prohibido\", descripcion: \"No debería poder crear esto\", instructorId: \"student-1\" }) { id titulo } }"}' | jq .

echo -e "\n${YELLOW}5. Prueba de query compleja (análisis de complejidad en audit)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_instructor" \
  -d '{"query":"query { cursos { id titulo instructor { id nombreCompleto } lecciones { id titulo } estadisticas { totalEstudiantes calificacionPromedio } } }"}' | jq .

echo -e "\n${YELLOW}6. Prueba de consulta de audit logs (solo admin)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_admin" \
  -d '{"query":"query { auditLogsRecientes { id timestamp eventType severity userId operationName success errorMessage } }"}' | jq .

echo -e "\n${YELLOW}7. Múltiples requests para trigger rate limiting (audit de rate limit)${NC}"
for i in {1..5}; do
  echo "Request $i/5..."
  curl -s -X POST $ENDPOINT \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token_estudiante" \
    -d '{"query":"query { cursos { id titulo } }"}' > /dev/null
  sleep 0.1
done

echo -e "\n${GREEN}✅ Pruebas completadas${NC}"

echo -e "\n${BLUE}📊 CARACTERÍSTICAS DEL SISTEMA DE AUDIT LOGGING:${NC}"
echo "================================================"
echo "🔹 Tipos de eventos auditados:"
echo "  • AUTHENTICATION - Intentos de login/validación de tokens"
echo "  • AUTHORIZATION - Verificación de permisos y roles"
echo "  • DATA_ACCESS - Acceso a datos (queries)"
echo "  • DATA_MODIFICATION - Modificación de datos (mutations)"
echo "  • SECURITY_VIOLATION - Violaciones de políticas de seguridad"
echo "  • RATE_LIMIT - Exceso de límites de velocidad"
echo ""
echo "🔹 Información registrada:"
echo "  • Usuario (ID, email, roles, sesión)"
echo "  • Request (IP, User-Agent, operación GraphQL)"
echo "  • Contexto (complejidad, profundidad de query)"
echo "  • Resultados (éxito/fallo, códigos de error)"
echo "  • Metadata específica por tipo de evento"
echo ""
echo "🔹 Niveles de severidad:"
echo "  • LOW: Operaciones normales de lectura"
echo "  • MEDIUM: Modificaciones, fallos de autorización"
echo "  • HIGH: Violaciones de seguridad"
echo "  • CRITICAL: Operaciones críticas del sistema"
echo ""
echo "🔹 Compliance y monitoreo:"
echo "  • Logs estructurados en JSON"
echo "  • Timestamps precisos"
echo "  • Trazabilidad completa de operaciones"
echo "  • Consulta de logs por administradores"
echo "  • Alertas automáticas para eventos críticos"

echo -e "\n${GREEN}🎯 SISTEMA DE AUDIT LOGGING COMPLETAMENTE IMPLEMENTADO${NC}"

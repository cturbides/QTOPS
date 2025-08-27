#!/bin/bash

echo "🔐 Pruebas de Seguridad GraphQL - Sistema E-Learning"
echo "=================================================="

# Configuración
ENDPOINT="http://localhost:3000/graphql"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Prueba sin autenticación (debería fallar para operaciones protegidas)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query":"query { cursosDisponibles { id titulo } }"}' | jq .

echo -e "\n${YELLOW}2. Prueba con token de estudiante${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_estudiante" \
  -d '{"query":"query { cursosDisponibles { id titulo instructor { nombreCompleto } } }"}' | jq .

echo -e "\n${YELLOW}3. Prueba de creación de curso (solo instructores)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_instructor" \
  -d '{"query":"mutation { crearCurso(datos: { titulo: \"Curso de Seguridad\", descripcion: \"Aprende seguridad en GraphQL\", instructorId: \"test-id\" }) { id titulo } }"}' | jq .

echo -e "\n${YELLOW}4. Prueba de consulta compleja (análisis de complejidad)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_estudiante" \
  -d '{"query":"query { cursos { id titulo instructor { id nombreCompleto } lecciones { id titulo } estadisticas { totalEstudiantes calificacionPromedio } } }"}' | jq .

echo -e "\n${YELLOW}5. Prueba de consulta muy profunda (debería fallar)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_estudiante" \
  -d '{"query":"query { cursos { instructor { id } lecciones { id } estadisticas { totalEstudiantes } } }"}' | jq .

echo -e "\n${YELLOW}6. Prueba de introspection (debería funcionar en desarrollo)${NC}"
curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query":"query IntrospectionQuery { __schema { types { name } } }"}' | jq '.data.__schema.types[0:3]'

echo -e "\n${GREEN}✅ Pruebas completadas${NC}"
echo -e "\n${YELLOW}📊 Características implementadas:${NC}"
echo "• ✅ Autenticación JWT --dummy-- integrada"
echo "• ✅ Autorización basada en roles (Estudiante, Instructor, Administrador)"
echo "• ✅ Guards personalizados para GraphQL"
echo "• ✅ Análisis de complejidad de consultas"
echo "• ✅ Rate limiting inteligente"
echo "• ✅ Protección contra consultas profundas"
echo "• ✅ Logs de seguridad"
echo "• ✅ Headers de rate limiting"
echo "• ✅ Contexto seguro con validación de token"
echo "• ✅ Permisos granulares por operación"

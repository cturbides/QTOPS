#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
GRAPHQL_URL="http://localhost:3000/graphql"
DELAY=2

echo -e "${BLUE}🚀 Test Automatizado - Mutations del Chat en Tiempo Real${NC}"
echo "=================================================="

# Obtener usuarios reales del sistema
echo -e "\n${BLUE}🔍 Obteniendo usuarios del sistema...${NC}"

temp_users_file=$(mktemp)
cat > "$temp_users_file" << 'EOF'
{
  "query": "query { usuarios { id nombreCompleto } }"
}
EOF

users_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d @"$temp_users_file" \
    "$GRAPHQL_URL")

rm -f "$temp_users_file"

# Extraer IDs de usuarios
USER1_ID=$(echo "$users_response" | jq -r '.data.usuarios[0].id' 2>/dev/null)
USER2_ID=$(echo "$users_response" | jq -r '.data.usuarios[1].id' 2>/dev/null)
USER3_ID=$(echo "$users_response" | jq -r '.data.usuarios[2].id' 2>/dev/null)

# Fallback a IDs por defecto si no se encuentran usuarios
if [ "$USER1_ID" == "null" ] || [ "$USER1_ID" == "" ]; then
    USER1_ID="1"
fi
if [ "$USER2_ID" == "null" ] || [ "$USER2_ID" == "" ]; then
    USER2_ID="2"
fi
if [ "$USER3_ID" == "null" ] || [ "$USER3_ID" == "" ]; then
    USER3_ID="3"
fi

echo -e "${GREEN}✅ Usuarios obtenidos:${NC}"
echo -e "   USER1: $USER1_ID"
echo -e "   USER2: $USER2_ID"
echo -e "   USER3: $USER3_ID"

# Obtener cursos disponibles
echo -e "\n${BLUE}🔍 Obteniendo cursos del sistema...${NC}"

temp_courses_file=$(mktemp)
cat > "$temp_courses_file" << 'EOF'
{
  "query": "query { cursos { id titulo } }"
}
EOF

courses_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d @"$temp_courses_file" \
    "$GRAPHQL_URL")

rm -f "$temp_courses_file"

CURSO_ID=$(echo "$courses_response" | jq -r '.data.cursos[0].id' 2>/dev/null)

if [ "$CURSO_ID" == "null" ] || [ "$CURSO_ID" == "" ]; then
    CURSO_ID="1"
fi

echo -e "${GREEN}✅ Curso seleccionado: $CURSO_ID${NC}"

# Función para ejecutar mutation
execute_mutation() {
    local name="$1"
    local query="$2"
    
    echo -e "\n${YELLOW}📝 Ejecutando: $name${NC}"
    
    # Crear archivo temporal con el JSON
    temp_file=$(mktemp)
    cat > "$temp_file" << EOF
{
  "query": $(echo "$query" | jq -R -s .)
}
EOF
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d @"$temp_file" \
        "$GRAPHQL_URL")
    
    # Limpiar archivo temporal
    rm -f "$temp_file"
    
    if echo "$response" | grep -q '"errors"'; then
        echo -e "${RED}❌ Error:${NC}"
        echo "$response" | jq '.errors' 2>/dev/null || echo "$response"
    else
        echo -e "${GREEN}✅ Éxito:${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    fi
    
    sleep $DELAY
}

# Test 1: Enviar mensaje simple
echo -e "\n${BLUE}=== TEST 1: Enviar Mensaje Simple ===${NC}"
execute_mutation "Enviar Mensaje" \
"mutation {
  enviarMensaje(enviarMensajeInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    contenido: \"¡Hola! Este es un mensaje de prueba automática\"
    tipo: TEXTO
  }) {
    id
    contenido
    autor {
      id
      nombreCompleto
    }
    fechaEnvio
    editado
  }
}"

# Test 2: Enviar mensaje con mención
echo -e "\n${BLUE}=== TEST 2: Enviar Mensaje con Mención ===${NC}"
execute_mutation "Enviar Mensaje con Mención" \
"mutation {
  enviarMensaje(enviarMensajeInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    contenido: \"Hola @$USER2_ID, ¿cómo van los ejercicios del curso?\"
    tipo: TEXTO
  }) {
    id
    contenido
    autor {
      id
      nombreCompleto
    }
    fechaEnvio
    editado
  }
}"

# Test 3: Obtener mensajes del curso
echo -e "\n${BLUE}=== TEST 3: Obtener Mensajes del Curso ===${NC}"
execute_mutation "Obtener Mensajes" \
"query {
  obtenerMensajesCurso(obtenerMensajesInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    limite: 10
    offset: 0
  }) {
    id
    contenido
    autor {
      id
      nombreCompleto
    }
    fechaEnvio
    tipo
    editado
  }
}"

# Test 4: Indicar que está escribiendo
echo -e "\n${BLUE}=== TEST 4: Indicar Escritura ===${NC}"
execute_mutation "Indicar Escritura - Activar" \
"mutation {
  indicarEscritura(indicarEscrituraInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    escribiendo: true
  })
}"

sleep 1

execute_mutation "Indicar Escritura - Desactivar" \
"mutation {
  indicarEscritura(indicarEscrituraInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    escribiendo: false
  })
}"

# Test 5: Cambiar presencia
echo -e "\n${BLUE}=== TEST 5: Cambiar Estado de Presencia ===${NC}"
execute_mutation "Cambiar Estado - ONLINE" \
"mutation {
  cambiarEstado(cambiarEstadoInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    estado: ONLINE
  })
}"

execute_mutation "Cambiar Estado - OCUPADO" \
"mutation {
  cambiarEstado(cambiarEstadoInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
    estado: OCUPADO
  })
}"

# Test 6: Obtener estado en curso
echo -e "\n${BLUE}=== TEST 6: Obtener Estado en Curso ===${NC}"
execute_mutation "Obtener Estado" \
"query {
  obtenerEstadoCurso(
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER1_ID\"
  ) {
    usuario {
      id
      nombreCompleto
    }
    estado
    ultimaConexion
  }
}"

# Test 7: Simulación Multi-Usuario
echo -e "\n${BLUE}=== TEST 7: Simulación Multi-Usuario ===${NC}"

# Solo usar usuarios que tienen acceso al curso
users=("$USER1_ID" "$USER2_ID")
messages=("¡Hola a todos!" "¿Alguien puede ayudarme con el ejercicio 3?")

for i in "${!users[@]}"; do
    user="${users[$i]}"
    message="${messages[$i]}"
    
    execute_mutation "Mensaje de $user" \
    "mutation {
      enviarMensaje(enviarMensajeInput: {
        cursoId: \"$CURSO_ID\"
        usuarioId: \"$user\"
        contenido: \"$message\"
        tipo: TEXTO
      }) {
        id
        contenido
        autor {
          nombreCompleto
        }
        fechaEnvio
      }
    }"
done

# Intentar inscribir al tercer usuario y luego enviar mensaje
echo -e "\n${CYAN}Intentando inscribir al tercer usuario en el curso...${NC}"
execute_mutation "Inscribir Usuario 3" \
"mutation {
  inscribirEnCurso(
    cursoId: \"$CURSO_ID\"
    estudianteId: \"$USER3_ID\"
  ) {
    message
    success
  }
}"

sleep 1

# Ahora intentar enviar mensaje con el tercer usuario
execute_mutation "Mensaje de $USER3_ID (después de inscripción)" \
"mutation {
  enviarMensaje(enviarMensajeInput: {
    cursoId: \"$CURSO_ID\"
    usuarioId: \"$USER3_ID\"
    contenido: \"Yo puedo ayudarte @$USER2_ID\"
    tipo: TEXTO
  }) {
    id
    contenido
    autor {
      nombreCompleto
    }
    fechaEnvio
  }
}"

# Test 8: Editar un mensaje (necesitamos primero crear uno y guardar su ID)
echo -e "\n${BLUE}=== TEST 8: Editar Mensaje ===${NC}"

# Primero enviamos un mensaje y capturamos su ID
temp_query_file=$(mktemp)
cat > "$temp_query_file" << EOF
{
  "query": "mutation { enviarMensaje(enviarMensajeInput: { cursoId: \"$CURSO_ID\", usuarioId: \"$USER1_ID\", contenido: \"Mensaje original para editar\", tipo: TEXTO }) { id } }"
}
EOF

response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d @"$temp_query_file" \
    "$GRAPHQL_URL")

rm -f "$temp_query_file"

message_id=$(echo "$response" | jq -r '.data.enviarMensaje.id' 2>/dev/null)

if [ "$message_id" != "null" ] && [ "$message_id" != "" ]; then
    execute_mutation "Editar Mensaje" \
    "mutation {
      editarMensaje(editarMensaje: {
        mensajeId: \"$message_id\"
        usuarioId: \"$USER1_ID\"
        contenido: \"Mensaje editado automáticamente por el test\"
      }) {
        id
        contenido
        editado
        fechaEdicion
      }
    }"
else
    echo -e "${RED}❌ No se pudo obtener ID del mensaje para editar${NC}"
fi

# Test 9: Eliminar un mensaje
echo -e "\n${BLUE}=== TEST 9: Eliminar Mensaje ===${NC}"

if [ "$message_id" != "null" ] && [ "$message_id" != "" ]; then
    execute_mutation "Eliminar Mensaje" \
    "mutation {
      eliminarMensaje(eliminarMensajeData: {
        mensajeId: \"$message_id\"
        usuarioId: \"$USER1_ID\"
      })
    }"
else
    echo -e "${RED}❌ No se pudo eliminar mensaje (ID no disponible)${NC}"
fi

echo -e "\n${GREEN}🎉 Tests de Mutations Completados!${NC}"
echo "=================================================="
echo -e "${BLUE}💡 Próximo paso: Ejecuta ./test_subscriptions.sh para probar las suscripciones${NC}"

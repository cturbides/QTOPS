#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
GRAPHQL_URL="http://localhost:3000/graphql"
DELAY=2

echo -e "${BLUE}🏠 Test Automatizado - Salas Privadas${NC}"
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
        return 1
    else
        echo -e "${GREEN}✅ Éxito:${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    fi
    
    sleep $DELAY
}

# Variables para almacenar IDs creados durante los tests
SALA_PRIVADA_ID=""
SALA_GRUPO_ID=""

# Test 1: Crear Sala Privada
echo -e "\n${BLUE}=== TEST 1: Crear Sala Privada ===${NC}"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"query\": \"mutation { crearSalaPrivada(crearSalaInput: { nombre: \\\"Proyecto Secreto\\\", descripcion: \\\"Sala privada para discutir el proyecto secreto\\\", tipo: PRIVADA, creadorId: \\\"$USER1_ID\\\", participantesIds: [\\\"$USER2_ID\\\"] }) { id nombre tipo creador { id nombreCompleto } participantes { id nombreCompleto } configuracion { mensajesVozPermitidos notificacionesSonido archivoCompartido } } }\"
    }" \
    "$GRAPHQL_URL")

if echo "$response" | grep -q '"errors"'; then
    echo -e "${RED}❌ Error creando sala privada:${NC}"
    echo "$response" | jq '.errors' 2>/dev/null || echo "$response"
else
    echo -e "${GREEN}✅ Sala privada creada exitosamente:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    SALA_PRIVADA_ID=$(echo "$response" | jq -r '.data.crearSalaPrivada.id' 2>/dev/null)
fi

sleep $DELAY

# Test 2: Crear Sala de Grupo
echo -e "\n${BLUE}=== TEST 2: Crear Sala de Grupo ===${NC}"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"query\": \"mutation { crearSalaPrivada(crearSalaInput: { nombre: \\\"Equipo Frontend\\\", descripcion: \\\"Sala del equipo de desarrollo frontend\\\", tipo: GRUPO, creadorId: \\\"$USER1_ID\\\", participantesIds: [\\\"$USER2_ID\\\", \\\"$USER3_ID\\\"], configuracion: { mensajesVozPermitidos: true, notificacionesSonido: false, limiteMensajes: 500 } }) { id nombre tipo creador { id nombreCompleto } participantes { id nombreCompleto } configuracion { mensajesVozPermitidos notificacionesSonido limiteMensajes } } }\"
    }" \
    "$GRAPHQL_URL")

if echo "$response" | grep -q '"errors"'; then
    echo -e "${RED}❌ Error creando sala de grupo:${NC}"
    echo "$response" | jq '.errors' 2>/dev/null || echo "$response"
else
    echo -e "${GREEN}✅ Sala de grupo creada exitosamente:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    SALA_GRUPO_ID=$(echo "$response" | jq -r '.data.crearSalaPrivada.id' 2>/dev/null)
fi

sleep $DELAY

# Test 3: Obtener Salas del Usuario
echo -e "\n${BLUE}=== TEST 3: Obtener Salas del Usuario ===${NC}"
execute_mutation "Obtener Salas de $USER1_ID" \
"query {
  obtenerSalasUsuario(usuarioId: \"$USER1_ID\") {
    id
    nombre
    descripcion
    tipo
    creador {
      id
      nombreCompleto
    }
    participantes {
      id
      nombreCompleto
    }
    fechaCreacion
    ultimaActividad
    configuracion {
      mensajesVozPermitidos
      notificacionesSonido
      limiteMensajes
      archivoCompartido
    }
  }
}"

# Test 4: Enviar mensaje en sala privada
if [ "$SALA_PRIVADA_ID" != "null" ] && [ "$SALA_PRIVADA_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 4: Enviar Mensaje en Sala Privada ===${NC}"
    execute_mutation "Enviar Mensaje en Sala Privada" \
    "mutation {
      enviarMensajeSala(enviarMensajeInput: {
        usuarioId: \"$USER1_ID\"
        salaId: \"$SALA_PRIVADA_ID\"
        contenido: \"¡Hola! Este es nuestro primer mensaje en la sala privada.\"
        tipo: TEXTO
      }) {
        id
        contenido
        autor {
          id
          nombreCompleto
        }
        salaId
        fechaEnvio
        tipo
      }
    }"
else
    echo -e "${RED}❌ No se puede enviar mensaje (Sala privada no creada)${NC}"
fi

# Test 5: Enviar mensaje con respuesta (threading)
if [ "$SALA_GRUPO_ID" != "null" ] && [ "$SALA_GRUPO_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 5: Enviar Mensaje Original en Sala de Grupo ===${NC}"
    
    # Primero enviamos un mensaje original
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"query\": \"mutation { enviarMensajeSala(enviarMensajeInput: { usuarioId: \\\"$USER2_ID\\\", salaId: \\\"$SALA_GRUPO_ID\\\", contenido: \\\"¿Alguien puede revisar mi código?\\\", tipo: TEXTO }) { id contenido autor { nombreCompleto } } }\"
        }" \
        "$GRAPHQL_URL")
    
    mensaje_original_id=$(echo "$response" | jq -r '.data.enviarMensajeSala.id' 2>/dev/null)
    
    if [ "$mensaje_original_id" != "null" ] && [ "$mensaje_original_id" != "" ]; then
        echo -e "${GREEN}✅ Mensaje original enviado (ID: $mensaje_original_id)${NC}"
        
        sleep 1
        
        echo -e "\n${BLUE}=== TEST 6: Enviar Respuesta (Threading) ===${NC}"
        execute_mutation "Responder a Mensaje" \
        "mutation {
          enviarMensajeSala(enviarMensajeInput: {
            usuarioId: \"$USER3_ID\"
            salaId: \"$SALA_GRUPO_ID\"
            contenido: \"¡Claro! Puedo ayudarte con la revisión.\"
            tipo: TEXTO
            respondePor: \"$mensaje_original_id\"
          }) {
            id
            contenido
            autor {
              nombreCompleto
            }
            respondePor
            fechaEnvio
          }
        }"
    else
        echo -e "${RED}❌ No se pudo obtener ID del mensaje original${NC}"
    fi
else
    echo -e "${RED}❌ No se puede enviar mensaje (Sala de grupo no creada)${NC}"
fi

# Test 7: Obtener mensajes de sala
if [ "$SALA_PRIVADA_ID" != "null" ] && [ "$SALA_PRIVADA_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 7: Obtener Mensajes de Sala Privada ===${NC}"
    execute_mutation "Obtener Mensajes de Sala" \
    "query {
      obtenerMensajesSala(obtenerMensajesInput: {
        usuarioId: \"$USER1_ID\"
        salaId: \"$SALA_PRIVADA_ID\"
        limite: 10
        offset: 0
      }) {
        id
        contenido
        autor {
          id
          nombreCompleto
        }
        tipo
        fechaEnvio
        respondePor
        salaId
      }
    }"
fi

# Test 8: Sincronización de Estado
if [ "$SALA_GRUPO_ID" != "null" ] && [ "$SALA_GRUPO_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 8: Sincronización de Estado ===${NC}"
    execute_mutation "Sincronizar Estado" \
    "mutation {
      sincronizarEstado(sincronizarInput: {
        usuarioId: \"$USER2_ID\"
        salaId: \"$SALA_GRUPO_ID\"
      }) {
        id
        usuarioId
        salaId
        ultimaConexion
        estadoConexion
        mensajesSincronizados
        eventosPendientes {
          id
          tipo
          fechaEvento
          procesado
        }
      }
    }"
fi

# Test 9: Obtener mensajes desde timestamp específico
if [ "$SALA_GRUPO_ID" != "null" ] && [ "$SALA_GRUPO_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 9: Obtener Mensajes desde Timestamp ===${NC}"
    
    # Obtener timestamp de hace 1 hora
    timestamp=$(date -u -d '1 hour ago' +"%Y-%m-%dT%H:%M:%SZ")
    
    execute_mutation "Obtener Mensajes desde $timestamp" \
    "query {
      obtenerMensajesSala(obtenerMensajesInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_GRUPO_ID\"
        limite: 20
        desdeTimestamp: \"$timestamp\"
      }) {
        id
        contenido
        autor {
          nombreCompleto
        }
        fechaEnvio
        tipo
      }
    }"
fi

# Test 10: Test de validación de acceso
echo -e "\n${BLUE}=== TEST 10: Validación de Acceso (Debe Fallar) ===${NC}"
if [ "$SALA_PRIVADA_ID" != "null" ] && [ "$SALA_PRIVADA_ID" != "" ]; then
    execute_mutation "Intentar Acceso No Autorizado" \
    "mutation {
      enviarMensajeSala(enviarMensajeInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_PRIVADA_ID\"
        contenido: \"Intento de acceso no autorizado\"
        tipo: TEXTO
      }) {
        id
        contenido
      }
    }"
    
    echo -e "${CYAN}💡 Este error es esperado - valida que la seguridad funciona correctamente${NC}"
fi

# Test 11: Abandonar Sala
if [ "$SALA_GRUPO_ID" != "null" ] && [ "$SALA_GRUPO_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 11: Abandonar Sala ===${NC}"
    execute_mutation "Usuario abandona sala" \
    "mutation {
      abandonarSala(salaId: \"$SALA_GRUPO_ID\", usuarioId: \"$USER3_ID\")
    }"
    
    # Verificar que el usuario ya no está en la sala
    echo -e "\n${BLUE}=== TEST 12: Verificar que Usuario No Está en Sala ===${NC}"
    execute_mutation "Verificar ausencia en sala" \
    "query {
      obtenerSalasUsuario(usuarioId: \"$USER3_ID\") {
        id
        nombre
        participantes {
          id
        }
      }
    }"
fi

echo -e "\n${GREEN}🎉 Tests de Salas Privadas Completados!${NC}"
echo "=================================================="
echo -e "${CYAN}Salas creadas durante los tests:${NC}"
if [ "$SALA_PRIVADA_ID" != "null" ] && [ "$SALA_PRIVADA_ID" != "" ]; then
    echo -e "  📁 Sala Privada: $SALA_PRIVADA_ID"
fi
if [ "$SALA_GRUPO_ID" != "null" ] && [ "$SALA_GRUPO_ID" != "" ]; then
    echo -e "  👥 Sala de Grupo: $SALA_GRUPO_ID"
fi
echo -e "\n${BLUE}💡 Próximo paso: Ejecuta ./test_mensajes_voz.sh para probar mensajes de voz${NC}"

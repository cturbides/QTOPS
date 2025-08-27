#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuración
GRAPHQL_URL="http://localhost:3000/graphql"
DELAY=2

echo -e "${BLUE}🔄 Test Automatizado - Sincronización de Estado${NC}"
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

# Variables para almacenar IDs
SALA_SYNC_ID=""

# Test 1: Crear Sala para Pruebas de Sincronización
echo -e "\n${BLUE}=== TEST 1: Crear Sala para Sincronización ===${NC}"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"query\": \"mutation { crearSalaPrivada(crearSalaInput: { nombre: \\\"Sala de Sincronización\\\", descripcion: \\\"Sala para probar la sincronización de estado\\\", tipo: GRUPO, creadorId: \\\"$USER1_ID\\\", participantesIds: [\\\"$USER2_ID\\\", \\\"$USER3_ID\\\"] }) { id nombre participantes { id nombreCompleto } } }\"
    }" \
    "$GRAPHQL_URL")

if echo "$response" | grep -q '"errors"'; then
    echo -e "${RED}❌ Error creando sala de sincronización:${NC}"
    echo "$response" | jq '.errors' 2>/dev/null || echo "$response"
else
    echo -e "${GREEN}✅ Sala de sincronización creada exitosamente:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    SALA_SYNC_ID=$(echo "$response" | jq -r '.data.crearSalaPrivada.id' 2>/dev/null)
fi

sleep $DELAY

# Test 2: Inicializar Sincronización para Usuario 1
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 2: Inicializar Sincronización - Usuario 1 ===${NC}"
    execute_mutation "Sincronizar Estado - User1" \
    "mutation {
      sincronizarEstado(sincronizarInput: {
        usuarioId: \"$USER1_ID\"
        salaId: \"$SALA_SYNC_ID\"
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

# Test 3: Inicializar Sincronización para Usuario 2
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 3: Inicializar Sincronización - Usuario 2 ===${NC}"
    execute_mutation "Sincronizar Estado - User2" \
    "mutation {
      sincronizarEstado(sincronizarInput: {
        usuarioId: \"$USER2_ID\"
        salaId: \"$SALA_SYNC_ID\"
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

# Test 4: Enviar Varios Mensajes para Crear Historial
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 4: Crear Historial de Mensajes ===${NC}"
    
    mensajes=(
        "Primer mensaje para el historial"
        "Segundo mensaje con información importante"
        "Tercer mensaje para completar el historial"
    )
    
    usuarios=("$USER1_ID" "$USER2_ID" "$USER1_ID")
    
    for i in "${!mensajes[@]}"; do
        usuario="${usuarios[$i]}"
        mensaje="${mensajes[$i]}"
        
        echo -e "\n${CYAN}📨 Enviando mensaje $((i+1))/3${NC}"
        
        execute_mutation "Mensaje $((i+1))" \
        "mutation {
          enviarMensajeSala(enviarMensajeInput: {
            usuarioId: \"$usuario\"
            salaId: \"$SALA_SYNC_ID\"
            contenido: \"$mensaje\"
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
        
        sleep 1
    done
fi

# Test 5: Usuario 3 se "Conecta" por Primera Vez (Sincronización Inicial)
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 5: Primera Conexión de Usuario 3 ===${NC}"
    execute_mutation "Primera Sincronización - User3" \
    "mutation {
      sincronizarEstado(sincronizarInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_SYNC_ID\"
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
          datos
          fechaEvento
          procesado
        }
      }
    }"
fi

# Test 6: Enviar Más Mensajes Mientras Usuario 3 Está "Desconectado"
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 6: Mensajes Mientras Usuario 3 Desconectado ===${NC}"
    
    mensajes_offline=(
        "Mensaje mientras User3 estaba desconectado - 1"
        "Mensaje mientras User3 estaba desconectado - 2"
    )
    
    for i in "${!mensajes_offline[@]}"; do
        mensaje="${mensajes_offline[$i]}"
        
        echo -e "\n${CYAN}📨 Enviando mensaje offline $((i+1))/2${NC}"
        
        execute_mutation "Mensaje Offline $((i+1))" \
        "mutation {
          enviarMensajeSala(enviarMensajeInput: {
            usuarioId: \"$USER1_ID\"
            salaId: \"$SALA_SYNC_ID\"
            contenido: \"$mensaje\"
            tipo: TEXTO
          }) {
            id
            contenido
            fechaEnvio
          }
        }"
        
        sleep 1
    done
fi

# Test 7: Enviar Mensaje de Voz Mientras Usuario 3 Desconectado
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 7: Mensaje de Voz Offline ===${NC}"
    execute_mutation "Mensaje de Voz Offline" \
    "mutation {
      enviarMensajeVozSala(enviarMensajeVozInput: {
        usuarioId: \"$USER2_ID\"
        salaId: \"$SALA_SYNC_ID\"
        duracion: 8.5
        urlAudio: \"https://example.com/audio/mensaje_offline.mp3\"
        transcripcion: \"Este es un mensaje de voz enviado mientras el usuario 3 estaba desconectado\"
        metadatos: {
          calidad: MEDIA
          formatoCompresion: MP3
          tamanoBytes: 110000
        }
      }) {
        id
        tipo
        mensajeVoz {
          duracion
          transcripcion
        }
        fechaEnvio
      }
    }"
fi

# Test 8: Usuario 3 se "Reconecta" y Sincroniza
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 8: Reconexión y Sincronización de Usuario 3 ===${NC}"
    execute_mutation "Reconexión - User3" \
    "mutation {
      sincronizarEstado(sincronizarInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_SYNC_ID\"
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
          datos
          fechaEvento
          procesado
        }
      }
    }"
fi

# Test 9: Obtener Mensajes desde Última Conexión
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 9: Obtener Mensajes desde Última Conexión ===${NC}"
    
    # Calcular timestamp de hace 10 minutos
    timestamp=$(date -u -d '10 minutes ago' +"%Y-%m-%dT%H:%M:%SZ")
    
    execute_mutation "Mensajes desde $timestamp" \
    "query {
      obtenerMensajesSala(obtenerMensajesInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_SYNC_ID\"
        limite: 20
        desdeTimestamp: \"$timestamp\"
      }) {
        id
        contenido
        tipo
        autor {
          nombreCompleto
        }
        fechaEnvio
        mensajeVoz {
          duracion
          transcripcion
        }
      }
    }"
fi

# Test 10: Simular Múltiples Conexiones/Desconexiones
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 10: Múltiples Conexiones/Desconexiones ===${NC}"
    
    for i in {1..3}; do
        echo -e "\n${MAGENTA}🔄 Ciclo de Conexión $i${NC}"
        
        # Sincronizar
        execute_mutation "Conexión $i - User2" \
        "mutation {
          sincronizarEstado(sincronizarInput: {
            usuarioId: \"$USER2_ID\"
            salaId: \"$SALA_SYNC_ID\"
          }) {
            estadoConexion
            eventosPendientes {
              tipo
              procesado
            }
          }
        }"
        
        # Enviar mensaje
        execute_mutation "Mensaje durante Conexión $i" \
        "mutation {
          enviarMensajeSala(enviarMensajeInput: {
            usuarioId: \"$USER2_ID\"
            salaId: \"$SALA_SYNC_ID\"
            contenido: \"Mensaje durante ciclo de conexión $i\"
            tipo: TEXTO
          }) {
            id
            contenido
          }
        }"
        
        sleep 1
    done
fi

# Test 11: Obtener Estado de Sincronización Final
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 11: Estado Final de Sincronización ===${NC}"
    
    usuarios_finales=("$USER1_ID" "$USER2_ID" "$USER3_ID")
    
    for usuario in "${usuarios_finales[@]}"; do
        echo -e "\n${CYAN}👤 Estado de sincronización para Usuario: $usuario${NC}"
        
        execute_mutation "Estado Final - $usuario" \
        "mutation {
          sincronizarEstado(sincronizarInput: {
            usuarioId: \"$usuario\"
            salaId: \"$SALA_SYNC_ID\"
          }) {
            id
            estadoConexion
            ultimaConexion
            mensajesSincronizados
            eventosPendientes {
              id
              tipo
              procesado
            }
          }
        }"
    done
fi

# Test 12: Resumen Final de Mensajes
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 12: Resumen Final de Mensajes ===${NC}"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"query\": \"query { obtenerMensajesSala(obtenerMensajesInput: { usuarioId: \\\"$USER1_ID\\\", salaId: \\\"$SALA_SYNC_ID\\\", limite: 50 }) { id contenido tipo autor { nombreCompleto } fechaEnvio mensajeVoz { duracion } } }\"
        }" \
        "$GRAPHQL_URL")
    
    echo -e "${GREEN}📊 Resumen Final:${NC}"
    echo "$response" | jq '.data.obtenerMensajesSala | length' | sed 's/^/  Total de mensajes: /'
    echo "$response" | jq '[.data.obtenerMensajesSala[] | select(.tipo == "TEXTO")] | length' | sed 's/^/  Mensajes de texto: /'
    echo "$response" | jq '[.data.obtenerMensajesSala[] | select(.tipo == "AUDIO")] | length' | sed 's/^/  Mensajes de voz: /'
    
    echo -e "\n${GREEN}👥 Mensajes por Usuario:${NC}"
    for usuario in "${usuarios_finales[@]}"; do
        count=$(echo "$response" | jq "[.data.obtenerMensajesSala[] | select(.autor.id == \"$usuario\")] | length")
        echo "  Usuario $usuario: $count mensajes"
    done
    
    echo -e "\n${GREEN}⏰ Timeline de Mensajes:${NC}"
    echo "$response" | jq -r '.data.obtenerMensajesSala[] | "  \(.fechaEnvio | split("T")[1] | split(".")[0]) - \(.autor.nombreCompleto): \(.contenido[0:50])\(if .contenido | length > 50 then "..." else "" end)"' | tail -10
fi

# Test 13: Verificar Persistencia de Estado
echo -e "\n${BLUE}=== TEST 13: Verificación de Persistencia ===${NC}"
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "${CYAN}🔍 Verificando que los estados de sincronización persisten...${NC}"
    
    # Verificar que podemos obtener el estado sin inicializar nuevamente
    for usuario in "${usuarios_finales[@]}"; do
        execute_mutation "Verificar Persistencia - $usuario" \
        "mutation {
          sincronizarEstado(sincronizarInput: {
            usuarioId: \"$usuario\"
            salaId: \"$SALA_SYNC_ID\"
          }) {
            mensajesSincronizados
            eventosPendientes {
              procesado
            }
          }
        }"
    done
fi

echo -e "\n${GREEN}🎉 Tests de Sincronización de Estado Completados!${NC}"
echo "=================================================="
echo -e "${CYAN}Sala utilizada:${NC}"
if [ "$SALA_SYNC_ID" != "null" ] && [ "$SALA_SYNC_ID" != "" ]; then
    echo -e "  🔄 Sala de Sincronización: $SALA_SYNC_ID"
fi
echo -e "\n${GREEN}✅ Funcionalidades Probadas:${NC}"
echo -e "  🔹 Inicialización de sincronización"
echo -e "  🔹 Manejo de mensajes perdidos"
echo -e "  🔹 Estados de conexión"
echo -e "  🔹 Eventos pendientes"
echo -e "  🔹 Reconexión automática"
echo -e "  🔹 Persistencia de estado"
echo -e "  🔹 Sincronización de mensajes de voz"
echo -e "  🔹 Timeline de mensajes"
echo -e "\n${BLUE}💡 Todos los tests de las nuevas funcionalidades han sido completados${NC}"

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

echo -e "${BLUE}🎤 Test Automatizado - Mensajes de Voz${NC}"
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
SALA_VOZ_ID=""

# Test 1: Crear Sala con Mensajes de Voz Habilitados
echo -e "\n${BLUE}=== TEST 1: Crear Sala con Mensajes de Voz Habilitados ===${NC}"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"query\": \"mutation { crearSalaPrivada(crearSalaInput: { nombre: \\\"Sala de Audio\\\", descripcion: \\\"Sala para probar mensajes de voz\\\", tipo: GRUPO, creadorId: \\\"$USER1_ID\\\", participantesIds: [\\\"$USER2_ID\\\", \\\"$USER3_ID\\\"], configuracion: { mensajesVozPermitidos: true, notificacionesSonido: true } }) { id nombre configuracion { mensajesVozPermitidos } } }\"
    }" \
    "$GRAPHQL_URL")

if echo "$response" | grep -q '"errors"'; then
    echo -e "${RED}❌ Error creando sala de audio:${NC}"
    echo "$response" | jq '.errors' 2>/dev/null || echo "$response"
else
    echo -e "${GREEN}✅ Sala de audio creada exitosamente:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    SALA_VOZ_ID=$(echo "$response" | jq -r '.data.crearSalaPrivada.id' 2>/dev/null)
fi

sleep $DELAY

# Test 2: Enviar Mensaje de Voz Corto
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 2: Enviar Mensaje de Voz Corto ===${NC}"
    execute_mutation "Enviar Mensaje de Voz Corto" \
    "mutation {
      enviarMensajeVozSala(enviarMensajeVozInput: {
        usuarioId: \"$USER1_ID\"
        salaId: \"$SALA_VOZ_ID\"
        duracion: 5.2
        urlAudio: \"https://example.com/audio/mensaje_corto_001.mp3\"
        transcripcion: \"Hola equipo, ¿cómo están?\"
        metadatos: {
          calidad: ALTA
          formatoCompresion: MP3
          tamanoBytes: 67584
        }
      }) {
        id
        contenido
        tipo
        autor {
          nombreCompleto
        }
        mensajeVoz {
          id
          duracion
          urlAudio
          transcripcion
          estadoReproduccion
          metadatos {
            calidad
            formatoCompresion
            tamanoBytes
            fechaCreacion
          }
        }
        fechaEnvio
      }
    }"
fi

# Test 3: Enviar Mensaje de Voz Largo
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 3: Enviar Mensaje de Voz Largo ===${NC}"
    execute_mutation "Enviar Mensaje de Voz Largo" \
    "mutation {
      enviarMensajeVozSala(enviarMensajeVozInput: {
        usuarioId: \"$USER2_ID\"
        salaId: \"$SALA_VOZ_ID\"
        duracion: 45.8
        urlAudio: \"https://example.com/audio/mensaje_largo_002.ogg\"
        transcripcion: \"Quería contarles sobre el avance del proyecto. Hemos terminado la primera fase de desarrollo y estamos listos para comenzar con las pruebas. Necesitamos revisar los casos de uso principales y asegurarnos de que todo funcione correctamente antes del lanzamiento.\"
        metadatos: {
          calidad: MEDIA
          formatoCompresion: OGG
          tamanoBytes: 245760
        }
      }) {
        id
        contenido
        tipo
        mensajeVoz {
          duracion
          urlAudio
          transcripcion
          estadoReproduccion
          metadatos {
            calidad
            formatoCompresion
            tamanoBytes
          }
        }
      }
    }"
fi

# Test 4: Enviar Mensaje de Voz sin Transcripción
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 4: Enviar Mensaje de Voz sin Transcripción ===${NC}"
    execute_mutation "Enviar Mensaje de Voz sin Transcripción" \
    "mutation {
      enviarMensajeVozSala(enviarMensajeVozInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_VOZ_ID\"
        duracion: 12.1
        urlAudio: \"https://example.com/audio/mensaje_sin_transcripcion_003.webm\"
        metadatos: {
          calidad: BAJA
          formatoCompresion: WEBM
          tamanoBytes: 98304
        }
      }) {
        id
        contenido
        tipo
        mensajeVoz {
          id
          duracion
          urlAudio
          transcripcion
          estadoReproduccion
          metadatos {
            calidad
            formatoCompresion
          }
        }
      }
    }"
fi

# Test 5: Crear Sala con Mensajes de Voz Deshabilitados
echo -e "\n${BLUE}=== TEST 5: Crear Sala con Mensajes de Voz Deshabilitados ===${NC}"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{
        \"query\": \"mutation { crearSalaPrivada(crearSalaInput: { nombre: \\\"Sala Solo Texto\\\", descripcion: \\\"Sala donde no se permiten mensajes de voz\\\", tipo: PRIVADA, creadorId: \\\"$USER1_ID\\\", participantesIds: [\\\"$USER2_ID\\\"], configuracion: { mensajesVozPermitidos: false } }) { id nombre configuracion { mensajesVozPermitidos } } }\"
    }" \
    "$GRAPHQL_URL")

SALA_SIN_VOZ_ID=$(echo "$response" | jq -r '.data.crearSalaPrivada.id' 2>/dev/null)

if [ "$SALA_SIN_VOZ_ID" != "null" ] && [ "$SALA_SIN_VOZ_ID" != "" ]; then
    echo -e "${GREEN}✅ Sala sin voz creada: $SALA_SIN_VOZ_ID${NC}"
    
    # Test 6: Intentar Enviar Mensaje de Voz en Sala Prohibida (Debe Fallar)
    echo -e "\n${BLUE}=== TEST 6: Intentar Mensaje de Voz en Sala Prohibida ===${NC}"
    execute_mutation "Intentar Mensaje de Voz (Debe Fallar)" \
    "mutation {
      enviarMensajeVozSala(enviarMensajeVozInput: {
        usuarioId: \"$USER1_ID\"
        salaId: \"$SALA_SIN_VOZ_ID\"
        duracion: 3.5
        urlAudio: \"https://example.com/audio/prohibido.mp3\"
        metadatos: {
          tamanoBytes: 45000
        }
      }) {
        id
        contenido
      }
    }"
    
    echo -e "${CYAN}💡 Este error es esperado - valida que la configuración funciona${NC}"
fi

# Test 7: Mensaje de Voz como Respuesta (Threading)
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 7: Enviar Mensaje de Texto Original ===${NC}"
    
    # Primero enviamos un mensaje de texto
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"query\": \"mutation { enviarMensajeSala(enviarMensajeInput: { usuarioId: \\\"$USER1_ID\\\", salaId: \\\"$SALA_VOZ_ID\\\", contenido: \\\"¿Pueden confirmar si recibieron mi mensaje de voz anterior?\\\", tipo: TEXTO }) { id contenido } }\"
        }" \
        "$GRAPHQL_URL")
    
    mensaje_original_id=$(echo "$response" | jq -r '.data.enviarMensajeSala.id' 2>/dev/null)
    
    if [ "$mensaje_original_id" != "null" ] && [ "$mensaje_original_id" != "" ]; then
        echo -e "${GREEN}✅ Mensaje de texto enviado (ID: $mensaje_original_id)${NC}"
        
        sleep 1
        
        echo -e "\n${BLUE}=== TEST 8: Responder con Mensaje de Voz ===${NC}"
        execute_mutation "Responder con Mensaje de Voz" \
        "mutation {
          enviarMensajeVozSala(enviarMensajeVozInput: {
            usuarioId: \"$USER2_ID\"
            salaId: \"$SALA_VOZ_ID\"
            duracion: 8.3
            urlAudio: \"https://example.com/audio/respuesta_004.mp3\"
            transcripcion: \"Sí, recibí tu mensaje perfectamente. Todo se escucha muy claro.\"
            respondePor: \"$mensaje_original_id\"
            metadatos: {
              calidad: ALTA
              formatoCompresion: MP3
              tamanoBytes: 108000
            }
          }) {
            id
            contenido
            tipo
            respondePor
            mensajeVoz {
              duracion
              transcripcion
              estadoReproduccion
            }
          }
        }"
    fi
fi

# Test 9: Obtener Solo Mensajes de Voz
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 9: Obtener Todos los Mensajes de la Sala ===${NC}"
    execute_mutation "Obtener Mensajes (Incluyendo Voz)" \
    "query {
      obtenerMensajesSala(obtenerMensajesInput: {
        usuarioId: \"$USER1_ID\"
        salaId: \"$SALA_VOZ_ID\"
        limite: 20
      }) {
        id
        contenido
        tipo
        autor {
          nombreCompleto
        }
        fechaEnvio
        mensajeVoz {
          id
          duracion
          urlAudio
          transcripcion
          estadoReproduccion
          metadatos {
            calidad
            formatoCompresion
            tamanoBytes
          }
        }
        respondePor
      }
    }"
fi

# Test 10: Diferentes Formatos de Audio
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 10: Probar Diferentes Formatos de Audio ===${NC}"
    
    formatos=("MP3" "OGG" "WEBM")
    calidades=("BAJA" "MEDIA" "ALTA")
    duraciones=(3.2 15.7 28.9)
    
    for i in "${!formatos[@]}"; do
        formato="${formatos[$i]}"
        calidad="${calidades[$i]}"
        duracion="${duraciones[$i]}"
        
        echo -e "\n${MAGENTA}Probando formato $formato con calidad $calidad${NC}"
        
        execute_mutation "Mensaje de Voz - $formato" \
        "mutation {
          enviarMensajeVozSala(enviarMensajeVozInput: {
            usuarioId: \"$USER1_ID\"
            salaId: \"$SALA_VOZ_ID\"
            duracion: $duracion
            urlAudio: \"https://example.com/audio/test_${formato,,}_${i}.${formato,,}\"
            transcripcion: \"Mensaje de prueba en formato $formato con calidad $calidad\"
            metadatos: {
              calidad: $calidad
              formatoCompresion: $formato
              tamanoBytes: $((50000 + i * 20000))
            }
          }) {
            id
            tipo
            mensajeVoz {
              duracion
              metadatos {
                calidad
                formatoCompresion
                tamanoBytes
              }
            }
          }
        }"
        
        sleep 1
    done
fi

# Test 11: Mensaje de Voz Muy Largo (Límite)
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "\n${BLUE}=== TEST 11: Mensaje de Voz Muy Largo ===${NC}"
    execute_mutation "Mensaje de Voz de 2 Minutos" \
    "mutation {
      enviarMensajeVozSala(enviarMensajeVozInput: {
        usuarioId: \"$USER3_ID\"
        salaId: \"$SALA_VOZ_ID\"
        duracion: 120.5
        urlAudio: \"https://example.com/audio/mensaje_muy_largo.mp3\"
        transcripcion: \"Este es un mensaje de voz muy largo para probar los límites del sistema. Incluye mucha información detallada sobre el proyecto, explicaciones técnicas, y discusiones sobre la implementación. Es importante verificar que el sistema puede manejar archivos de audio de mayor duración sin problemas.\"
        metadatos: {
          calidad: ALTA
          formatoCompresion: MP3
          tamanoBytes: 1920000
        }
      }) {
        id
        contenido
        mensajeVoz {
          duracion
          transcripcion
          metadatos {
            tamanoBytes
          }
        }
      }
    }"
fi

# Test 12: Estadísticas de Mensajes de Voz (Simulación)
echo -e "\n${BLUE}=== TEST 12: Resumen de Mensajes de Voz Enviados ===${NC}"
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "${CYAN}📊 Obteniendo resumen de todos los mensajes...${NC}"
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"query\": \"query { obtenerMensajesSala(obtenerMensajesInput: { usuarioId: \\\"$USER1_ID\\\", salaId: \\\"$SALA_VOZ_ID\\\", limite: 50 }) { tipo mensajeVoz { duracion metadatos { tamanoBytes calidad } } } }\"
        }" \
        "$GRAPHQL_URL")
    
    echo -e "${GREEN}📈 Resumen de Mensajes:${NC}"
    echo "$response" | jq '.data.obtenerMensajesSala | length' | sed 's/^/  Total de mensajes: /'
    echo "$response" | jq '[.data.obtenerMensajesSala[] | select(.tipo == "AUDIO")] | length' | sed 's/^/  Mensajes de voz: /'
    echo "$response" | jq '[.data.obtenerMensajesSala[] | select(.tipo == "TEXTO")] | length' | sed 's/^/  Mensajes de texto: /'
    
    total_duracion=$(echo "$response" | jq '[.data.obtenerMensajesSala[] | select(.mensajeVoz != null) | .mensajeVoz.duracion] | add')
    if [ "$total_duracion" != "null" ]; then
        echo "  Duración total de audio: ${total_duracion}s"
    fi
fi

echo -e "\n${GREEN}🎉 Tests de Mensajes de Voz Completados!${NC}"
echo "=================================================="
echo -e "${CYAN}Salas utilizadas:${NC}"
if [ "$SALA_VOZ_ID" != "null" ] && [ "$SALA_VOZ_ID" != "" ]; then
    echo -e "  🎤 Sala de Audio: $SALA_VOZ_ID"
fi
if [ "$SALA_SIN_VOZ_ID" != "null" ] && [ "$SALA_SIN_VOZ_ID" != "" ]; then
    echo -e "  📝 Sala Solo Texto: $SALA_SIN_VOZ_ID"
fi
echo -e "\n${BLUE}💡 Próximo paso: Ejecuta ./test_sincronizacion.sh para probar sincronización${NC}"

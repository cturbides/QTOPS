# Sistema Event-Driven para Procesamiento de Inscripciones

## Descripción

Este sistema implementa una arquitectura dirigida por eventos completa para el procesamiento de inscripciones en una plataforma e-learning, incluyendo múltiples event handlers y compensating actions usando el patrón Saga.

## Arquitectura Implementada

### 🎯 Componentes Principales

#### 1. **Event Store**
- Persistencia inmutable de todos los eventos de dominio
- Capacidad de reconstruir estado histórico (Event Sourcing)
- Auditoría completa de todas las transacciones

#### 2. **Message Broker (RabbitMQ)**
- Entrega confiable de eventos entre servicios
- Dead Letter Queues para manejo de errores
- Reintentos automáticos con backoff exponencial

#### 3. **Domain Events**
- `UsuarioRegistradoEvent`
- `InscripcionSolicitadaEvent`
- `PagoRealizadoEvent`
- `CursoCompletadoEvent`
- `InscripcionConfirmadaEvent`
- `InscripcionRechazadaEvent`
- `PagoFallidoEvent`
- `InscripcionFallidaEvent`

#### 4. **Event Handlers & Saga Pattern**
- **InscripcionProcessorService**: Orquesta el proceso completo de inscripción
- **Compensating Actions**: Manejo automático de fallos y rollbacks
- **Saga Pattern**: Coordinación de transacciones distribuidas

### 🔄 Flujo de Procesamiento

#### Inscripción Exitosa:
1. **Usuario solicita inscripción** → `InscripcionSolicitadaEvent`
2. **Verificar usuario activo** → Validación de estado
3. **Verificar disponibilidad del curso** → Reserva de cupo
4. **Procesar pago** (si es requerido) → Validación de fondos + Procesamiento
5. **Confirmar inscripción** → `InscripcionConfirmadaEvent`
6. **Enviar email de confirmación** → Notificación al usuario

#### Compensating Actions (en caso de fallo):
- **Usuario inactivo** → `InscripcionRechazadaEvent`
- **Curso no disponible** → `InscripcionRechazadaEvent`
- **Fallo en pago** → `PagoFallidoEvent`
- **Error general** → `InscripcionFallidaEvent`

### 🚀 Uso del Sistema

#### Inicializar Docker Services
```bash
# Levantar RabbitMQ
npm run dev:consul
docker-compose up rabbitmq -d
```

#### Ejecutar Migraciones
```bash
npm run migration:run
```

#### Iniciar la Aplicación
```bash
npm run start:dev:curso-completo
```

### 📡 API Endpoints

#### 1. Solicitar Inscripción
```http
POST /eventos/inscripcion/solicitar
Content-Type: application/json

{
  "usuarioId": "user-123",
  "cursoId": "course-456",
  "fechaInicio": "2024-09-15",
  "requierePago": true,
  "monto": 150,
  "metodoPago": "tarjeta_credito"
}
```

#### 2. Registrar Usuario
```http
POST /eventos/usuario/registrar
Content-Type: application/json

{
  "usuarioId": "user-123",
  "email": "usuario@example.com",
  "tipoUsuario": "estudiante",
  "perfilCompleto": true
}
```

#### 3. Confirmar Pago
```http
POST /eventos/pago/confirmar
Content-Type: application/json

{
  "pagoId": "pay-789",
  "usuarioId": "user-123",
  "monto": 150,
  "metodoPago": "tarjeta_credito",
  "cursosAdquiridos": ["course-456"]
}
```

#### 4. Completar Curso
```http
POST /eventos/curso/completar
Content-Type: application/json

{
  "estudianteId": "user-123",
  "cursoId": "course-456",
  "calificacionFinal": 85,
  "certificadoGenerado": true
}
```

#### 5. Probar Flujo Completo
```http
GET /eventos/test/flujo-completo/{usuarioId}/{cursoId}
```

### 🔍 Monitoreo y Logs

El sistema proporciona logging detallado de:
- Publicación de eventos
- Procesamiento de eventos
- Pasos de la Saga
- Compensating actions
- Errores y reintentos

#### Ejemplo de logs durante inscripción:
```
Saga inscription-123: Ejecutando paso - Verificando usuario activo
Saga inscription-123: Ejecutando paso - Verificando disponibilidad del curso
Procesando pago de $150 para usuario user-123
Verificando fondos para usuario user-123 - monto: $150
Saga inscription-123: Ejecutando paso - Procesando pago
Saga inscription-123: Ejecutando paso - Confirmando inscripción
Saga inscription-123: Completada exitosamente
Evento publicado: InscripcionConfirmadaEvent - evt-456
```

### 🧪 Simulaciones del Sistema

#### Fallos Simulados:
- **10% de fallos en pagos** (tarjeta rechazada)
- **15% de cursos sin disponibilidad**
- **20% de usuarios sin fondos suficientes** (IDs terminados en 0 o 5)

#### Resilencia:
- **3 reintentos automáticos** con backoff exponencial
- **Dead Letter Queue** para eventos no procesables
- **Event Store** para recuperación completa

### 🏗️ Arquitectura de Archivos

```
apps/shared-modules/events/
├── controllers/
│   └── eventos.controller.ts
├── domain-events/
│   ├── usuario-registrado.event.ts
│   ├── inscripcion-solicitada.event.ts
│   ├── pago-realizado.event.ts
│   ├── curso-completado.event.ts
│   ├── inscripcion-confirmada.event.ts
│   ├── inscripcion-rechazada.event.ts
│   ├── pago-fallido.event.ts
│   └── inscripcion-fallida.event.ts
├── entities/
│   └── event-store-entry.entity.ts
├── enums/
│   ├── tipo-usuario.enum.ts
│   ├── estado-inscripcion.enum.ts
│   └── estado-pago.enum.ts
├── interfaces/
│   ├── message-broker.interface.ts
│   ├── consumer-config.interface.ts
│   ├── payment-result.interface.ts
│   ├── payment-request.interface.ts
│   └── email-confirmacion-inscripcion.interface.ts
├── services/
│   ├── domain-event-publisher.service.ts
│   ├── domain-event-subscriber.service.ts
│   ├── event-store.service.ts
│   ├── rabbitmq-event-broker.service.ts
│   ├── inscripcion-processor.service.ts
│   ├── payment.service.ts
│   ├── course.service.ts
│   ├── user.service.ts
│   ├── email.service.ts
│   └── event-system-initializer.service.ts
├── sagas/
│   └── inscripcion.saga.ts
├── exceptions/
│   ├── event-publication.exception.ts
│   └── message-delivery.exception.ts
├── wrappers/
│   └── message.wrapper.ts
├── dtos/
│   └── publish-event.dto.ts
├── events.module.ts
└── index.ts
```

### 🎖️ Características Avanzadas

#### Event Sourcing:
- **Reconstrucción de estado** desde eventos históricos
- **Time travel** para debugging y auditoría
- **Proyecciones** para optimizar consultas

#### CQRS (Command Query Responsibility Segregation):
- **Separación** de comandos y consultas
- **Optimización independiente** de escritura y lectura
- **Escalabilidad** diferenciada por tipo de operación

#### Saga Pattern:
- **Orquestación** de transacciones distribuidas
- **Compensating actions** automáticas
- **Estado de saga** observable y auditable

#### Message Broker Robusto:
- **Garantías de entrega** (at-least-once)
- **Manejo de errores** con DLQ
- **Routing inteligente** por dominio y tipo de evento

Este sistema proporciona una base sólida para arquitecturas event-driven escalables y resilientes, implementando las mejores prácticas de la industria para sistemas distribuidos.

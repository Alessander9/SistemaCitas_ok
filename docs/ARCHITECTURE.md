# 🏛️ Arquitectura del Sistema — CitasSistema

> **Documento de Especificación Arquitectónica y Diseño Técnico**  
> _Versión 1.1 — Monolito Modular, Multi-Tenant y Event-Driven con Metodología RUP y Modelado UML (Modelo 4+1 Vistas)_

---

## 📑 Tabla de Contenidos

- [1. Visión General y Filosofía de Diseño](#1-visión-general-y-filosofía-de-diseño)
- [2. Metodología RUP y Modelo de Vistas 4+1 UML](#2-metodología-rup-y-modelo-de-vistas-41-uml)
  - [2.1 Vista de Casos de Uso (Use Case View)](#21-vista-de-casos-de-uso-use-case-view)
  - [2.2 Vista Lógica (Logical View - Diagrama de Clases UML)](#22-vista-lógica-logical-view---diagrama-de-clases-uml)
  - [2.3 Vista de Procesos (Process View - Diagrama de Secuencia UML)](#23-vista-de-procesos-process-view---diagrama-de-secuencia-uml)
  - [2.4 Vista Dinámica (Statechart - Diagrama de Estados FSM)](#24-vista-dinámica-statechart---diagrama-de-estados-fsm)
  - [2.5 Vista de Implementación y Despliegue (Deployment & Component View)](#25-vista-de-implementación-y-despliegue-deployment--component-view)
  - [2.6 Fases y Disciplinas del Proceso RUP](#26-fases-y-disciplinas-del-proceso-rup)
- [3. Estructura del Monorepo](#3-estructura-del-monorepo)
- [4. Capa Frontend (Client-Side SPA)](#4-capa-frontend-client-side-spa)
- [5. Capa Backend (Core API & Clean Architecture)](#5-capa-backend-core-api--clean-architecture)
- [6. Modelo de Datos y Persistencia Relacional](#6-modelo-de-datos-y-persistencia-relacional)
- [7. Máquinas de Estado Finitas (FSM) y Concurrencia](#7-máquinas-de-estado-finitas-fsm-y-concurrencia)
- [8. Seguridad y Multi-Tenancy (Anti-IDOR)](#8-seguridad-y-multi-tenancy-anti-idor)
- [9. Integración de Inteligencia Artificial (Chanfainita Voice Engine)](#9-integración-de-inteligencia-artificial-chanfainita-voice-engine)
- [10. Decisiones Arquitectónicas Registradas (ADRs)](#10-decisiones-arquitectónicas-registradas-adrs)

---

## 1. Visión General y Filosofía de Diseño

**CitasSistema** está diseñado como un **Monolito Modular de Alto Rendimiento** que combina la simplicidad de despliegue y desarrollo de un monorepo con el desacoplamiento lógico propio de arquitecturas orientadas al dominio (DDD) y sistemas guiados por eventos (Event-Driven Architecture).

### Principios Fundamentales

1. **Multi-Tenancy Nativo por Registro:** Cada tabla operativa cuenta con `clinic_id`, gobernada por el `TenantGuard` y validaciones estrictas de titularidad de datos (`assertPatientOwnership`).
2. **Cero Sobrereservas (Zero Double-Booking):** El motor transaccional de citas utiliza bloqueos consultivos a nivel de base de datos (`pg_advisory_xact_lock`) sobre el profesional y la fecha/bloque horario.
3. **Seguridad Anti-XSS (Gold Standard):** El `access_token` JWT reside exclusivamente en la memoria volátil de React (`AuthContext`), mientras que el `refresh_token` se transporta en una Cookie HTTP `HttpOnly; Secure; SameSite=Lax`.
4. **Desacoplamiento Asíncrono de Efectos Secundarios:** Los eventos de confirmación, cancelación o reasignación disparan notificaciones (email Resend/Brevo, Telegram) mediante `@nestjs/event-emitter` fuera del ciclo transaccional HTTP.
5. **Fail-Fast Environment:** Todas las variables de configuración se validan al inicio mediante esquemas estrictos de `Zod`, abortando el arranque si falta alguna credencial crítica o formato inválido.

---

## 2. Metodología RUP y Modelo de Vistas 4+1 UML

El modelado y documentación arquitectónica sigue las mejores prácticas de la metodología **RUP (Rational Unified Process)**, organizándose mediante el **Modelo de Vistas 4+1 de Philippe Kruchten**, donde los Casos de Uso actúan como elemento integrador de las cuatro vistas técnicas (Lógica, Procesos, Implementación y Despliegue):

```text
       ┌────────────────────────┐
       │  Vista de Casos de Uso │ (Comportamiento y Negocio)
       └───────────┬────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───┴──────────┐   │   ┌──────────┴───┐
│ Vista Lógica │   │   │  Vista de    │
│ (Clases UML) │   │   │  Procesos    │
└──────────────┘   │   │  (Secuencia) │
                   │   └──────────────┘
    ┌──────────────┼──────────────┐
    │              │              │
┌───┴──────────┐   │   ┌──────────┴───┐
│ Vista de     │   │   │  Vista de    │
│ Componentes  │   │   │  Despliegue  │
└──────────────┘   │   └──────────────┘
                   │
       ┌───────────┴────────────┐
       │ Fases RUP e Iteración  │
       └────────────────────────┘
```

### 2.1 Vista de Casos de Uso (Use Case View)

Identifica a los actores que interactúan con el sistema y sus respectivos casos de uso esenciales:

```mermaid
flowchart LR
    subgraph ACTORS ["👥 Actores del Sistema"]
        PAC["👤 Paciente"]
        REC["📋 Recepción / Admisión"]
        MED["👨‍⚕️ Médico / Fisioterapeuta"]
        ADM["🏢 Director / Admin Clínica"]
        SADM["👑 Super Administrador"]
    end

    subgraph SYSTEM ["🏥 Límites del Sistema CitasSistema (Casos de Uso)"]
        UC01(["UC-01: Reservar Cita en Línea (6 Pasos)"])
        UC02(["UC-02: Validar DNI en RENIEC / Decolecta"])
        UC03(["UC-03: Triaje y Check-in Kanban"])
        UC04(["UC-04: Cobro en Ventanilla y Arqueo POS"])
        UC05(["UC-05: Consulta HCE y Escala EVA"])
        UC06(["UC-06: Mapeo Anatómico del Dolor 2D/3D"])
        UC07(["UC-07: Dictado de Voz 'Chanfainita'"])
        UC08(["UC-08: Emisión de Receta y Descuento Kardex"])
        UC09(["UC-09: Configurar Sede, Horarios y Marca"])
        UC10(["UC-10: Gobernanza Multi-Tenant y Métricas"])
    end

    PAC --> UC01
    UC01 -.->|«include»| UC02
    REC --> UC03
    REC --> UC04
    MED --> UC05
    MED --> UC06
    MED --> UC07
    MED --> UC08
    ADM --> UC09
    ADM --> UC04
    SADM --> UC10
```

---

### 2.2 Vista Lógica (Logical View - Diagrama de Clases UML)

Describe la estructura estática del modelo de dominio clínico, finanzas y control de inventario:

```mermaid
classDiagram
    direction TB
    class Clinic {
        +UUID id
        +string name
        +string slug
        +jsonb branding
        +boolean isActive
        +create()
        +updateBranding()
    }
    class User {
        +UUID id
        +UUID clinicId
        +string email
        +string role
        +boolean isActive
        +authenticate()
    }
    class Patient {
        +UUID id
        +UUID clinicId
        +string dni
        +string fullName
        +string phone
        +string email
    }
    class Appointment {
        +UUID id
        +UUID clinicId
        +UUID patientId
        +UUID professionalId
        +date appointmentDate
        +time startTime
        +AppointmentStatus status
        +transitionTo()
    }
    class ClinicalRecord {
        +UUID id
        +UUID clinicId
        +UUID appointmentId
        +UUID patientId
        +string anamnesis
        +int painScaleEva
        +string diagnosisCie10
        +saveHce()
    }
    class PainMapPoint {
        +UUID id
        +UUID clinicalRecordId
        +string anatomicalRegion
        +string laterality
        +float coordX
        +float coordY
        +float coordZ
    }
    class CashSession {
        +UUID id
        +UUID clinicId
        +UUID openedBy
        +decimal initialBalance
        +decimal finalBalance
        +CashStatus status
        +openSession()
        +closeSession()
    }
    class InventoryProduct {
        +UUID id
        +UUID clinicId
        +string name
        +int currentStock
        +int minStock
        +deductStock()
    }

    Clinic "1" *-- "*" User : contiene
    Clinic "1" *-- "*" Patient : registra
    Clinic "1" *-- "*" CashSession : gestiona
    Clinic "1" *-- "*" InventoryProduct : almacena
    Patient "1" --> "*" Appointment : agenda
    User "1" --> "*" Appointment : atiende como profesional
    Appointment "1" --> "0..1" ClinicalRecord : genera
    ClinicalRecord "1" *-- "*" PainMapPoint : mapea puntos
    ClinicalRecord "1" --> "*" InventoryProduct : descuenta insumos
```

---

### 2.3 Vista de Procesos (Process View - Diagrama de Secuencia UML)

Ilustra la dinámica de ejecución concurrente durante la reserva atómica con bloqueo consultivo en PostgreSQL:

```mermaid
sequenceDiagram
    autonumber
    actor Paciente as 👤 Paciente / Cliente Web
    participant Gateway as 🛡️ Gateway / Auth & Tenant
    participant ApptService as 📅 AppointmentsService
    participant DB as 🐘 PostgreSQL (DatabaseService)
    participant EventBus as 📢 EventEmitter2
    participant NotifListener as ✉️ NotificationListener

    Paciente->>Gateway: POST /api/appointments/public (datos reserva)
    Gateway->>Gateway: Zod / ValidationPipe + Turnstile check
    Gateway->>ApptService: createPublicAppointment(dto)
    ApptService->>DB: BEGIN TRANSACTION
    ApptService->>DB: SELECT pg_advisory_xact_lock(hash(professional_id, date))
    Note over ApptService,DB: Bloqueo transaccional atómico contra colisiones
    ApptService->>DB: SELECT * FROM appointments WHERE prof_id & time (Check colisión)
    alt Horario ya ocupado
        ApptService-->>Gateway: ConflictException ("Horario no disponible")
        Gateway-->>Paciente: HTTP 409 Conflict
    else Horario libre disponible
        ApptService->>DB: INSERT INTO appointments (...) RETURNING id
        ApptService->>DB: INSERT INTO appointment_status_history (...)
        ApptService->>DB: COMMIT TRANSACTION
        ApptService->>EventBus: emit('appointment.created', eventPayload)
        ApptService-->>Gateway: Cita Creada (AppointmentDto)
        Gateway-->>Paciente: HTTP 201 Created (Comprobante Digital)
        par Notificación Asíncrona Desacoplada
            EventBus->>NotifListener: handleAppointmentCreated(eventPayload)
            NotifListener->>NotifListener: Renderizar plantilla Resend & Telegram
            NotifListener-->>Paciente: Envío de Email de Confirmación
        end
    end
```

---

### 2.4 Vista Dinámica (Statechart - Diagrama de Estados FSM)

Modela los estados de vida de una cita y las transiciones válidas:

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Reserva con pasarela de pago
    [*] --> CONFIRMED : Reserva presencial o confirmada

    PENDING_PAYMENT --> CONFIRMED : Pago procesado / Aprobado
    PENDING_PAYMENT --> CANCELLED : Expiración de tiempo / Rechazo

    CONFIRMED --> IN_PROGRESS : Check-in del paciente e inicio de atención
    CONFIRMED --> RESCHEDULED : Solicitud de cambio de horario
    CONFIRMED --> NO_SHOW : Paciente inasistente
    CONFIRMED --> CANCELLED : Cancelación voluntaria

    RESCHEDULED --> CONFIRMED : Nuevo horario reasignado
    RESCHEDULED --> CANCELLED : Cancelación definitiva

    IN_PROGRESS --> COMPLETED : Cierre de consulta médica y guardado de HCE
    IN_PROGRESS --> CANCELLED : Interrupción por fuerza mayor

    COMPLETED --> [*]
    NO_SHOW --> [*]
    CANCELLED --> [*]
```

---

### 2.5 Vista de Implementación y Despliegue (Deployment & Component View)

Mapea la distribución física en contenedores y servicios en la nube:

```mermaid
flowchart TB
    subgraph CLIENT_TIER ["«device» Dispositivo de Usuario"]
        BROWSER["«execution environment» Navegador Web
        📦 SPA React 19 + Vite 6
        📦 Three.js 3D Canvas
        📦 Web Audio API (Micrófono)"]
    end

    subgraph CLOUD_GATEWAY ["«node» Frontera de Red & Seguridad"]
        CF["«proxy» Cloudflare Turnstile & CDN"]
    end

    subgraph APP_SERVER ["«device» Servidor de Aplicaciones (Linux Container)"]
        subgraph RUNTIME ["«execution environment» Node.js 20+ Runtime"]
            NEST["«subsystem» Backend NestJS 11
            📦 REST API Gateway (/api)
            📦 Throttler Rate Limiting
            📦 Clean Architecture Modules
            📦 EventEmitter2 Bus"]
        end
    end

    subgraph DATA_SERVER ["«device» Servidor de Persistencia"]
        subgraph PG_NODE ["«database system» PostgreSQL 16+ Engine"]
            PG_SERVICE["🐘 DatabaseService (pg.Pool)
            🗄️ Relational Schema (17 Migraciones)
            🔒 Advisory Locks Engine (pg_advisory_xact_lock)
            ⚡ B-Tree Performance Indexes"]
        end
    end

    subgraph THIRD_PARTY ["«cloud system» Proveedores de Servicios Externos"]
        RESEND_API["✉️ Resend / Brevo (Email SMTP)"]
        TG_API["📱 Telegram Bot API"]
        GROQ_API["🧠 Groq LPU (GPT-OSS-120B)"]
        GEMINI_API["🧠 Google Gemini 3.8 Flash"]
        RENIEC_API["🆔 Decolecta / RENIEC API"]
    end

    BROWSER -- "HTTPS / TLS 1.3 (JSON & Audio)" --> CF
    CF -- "Reverse Proxy" --> NEST
    NEST -- "TCP / Socket 5432 (pg.Pool Connection)" --> PG_SERVICE
    NEST -- "HTTPS REST API (Async Events)" --> RESEND_API
    NEST -- "HTTPS REST API (Alerts)" --> TG_API
    NEST -- "HTTPS REST API (Inferencia <500ms)" --> GROQ_API
    NEST -- "HTTPS REST API (JSON Schema)" --> GEMINI_API
    NEST -- "HTTPS REST API (Token Auth)" --> RENIEC_API
```

---

### 2.6 Fases y Disciplinas del Proceso RUP

| Fase RUP                           | Objetivo Primario                                                                                                                                 | Entregables y Artefactos Producidos                                                                      | Hito RUP Alcanzado                                   |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| **1. Inicio (Inception)**          | Definición del alcance del SaaS, viabilidad técnica, captura de requerimientos de clínicas y arquitectura monolítica modular.                     | Casos de uso base, modelo de dominio conceptual, prototipo de asistente de voz.                          | **LCO** (_Lifecycle Objectives Milestone_)           |
| **2. Elaboración (Elaboration)**   | Mitigación de riesgos críticos de concurrencia y seguridad: Advisory Locks en PostgreSQL, autenticación anti-XSS y validación Fail-Fast Zod.      | Arquitectura ejecutable 4+1, paquete `@citassistema/shared-types`, esquemas DDL (001-008).               | **LCA** (_Lifecycle Architecture Milestone_)         |
| **3. Construcción (Construction)** | Desarrollo iterativo de los 16 módulos de dominio NestJS, visor Three.js 3D, FSM de caja y citas, e inferencia LLM en cascada.                    | 17 migraciones completas, 409 pruebas automáticas aprobadas, integración con Telegram/Resend.            | **IOC** (_Initial Operational Capability Milestone_) |
| **4. Transición (Transition)**     | Auditorías de seguridad de secretos, optimización de bundles Vite (`< 500 kB`), smoke tests en navegador real con Puppeteer y empaquetado Docker. | Versión `0.1.0-alpha` lista para producción, suite E2E superada al 100%, documentación técnica completa. | **PR** (_Product Release Milestone_)                 |

---

## 3. Estructura del Monorepo

El proyecto está orquestado mediante npm workspaces:

```text
SistemaCitas_ok/
├── apps/
│   ├── backend/                      # API REST construida con NestJS 11 y TypeScript 5.7
│   │   ├── src/
│   │   │   ├── common/               # Guards, interceptores, filtros y utilidades de seguridad
│   │   │   ├── config/               # Configuración centralizada y esquema Zod de entorno
│   │   │   ├── database/             # Servicio pg.Pool, runner de migraciones y semillas
│   │   │   └── modules/              # 16 módulos de dominio con responsabilidades aisladas
│   │   └── test/                     # Suites de tests Jest (unitarios) y E2E (PostgreSQL real)
│   └── frontend/                     # SPA en React 19, Vite 6 y Tailwind CSS 4
│       ├── src/
│       │   ├── components/           # Componentes UI reutilizables (Kanban, PainMap, Modales)
│       │   ├── context/              # Contextos globales (AuthContext en memoria, Theme, Tenant)
│       │   ├── pages/                # Vistas principales y dashboards específicos por rol
│       │   ├── services/             # Adaptadores HTTP hacia el backend
│       │   └── utils/                # Utilidades de almacenamiento seguro, helpers de audio y fecha
│       └── vite.config.ts            # Optimización de chunks y proxy reverso local
├── packages/
│   └── shared-types/                 # Contratos TypeScript comunes, enums de FSM y parseadores
├── db/
│   ├── docker/docker-compose.yml     # Orquestación de contenedores PostgreSQL (dev y test)
│   ├── migrations/                   # 17 archivos SQL DDL versionados secuencialmente
│   └── seeds/                        # Scripts SQL con catálogos médicos y datos de demostración
└── docs/                             # Documentación de diseño, reglas de negocio y ADRs
```

---

## 4. Capa Frontend (Client-Side SPA)

- **Framework:** React 19 con renderizado en el cliente mediante Vite 6.
- **Estilos:** Tailwind CSS 4 con sistema de tokens de diseño dinámicos para soporte de marca blanca (white-labeling).
- **Gestión de Estado y Sesión:**
  - `AuthContext`: Conserva el `accessToken`, datos del usuario autenticado y permisos en memoria de ejecución.
  - Implementación de **Silent Refresh**: Al cargar la página (`F5`), un `useEffect` invoca `/api/auth/refresh-token` enviando automáticamente la cookie segura. Si es válida, el estado se hidrata sin requerir credenciales en almacenamiento local (`localStorage`).
- **Visualización 3D:** Integración con `Three.js` cargada de forma dinámica para renderizar el modelo corporal del mapa del dolor (PainMap 3D), optimizando el tiempo de carga inicial.
- **División de Código (Code Splitting):** Configuración en Vite con `manualChunks` que separa dependencias pesadas (`three`, `lucide-react`, `vendor`) manteniendo el bundle principal bajo 500 kB.

---

## 5. Capa Backend (Core API & Clean Architecture)

El backend expone una API REST modular construida sobre NestJS 11:

1. **ValidationPipe Global:** Transforma payloads y aplica validación estricta descartando propiedades no reconocidas (`whitelist: true`).
2. **HttpExceptionFilter Global:** Captura cualquier excepción de la aplicación. En caso de colisiones de base de datos (PostgreSQL `23505` clave única o `23503` llave foránea), sanitiza el mensaje para no filtrar información estructural del esquema relacional.
3. **ThrottlerGuard:** Limita ráfagas de solicitudes en endpoints públicos sensibles (login, consulta por DNI, reserva pública).
4. **Módulos de Dominio:**
   - `AuthModule`: Generación y rotación de tokens JWT (Access de 15m / Refresh de 7d con almacenamiento de hash en base de datos).
   - `AppointmentsModule`: Motor de disponibilidad horaria y transición de estados con FSM.
   - `ClinicalModule`: Historias clínicas, recetas, puntos de mapa de dolor anatómico y sesiones de tratamiento.
   - `ClinicalVoiceAssistantService`: Asistente bilateral con cascada de inferencia y guardrails de seguridad clínica.
   - `CashModule` e `InventoryModule`: Control de arqueo de caja chica y Kardex de inventario.

---

## 6. Modelo de Datos y Persistencia Relacional

El almacenamiento persiste en **PostgreSQL 16+** administrado a través de `DatabaseService` utilizando un pool nativo (`pg.Pool`) optimizado para transacciones concurrentes ACID:

```mermaid
erDiagram
    CLINICS ||--o{ USERS : "posee"
    CLINICS ||--o{ PATIENTS : "registra"
    CLINICS ||--o{ SERVICES : "ofrece"
    CLINICS ||--o{ CASH_SESSIONS : "opera"
    CLINICS ||--o{ INVENTORY_PRODUCTS : "almacena"

    USERS ||--o{ APPOINTMENTS : "atiende como profesional"
    USERS }|--|| ROLES : "asigna"

    PATIENTS ||--o{ APPOINTMENTS : "reserva"
    PATIENTS ||--o{ CLINICAL_RECORDS : "posee historial"

    APPOINTMENTS ||--o{ APPOINTMENT_STATUS_HISTORY : "registra cambios"
    APPOINTMENTS ||--o| CLINICAL_RECORDS : "asocia atencion"

    CLINICAL_RECORDS ||--o{ PAIN_MAP_POINTS : "incluye mapa dolor"
    CLINICAL_RECORDS ||--o{ PRESCRIPTIONS : "emite recetas"
    CLINICAL_RECORDS ||--o{ TREATMENTS : "planes fisioterapia"

    CASH_SESSIONS ||--o{ CASH_TRANSACTIONS : "contiene cobros"
    INVENTORY_PRODUCTS ||--o{ INVENTORY_MOVEMENTS : "registra kardex"
```

---

## 7. Máquinas de Estado Finitas (FSM) y Concurrencia

### Ciclo de Vida de las Citas (`AppointmentStatus`)

El cambio de estado de una cita está restringido por la función de transición estricta `canTransitionAppointment`:

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Reserva con pago pendiente
    [*] --> CONFIRMED : Reserva confirmada o pago presencial

    PENDING_PAYMENT --> CONFIRMED : Pago validado (Webhook/Efectivo)
    PENDING_PAYMENT --> CANCELLED : Timeout / Anulación

    CONFIRMED --> IN_PROGRESS : Paciente ingresa a consulta
    CONFIRMED --> RESCHEDULED : Reasignación de fecha/hora
    CONFIRMED --> NO_SHOW : Paciente no se presenta
    CONFIRMED --> CANCELLED : Cancelación anticipada

    RESCHEDULED --> CONFIRMED : Nueva fecha fijada
    RESCHEDULED --> CANCELLED : Anulación

    IN_PROGRESS --> COMPLETED : Consulta finalizada y HCE guardada
    IN_PROGRESS --> CANCELLED : Interrupción de urgencia

    COMPLETED --> [*]
    NO_SHOW --> [*]
    CANCELLED --> [*]
```

### Prevención Atómica de Sobrereservas

Durante el proceso de reserva, el sistema adquiere un bloqueo consultivo transaccional en PostgreSQL:

```sql
SELECT pg_advisory_xact_lock(hashtext(concat('appt_', professional_id::text, '_', appointment_date::text)));
```

Este bloqueo garantiza que dos solicitudes simultáneas para el mismo profesional y bloque horario se procesen secuencialmente, abortando la segunda transacción si el intervalo ya fue ocupado.

---

## 8. Seguridad y Multi-Tenancy (Anti-IDOR)

1. **Aislamiento de Inquilinos (`TenantGuard`):**  
   Cada solicitud autenticada extrae el contexto del `clinic_id` desde el token o encabezado autorizado. Las consultas SQL parametrizadas inyectan obligatoriamente la cláusula `WHERE clinic_id = $1`.
2. **Defensa Anti-IDOR (`assertPatientOwnership`):**  
   Antes de permitir la lectura o modificación de una historia clínica o cita, el backend ejecuta una verificación cruzada para validar que el paciente pertenezca a la clínica del operador o que el usuario solicitante sea el propio paciente autenticado.
3. **Rotación de Refresh Tokens:**  
   Los tokens de actualización se almacenan con cifrado hash seguro en base de datos (`auth_refresh_tokens`). Si un token ya revocado intenta ser reutilizado, la sesión se invalida por completo como medida preventiva.

---

## 9. Integración de Inteligencia Artificial (Chanfainita Voice Engine)

El módulo clínico cuenta con un motor de asistencia de voz para profesionales de la salud con una estrategia de cascada tolerante a fallos:

```mermaid
flowchart TD
    TRANSCRIPT["🎙️ Transcripción de Voz / Dictado Clínico"]
    GUARDRAIL{"🛡️ Guardrail de Contención Médica\n¿Intenta auto-diagnóstico no supervisado?"}

    TRANSCRIPT --> GUARDRAIL
    GUARDRAIL -- "Sí (Consulta no permitida)" --> REJECT["⛔ Bloqueo Normativo con Explicación Segura"]
    GUARDRAIL -- "No (Dictado de Consulta Válido)" --> LPU{"1. Groq LPU\n(openai/gpt-oss-120b)"}

    LPU -- "Éxito (<500ms)" --> CIE10["📚 Codificación Silenciosa CIE-10"]
    LPU -- "Falla / Timeout" --> GEMINI{"2. Google Gemini 3.8 Flash"}

    GEMINI -- "Éxito" --> CIE10
    GEMINI -- "Falla / Sin Cuota" --> OPENROUTER{"3. OpenRouter AI"}

    OPENROUTER -- "Éxito" --> CIE10
    OPENROUTER -- "Falla / Sin Red" --> LOCAL["4. Chanfainita Local Regex Engine"]

    LOCAL --> CIE10
    CIE10 --> OUTPUT["📋 Autocompletado de HCE + Resumen WhatsApp"]
```

---

## 10. Decisiones Arquitectónicas Registradas (ADRs)

Para conocer en detalle el contexto, alternativas evaluadas y consecuencias de las decisiones tomadas durante el desarrollo:

- [ADR 001: Decisiones de Arquitectura y Seguridad](./adr/001-architecture-and-security-decisions.md) — Adopción de tokens en memoria volátil, cookies HttpOnly y Advisory Locks para citas.
- [ADR 002: Dominio Tipado y Validación Fail-Fast](./adr/002-typed-domain-and-fail-fast-env.md) — Definición de esquemas Zod en backend y paquete de tipos compartidos `@citassistema/shared-types`.

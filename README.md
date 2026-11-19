<p align="center">
  <img src="https://img.shields.io/badge/PLATAFORMA_MÉDICA-CITASSISTEMA-0ea5e9?style=for-the-badge&logo=medlineplus&logoColor=white" alt="CitasSistema Banner" />
</p>

<h1 align="center">🏥 CitasSistema — Documentación Global</h1>

<p align="center">
  <strong>Plataforma SaaS multi-tenant para gestión de citas médicas, historia clínica electrónica (HCE), operación de recepción, pagos idempotentes, caja chica, inventario Kardex y automatizaciones omnicanal con IA.</strong>
</p>

<p align="center">
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Tests-295%2F295%20Passing-10b981?style=flat-square&logo=vitest&logoColor=white" alt="Tests Passing" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Backend-NestJS%2011%20%2B%20TS%205.7-e0234e?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 11" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%206%20%2B%20Tailwind%204-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Database-PostgreSQL%2016+-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16+" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Architecture-Multi--Tenant%20%7C%20Modular%20Monolith-8b5cf6?style=flat-square" alt="Architecture" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Node-%3E%3D20.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node 20+" /></a>
</p>

---

## 📑 Tabla de Contenidos

- [1. 🌟 Visión General](#1--visión-general)
- [2. 🏛️ Arquitectura del Sistema y Monorepo](#2-️-arquitectura-del-sistema-y-monorepo)
- [3. ✨ Módulos y Funcionalidades Principales](#3--módulos-y-funcionalidades-principales)
  - [3.1 Web Pública y Asistente de Reserva (6 Pasos)](#31-web-pública-y-asistente-de-reserva-6-pasos)
  - [3.2 Motor de Disponibilidad y Prevención de Doble Reserva](#32-motor-de-disponibilidad-y-prevención-de-doble-reserva)
  - [3.3 Consulta Médica, HCE, Mapa Corporal y Voz IA](#33-consulta-médica-hce-mapa-corporal-y-voz-ia)
  - [3.4 Pagos Idempotentes, Caja Chica (POS) e Inventario Kardex](#34-pagos-idempotentes-caja-chica-pos-e-inventario-kardex)
  - [3.5 Comunicaciones Omnicanal y Asistente IA](#35-comunicaciones-omnicanal-y-asistente-ia)
  - [3.6 Dashboards por Rol (RBAC) y Experiencia Móvil](#36-dashboards-por-rol-rbac-y-experiencia-móvil)
- [4. 🔌 Referencia de API REST (`/api`)](#4--referencia-de-api-rest-api)
- [5. 🛠️ Stack Tecnológico](#5-️-stack-tecnológico)
- [6. 🗄️ Base de Datos, Migraciones y Datos Demo](#6-️-base-de-datos-migraciones-y-datos-demo)
- [7. 🚀 Instalación y Puesta en Marcha](#7--instalación-y-puesta-en-marcha)
- [8. 🧪 Pruebas, Linting y Scripts del Monorepo](#8--pruebas-linting-y-scripts-del-monorepo)
- [9. 🔐 Seguridad, Multi-Tenancy y Cumplimiento](#9--seguridad-multi-tenancy-y-cumplimiento)
- [10. 📚 Mapa de Documentación del Proyecto](#10--mapa-de-documentación-del-proyecto)

---

## 1. 🌟 Visión General

**CitasSistema** es una plataforma clínica integral diseñada para clínicas multidisciplinarias, centros de fisioterapia, rehabilitación física y consultorios médicos. Cubre el ciclo completo del paciente y la operación interna de la clínica desde una sola arquitectura unificada:

```text
Captación Web ➔ Reserva Online ➔ Pago Idempotente ➔ Recepción / Triaje ➔ Consulta Clínica (HCE / EVA / Receta) ➔ Caja & Kardex ➔ Seguimiento Omnicanal
```

### Pilares Arquitectónicos
1. **Aislamiento Multi-Tenant Estricto**: Cada registro operativo pertenece a un `clinic_id`. El backend valida la identidad del inquilino contra el token JWT y la cabecera `X-Clinic-ID` sin confiar en filtros del cliente.
2. **Cero Dobles Reservas (Zero Double-Booking)**: Serialización transaccional atómica mediante `pg_advisory_xact_lock` en PostgreSQL por profesional y fecha.
3. **Contratos Tipados Compartidos**: Paquete interno `@citassistema/shared-types` compartido entre NestJS y React para garantizar coherencia en DTOs, enums, máquinas de estado y permisos RBAC.
4. **Rendimiento y Experiencia Móvil**: Carga diferida (`React.lazy` + `Suspense`) de dashboards y vistas clínicas, pool configurable en PostgreSQL (`DB_POOL_MAX`), navegación móvil inferior, modo oscuro y escalado de accesibilidad.

---

## 2. 🏛️ Arquitectura del Sistema y Monorepo

El sistema implementa un **Monolito Modular con Clean Architecture pragmática** en el backend (`apps/backend`) y una **SPA modular en React 19** (`apps/frontend`), sincronizados mediante `@citassistema/shared-types` (`packages/shared-types`).

```mermaid
flowchart TB
    subgraph CLIENTS ["🖥️ Clientes y Canales de Entrada"]
        WEB_PUB["🌐 Landing Pública y Booking Wizard (6 pasos)"]
        PORTAL_PAC["👤 Portal y Dashboard del Paciente"]
        PORTAL_MED["👨‍⚕️ Dashboard Médico, HCE, BodyMap y Voz IA"]
        PORTAL_REC["📋 Dashboard de Recepción (Kanban, Triaje y Ventanilla)"]
        PORTAL_ADM["📊 Super Admin y Admin de Clínica"]
        BOT_TG["📱 Bot de Telegram"]
        WHATSAPP["💬 Recordatorios WhatsApp"]
    end

    subgraph GATEWAY ["🛡️ Capa HTTP, Seguridad y Contexto (NestJS /api)"]
        TENANT_MW["🏢 TenantMiddleware (X-Clinic-ID)"]
        VAL_PIPE["✅ Global ValidationPipe (whitelist + transform)"]
        AUTH_GUARD["🔑 JwtAuthGuard (Access 15m / Refresh 7d)"]
        TENANT_GUARD["🔒 TenantGuard (Aislamiento estricto por clínica)"]
        RBAC_GUARD["🛡️ RolesGuard & PermissionsGuard"]
    end

    subgraph MODULES ["📦 Módulos de Dominio (15 Módulos NestJS)"]
        CORE_MOD["🔐 Auth · 🩺 Health"]
        CAT_MOD["🏥 Specialties · Services · Professionals · Schedules"]
        APPT_MOD["📅 Appointments (Availability + pg_advisory_xact_lock)"]
        CLIN_MOD["📋 Patients · Clinical (HCE, EVA, Treatments, Prescriptions)"]
        FIN_MOD["💳 Payments (Strategy + HMAC) · 💵 Cash · 📦 Inventory Kardex"]
        AUTO_MOD["✉️ Emails · 🤖 Telegram · 🧠 AI Assistant"]
    end

    subgraph STORAGE ["🗄️ Persistencia"]
        POOL["⚡ DatabaseService (pg.Pool + Transacciones ACID)"]
        PG_DB[("🐘 PostgreSQL 16+\n13 Migraciones DDL + 2 Seeds")]
    end

    CLIENTS --> GATEWAY
    GATEWAY --> MODULES
    MODULES --> POOL
    POOL --> PG_DB
```

### Estructura del Monorepo

```text
SistemaCitas_ok/
├── apps/
│   ├── backend/                      # API REST NestJS 11 + TypeScript (prefijo /api)
│   │   ├── src/
│   │   │   ├── common/               # Decorators, Guards (JWT, Tenant, Roles, Permissions), Middleware, Security Audit
│   │   │   ├── database/             # DatabaseService (pg.Pool), migrate.ts, seed.ts, reset.ts
│   │   │   └── modules/              # 15 módulos de negocio + suite global-regression.spec.ts
│   │   └── package.json
│   └── frontend/                     # SPA React 19 + Vite 6 + Tailwind CSS 4
│       ├── src/
│       │   ├── components/           # ai/, booking/, clinical/, common/, layout/, public/, reception/, ui/
│       │   ├── context/              # ThemeContext (Light / Dark mode)
│       │   ├── data/                 # Datasets demo y fallback de disponibilidad
│       │   ├── pages/                # public/, login/, dashboards/, clinical/, admin/, patient/
│       │   ├── services/             # Cliente HTTP (/api) con fallback controlado
│       │   ├── styles/               # Tokens de diseño y dark-theme.css
│       │   └── utils/                # Utilidades de sonido y helpers UI
│       └── package.json
├── packages/
│   └── shared-types/                 # @citassistema/shared-types (enums, interfaces y transiciones)
├── db/
│   ├── docker/docker-compose.yml     # Contenedores PostgreSQL 16 (desarrollo :5432 y test :5433)
│   ├── factories/                    # Factories para pruebas
│   ├── migrations/                   # 001 a 013 (DDL completo + índices de rendimiento)
│   └── seeds/                        # 001_roles_permissions.sql y 002_demo_data.sql
├── DOCUMENTO_MAESTRO.md              # Especificación funcional integral (113 directrices)
├── ROADMAP.md                        # Plan de implementación de 14 fases y Gates de Evidencia
├── DIRECTIVA_GENTLE_AI.md            # Metodología SDD/TDD y Definition of Done
├── contexto.md                       # Snapshot histórico del progreso técnico
├── .env.example                      # Plantilla oficial de variables de entorno
└── package.json                      # Workspaces npm y scripts globales
```

---

## 3. ✨ Módulos y Funcionalidades Principales

### 3.1 Web Pública y Asistente de Reserva (6 Pasos)
- **Portal Institucional (`LandingPage.tsx`)**: Hero clínico orientado a conversión, directorio filtrable de especialidades, servicios y profesionales, preguntas frecuentes interactivas (FAQ), datos de sede y acceso al chat IA (`AiChatWidget`).
- **Wizard de Reserva Unificado (`BookingWizard.tsx` + `appointmentFlow.ts`)**: Flujo optimizado en **6 pasos (5 activos + confirmación)** con stepper visual, barra de progreso y navegación de edición directa desde el resumen:
  1. **Especialidad & Servicio**: Búsqueda de especialidades con acordeón auto-colapsable, modal de tratamientos, catálogo de servicios y selección de profesional (o *cualquier profesional disponible*).
  2. **Fecha & Horario**: Calendario mensual/semanal integrado con slots disponibles por turno.
  3. **Datos del Paciente**: Identificación por tipo/número de documento (con soporte de lookup `/api/patients/by-document`), datos de contacto y motivo de consulta.
  4. **Revisión & Políticas**: Resumen editable por bloques + aceptación obligatoria de política de cancelación y tratamiento de datos personales (Ley N.° 29733).
  5. **Pago**: Elección entre **Pago Online** (Tarjeta, Yape, Plin o Transferencia Bancaria) y **Pago en Clínica**.
  6. **Confirmación**: Emisión de código único (`CIT-2026-XXXX`) y acciones post-reserva.

---

### 3.2 Motor de Disponibilidad y Prevención de Doble Reserva
- **Cálculo de Disponibilidad (`GET /api/appointments/availability`)**: Cruza en tiempo real la duración del servicio, los horarios semanales activos del profesional (`professional_schedules`), los bloqueos excepcionales (`schedule_blocks`) y las citas vigentes.
- **Control de Concurrencia Atómico**: Al crear o reprogramar una cita, `AppointmentsService` abre una transacción PostgreSQL y ejecuta `SELECT pg_advisory_xact_lock(hashtext($1 || '_' || $2))` (llave compuesta por `professionalId` + `appointmentDate`), bloquea filas activas y rechaza colisiones con `409 Conflict`.
- **Máquina de Estados Auditada (`APPOINTMENT_TRANSITIONS`)**:
  - `pending` ➔ `confirmed` / `cancelled`
  - `confirmed` ➔ `checked_in` / `cancelled` / `no_show`
  - `checked_in` ➔ `in_progress` / `cancelled`
  - `in_progress` ➔ `completed` / `cancelled`
  - Cada transición se registra en `appointment_status_history` con autor, motivo y marca temporal.

```mermaid
sequenceDiagram
    autonumber
    actor P1 as Paciente A
    actor P2 as Paciente B
    participant API as NestJS AppointmentsService
    participant DB as PostgreSQL (pg_advisory_xact_lock)

    P1->>API: POST /api/appointments (Dr. Mendoza, 10:00)
    P2->>API: POST /api/appointments (Dr. Mendoza, 10:00)
    activate API
    API->>DB: BEGIN + SELECT pg_advisory_xact_lock(hashtext(profId || '_' || date))
    DB-->>API: Lock adquirido por Paciente A
    API->>DB: Verifica solapamiento (libre) -> INSERT cita + historial
    API->>DB: COMMIT (libera advisory lock)
    API-->>P1: 201 Created (Cita confirmada)

    DB-->>API: Lock adquirido por Paciente B
    API->>DB: Verifica solapamiento (slot ocupado)
    API->>DB: ROLLBACK
    API-->>P2: 409 Conflict ("Horario ya reservado")
    deactivate API
```

---

### 3.3 Consulta Médica, HCE, Mapa Corporal y Voz IA
- **Historia Clínica Digital Inmutable (`ClinicalModule` + `ClinicalConsultationView.tsx`)**: Registro cronológico append-only con motivo de consulta, anamnesis, examen físico, signos vitales (`vitals` JSONB), diagnóstico y plan terapéutico.
- **Planes de Tratamiento y Sesiones**: Seguimiento de sesiones totales vs. completadas, técnicas kinesiológicas aplicadas (`techniques_applied`), evolución de dolor en **Escala Visual Analógica EVA (0–10)** (`pain_scale_before` vs. `pain_scale_after`) y cierre automático al completar el plan.
- **Mapeo Anatómico Interactivo (`BodyMapPicker.tsx`)**: Selección visual de zonas dolorosas en vista anterior y posterior (28 puntos anatómicos predefinidos) con intensidad EVA y notas por punto.
- **Asistente Clínico por Voz (`VoiceConsultationAssistant.tsx`)**: Dictado de consulta con extracción estructurada de motivo, examen, dolor EVA inicial/final, diagnóstico, técnicas aplicadas y medicamentos.
- **Recetas Médicas Digitales (`DigitalPrescriptionModal.tsx`)**: Emisión estructurada de fármacos (dosis, vía, frecuencia, duración) e indicaciones domiciliarias.

---

### 3.4 Pagos Idempotentes, Caja Chica (POS) e Inventario Kardex
- **Pagos (`PaymentsModule`)**:
  - Patrón Strategy mediante `IPaymentProvider`: `ManualPaymentProvider` (Efectivo, POS, Transferencia, Yape, Plin) y `GatewayPaymentProvider` (pasarela online).
  - **Idempotencia estricta** por `idempotency_key` en `payments` para evitar cobros duplicados.
  - **Webhooks seguros** (`POST /api/payments/webhook/:provider`) con verificación `HMAC-SHA256` resistente a timing attacks (`crypto.timingSafeEqual`) y deduplicación en `webhook_events`.
- **Caja Chica (`CashModule` + `CashRegisterPage.tsx`)**: Apertura de turno con monto inicial, registro de ingresos/egresos operativos, consulta de caja del día, historial y cierre con arqueo y diferencias.
- **Inventario Kardex (`InventoryModule` + `InventoryPage.tsx`)**: Gestión de productos e insumos médicos, movimientos de entrada/salida/ajuste, alertas automáticas de stock mínimo (`GET /api/inventory/alerts`) y trazabilidad Kardex expandible por producto.

---

### 3.5 Comunicaciones Omnicanal y Asistente IA
- **Correos Transaccionales (`EmailsModule` + `CommunicationsPage.tsx`)**: Administración de plantillas dinámicas (`{{patient_name}}`, `{{service_name}}`, `{{appointment_date}}`), envío de prueba, auditoría en `email_logs` y barrido programado de recordatorios (`POST /api/emails/reminders/sweep`).
- **Bot de Telegram (`TelegramModule` + `TelegramBotPage.tsx`)**: Vinculación de cuentas de profesionales mediante código OTP temporal de 15 minutos (`POST /api/telegram/link-code`), recepción de webhooks de comandos/botones inline y disparo de resumen diario (`POST /api/telegram/daily-summary/trigger`).
- **Asistente IA Web (`AiAssistantModule` + `AiChatWidget.tsx`)**: Chat flotante alimentado con la base de conocimiento real de la clínica (`GET /api/ai/knowledge`), con contención estricta (no emite diagnósticos médicos) y derivación directa a reserva o escalamiento humano.
- **Recordatorios WhatsApp (`WhatsAppReminderModal.tsx`)**: Despacho directo desde recepción con plantillas listas para enviar al paciente.

---

### 3.6 Dashboards por Rol (RBAC) y Experiencia Móvil

| Rol (`UserRole`) | Vista Principal | Capacidades Destacadas |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | `SuperAdminDashboard` | Red global multi-clínica, métricas consolidadas, alta/estado de sedes y **Modo Supervisión Master** para operar dentro de cualquier clínica. |
| **`ADMIN_CLINIC`** | `ClinicAdminDashboard` | KPIs de sede, monitor de staff y consultorios en tiempo real, agenda en vista tabla/Kanban y accesos a caja, inventario, correos y Telegram. |
| **`RECEPCION`** | `ReceptionDashboard` + `ReceptionBookingPage` | Tablero Kanban de sala (`ReceptionKanbanBoard`), tiempos de espera (`WaitingTimeBadge`), triaje rápido, cobro en ventanilla, reserva express y recordatorios WhatsApp. |
| **`PROFESIONAL`** | `DoctorDashboard` + `ClinicalConsultationView` | Cola de pacientes del día con tendencia EVA, agenda semanal, bloqueo de horarios, consulta HCE, `BodyMapPicker`, dictado por voz y recetas digitales. |
| **`PACIENTE`** | `PatientDashboard` + `PatientPortal` | Próximas citas, reprogramación/cancelación, historial clínico, evolución EVA, tratamientos activos, recetas y comprobantes. |

La interfaz incluye además `AppShell`, `MobileBottomNav`, `SpeedDialFAB`, `AccessibilityFontScaler`, escáner móvil (`MobileCameraScannerModal`), `SkeletonLoader` y soporte completo de tema claro/oscuro (`ThemeContext`).

---

## 4. 🔌 Referencia de API REST (`/api`)

Todos los endpoints del backend NestJS están expuestos bajo el prefijo global `/api` (puerto por defecto `3000`) con `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).

| Módulo | Prefijo | Endpoints Principales |
| :--- | :--- | :--- |
| **Health** | `/api/health` | `GET /`, `GET /database` |
| **Auth** | `/api/auth` | `POST /login`, `POST /refresh`, `POST /logout`, `GET /me` |
| **Specialties** | `/api/specialties` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Services** | `/api/services` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Professionals** | `/api/professionals` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /:id/services` |
| **Schedules** | `/api/schedules` | `GET /professionals/:professionalId`, `PUT /professionals/:professionalId`, `GET /professionals/:professionalId/blocks`, `POST /blocks`, `DELETE /blocks/:blockId` |
| **Appointments** | `/api/appointments` | `GET /availability`, `GET /`, `GET /:id`, `POST /`, `PATCH /:id/confirm`, `PATCH /:id/check-in`, `PATCH /:id/start`, `PATCH /:id/complete`, `PATCH /:id/no-show`, `PATCH /:id/cancel`, `POST /:id/reschedule`, `GET /:id/history`, `DELETE /:id` |
| **Patients** | `/api/patients` | `POST /`, `GET /`, `GET /:id`, `GET /:id/history`, `PATCH /:id`, `DELETE /:id` |
| **Payments** | `/api/payments` | `POST /`, `GET /`, `GET /:id`, `POST /webhook/:provider` |
| **Clinical** | `/api/clinical` | `POST /records`, `GET /records/patient/:patientId`, `GET /records/:id`, `POST /treatments`, `GET /treatments/patient/:patientId`, `GET /treatments/:id`, `POST /treatments/:treatmentId/sessions`, `GET /treatments/:treatmentId/sessions`, `POST /prescriptions`, `GET /prescriptions/patient/:patientId`, `GET /prescriptions/:id` |
| **Cash** | `/api/cash` | `POST /open`, `POST /:id/close`, `POST /:id/movements`, `GET /today`, `GET /history` |
| **Inventory** | `/api/inventory` | `GET /`, `GET /alerts`, `GET /movements`, `POST /`, `POST /movements`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| **Emails** | `/api/emails` | `GET /templates`, `POST /templates`, `PUT /templates/:id`, `POST /send-test`, `GET /logs`, `POST /reminders/sweep` |
| **Telegram** | `/api/telegram` | `POST /webhook`, `POST /link-code`, `GET /account`, `POST /daily-summary/trigger` |
| **AI Assistant** | `/api/ai` | `POST /chat`, `GET /knowledge` |

---

## 5. 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | `React 19` + `TypeScript 5.7` | Interfaz SPA reactiva y tipada |
| **Bundler & CSS** | `Vite 6` + `Tailwind CSS 4` (`@tailwindcss/vite`) + CSS Tokens | Desarrollo HMR rápido, proxy `/api` y diseño modular con tema oscuro |
| **Backend** | `NestJS 11` + `Express` + `TypeScript 5.7` | Monolito modular con inyección de dependencias y guards |
| **Validación** | `class-validator` + `class-transformer` | Validación estricta de DTOs en entrada HTTP |
| **Tipos Compartidos** | `@citassistema/shared-types` | Contratos, enums, roles, permisos y máquina de estados compartidos |
| **Base de Datos** | `PostgreSQL 16+` (`pg` Pool) | Persistencia relacional ACID, advisory locks y migraciones SQL |
| **Autenticación** | `Passport JWT` + `@nestjs/jwt` + `bcrypt` | Access/Refresh tokens rotativos y hash seguro de contraseñas |
| **Pruebas Backend** | `Jest 29` + `Supertest 7` | 20 suites / 142 tests (servicios, guards, seguridad y regresión) |
| **Pruebas Frontend** | `Vitest 3` + `Testing Library` + `jsdom` | 25 archivos / 153 tests (booking, dashboards, HCE, caja, IA) |
| **Calidad de Código** | `ESLint 9` + `typescript-eslint 8` + `Prettier 3` | Estándares de código y formato uniforme en todo el monorepo |

---

## 6. 🗄️ Base de Datos, Migraciones y Datos Demo

El esquema relacional se gestiona mediante **13 migraciones SQL secuenciales** con tabla de seguimiento `_migrations` (`apps/backend/src/database/migrate.ts`) y **2 scripts de semillas**:

```text
db/
├── docker/
│   └── docker-compose.yml                           # PostgreSQL 16 dev (:5432) y test (:5433)
├── migrations/
│   ├── 001_extensions_and_enums.sql                 # Extensiones UUID/CITEXT y enums de dominio
│   ├── 002_tenants_users_roles.sql                  # Clínicas (tenants), usuarios, roles y permisos RBAC
│   ├── 003_medical_tables.sql                       # Especialidades, servicios, profesionales, horarios y bloqueos
│   ├── 004_patients_appointments.sql                # Pacientes, citas e historial de estados
│   ├── 005_financial.sql                            # Pagos, transacciones, cajas y movimientos
│   ├── 006_clinical.sql                             # Historias clínicas, tratamientos, sesiones, recetas y documentos
│   ├── 007_operational.sql                          # Inventario, plantillas/logs de email, Telegram y audit_logs
│   ├── 008_auth_refresh_tokens.sql                  # Almacenamiento y revocación de refresh tokens
│   ├── 009_payments_idempotency.sql                 # Llaves de idempotencia y eventos webhook deduplicados
│   ├── 010_clinical_pain_scale_and_sessions.sql     # Escala EVA (0–10) y seguimiento de sesiones terapéuticas
│   ├── 011_cash_session_and_inventory_adjustments.sql # Sesiones de caja chica y ajustes de inventario Kardex
│   ├── 012_telegram_professional_linking.sql        # Vinculación OTP de cuentas Telegram
│   └── 013_performance_and_security_indexes.sql     # Índices compuestos para consultas frecuentes y aislamiento
└── seeds/
    ├── 001_roles_permissions.sql                    # Clínica demo, 5 roles base y permisos del sistema
    └── 002_demo_data.sql                            # Especialidades, servicios, médicos, horarios y usuarios demo
```

---

## 7. 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.x` (con soporte de workspaces)
- **PostgreSQL 16+** local, en Docker o gestionado (p. ej. Supabase)

### 1. Clonar e instalar dependencias
```bash
git clone https://github.com/Alessander9/SistemaCitas_ok.git
cd SistemaCitas_ok
npm install
```

### 2. Configurar variables de entorno
Copia [`.env.example`](./.env.example) a `.env` en la raíz del proyecto y ajusta tus valores:

```env
# Base de Datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citassistema
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5433/citassistema_test
DB_POOL_MAX=20

# Supabase (opcional para almacenamiento / despliegue)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=documents

# Autenticación JWT
JWT_SECRET=change-this-in-production
JWT_REFRESH_SECRET=change-this-refresh-secret-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Aplicación
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 3. Levantar PostgreSQL (opcional con Docker)
```bash
docker compose -f db/docker/docker-compose.yml up -d
```

### 4. Ejecutar migraciones y semillas
```bash
# Aplicar las 13 migraciones SQL en orden
npm run db:migrate

# Cargar clínica demo, roles, permisos, catálogos y usuarios de prueba
npm run db:seed
```

> Si necesitas reiniciar la base de datos desde cero en desarrollo, ejecuta `npm run db:reset`.

### 5. Iniciar los servidores de desarrollo
Abre dos terminales (Vite hace proxy automático de `/api` hacia `http://localhost:3000`):

```bash
# Terminal 1 — Backend NestJS (http://localhost:3000/api)
npm run dev:backend

# Terminal 2 — Frontend React + Vite (http://localhost:5173)
npm run dev:frontend
```

### 6. Credenciales Demo (Seed `002_demo_data.sql`)

Todas las cuentas demo de desarrollo comparten la contraseña **`Password123!`**:

| Rol | Correo | Descripción |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | `superadmin@citassistema.pe` | Administrador global multi-clínica |
| **`ADMIN_CLINIC`** | `admin@clinica.pe` | Director médico / administrador de sede |
| **`PROFESIONAL`** | `doctor@clinica.pe` | Dra. María González (Fisioterapia y Rehabilitación) |
| **`RECEPCION`** | `recepcion@clinica.pe` | Recepción y ventanilla central |
| **`PACIENTE`** | `paciente@clinica.pe` | Juan Carlos Pérez (Portal de paciente) |

---

## 8. 🧪 Pruebas, Linting y Scripts del Monorepo

### Scripts Disponibles (Raíz)

| Comando | Descripción |
| :--- | :--- |
| `npm run dev:backend` | Inicia NestJS en modo watch (`http://localhost:3000/api`) |
| `npm run dev:frontend` | Inicia Vite en modo desarrollo (`http://localhost:5173`) |
| `npm run build:backend` | Compila el backend en `apps/backend/dist` |
| `npm run build:frontend` | Verifica TypeScript (`tsc --noEmit`) y construye el bundle Vite |
| `npm test` | Ejecuta toda la suite de pruebas (Backend + Frontend) |
| `npm run test:backend` | Ejecuta las pruebas unitarias, de seguridad y regresión en Jest |
| `npm run test:frontend` | Ejecuta las pruebas de componentes y flujos en Vitest |
| `npm run test:e2e` | Ejecuta pruebas end-to-end del backend |
| `npm run lint` | Ejecuta ESLint en backend y frontend |
| `npm run format` | Formatea el monorepo con Prettier |
| `npm run format:check` | Verifica el formato sin modificar archivos |
| `npm run db:migrate` | Aplica migraciones SQL pendientes |
| `npm run db:seed` | Ejecuta los archivos de datos semilla |
| `npm run db:reset` | Reinicia el esquema de base de datos |

### Estado Verificado de la Suite de Pruebas

```text
✓ Backend (Jest):     20 test suites passed | 142 tests passed (100%)
✓ Frontend (Vitest):  25 test files passed  | 153 tests passed (100%)
✓ Total Verificado:   45 suites             | 295 tests PASSED
```

---

## 9. 🔐 Seguridad, Multi-Tenancy y Cumplimiento

- **Aislamiento Multi-Tenant (`TenantMiddleware` + `TenantGuard`)**:
  - Todo usuario autenticado queda vinculado al `clinicId` firmado en su JWT.
  - Si un usuario no `SUPER_ADMIN` envía una cabecera `X-Clinic-ID` o parámetro de otra clínica, el guard rechaza la petición con `403 Forbidden`.
- **Autorización RBAC (`JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`)**:
  - 5 roles base y permisos granulares definidos en `SystemPermission` (`appointments.*`, `patients.*`, `medical_records.*`, `treatments.manage`, `sessions.manage`, `prescriptions.manage`, `payments.*`, `cash.*`, `inventory.*`, `reports.read`, `users.manage`, `settings.manage`, `audit.read`).
- **Protección Criptográfica**:
  - Contraseñas hasheadas con `bcrypt` (10 rounds).
  - Tokens JWT con rotación de Refresh Tokens y revocación persistente (`008_auth_refresh_tokens.sql`).
  - Webhooks de pago validados mediante `HMAC-SHA256` y `crypto.timingSafeEqual`.
- **Integridad Clínica y Normativa**:
  - Historias clínicas cronológicas sin sobreescritura destructiva y trazabilidad de cambios en `audit_logs` y `appointment_status_history`.
  - Flujos de consentimiento informado y protección de datos personales alineados a la **Ley N.° 29733 (Perú)**.

---

## 10. 📚 Mapa de Documentación del Proyecto

Este `README.md` actúa como la **documentación global de entrada** del repositorio. Para profundizar en especificaciones, metodología o plan de fases, consulta los documentos complementarios:

| Documento | Contenido |
| :--- | :--- |
| 📘 [`DOCUMENTO_MAESTRO.md`](./DOCUMENTO_MAESTRO.md) | 113 directrices de producto, arquitectura, dominio y reglas de negocio. |
| 🗺️ [`ROADMAP.md`](./ROADMAP.md) | Matriz de dependencias de las 14 fases de implementación y Gates de Evidencia. |
| 🛡️ [`DIRECTIVA_GENTLE_AI.md`](./DIRECTIVA_GENTLE_AI.md) | Metodología SDD/TDD, niveles de prueba obligatorios y Definition of Done. |
| 🧭 [`contexto.md`](./contexto.md) | Registro histórico de hitos técnicos y evolución de fases. |
| ⚙️ [`.env.example`](./.env.example) | Plantilla oficial de variables de entorno del monorepo. |

---

<p align="center">
  <strong>© 2026 CitasSistema</strong> — Plataforma SaaS Clínica & Gestión Médica Multi-Tenant.
</p>

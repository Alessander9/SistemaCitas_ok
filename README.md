<p align="center">
  <img src="https://img.shields.io/badge/PLATAFORMA_MÉDICA-CITASSISTEMA-0ea5e9?style=for-the-badge&logo=medlineplus&logoColor=white" alt="CitasSistema Banner" />
</p>

<h1 align="center">🏥 CitasSistema — Documentación Global</h1>

<p align="center">
  <strong>Plataforma SaaS multi-tenant marca blanca para gestión de clínicas médicas, historia clínica electrónica (HCE), asistente clínico de voz bilateral ("Chanfainita"), arquitectura orientada a eventos, FSM estricta, pagos idempotentes, caja chica y control de inventario Kardex.</strong>
</p>

<p align="center">
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Tests-409%2F409%20Passing-10b981?style=flat-square&logo=vitest&logoColor=white" alt="Tests Passing" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Backend-NestJS%2011%20%2B%20TS%205.7%20%2B%20Zod-e0234e?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 11" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%206%20%2B%20Tailwind%204-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Database-PostgreSQL%2016+-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16+" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Architecture-Event--Driven%20%7C%20FSM%20%7C%20White--Label-8b5cf6?style=flat-square" alt="Architecture" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Node-%3E%3D20.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node 20+" /></a>
</p>

---

## 📑 Tabla de Contenidos

- [1. 🌟 Visión General](#1--visión-general)
- [2. 🏛️ Arquitectura del Sistema y Monorepo](#2-️-arquitectura-del-sistema-y-monorepo)
- [3. ✨ Módulos y Funcionalidades Principales](#3--módulos-y-funcionalidades-principales)
  - [3.1 Web Pública y Asistente de Reserva (6 Pasos)](#31-web-pública-y-asistente-de-reserva-6-pasos)
  - [3.2 Motor de Disponibilidad, FSM y Prevención de Doble Reserva](#32-motor-de-disponibilidad-fsm-y-prevención-de-doble-reserva)
  - [3.3 Arquitectura Basada en Eventos (Event-Driven Notifications)](#33-arquitectura-basada-en-eventos-event-driven-notifications)
  - [3.4 SaaS Marca Blanca (White-Label) y Gobernanza Multi-Tenant](#34-saas-marca-blanca-white-label-y-gobernanza-multi-tenant)
  - [3.5 Consulta Médica, HCE, Mapa Corporal 2D/3D y Asistente Bilateral "Chanfainita"](#35-consulta-médica-hce-mapa-corporal-2d3d-y-asistente-bilateral-chanfainita)
  - [3.6 Pagos Idempotentes, Caja Chica (POS) e Inventario Kardex Hidratados](#36-pagos-idempotentes-caja-chica-pos-e-inventario-kardex-hidratados)
  - [3.7 Comunicaciones Omnicanal y Conocimiento Médico IA](#37-comunicaciones-omnicanal-y-conocimiento-médico-ia)
  - [3.8 Dashboards por Rol (RBAC), Sesión Segura y Navegación Blindada](#38-dashboards-por-rol-rbac-sesión-segura-y-navegación-blindada)
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
Captación Web ➔ Reserva Online ➔ Pago Idempotente ➔ Recepción / Triaje ➔ Consulta Clínica (HCE / EVA / Voz Bilateral / Receta) ➔ Caja & Kardex ➔ Seguimiento Omnicanal
```

### Pilares Arquitectónicos
1. **Aislamiento Multi-Tenant Estricto + Anti-IDOR**: Cada registro operativo pertenece a un `clinic_id`. El backend valida la identidad del inquilino (`TenantGuard`) y la titularidad de los datos de pacientes (`assertPatientOwnership`) sin confiar en filtros del cliente.
2. **Cero Dobles Reservas (Zero Double-Booking) y FSM Formal**: Serialización transaccional atómica mediante `pg_advisory_xact_lock` en PostgreSQL por profesional y fecha, junto con máquinas de estado finitas formales (`canTransitionAppointment` y `canTransitionCashRegister`) que impiden saltos de estado ilegales o mutaciones sobre estados terminales.
3. **Autenticación Blindada Anti-XSS (Gold Standard)**: Arquitectura de dos capas con **Access Token en memoria volátil de React** (`AuthContext`) y **Refresh Token en Cookie `HttpOnly; Secure; SameSite=Lax`**, complementada con Silent Refresh automático en recargas (`F5`), eliminando la exposición de credenciales en `localStorage`.
4. **Arquitectura Basada en Eventos (`@nestjs/event-emitter`)**: Desacoplamiento total de los efectos secundarios (envío de correos Brevo, alertas a Telegram) del hilo transaccional principal de agendamiento y cancelación de citas.
5. **SaaS Marca Blanca Dinámico (White-Label Onboarding)**: Capacidad para que cada clínica opere con su propio logo, colores de marca, eslogan de bienvenida, nombre personalizado de Asistente IA y control de suspensión de servicio en tiempo real.
6. **Producción Endurecida & Cero Advertencias**: Rate Limiting (`@nestjs/throttler`), filtro global de excepciones (`HttpExceptionFilter`) para sanitización de errores de base de datos (PostgreSQL 23505/23503), logging corporativo NestJS (`Logger`), optimización de bundle en Vite con `manualChunks` (< 500 kB) y 100% de pruebas automáticas pasando (409 tests).

---

## 2. 🏛️ Arquitectura del Sistema y Monorepo

El sistema implementa un **Monolito Modular con Clean Architecture pragmática** en el backend (`apps/backend`) y una **SPA modular en React 19** (`apps/frontend`), sincronizados mediante `@citassistema/shared-types` (`packages/shared-types`).

```mermaid
flowchart TB
    subgraph CLIENTS ["🖥️ Clientes y Canales de Entrada"]
        WEB_PUB["🌐 Landing Pública y Booking Wizard (6 pasos)"]
        PORTAL_PAC["👤 Portal y Dashboard del Paciente"]
        PORTAL_MED["👨‍⚕️ Dashboard Médico, HCE, Mapa 2D/3D y Chanfainita Voz IA"]
        PORTAL_REC["📋 Dashboard de Recepción (Kanban, Triaje y Ventanilla)"]
        PORTAL_ADM["📊 Super Admin (Multi-Sede DB) y Admin de Clínica"]
        BOT_TG["📱 Bot de Telegram"]
        WHATSAPP["💬 Resumen Post-Consulta & Recordatorios WhatsApp"]
    end

    subgraph GATEWAY ["🛡️ Capa HTTP, Seguridad y Contexto (NestJS /api)"]
        ENV_ZOD["⚡ Zod Fail-Fast Env Validator (env.schema.ts)"]
        TENANT_MW["🏢 TenantMiddleware (X-Clinic-ID)"]
        VAL_PIPE["✅ Global ValidationPipe (whitelist + transform)"]
        AUTH_GUARD["🔑 JwtAuthGuard (Access 15m / Refresh 7d)"]
        TENANT_GUARD["🔒 TenantGuard + Anti-IDOR PatientOwnership"]
        RBAC_GUARD["🛡️ RolesGuard & PermissionsGuard"]
    end

    subgraph MODULES ["📦 Módulos de Dominio (16 Módulos NestJS)"]
        CORE_MOD["🔐 Auth · 🩺 Health · 🏛️ Admin Clinics (Multi-Tenant CRUD)"]
        CAT_MOD["🏥 Specialties · Services · Professionals · Schedules"]
        APPT_MOD["📅 Appointments (Availability + pg_advisory_xact_lock)"]
        CLIN_MOD["📋 Patients · Clinical (HCE, EVA, PainMap 2D/3D, Chanfainita, Knowledge DB)"]
        FIN_MOD["💳 Payments (Strategy + HMAC) · 💵 Cash · 📦 Inventory Kardex"]
        AUTO_MOD["✉️ Emails · 🤖 Telegram · 🧠 AI Assistant"]
    end

    subgraph STORAGE ["🗄️ Persistencia"]
        POOL["⚡ DatabaseService (pg.Pool + Transacciones ACID)"]
        PG_DB[("🐘 PostgreSQL 16+\n17 Migraciones DDL + Seeds")]
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
│   │   │   ├── common/               # Decorators, Guards (JWT, Tenant, Roles, Permissions), Anti-IDOR, Security Audit
│   │   │   ├── config/               # env.schema.ts (Validación Fail-Fast con Zod) + env.schema.spec.ts
│   │   │   ├── database/             # DatabaseService (pg.Pool), migrate.ts, seed.ts, reset.ts
│   │   │   └── modules/              # 16 módulos de negocio (incluye AdminModule y ClinicalKnowledgeService)
│   │   ├── test/                     # Suites E2E contra PostgreSQL real (appointments, clinical, finance, security)
│   │   └── package.json
│   └── frontend/                     # SPA React 19 + Vite 6 + Tailwind CSS 4
│       ├── src/
│       │   ├── components/           # ai/, booking/, clinical/, clinic-admin/, doctor/, patient/, reception/, ui/
│       │   ├── context/              # ThemeContext (Light / Dark mode)
│       │   ├── data/                 # Datasets demo y fallback de disponibilidad
│       │   ├── pages/                # public/, login/, dashboards/ (superadmin/ modular), clinical/ (tabs/ modular), admin/, patient/
│       │   ├── services/             # api.ts + api/ (booking, patients, clinical, auth, admin, knowledge, http)
│       │   ├── styles/               # Tokens de diseño y dark-theme.css
│       │   └── utils/                # Utilidades de sonido y helpers UI
│       └── package.json
├── packages/
│   └── shared-types/                 # @citassistema/shared-types (ClinicalVitals, PainReferredArea, parseClinicalSpeech, enums)
├── db/
│   ├── docker/docker-compose.yml     # Contenedores PostgreSQL 16 (desarrollo :5432 y test :5433)
│   ├── factories/                    # Factories para pruebas
│   ├── migrations/                   # 001 a 017 (DDL completo + protocolos clínicos IA + configuración de voz)
│   └── seeds/                        # 001_roles_permissions.sql y 002_demo_data.sql
├── docs/
│   └── adr/                          # Architecture Decision Records (001-clinical-speech-parser, 002-typed-domain-and-fail-fast-env)
├── scripts/
│   └── e2e-browser-smoke.mjs         # Smoke test E2E automatizado en navegador Chromium real (Puppeteer)
├── GLOSSARY.md                       # Glosario oficial de lenguaje ubicuo (Ubiquitous Language)
├── DOCUMENTO_MAESTRO.md              # Especificación funcional integral (113 directrices)
├── ROADMAP.md                        # Plan de implementación y Gates de Evidencia
├── DIRECTIVA_GENTLE_AI.md            # Metodología SDD/TDD y Definition of Done
├── .env.example                      # Plantilla oficial de variables de entorno
└── package.json                      # Workspaces npm y scripts globales
```

---

## 3. ✨ Módulos y Funcionalidades Principales

### 3.1 Web Pública y Asistente de Reserva (6 Pasos)
- **Portal Institucional (`LandingPage.tsx`)**: Hero clínico orientado a conversión, directorio filtrable de especialidades, servicios y profesionales, preguntas frecuentes interactivas (FAQ), datos de sede y acceso al chat IA (`AiChatWidget`).
- **Wizard de Reserva Unificado (`BookingWizard.tsx` + `appointmentFlow.ts`)**: Flujo optimizado en **6 pasos (5 activos + confirmación)** con stepper visual, barra de progreso y navegación de edición directa desde el resumen:
  1. **Especialidad & Servicio**: Búsqueda de especialidades con acordeón auto-colapsable, modal de tratamientos, catálogo de servicios y selección de profesional.
  2. **Fecha & Horario**: Calendario mensual/semanal integrado con slots disponibles por turno.
  3. **Datos del Paciente**: Identificación por tipo/número de documento (con auto-lookup público `GET /api/patients/by-document` al completar 8 dígitos de DNI), datos de contacto y motivo de consulta.
  4. **Revisión & Políticas**: Resumen editable por bloques + aceptación obligatoria de política de cancelación y tratamiento de datos personales (Ley N.° 29733).
  5. **Pago**: Elección entre **Pago Online** (Tarjeta, Yape, Plin o Transferencia Bancaria) y **Pago en Clínica**.
  6. **Confirmación**: Emisión de código único (`CIT-2026-XXXX`) y comprobante digital.

---

### 3.2 Motor de Disponibilidad, FSM y Prevención de Doble Reserva
- **Cálculo de Disponibilidad (`GET /api/appointments/availability`)**: Cruza en tiempo real la duración del servicio, los horarios semanales activos del profesional (`professional_schedules`), los bloqueos excepcionales (`schedule_blocks`) y las citas vigentes.
- **Control de Concurrencia Atómico**: Al crear o reprogramar una cita, `AppointmentsService` abre una transacción PostgreSQL y ejecuta `SELECT pg_advisory_xact_lock(hashtext($1 || '_' || $2))` (llave compuesta por `professionalId` + `appointmentDate`), bloquea filas activas y rechaza colisiones con `409 Conflict`.
- **Máquinas de Estado Finitas Formadas (`@citassistema/shared-types`)**:
  - **Citas (`canTransitionAppointment`)**: Control formal que valida transiciones válidas (`pending` ➔ `confirmed` ➔ `checked_in` ➔ `in_progress` ➔ `completed` / `cancelled` / `no_show`). Protege contra transiciones inválidas y bloquea cualquier mutación sobre estados terminales (`completed`, `cancelled`, `no_show`).
  - **Caja Chica (`canTransitionCashRegister`)**: Garantiza la secuencia estricta `closed` ➔ `open` ➔ `closed`.
  - Cada transición de cita se audita en `appointment_status_history` con autor, motivo y marca temporal.

---

### 3.3 Arquitectura Basada en Eventos (Event-Driven Notifications)
- **Desacoplamiento con `@nestjs/event-emitter`**:
  - El flujo transaccional principal de agendamiento y cancelación emite eventos de dominio: `AppointmentConfirmedEvent` y `AppointmentCancelledEvent`.
  - El listener `AppointmentNotificationsListener` captura estos eventos en segundo plano y dispara de forma asíncrona:
    - Correos electrónicos transaccionales de confirmación y cancelación vía Brevo (`EmailsService`).
    - Alertas operativas instantáneas al canal de Telegram de la sede (`TelegramService`).
  - **Beneficio**: Tiempos de respuesta HTTP ultra-rápidos (< 50ms) y alta tolerancia a fallos en proveedores externos sin riesgo de rollback transaccional de la cita.

---

### 3.4 SaaS Marca Blanca (White-Label) y Gobernanza Multi-Tenant
- **Onboarding Inteligente por Sede**:
  - Cada clínica opera con su identidad visual única: logo corporativo, paleta de colores CSS variables (`ClinicBrandingContext`), eslogan de bienvenida y datos de contacto propios.
  - Nombre del Asistente IA personalizado por clínica (ej. *"Sofía · Asistente San Mateo"*).
- **Gobernanza y Switch de Suspensión (SuperAdmin)**:
  - El SuperAdmin dispone de un switch maestro para habilitar o suspender cualquier clínica (`PUT /api/admin/clinics/:id`).
  - Al suspenderse una clínica, el backend rechaza autenticaciones con `403 Forbidden` (`CLINIC_SUSPENDED`), y el frontend despliega un banner de regularización con enlace directo a WhatsApp precargado con el ID de la clínica y el usuario.

---

### 3.5 Consulta Médica, HCE, Mapa Corporal 2D/3D y Asistente Bilateral "Chanfainita"
- **Historia Clínica Digital Modularizada (`ClinicalConsultationView.tsx` + `tabs/`)**: Dividida en pestañas especializadas (`ClinicalEvolutionTab`, `ClinicalSessionTab`, `ClinicalPrescriptionTab`, `ClinicalKardexAndSummarySection`) con signos vitales estrictamente tipados (`ClinicalVitals`), diagnóstico CIE-10 y plan terapéutico.
- **Mapeo Anatómico Jerárquico 2D y Visor 3D (`pain-map/PainMapPicker.tsx`)**: Exploración corporal multinivel con catálogo de ~170 estructuras clínicas, buscador instantáneo (`Ctrl+K`), visor 3D cargado bajo demanda (`React.lazy`), lateralidad, puntos gatillo, metadatos del Atlas 3D (`PainReferredArea`) y persistencia en `pain_map_points`.
- **Asistente Clínico de Voz Bilateral ("Chanfainita")**:
  - **Modo Ambiental vs. Activo**: Escucha pasiva durante la consulta sin interrumpir al paciente; al detectar la palabra de invocación configurable (`"Chanfainita"`), responde por voz en lenguaje humano natural sin recitar códigos CIE-10 (**Regla del Doble Canal**).
  - **Briefing Rápido de 10s Bajo Demanda**: Resumen hablado de diagnóstico, sesión actual, último EVA y alergias solo cuando el médico pulsa *"Escuchar resumen (10s)"*.
  - **Seguridad Clínica y Farmacovigilancia**: Cruza en tiempo real medicamentos dictados contra alergias del paciente (ej. AINEs) y detecta banderas rojas neurológicas (ej. síndrome de cola de caballo).
  - **Pre-selección de Insumos para Kardex**: Detecta insumos mencionados por voz (ej. *"usamos 2 agujas de punción seca y kinesiotape"*) y genera chips editables que solo descuentan stock del Kardex cuando el médico confirma y guarda la ficha.
  - **Traductor a Lenguaje de Paciente (WhatsApp)**: Genera con 1 clic un resumen claro y empático sin jerga médica listo para enviar por WhatsApp.

---

### 3.6 Pagos Idempotentes, Caja Chica (POS) e Inventario Kardex Hidratados
- **Pagos (`PaymentsModule`)**:
  - Patrón Strategy mediante `IPaymentProvider`: `ManualPaymentProvider` (Efectivo, POS, Transferencia, Yape, Plin) y `GatewayPaymentProvider`.
  - **Idempotencia estricta** por `idempotency_key` en `payments` para evitar cobros duplicados.
  - **Webhooks seguros** (`POST /api/payments/webhook/:provider`) con verificación `HMAC-SHA256` (`crypto.timingSafeEqual`) y deduplicación en `webhook_events`.
- **Caja Chica Hidratada en Vivo (`CashModule` + `CashRegisterPage.tsx`)**:
  - Conexión directa a `/api/cash/today`, `/api/cash/open`, `/api/cash/:id/movements` y `/api/cash/:id/close`.
  - Apertura con balance inicial, arqueo en vivo, control de diferencias y cierre formal de turno.
- **Inventario Kardex Hidratado en Vivo (`InventoryModule` + `InventoryPage.tsx`)**:
  - Conexión a `/api/inventory` y `/api/inventory/movements`.
  - Gestión de stock actual, alertas automáticas de reposición bajo el umbral mínimo y registro de movimientos de compra, venta, ajuste, devolución o merma.

---

### 3.7 Comunicaciones Omnicanal y Conocimiento Médico IA
- **Panel de Conocimiento Médico IA (`ClinicalKnowledgeAdminPage.tsx`)**: Administración en tiempo real respaldada en PostgreSQL (`016_clinical_knowledge.sql` y `017_clinical_voice_admin.sql`) con 4 pestañas:
  1. **Protocolos Clínicos CIE-10** (criterios diagnósticos, técnicas sugeridas y banderas rojas).
  2. **Vademécum & Reglas de Alergias** (grupos farmacológicos, contraindicaciones y alertas).
  3. **Macros de Voz & Nombre de Invocación** (personalización del wake-word `"Chanfainita"`, tono y velocidad de voz por sede).
  4. **Auditoría de Alertas Clínicas** (registro histórico de alertas farmacológicas y banderas rojas disparadas en consulta).
- **Correos Transaccionales (`EmailsModule` + `CommunicationsPage.tsx`)**: Plantillas dinámicas, envío de prueba, auditoría en `email_logs` y barrido de recordatorios.
- **Bot de Telegram (`TelegramModule` + `TelegramBotPage.tsx`)**: Vinculación OTP de 15 minutos, webhooks y resumen diario de agenda.

---

### 3.8 Dashboards por Rol (RBAC), Sesión Segura y Navegación Blindada

- **Gestor Global de Autenticación (`AuthContext.tsx` + `storage.ts`)**:
  - **Defensa en profundidad contra XSS**: El Access Token vive únicamente en la memoria volátil de la aplicación React (`AuthContext`), sin persistirse en `localStorage`.
  - **Refresh Token en Cookie `HttpOnly`**: Gestionado automáticamente por el navegador con flags `HttpOnly; Secure; SameSite=Lax; Path=/api/auth`, haciéndolo inaccesible ante ataques de script.
  - **Silent Refresh en Recarga (`F5`)**: Al abrir o recargar la app, `AuthContext` ejecuta un refresco silencioso contra `POST /api/auth/refresh` con `credentials: 'include'`, restaurando la sesión sin parpadeos ni vulnerabilidades.
- **Enrutamiento Blindado y Protección por Roles (`App.tsx`)**:
  - Soporte a navegación del historial del navegador (`popstate` atrás/adelante).
  - URLs amigables por vista (`?view=...`).
  - Matriz de autorización `ROLE_ALLOWED_VIEWS` que impide el acceso no autorizado a dashboards privados.
- **Modularización de Pantalla de Acceso (`LoginPage.tsx`)**:
  - Descompuesta en 5 subcomponentes especializados: `BrandSidebar`, `DemoRoleChips`, `SuspendedNoticeBanner`, `ForgotPasswordCard` (con Cloudflare Turnstile) y `ResetPasswordCard`.

| Rol (`UserRole`) | Vista Principal | Capacidades Destacadas |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | `SuperAdminDashboard` (`superadmin/` modular) | Red global multi-clínica conectada a PostgreSQL (`GET/POST/PUT /api/admin/clinics`), KPIs consolidados (`SuperAdminKpiGrid`), directorio filtrable (`ClinicsDirectoryTable`), configuración IPRESS/RENIPRESS, switch de suspensión y auditoría Ley 29733 (`AuditLogsDrawer`). |
| **`ADMIN_CLINIC`** | `ClinicAdminDashboard` (Hidratado) | KPIs de sede vivos desde API, monitor de profesionales ocupados, alertas de insumos bajo stock y estado de caja del día en tiempo real. |
| **`RECEPCION`** | `ReceptionDashboard` + `ReceptionBookingPage` (Hidratado) | Tablero Kanban de sala con citas reales del día, check-in en 1 clic conectado a `/api/appointments/:id/check-in`, cobro en ventanilla y agendamiento express. |
| **`PROFESIONAL`** | `DoctorDashboard` + `ClinicalConsultationView` (Hidratado) | Agenda médica sincronizada con la base de datos, consulta HCE modularizada, `PainMapPicker` 2D/3D, asistente bilateral `"Chanfainita"` y Kardex por voz. |
| **`PACIENTE`** | `PatientDashboard` + `PatientPortal` | Próximas citas, reprogramación/cancelación, historial clínico protegido con Anti-IDOR, evolución EVA, tratamientos activos, recetas y comprobantes. |

---

## 4. 🔌 Referencia de API REST (`/api`)

Todos los endpoints del backend NestJS están expuestos bajo el prefijo global `/api` (puerto por defecto `3000`) con validación de entorno **Fail-Fast (Zod)**, cabeceras de seguridad endurecidas y `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).

| Módulo | Prefijo | Endpoints Principales |
| :--- | :--- | :--- |
| **Health** | `/api/health` | `GET /`, `GET /database` |
| **Auth** | `/api/auth` | `POST /login`, `POST /refresh`, `POST /logout`, `GET /me`, `POST /forgot-password`, `POST /reset-password` |
| **Admin (SuperAdmin)** | `/api/admin` | `GET /clinics`, `POST /clinics`, `PUT /clinics/:id` |
| **Specialties** | `/api/specialties` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Services** | `/api/services` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| **Professionals** | `/api/professionals` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /:id/services` |
| **Schedules** | `/api/schedules` | `GET /professionals/:professionalId`, `PUT /professionals/:professionalId`, `GET /professionals/:professionalId/blocks`, `POST /blocks`, `DELETE /blocks/:blockId` |
| **Appointments** | `/api/appointments` | `GET /availability`, `POST /public-book`, `GET /`, `GET /:id`, `POST /`, `PATCH /:id/confirm`, `PATCH /:id/check-in`, `PATCH /:id/start`, `PATCH /:id/complete`, `PATCH /:id/no-show`, `PATCH /:id/cancel`, `POST /:id/reschedule`, `GET /:id/history`, `DELETE /:id` |
| **Patients** | `/api/patients` | `GET /by-document` (público), `POST /`, `GET /`, `GET /:id`, `GET /:id/history`, `PATCH /:id`, `DELETE /:id` |
| **Payments** | `/api/payments` | `POST /`, `GET /`, `GET /:id`, `POST /webhook/:provider` |
| **Clinical & Voz IA** | `/api/clinical` | `POST /records`, `GET /records/patient/:patientId`, `POST /treatments`, `POST /treatments/:treatmentId/sessions`, `POST /prescriptions`, `POST /pain-map`, `GET /pain-map/patient/:patientId`, `POST /voice/parse`, `POST /voice/save-consultation`, `POST /voice/patient-summary`, `GET /voice/patient-briefing/:patientId`, `POST /voice/deduct-supplies` |
| **Clinical Knowledge** | `/api/clinical/knowledge` | `GET /overview`, `POST /protocols`, `DELETE /protocols/:id`, `POST /vademecum`, `DELETE /vademecum/:id`, `POST /macros`, `DELETE /macros/:id`, `PUT /voice-settings` |
| **Cash** | `/api/cash` | `POST /open`, `POST /:id/close`, `POST /:id/movements`, `GET /today`, `GET /history` |
| **Inventory** | `/api/inventory` | `GET /`, `GET /alerts`, `GET /movements`, `POST /`, `POST /movements`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| **Emails** | `/api/emails` | `GET /templates`, `POST /templates`, `PUT /templates/:id`, `POST /send-test`, `GET /logs`, `POST /reminders/sweep` |
| **Telegram** | `/api/telegram` | `POST /webhook`, `POST /link-code`, `GET /account`, `POST /daily-summary/trigger` |
| **AI Assistant** | `/api/ai` | `POST /chat`, `GET /knowledge` |

---

## 5. 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | `React 19` + `TypeScript 5.7` + `Three.js` | Interfaz SPA reactiva, tipada y con visor anatómico 3D bajo demanda |
| **Bundler & Chunks** | `Vite 6` + `Tailwind CSS 4` + `manualChunks` | Desarrollo HMR rápido, code-splitting (`vendor-react`, `vendor-three`) y bundles optimizados < 500 kB |
| **Backend & Eventos** | `NestJS 11` + `@nestjs/event-emitter` + `Express` | Monolito modular con arquitectura orientada a eventos para notificaciones asíncronas |
| **Protección & Throttling** | `@nestjs/throttler` + `HttpExceptionFilter` | Rate limiting de endpoints sensibles y sanitización de excepciones de PostgreSQL |
| **Validación & Config** | `Zod` + `class-validator` + `class-transformer` | Validación Fail-Fast de variables de entorno al arranque y DTOs HTTP |
| **Tipos Compartidos & FSM** | `@citassistema/shared-types` | Contratos estrictos (`ClinicalVitals`), parser NLP compartido y máquinas de estado formales |
| **Base de Datos** | `PostgreSQL 16+` (`pg` Pool) | Persistencia relacional ACID, advisory locks y 17 migraciones SQL |
| **Autenticación** | `Passport JWT` + `@nestjs/jwt` + `cookie-parser` + `bcrypt` | Access Token en memoria volátil, Refresh Token en cookie `HttpOnly` rotativo y hash seguro |
| **Pruebas Backend** | `Jest 29` + `Supertest 7` | 23 suites unitarias (172 tests) + 2 suites E2E contra PostgreSQL real (35 tests) |
| **Pruebas Frontend** | `Vitest 3` + `Testing Library` + `jsdom` + `Puppeteer` | 33 suites Vitest (202 tests con 0 warnings) + Smoke Test E2E en navegador Chromium real |
| **Calidad de Código** | `ESLint 9` + `typescript-eslint 8` + `Prettier 3` | Linting estricto (`--max-warnings=0`) y formato uniforme en todo el monorepo |

---

## 6. 🗄️ Base de Datos, Migraciones y Datos Demo

El esquema relacional se gestiona mediante **17 migraciones SQL secuenciales** con tabla de seguimiento `_migrations` (`apps/backend/src/database/migrate.ts`) y **2 scripts de semillas**:

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
│   ├── 013_performance_and_security_indexes.sql     # Índices compuestos para consultas frecuentes y aislamiento
│   ├── 014_pain_map_points.sql                      # Puntos anatómicos de dolor 2D/3D por consulta o sesión
│   ├── 015_password_reset_tokens.sql                # Tokens seguros de recuperación de contraseña
│   ├── 016_clinical_knowledge.sql                   # Protocolos clínicos CIE-10 y guías médicas IA por sede
│   └── 017_clinical_voice_admin.sql                 # Vademécum, macros de voz, wake-word ("Chanfainita") y auditoría de alertas
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

# Autenticación JWT (Obligatorio cambiar en NODE_ENV=production; validado por Zod)
JWT_SECRET=change-this-in-production-min-16-chars
JWT_REFRESH_SECRET=change-this-refresh-secret-in-production

# Proveedor IA Opcional (Groq LLM para Asistente Clínico de Voz)
GROQ_API_KEY=

# Aplicación
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173,http://localhost:5300
```

### 3. Levantar PostgreSQL (opcional con Docker)
```bash
docker compose -f db/docker/docker-compose.yml up -d
```

### 4. Ejecutar migraciones y semillas
```bash
# Aplicar las 17 migraciones SQL en orden
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
| `npm run build:frontend` | Verifica TypeScript (`tsc --noEmit`) y construye el bundle Vite de producción |
| `npm test` | Ejecuta las suites unitarias de Backend y Frontend |
| `npm run test:all` | Ejecuta Backend Unit + Backend E2E (PostgreSQL) + Frontend (Vitest) |
| `npm run test:backend` | Ejecuta las 23 suites unitarias, de seguridad y regresión en Jest |
| `npm run test:e2e` | Ejecuta las 35 pruebas E2E contra PostgreSQL real |
| `npm run test:frontend` | Ejecuta las 33 suites (202 tests) de componentes e integración en Vitest |
| `npm run test:e2e:browser` | Ejecuta el Smoke Test E2E en navegador Chromium real (Landing, Consulta Médica y Admin IA) |
| `npm run lint` | Ejecuta ESLint (`--max-warnings=0`) en backend y frontend |
| `npm run format` | Formatea el monorepo con Prettier |
| `npm run db:migrate` | Aplica migraciones SQL pendientes |
| `npm run db:seed` | Ejecuta los archivos de datos semilla |
| `npm run db:reset` | Reinicia el esquema de base de datos |

### Estado Verificado de la Suite de Pruebas

```text
✓ Backend Unit (Jest):        23 test suites passed | 172 tests passed (100%)
✓ Backend E2E (PostgreSQL):    2 test suites passed |  35 tests passed (100%)
✓ Frontend (Vitest):          33 test files passed  | 202 tests passed (100%, 0 warnings)
✓ Browser E2E (Chromium):      3 real user flows    |   3 flows passed (0 runtime errors, 0 404s)
───────────────────────────────────────────────────────────────────────────────────────────────
✓ Total Automatizado:         58 suites             | 409 tests PASSED + 3 Browser E2E Flows
```

---

## 9. 🔐 Seguridad, Multi-Tenancy y Cumplimiento

- **Validación Fail-Fast de Entorno (`env.schema.ts`)**:
  - Al iniciar el backend, Zod valida todas las variables críticas. En `NODE_ENV=production`, el servidor rechaza iniciar si faltan secretos o si se detectan claves JWT por defecto.
- **Aislamiento Multi-Tenant (`TenantMiddleware` + `TenantGuard`) y Anti-IDOR (`assertPatientOwnership`)**:
  - Todo usuario autenticado queda vinculado al `clinicId` firmado en su JWT.
  - Los usuarios con rol `PACIENTE` solo pueden acceder o modificar recursos clínicos cuyo `patientId` coincida con el de su sesión autenticada (`403 Forbidden` ante intentos de acceso cruzado).
- **Autorización RBAC (`JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`)**:
  - 5 roles base y permisos granulares definidos en `SystemPermission`.
- **Defensa en Profundidad Anti-XSS (Token Architecture)**:
  - Access Token residente exclusivamente en la memoria volátil de React (`storage.ts`), inaccesible para scripts maliciosos.
  - Refresh Token emitido en cookie con directivas `HttpOnly`, `Secure` y `SameSite=Lax`, blindando la sesión contra robo por XSS y mitigando CSRF.
  - Endpoint `POST /api/auth/refresh` con rotación obligatoria de token y revocación persistente en base de datos.
- **Protección Criptográfica**:
  - Contraseñas hasheadas con `bcrypt` (10 rounds).
  - Tokens JWT con rotación de Refresh Tokens y revocación persistente (`008_auth_refresh_tokens.sql`).
  - Webhooks de pago validados mediante `HMAC-SHA256` y `crypto.timingSafeEqual`.
- **Integridad Clínica y Normativa**:
  - Historias clínicas cronológicas sin sobreescritura destructiva y trazabilidad de cambios en `audit_logs`, `clinical_alert_logs` y `appointment_status_history`.
  - Flujos de consentimiento informado y protección de datos personales alineados a la **Ley N.° 29733 (Perú)**.

---

## 10. 📚 Mapa de Documentación del Proyecto

| Documento | Contenido |
| :--- | :--- |
| 📘 [`DOCUMENTO_MAESTRO.md`](./DOCUMENTO_MAESTRO.md) | 113 directrices de producto, arquitectura, dominio y reglas de negocio. |
| 📖 [`GLOSSARY.md`](./GLOSSARY.md) | Glosario oficial de lenguaje ubicuo del dominio clínico y operativo. |
| 🏛️ [`docs/adr/`](./docs/adr/) | Registros de Decisiones de Arquitectura (ADR 001 Parser NLP Único, ADR 002 Dominio Tipado & Fail-Fast Env). |
| 🗺️ [`ROADMAP.md`](./ROADMAP.md) | Matriz de dependencias de las fases de implementación y Gates de Evidencia. |
| 🛡️ [`DIRECTIVA_GENTLE_AI.md`](./DIRECTIVA_GENTLE_AI.md) | Metodología SDD/TDD, niveles de prueba obligatorios y Definition of Done. |
| ⚙️ [`.env.example`](./.env.example) | Plantilla oficial de variables de entorno del monorepo. |

---

<p align="center">
  <strong>© 2026 CitasSistema</strong> — Plataforma SaaS Clínica & Gestión Médica Multi-Tenant.
</p>

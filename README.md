# CitasSistema

Plataforma SaaS multi-tenant marca blanca para la gestión integral de clínicas médicas y centros de rehabilitación física, diseñada para médicos, fisioterapeutas, personal de recepción, administradores y pacientes.

<p align="center">
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Tests-409%2F409%20Passing-10b981?style=flat-square&logo=vitest&logoColor=white" alt="Tests Passing" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Backend-NestJS%2011%20%2B%20TS%205.7-e0234e?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 11" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%206-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Database-PostgreSQL%2016+-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16+" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Security-HttpOnly%20Cookies%20%7C%20Anti--XSS-8b5cf6?style=flat-square" alt="Security" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/License-Proprietary-blue?style=flat-square" alt="Licencia" /></a>
  <a href="#inicio-rápido"><img src="https://img.shields.io/badge/Demo-Local%20%26%20Docker-brightgreen?style=flat-square&logo=docker&logoColor=white" alt="Demo Disponible" /></a>
</p>

---

## Qué hace

**CitasSistema** digitaliza y centraliza el flujo operativo, clínico y financiero de centros de salud ambulatorios y de rehabilitación:

- **Portal Público y Reserva de Citas en Línea:** Flujo asistido de agendamiento con selección de sede, especialidad, servicio y profesional médico; visualización de bloques de horarios disponibles en tiempo real; autocompletado de datos del paciente mediante consulta de DNI (Decolecta / RENIEC); protección anti-bot con Cloudflare Turnstile; y emisión de comprobante digital inmediato con opción de pago en línea o pago presencial en recepción.
- **Prevención Atómica de Dobles Reservas (Zero Double-Booking):** Serialización transaccional mediante bloqueos consultivos a nivel de motor PostgreSQL (`pg_advisory_xact_lock`) sobre el profesional y fecha de consulta, garantizando cero colisiones ante peticiones concurrentes simultáneas.
- **Recepción, Admisión y Triaje en Tiempo Real:** Tablero interactivo (Kanban) para el personal de admisión, registro de llegada del paciente en 1 clic (check-in), cobro presencial en ventanilla y validación de consentimientos informados.
- **Historia Clínica Electrónica (HCE) Especializada:** Registro cronológico estructurado, anamnesis, antecedentes clínicos, toma de signos vitales tipados, diagnósticos estandarizados CIE-10, medición de dolor mediante escala visual analógica EVA (0–10) y sesiones de tratamiento/fisioterapia.
- **Mapeo Anatómico del Dolor 2D/3D:** Exploración corporal jerárquica con más de 170 puntos anatómicos (segmentos óseo-musculares, puntos gatillo y lateralidad) junto con un visor 3D interactivo en Three.js con carga dinámica bajo demanda.
- **Asistente Clínico de Voz Bilateral ("Chanfainita"):** Asistente ambiental que procesa el diálogo médico-paciente durante la consulta médica, autocompleta los campos de la historia clínica en pantalla, preselecciona insumos de consumo médico y genera una explicación en lenguaje claro para el paciente lista para enviar por WhatsApp.
- **Módulo de Caja Chica (POS) y Arqueo:** Apertura de turnos con saldo inicial, registro de ingresos (efectivo, Yape/Plin, transferencias, tarjetas POS), egresos operativos, balance de saldo en tiempo real y conciliación estricta de cierre con arqueo físico.
- **Control de Inventario Kardex con Deducción Automática:** Catálogo de productos e insumos médicos, alertas de stock mínimo, registro detallado de movimientos de entrada/salida y descuento automático de insumos al completar cada atención médica.
- **Arquitectura Orientada a Eventos:** Desacoplamiento asíncrono con `@nestjs/event-emitter` para el envío de correos transaccionales (Resend / Brevo) y notificaciones de agenda a profesionales mediante Bot de Telegram sin demorar la respuesta HTTP al usuario.
- **SaaS Marca Blanca Dinámico (White-Label):** Gobernanza multi-sede que permite a cada clínica configurar su propio logotipo, paleta corporativa de colores, eslogan, nombre de asistente virtual y control de activación/suspensión desde el panel SuperAdmin.
- **Control de Acceso Basado en Roles (RBAC):** 5 portales con permisos granulares para Super Administrador, Administrador de Clínica, Médico Especialista, Recepción y Paciente.

---

## Arquitectura (diagrama + enlace a docs/ARCHITECTURE.md)

El sistema está construido como un **Monolito Modular con Clean Architecture pragmática** en el backend (`apps/backend`) y una **Single Page Application (SPA)** en el frontend (`apps/frontend`), coordinados a través de contratos tipados comunes en `@citassistema/shared-types` (`packages/shared-types`).

```mermaid
flowchart TB
    subgraph CLIENTS ["🖥️ Clientes y Canales de Entrada"]
        WEB_PUB["🌐 Landing Pública y Wizard de Reserva (6 pasos)"]
        PORTAL_PAC["👤 Portal y Dashboard del Paciente"]
        PORTAL_MED["👨‍⚕️ Dashboard Médico, HCE, PainMap 2D/3D & Chanfainita IA"]
        PORTAL_REC["📋 Dashboard de Recepción (Kanban, Admisión & Caja)"]
        PORTAL_ADM["📊 Dashboard Admin de Clínica y SuperAdmin Global"]
    end

    subgraph GATEWAY ["🛡️ Capa HTTP, Seguridad y Contexto (NestJS 11)"]
        ENV_ZOD["⚡ Zod Fail-Fast Env Validator (env.schema.ts)"]
        CORS_SEC["🔒 CORS con Credentials y Whitelist"]
        THROTTLER["⏱️ Rate Limiting (@nestjs/throttler)"]
        AUTH_GUARD["🔑 JwtAuthGuard (Access Token en memoria volátil)"]
        COOKIE_PARSER["🍪 Cookie Parser (Refresh Token HttpOnly)"]
        TENANT_GUARD["🏢 TenantGuard + Anti-IDOR PatientOwnership"]
        RBAC_GUARD["🛡️ RolesGuard & PermissionsGuard"]
        EXC_FILTER["🛡️ HttpExceptionFilter (Sanitización Postgres 23505/23503)"]
    end

    subgraph BUSINESS ["📦 Módulos de Dominio (Monolito Modular NestJS)"]
        CORE_MOD["🔐 Auth · 🩺 Health · 🏛️ Admin Clinics (Multi-Tenant)"]
        CAT_MOD["🏥 Specialties · Services · Professionals · Schedules"]
        APPT_MOD["📅 Appointments (Motor FSM + pg_advisory_xact_lock)"]
        CLIN_MOD["📋 Patients · Clinical (HCE, EVA, PainMap 2D/3D, Prescriptions)"]
        VOICE_MOD["🎙️ Voice Assistant 'Chanfainita' (Groq/Gemini/OpenRouter/Local)"]
        FIN_MOD["💳 Payments (Idempotency) · 💵 Cash Sessions · 📦 Inventory Kardex"]
        EVENT_BUS["📢 EventEmitter2 (@nestjs/event-emitter)"]
    end

    subgraph EXTERNAL ["🌐 Servicios Externos e Integraciones"]
        RENIEC["🆔 DNI Lookup (Decolecta / RENIEC API)"]
        RESEND["✉️ Resend / Brevo (Email Transaccional)"]
        TG_BOT["🤖 Telegram Bot API"]
        LLM_APIS["🧠 LLMs (Groq LPU / Google Gemini / OpenRouter)"]
        TURNSTILE["🛡️ Cloudflare Turnstile (Anti-Bot)"]
    end

    subgraph STORAGE ["🗄️ Persistencia de Datos"]
        POOL["⚡ DatabaseService (pg.Pool Connection Pooler)"]
        PG_DB[("🐘 PostgreSQL 16+\n17 Migraciones DDL + Seeds\nAdvisory Locks & Índices B-Tree")]
    end

    CLIENTS --> GATEWAY
    GATEWAY --> BUSINESS
    BUSINESS --> STORAGE
    BUSINESS --> EVENT_BUS
    EVENT_BUS --> EXTERNAL
    VOICE_MOD --> LLM_APIS
    APPT_MOD --> TURNSTILE
    CLIN_MOD --> RENIEC
```

> 📖 Para un análisis exhaustivo de componentes, patrones de diseño, flujos transaccionales y decisiones de ingeniería, consulta [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Inicio rápido

### 1. Requisitos Previos

- **Node.js:** Versión `>= 20.0.0`
- **npm:** Versión `>= 10.0.0`
- **Docker y Docker Compose** (o PostgreSQL 16+ instalado localmente)

### 2. Clonación e Instalación de Dependencias

```bash
git clone https://github.com/Alessander9/SistemaCitas_ok.git
cd SistemaCitas_ok
npm install
```

### 3. Levantar la Base de Datos con Docker

```bash
docker compose -f db/docker/docker-compose.yml up -d
```

_(Inicia PostgreSQL 16 en el puerto 5432 para desarrollo y en el puerto 5433 para pruebas)._

### 4. Configurar Variables de Entorno

```bash
cp .env.example .env
```

_(Verifica que los valores de `.env` coincidan con tus credenciales locales)._

### 5. Ejecutar Migraciones DDL y Datos Semilla

```bash
# Aplica las 17 migraciones en orden secuencial
npm run db:migrate

# Carga clínicas demo, especialidades, servicios, agendas y usuarios
npm run db:seed
```

### 6. Iniciar Servidores de Desarrollo

Abre dos terminales para arrancar el entorno en caliente:

```bash
# Terminal 1 — Backend NestJS (expone API en http://localhost:3000/api)
npm run dev:backend

# Terminal 2 — Frontend React 19 + Vite (disponible en http://localhost:5173 o 5300)
npm run dev:frontend
```

### 7. Cuentas Demo Preconfiguradas (Contraseña común: `Password123!`)

| Rol de Usuario                 | Correo Electrónico           | Acceso / Funcionalidad Principal                             |
| :----------------------------- | :--------------------------- | :----------------------------------------------------------- |
| **Super Administrador Global** | `superadmin@citassistema.pe` | Gestión multi-sede, creación de clínicas y métricas globales |
| **Director / Admin Clínica**   | `admin@clinica.pe`           | Operación de sede, finanzas, kardex y personal médico        |
| **Médico Especialista**        | `doctor@clinica.pe`          | Consulta clínica, HCE, PainMap 3D y asistente Chanfainita    |
| **Recepción y Admisión**       | `recepcion@clinica.pe`       | Tablero Kanban, triaje, check-in y cobro en caja chica       |
| **Portal de Paciente**         | `paciente@clinica.pe`        | Historial de citas, recetas médicas y comprobantes           |

---

## Configuración (.env.example)

El archivo [`.env.example`](./.env.example) centraliza las variables de configuración del sistema, validadas estrictamente al arranque mediante Zod (`src/config/env.schema.ts`):

```env
# =============================================================================
# Base de Datos PostgreSQL (Pool de Conexiones)
# =============================================================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citassistema
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5432/citassistema_test
DB_POOL_MAX=20

# =============================================================================
# Supabase (Storage para Documentos y Prescripciones)
# =============================================================================
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=documents

# =============================================================================
# Seguridad JWT (Tokens Validados con Zod; cambiar en producción)
# =============================================================================
JWT_SECRET=change-this-in-production
JWT_REFRESH_SECRET=change-this-refresh-secret-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# =============================================================================
# Servidor HTTP y Orígenes CORS
# =============================================================================
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5300

# =============================================================================
# Cloudflare Turnstile (Protección Anti-Bot en Reserva Pública)
# =============================================================================
CLOUDFLARE_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# =============================================================================
# Servicio de Correos Resend (Notificaciones Transaccionales)
# =============================================================================
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Clínica VitalSalud <onboarding@resend.dev>
CLINIC_NOTIFICATION_EMAIL=contacto@clinica.pe

# =============================================================================
# Consulta de DNI (Decolecta / RENIEC API)
# =============================================================================
DNI_API_TOKEN=your_decolecta_token_here

# =============================================================================
# Motores de Inteligencia Artificial (Asistente Clínico de Voz "Chanfainita")
# Cascada multi-proveedor con fallback tolerante a fallos
# =============================================================================
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## Modelos y datos usados

### 1. Modelos de Base de Datos (PostgreSQL DDL)

El esquema relacional cuenta con 17 migraciones DDL con restricciones de clave foránea, índices B-Tree e integridad referencial:

- **Gobernanza y Tenancy:** `clinics` (datos de sede y configuración de marca blanca JSONB), `users`, `roles`, `permissions`, `role_permissions`.
- **Catálogo Clínico y Agendas:** `specialties`, `services` (precios y duraciones en minutos), `professionals`, `schedules` (bloques horarios semanales), `schedule_overrides` (bloqueos por feriado o vacaciones).
- **Gestión de Pacientes y Citas:** `patients` (datos demográficos, DNI y contactos), `appointments` (registro transaccional con FSM), `appointment_status_history` (auditoría cronológica de estados).
- **Historia Clínica y Dolor:** `clinical_records` (anamnesis, constantes vitales, diagnóstico y plan), `pain_map_points` (coordenadas anatómicas 2D/3D con lateralidad), `treatments`, `treatment_sessions`, `prescriptions` (receta farmacológica), `clinical_knowledge` (corpus médico institucional).
- **Finanzas y Logística:** `cash_sessions` (turnos y arqueos), `cash_transactions` (cobros y pagos), `inventory_products` (catálogo y stock), `inventory_movements` (Kardex detallado).
- **Seguridad y Auditoría:** `auth_refresh_tokens` (hashes de refresh tokens), `password_resets` (tokens de recuperación con caducidad).

### 2. Modelos de Inteligencia Artificial & NLP

El asistente clínico **Chanfainita** y el widget de orientación al paciente implementan una cascada de inferencia clínica con guardrails normativos:

- **Groq LPU (`openai/gpt-oss-120b`):** Inferencia de ultra-baja latencia (< 500 ms) para estructurar el dictado de la consulta médica en tiempo real en campos JSON conformes a la HCE.
- **Google Gemini 3.8 Flash (`gemini-3.8-flash`):** Extracción clínica estructurada de alta precisión con temperatura 0.1 y soporte para historiales de contexto clínico amplio.
- **OpenRouter AI:** Gateway de respaldo para distribución de carga y alta disponibilidad.
- **Motor Clínico Local Determinístico ("Chanfainita"):** Analizador léxico con expresiones regulares entrenadas en terminología médica que garantiza operatividad sin conexión a internet ni consumo de saldo API.
- **Codificador Silencioso CIE-10:** Motor de matching contextual que traduce diagnósticos en texto natural a códigos estandarizados CIE-10 (ej. _M54.5 Lumbago no especificado_, _S83.5 Esguince de rodilla_).
- **Guardrail de Contención Médica:** Reglas de validación estricta que impiden que el chatbot público emita prescripciones o diagnósticos sin supervisión médica, escalando automáticamente a citas presenciales o WhatsApp.

### 3. Datos Semilla (Datasets & Seeds)

- **Especialidades:** Fisioterapia y Rehabilitación, Odontología, Medicina General y Traumatología.
- **Catálogo de Servicios:** Consultas iniciales, terapias manuales, sesiones de magnetoterapia, profilaxis dental y curaciones con tarifas y tiempos preconfigurados.
- **Atlas Anatómico:** Más de 170 puntos corporales mapeados con jerarquía músculo-esquelética y lateralidad (anterior/posterior/derecha/izquierda).
- **Insumos para Kardex:** Vendas elásticas, gel para ultrasonido, gasas estériles, agujas de punción seca y alcohol medicinal con umbrales mínimos de stock configurados.

---

## Evaluación y resultados

La integridad funcional y la resistencia técnica de la plataforma han sido verificadas exhaustivamente:

- **100% de Pruebas Automatizadas Aprobadas (409 tests):**
  - **Backend Unitario (Jest):** 23 suites y 172 pruebas unitarias con cobertura de servicios de dominio, guards RBAC, tenant isolation, validación Zod y FSM.
  - **Backend E2E (PostgreSQL Real):** 2 suites y 35 pruebas de integración transaccional verificando la serialización de `pg_advisory_xact_lock`, rotación de refresh tokens e idempotencia de pagos.
  - **Frontend Unitario y de Componentes (Vitest):** 33 suites y 202 pruebas de componentes verificando el wizard de reserva en 6 pasos, dashboards por rol, mapa de dolor anatómico y renderizado reactivo.
  - **Smoke Test E2E en Navegador Real (Puppeteer + Chromium):** Verificación de punta a punta de flujos de agendamiento público, admisión en recepción y evolución clínica médica.
- **Calidad de Código y Estándares:** Cero errores y cero advertencias bajo ESLint estricto (`--max-warnings=0`).
- **Optimización de Empaquetado Frontend:** Bundle principal optimizado por debajo de 500 kB gracias a code splitting manual (`manualChunks`) en Vite para Three.js y dependencias pesadas.

---

## Seguridad y limitaciones conocidas

### Mecanismos de Seguridad Implementados

- **Arquitectura de Tokens Anti-XSS (Gold Standard):** El `access_token` JWT se retiene únicamente en la memoria de la aplicación React (`AuthContext`), mientras que el `refresh_token` se transporta en una Cookie HTTP `HttpOnly; Secure; SameSite=Lax`. Las recargas de página (`F5`) renuevan el token automáticamente mediante Silent Refresh sin exponer credenciales en `localStorage`.
- **Aislamiento Multi-Tenant & Anti-IDOR:** Toda consulta a la base de datos se filtra por `clinic_id` mediante `TenantGuard`. El helper `assertPatientOwnership` valida la titularidad de los historiales clínicos impidiendo el acceso cruzado entre clínicas o pacientes no autorizados.
- **Protección ante Condiciones de Carrera:** Bloqueos consultivos transaccionales (`pg_advisory_xact_lock`) en PostgreSQL que imposibilitan dobles reservas en el mismo intervalo.
- **Control de Tasa (Rate Limiting):** `@nestjs/throttler` configurado en endpoints de autenticación, reservas públicas y consulta de DNI para mitigar ataques de denegación de servicio y fuerza bruta.
- **Sanitización de Errores de Base de Datos:** `HttpExceptionFilter` intercepta códigos nativos de PostgreSQL (como `23505` de clave duplicada y `23503` de llave foránea) para no filtrar metadatos de la estructura de tablas.
- **Fail-Fast Environment:** Zod valida cada variable de entorno al arrancar el servidor; si falta alguna clave obligatoria, el proceso se detiene inmediatamente con un diagnóstico claro.

### Limitaciones Conocidas

- **Facturación Electrónica SUNAT:** El sistema administra transacciones de caja chica, arqueos y métodos de cobro, pero no implementa de forma nativa la firma digital de comprobantes XML con SUNAT (requiere integración con un Proveedor de Servicios Electrónicos OSE/PSE como Nubefact).
- **Firma Digital PKI para Fármacos Controlados:** La receta médica se emite en PDF estructurado con el número de colegiatura del profesional para su envío por WhatsApp; sin embargo, no incluye firma digital con certificado digital acreditado si la regulación local exige receta especial retenida para psicotrópicos.

---

## Costos y rendimiento

- **Rendimiento de Endpoints (Latencia):** P95 < 50 ms en consultas transaccionales gracias al uso de índices B-Tree optimizados en PostgreSQL y desacoplamiento asíncrono de notificaciones.
- **Latencia de Inferencia IA:** < 500 ms con Groq LPU (`openai/gpt-oss-120b`) y < 1.2 s con Google Gemini 3.8 Flash.
- **Estimación de Costos de Infraestructura Cloud:**
  - **Nivel Inicial / Micro-SaaS:** $0 a $15 USD/mes utilizando PostgreSQL gestionado (ej. Supabase o Railway) y hosting estático para la SPA en Vercel o Cloudflare Pages.
  - **Nivel Producción Multi-Sede:** $25 a $60 USD/mes para albergar hasta 25 clínicas concurrentes con réplicas de lectura, backups automáticos y pool de conexiones dedicado.
- **Costo de Consumo de IA:** El sistema prioriza el motor local determinístico de costo cero ($0) y optimiza los prompts a menos de 1,000 tokens por consulta, manteniendo el costo de inferencia por debajo de $0.001 USD por cita procesada.

---

## Estructura del proyecto

```text
SistemaCitas_ok/
├── apps/
│   ├── backend/                      # API REST NestJS 11 + TypeScript 5.7
│   │   ├── src/
│   │   │   ├── common/               # Guards (Tenant, Roles), Filtros, Anti-IDOR
│   │   │   ├── config/               # Validación de entorno con Zod (env.schema.ts)
│   │   │   ├── database/             # Servicio pg.Pool, migraciones DDL y semillas
│   │   │   └── modules/              # 16 módulos de dominio (Auth, Appts, Clinical, etc.)
│   │   └── test/                     # Suites de tests unitarios (Jest) y E2E (Postgres)
│   └── frontend/                     # SPA React 19 + Vite 6 + Tailwind 4
│       ├── src/
│       │   ├── components/           # UI, Booking Wizard, Clinical, 3D PainMap
│       │   ├── context/              # AuthContext (Token en memoria), Branding, Theme
│       │   ├── pages/                # Vistas públicas y Dashboards por rol
│       │   ├── services/             # Adaptadores de llamadas a la API REST
│       │   └── utils/                # Almacenamiento seguro, helpers de audio y fecha
│       └── package.json
├── packages/
│   └── shared-types/                 # Modelos tipados compartidos, FSM y NLP Parser
├── db/
│   ├── docker/docker-compose.yml     # Orquestación de PostgreSQL 16 (dev y test)
│   ├── migrations/                   # 17 archivos de migración DDL secuenciales
│   └── seeds/                        # Scripts SQL de datos de prueba médicos
├── docs/
│   ├── ARCHITECTURE.md               # Documentación formal de arquitectura
│   ├── FLUJOS_OPERACIONALES_Y_REGLAS_DE_NEGOCIO.md # Reglas operativas detalladas
│   ├── GLOSSARY.md                   # Glosario de términos del dominio
│   ├── ROADMAP.md                    # Hoja de ruta del producto
│   └── adr/                          # Registros de decisiones arquitectónicas (ADRs)
├── scripts/                          # Scripts de auditoría de seguridad y pruebas E2E
├── package.json                      # Configuración de workspaces monorepo
└── LICENSE                           # Licencia de uso del software
```

---

## Tests

Para ejecutar las diferentes suites de pruebas automáticas del monorepo:

```bash
# Ejecutar todas las pruebas unitarias (Backend Jest + Frontend Vitest)
npm test

# Ejecutar pruebas unitarias de backend
npm run test:backend

# Ejecutar pruebas unitarias de frontend
npm run test:frontend

# Ejecutar pruebas E2E contra base de datos PostgreSQL real
npm run test:e2e

# Ejecutar smoke test automatizado en navegador Chromium real
npm run test:e2e:browser

# Ejecutar verificación estricta de linting (0 advertencias permitidas)
npm run lint

# Escanear el repositorio en búsqueda de secretos expuestos
npm run security:scan
```

---

## Documentación adicional

- 🏛️ [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): Especificación detallada de arquitectura, modelos y decisiones de diseño.
- 📋 [`docs/FLUJOS_OPERACIONALES_Y_REGLAS_DE_NEGOCIO.md`](./docs/FLUJOS_OPERACIONALES_Y_REGLAS_DE_NEGOCIO.md): Guía de flujos operacionales y reglas de negocio.
- 📘 [`DOCUMENTO_MAESTRO.md`](./DOCUMENTO_MAESTRO.md): Especificación funcional exhaustiva con 113 directrices de negocio.
- 📖 [`GLOSSARY.md`](./GLOSSARY.md): Glosario de lenguaje ubicuo del dominio médico, clínico y administrativo.
- 🗺️ [`ROADMAP.md`](./ROADMAP.md): Hoja de ruta, fases de entrega y definición de puertas de calidad.
- 🛡️ [`DIRECTIVA_GENTLE_AI.md`](./DIRECTIVA_GENTLE_AI.md): Metodología de desarrollo guiado por especificaciones y Definition of Done.
- 📝 [`docs/adr/001-architecture-and-security-decisions.md`](./docs/adr/001-architecture-and-security-decisions.md): ADR sobre tokens en memoria, cookies seguras y advisory locks.
- 📝 [`docs/adr/002-typed-domain-and-fail-fast-env.md`](./docs/adr/002-typed-domain-and-fail-fast-env.md): ADR sobre validación fail-fast con Zod y dominio tipado compartido.

---

## Contribuir · Licencia · Contacto

### Contribuir

Las contribuciones, reportes de incidencias y propuestas de mejora se gestionan a través de solicitudes de extracción (_Pull Requests_):

1. Crea una rama descriptiva para tu función o corrección (`git checkout -b feature/nueva-mejora`).
2. Asegúrate de que todo el código cumpla con los estándares de estilo y pase el 100% de los tests (`npm run lint && npm test`).
3. Envía tu Pull Request detallando los cambios introducidos y la evidencia de pruebas.

### Licencia

Este software está protegido bajo su respectiva licencia de autor propietaria. Para más información legal y términos de uso, consulta el archivo [`LICENSE`](./LICENSE):

> _Copyright (c) 2026 Luis Alexander Fernández Paz. Todos los derechos reservados. Queda prohibida la reproducción, distribución o explotación comercial no autorizada sin el consentimiento expreso del titular._

### Contacto

- **Autor:** Luis Alexander Fernández Paz
- **Correo Electrónico:** [Luisalexanderfp91@gmail.com](mailto:Luisalexanderfp91@gmail.com)
- **GitHub:** [@Alessander9](https://github.com/Alessander9)
- **LinkedIn:** [linkedin.com/in/alexanderfp91](https://linkedin.com/in/alexanderfp91)
- **Ubicación:** Lima, Perú

# CitasSistema

Plataforma SaaS multi-tenant marca blanca para gestión integral de clínicas médicas, historia clínica electrónica con asistente de voz bilateral, prevención atómica de dobles reservas y control financiero de caja chica e inventario Kardex.

<p align="center">
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Tests-409%2F409%20Passing-10b981?style=flat-square&logo=vitest&logoColor=white" alt="Tests Passing" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Backend-NestJS%2011%20%2B%20TS%205.7-e0234e?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 11" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%206-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Database-PostgreSQL%2016+-4169e1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16+" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Security-HttpOnly%20Cookies%20%7C%20Anti--XSS-8b5cf6?style=flat-square" alt="Security" /></a>
  <a href="https://github.com/Alessander9/SistemaCitas_ok"><img src="https://img.shields.io/badge/Demo-Local%20%26%20Docker-blue?style=flat-square" alt="Demo" /></a>
</p>

---

## Qué hace

CitasSistema digitaliza y unifica el ciclo completo de atención ambulatoria en clínicas de fisioterapia, medicina general, odontología y centros médicos especializados:

* **Portal Público y Reserva en 6 Pasos:** Asistente interactivo de autogestión de citas con selección de sede, especialidad, médico, fecha/horario en tiempo real, lookup por DNI y comprobante digital inmediato.
* **Cero Dobles Reservas:** Bloqueo transaccional a nivel de motor PostgreSQL (`pg_advisory_xact_lock`) que impide colisiones de horario bajo concurrencia extrema.
* **Recepción y Triaje en Tiempo Real:** Tablero Kanban para admisiones, check-in en un clic y cobro presencial en ventanilla.
* **Historia Clínica Electrónica (HCE) Modular:** Registro cronológico estructurado, signos vitales tipados, diagnósticos CIE-10 y evolución clínica con escala EVA (0–10).
* **Mapeo Anatómico del Dolor 2D/3D:** Exploración corporal jerárquica con más de 170 puntos clínicos y visor 3D interactivo en Three.js cargado bajo demanda.
* **Asistente Clínico de Voz Bilateral ("Chanfainita"):** Escucha ambiental no invasiva que autocompleta la ficha médica, preselecciona insumos de consumo y genera un resumen en lenguaje amigable para el paciente listo para enviar por WhatsApp.
* **Caja Chica (POS) e Inventario Kardex:** Apertura de caja con arqueo, control de ingresos/egresos, conciliación de cierre y deducción automática de insumos médicos.
* **SaaS Marca Blanca Dinámico:** Cada clínica cuenta con su propio logotipo, paleta de colores CSS, asistente IA personalizado y switch de suspensión por sede en el panel SuperAdmin.

---

## Arquitectura (diagrama + enlace a docs/ARCHITECTURE.md)

El sistema utiliza un **Monolito Modular con Clean Architecture pragmática** en el backend (`apps/backend`) y una **Single Page Application (SPA)** en el frontend (`apps/frontend`), sincronizados por `@citassistema/shared-types`.

```mermaid
flowchart TB
    subgraph FRONTEND ["Frontend SPA (React 19 + Vite 6 + Tailwind 4)"]
        BOOKING["Wizard de Citas (6 Pasos)"]
        CLINICAL_UI["Consulta Médica & PainMap 3D"]
        RECEPTION_UI["Tablero de Recepción & Caja"]
        ADMIN_UI["Dashboard Sede & SuperAdmin"]
    end

    subgraph SECURITY ["Capa de Transporte & Seguridad (NestJS 11)"]
        THROTTLER["Rate Limiting (@nestjs/throttler)"]
        CORS_MW["CORS con Credentials"]
        AUTH_MW["JWT Guard + Cookie Parser HttpOnly"]
        TENANT_MW["TenantGuard + Anti-IDOR PatientOwnership"]
    end

    subgraph BUSINESS ["Servicios de Dominio & Eventos"]
        APPT_SRV["Appointments (FSM + pg_advisory_xact_lock)"]
        CLIN_SRV["Clinical & Voice Parser"]
        EVENT_BUS["EventEmitter (@nestjs/event-emitter)"]
        NOTIF_LISTENER["Listener Brevo Email & Telegram"]
    end

    subgraph STORAGE ["Persistencia ACID (PostgreSQL 16+)"]
        PG_POOL["DatabaseService (pg.Pool)"]
        DB_TABLES[("17 Migraciones DDL + Seeds")]
    end

    FRONTEND --> SECURITY
    SECURITY --> BUSINESS
    BUSINESS --> EVENT_BUS
    EVENT_BUS --> NOTIF_LISTENER
    BUSINESS --> STORAGE
```

> 📖 Para una revisión detallada de las capas, contratos y decisiones de diseño, consulta el documento completo de arquitectura en [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Inicio rápido

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Alessander9/SistemaCitas_ok.git
cd SistemaCitas_ok
npm install
```

### 2. Levantar la base de datos (Docker opcional)
```bash
docker compose -f db/docker/docker-compose.yml up -d
```

### 3. Ejecutar migraciones y datos de prueba
```bash
npm run db:migrate
npm run db:seed
```

### 4. Iniciar servidores de desarrollo
```bash
# Terminal 1 — Backend NestJS (/api en puerto 3000)
npm run dev:backend

# Terminal 2 — Frontend React + Vite (puerto 5173 con proxy automático)
npm run dev:frontend
```

### 5. Cuentas demo preconfiguradas (Contraseña común: `Password123!`)
* **Super Admin Global:** `superadmin@citassistema.pe`
* **Director / Admin Clínica:** `admin@clinica.pe`
* **Médico Especialista:** `doctor@clinica.pe`
* **Recepción y Admisión:** `recepcion@clinica.pe`
* **Portal de Paciente:** `paciente@clinica.pe`

---

## Configuración (.env.example)

Copia el archivo [`.env.example`](./.env.example) a `.env` en la raíz del proyecto y ajusta las variables:

```env
# Conexión a Base de Datos PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/citassistema
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5433/citassistema_test
DB_POOL_MAX=20

# Seguridad JWT (Validados por Zod al arranque; obligatorio cambiar en producción)
JWT_SECRET=change-this-in-production-min-16-chars
JWT_REFRESH_SECRET=change-this-refresh-secret-in-production

# Proveedor de Inteligencia Artificial (Opcional - Groq LLM)
GROQ_API_KEY=

# Servidor y Orígenes Permitidos
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173,http://localhost:5300
```

---

## Modelos y datos usados

* **Entidades Relacionales Principales:**
  * `clinics`: Tenancy multi-sede, configuración de marca blanca (JSONB con colores, logos y asistente IA).
  * `users` / `roles` / `permissions`: Modelo RBAC granular con 5 roles base y permisos del sistema.
  * `appointments` / `appointment_status_history`: Registro de reservas, fechas, horas y trazabilidad de cambios de estado.
  * `clinical_records` / `treatments` / `treatment_sessions` / `prescriptions`: Historia clínica estructurada, recetas e indicadores EVA.
  * `pain_map_points`: Coordenadas anatómicas 2D/3D con lateralidad y puntos gatillo.
  * `cash_sessions` / `cash_transactions`: Turnos de caja, arqueos y movimientos de ingresos/egresos.
  * `inventory_products` / `inventory_movements`: Kardex de existencias, umbrales mínimos y motivos de ajuste.
* **Datos Semilla:** Especialidades médicas (Fisioterapia, Odontología, Medicina General, Traumatología), catálogo de servicios con precios y duraciones, profesionales con agendas y usuarios de demostración.

---

## Evaluación y resultados

La plataforma ha sido verificada integralmente mediante suites automatizadas de pruebas en múltiples niveles:

* **100% de Pruebas Unitarias y E2E Aprobadas (409 tests):**
  * **Backend Unit (Jest):** 23 suites y 172 pruebas unitarias sobre servicios, seguridad, FSM y filtros.
  * **Backend E2E (PostgreSQL Real):** 2 suites y 35 pruebas de integración sobre transacciones y concurrencia.
  * **Frontend Unit & Components (Vitest):** 33 suites y 202 pruebas con 0 fallos y 0 advertencias.
  * **Smoke Test en Navegador Real (Puppeteer + Chromium):** 3 flujos de usuario completos ejecutados de punta a punta.
* **Rendimiento de Empaquetado:** Bundle principal de frontend optimizado por debajo de 500 kB mediante división de código en Vite (`manualChunks`).
* **Calidad de Código:** Cero errores y cero advertencias bajo ESLint estricto (`--max-warnings=0`).

---

## Seguridad y limitaciones conocidas

### Mecanismos de Seguridad Implementados
* **Defensa Anti-XSS (Token Architecture):** Access Token almacenado únicamente en memoria volátil de React (`AuthContext`); Refresh Token emitido en cookie con atributos `HttpOnly`, `Secure` y `SameSite=Lax`.
* **Aislamiento Multi-Tenant & Anti-IDOR:** Validación forzada de titularidad en el backend (`TenantGuard`, `assertPatientOwnership`), impidiendo el acceso a historias clínicas de otros pacientes o sedes.
* **Control de Tasa (Rate Limiting):** `@nestjs/throttler` activo en rutas de autenticación y reserva pública.
* **Sanitización de Errores de Base de Datos:** `HttpExceptionFilter` intercepta y enmascara códigos de error de PostgreSQL (como 23505 y 23503) para evitar fugas de estructura interna.
* **Fail-Fast Environment:** Validación estricta de variables con Zod al iniciar el servidor (`env.schema.ts`).

### Limitaciones Conocidas
* **Facturación Electrónica SUNAT:** El sistema gestiona cobros, métodos de pago y arqueo de caja chica, pero no incluye de forma nativa la firma digital de boletas/facturas electrónicas XML (requiere integración con PSE/OSE como Nubefact).
* **Firma Digital de Recetas para Psicotrópicos:** La receta se emite en PDF y se envía por WhatsApp con los datos del médico tratante; la prescripción de fármacos controlados que exigen firma digital RNP acreditada requiere un proveedor de firma PKI externo.

---

## Costos y rendimiento

* **Tiempo de Respuesta en Endpoints Críticos:** < 50 ms gracias al desacoplamiento de notificaciones asíncronas con eventos en memoria.
* **Costo Operativo de Infraestructura:**
  * **Nivel Base / Micro-SaaS:** $0 a $15 USD/mes utilizando PostgreSQL gestionado (ej. Supabase o Railway) y hosting estático para la SPA (Vercel / Cloudflare Pages).
  * **Nivel Producción Escalable:** $25 a $60 USD/mes para soportar hasta 20 clínicas simultáneas con backups automatizados y base de datos con pool de conexiones dedicado.

---

## Estructura del proyecto

```text
SistemaCitas_ok/
├── apps/
│   ├── backend/                      # API REST NestJS 11 + TypeScript
│   │   ├── src/
│   │   │   ├── common/               # Guards, Decorators, Filters, Anti-IDOR
│   │   │   ├── config/               # Validación de entorno con Zod
│   │   │   ├── database/             # Conexión pg.Pool, migraciones y seeds
│   │   │   └── modules/              # 16 módulos de dominio (Auth, Appts, Clinical, etc.)
│   │   └── test/                     # Pruebas unitarias y E2E PostgreSQL
│   └── frontend/                     # SPA React 19 + Vite 6 + Tailwind 4
│       ├── src/
│       │   ├── components/           # UI, Booking Wizard, Clinical, 3D PainMap
│       │   ├── context/              # AuthContext (Memory Token), Theme, Branding
│       │   ├── pages/                # Public, Login modular, Dashboards por rol
│       │   ├── services/             # Clientes de API modularizados
│       │   └── utils/                # Storage seguro, helpers y sonidos
│       └── package.json
├── packages/
│   └── shared-types/                 # Modelos tipados compartidos, FSM y NLP Parser
├── db/
│   ├── docker/docker-compose.yml     # Contenedores PostgreSQL 16 (dev y test)
│   ├── migrations/                   # 17 archivos de migración DDL secuenciales
│   └── seeds/                        # Scripts SQL de datos de prueba
├── docs/
│   ├── ARCHITECTURE.md               # Documentación formal de arquitectura
│   └── adr/                          # Architecture Decision Records
└── package.json                      # npm workspaces monorepo
```

---

## Tests

Para ejecutar las suites de pruebas automatizadas del proyecto:

```bash
# Ejecutar todas las pruebas unitarias (Backend Jest + Frontend Vitest)
npm test

# Ejecutar pruebas unitarias de backend
npm run test:backend

# Ejecutar pruebas unitarias de frontend
npm run test:frontend

# Ejecutar pruebas E2E contra base de datos PostgreSQL real
npm run test:e2e

# Ejecutar smoke test en navegador Chromium real
npm run test:e2e:browser

# Ejecutar análisis de linting estricto (0 advertencias permitidas)
npm run lint
```

---

## Documentación adicional

* 📘 [`DOCUMENTO_MAESTRO.md`](./DOCUMENTO_MAESTRO.md): Especificación funcional exhaustiva con 113 directrices de negocio.
* 🏛️ [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): Diagramas de flujo y arquitectura detallada del sistema.
* 📖 [`GLOSSARY.md`](./GLOSSARY.md): Glosario de lenguaje ubicuo del dominio médico y operativo.
* 🗺️ [`ROADMAP.md`](./ROADMAP.md): Plan de fases, dependencias y puertas de evidencia.
* 🛡️ [`DIRECTIVA_GENTLE_AI.md`](./DIRECTIVA_GENTLE_AI.md): Metodología de desarrollo guiado por especificaciones y Definition of Done.

---

## Contribuir · Licencia · Contacto

* **Contribuciones:** Las contribuciones y propuestas de mejora se gestionan mediante pull requests y revisión de código con paso obligatorio de linting y suites de prueba.
* **Licencia:** Este proyecto está protegido bajo su respectiva licencia de software de autor. Consulta el archivo [`LICENSE`](./LICENSE) para más detalles.
* **Autor & Contacto:**
  * **Luis Alexander Fernández Paz**
  * **Email:** [Luisalexanderfp91@gmail.com](mailto:Luisalexanderfp91@gmail.com)
  * **GitHub:** [github.com/Alessander9](https://github.com/Alessander9)
  * **LinkedIn:** [linkedin.com/in/alexanderfp91](https://linkedin.com/in/alexanderfp91)
  * **Ubicación:** Lima, Perú

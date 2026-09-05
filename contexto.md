# CONTEXTO DEL PROYECTO — CITASSISTEMA

**Última actualización:** 2026-09-02  
**Versión:** 0.8.0-alpha (Fases 1, 2, 3, 4, 5, 6, 7 y 8 Completadas)  
**Estado General:** 🟢 Fases 1 a 8 completadas con 100% de pruebas unitarias y de integración en verde (`PASS`: 108 tests totales, 88 backend + 20 frontend).

---

## 📌 1. Visión y Objetivos Generales

**CitasSistema** es una plataforma web integral independiente diseñada para clínicas, consultorios y centros de rehabilitación física/terapias. Su arquitectura está orientada a soportar múltiples organizaciones (**Multi-Tenant**) de forma aislada y segura, gestionando todo el ciclo de vida de atención médica: desde la captación en la web pública y reserva en línea, hasta el control clínico (historias, sesiones, tratamientos, recetas), financiero (caja, pagos) y automatizaciones (Email, Telegram, Asistente IA).

### Documentos Fundacionales del Sistema
* 📄 [DOCUMENTO_MAESTRO.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/DOCUMENTO_MAESTRO.md) — Guía total con las 113 directrices arquitectónicas, de producto y reglas de negocio.
* 🛡️ [DIRECTIVA_GENTLE_AI.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/DIRECTIVA_GENTLE_AI.md) — Metodología de desarrollo orientada a especificaciones, pruebas obligatorias y evidencia demostrable.
* 📋 [ROADMAP.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/ROADMAP.md) — Plan de trabajo de 14 fases estructurado por dependencias estrictas y Gates de Evidencia.

---

## 🛠️ 2. Stack Tecnológico y Entorno de Pruebas

| Componente | Tecnología / Herramienta |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript + CSS Modular Tokens + Vitest + Testing Library |
| **Backend** | NestJS + TypeScript (Modular Monolith + Clean Architecture) + Jest |
| **Base de Datos** | PostgreSQL gestionado en Supabase (10 migraciones DDL completas) |
| **Autenticación & Seguridad** | JWT rotativo (15m/7d), Bcrypt, HMAC-SHA256, `TenantGuard`, `RolesGuard`, `PermissionsGuard` |
| **Testing Harness** | Jest (88 tests backend), Vitest (20 tests frontend) = **108 tests en verde (`PASS`)** |
| **Zona Horaria** | `America/Lima` |

---

## 🟢 3. Lo que YA está Construido y Verificado

### Definición, Metodología y Arquitectura
- [x] **Guía Total del Sistema:** 113 directrices completas en [DOCUMENTO_MAESTRO.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/DOCUMENTO_MAESTRO.md).
- [x] **Directiva Metodológica Gentle AI:** Procedimientos de SDD, ciclo TDD y Definition of Done en [DIRECTIVA_GENTLE_AI.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/DIRECTIVA_GENTLE_AI.md).
- [x] **Roadmap Ordenado por Dependencias:** 14 fases con matriz Mermaid y Gates de Evidencia en [ROADMAP.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/ROADMAP.md).
- [x] **Modelo de Datos Completo:** 10 migraciones SQL (`001` a `010`) con esquemas relacionales, enums, índices optimizados y soporte para escala EVA.

### Autenticación, Multi-Tenancy y RBAC (Fase 2)
- [x] **Módulo de Autenticación (`AuthModule`):** Login, rotación de tokens, auditoría automática, hash BCrypt.
- [x] **Aislamiento Multi-Tenancy Estricto (`TenantGuard` + `TenantMiddleware`):** Bloqueo `403 Forbidden` ante cross-tenant access.
- [x] **Control de Acceso Basado en Roles y Permisos (`RolesGuard` + `PermissionsGuard`):** `@RequirePermissions`, `@Roles`, `@Public`.
- [x] **Vista de Login Médica:** Fast-fill de roles demo, toggle de contraseña y tokens de diseño.

### Catálogos Médicos y Configuración de Horarios (Fase 3)
- [x] **Módulo de Especialidades (`SpecialtiesModule`):** CRUD con unicidad de nombre por clínica y ordenamiento.
- [x] **Módulo de Servicios (`ServicesModule`):** CRUD con duración, precio, moneda y políticas de depósito.
- [x] **Módulo de Profesionales (`ProfessionalsModule`):** CRUD con colegiatura, biografía y asignación N:M de servicios.
- [x] **Módulo de Horarios y Bloqueos (`SchedulesModule`):** Agenda semanal (días 0-6) y bloqueos (`schedule_blocks`).

### Motor de Disponibilidad y Citas (Fase 4)
- [x] **Módulo de Citas (`AppointmentsModule`):**
  - [x] Algoritmo de cálculo de slots de disponibilidad (`GET /availability`) cruzando horarios y citas.
  - [x] Sistema transaccional anti-colisiones con rechazo `409 Conflict`.
  - [x] Ciclo de vida completo (`pending`, `confirmed`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`).
  - [x] Historial de cambios de estado en `appointment_status_history`.

### Web Pública y Flujo de Reserva en Línea (Fase 5)
- [x] **Landing Page Institucional:** Hero section, catálogo interactivo con filtros, directorio médico, FAQ acordeón y footer legal.
- [x] **Wizard de Reserva en Línea de 11 Pasos:** Desde selección de especialidad hasta confirmación con código único (`CIT-2026-XXXX`).

### Pagos, Webhooks e Idempotencia (Fase 6)
- [x] **Módulo de Pagos (`PaymentsModule`):**
  - [x] Patrón Strategy con `IPaymentProvider` (`ManualPaymentProvider` para efectivo/Yape/Plin y `GatewayPaymentProvider` para pasarela online).
  - [x] Control de **idempotencia estricta** con llave única (`idempotency_key`) para evitar dobles cobros.
  - [x] Receptor de **Webhooks** (`POST /payments/webhook/:provider`) con validación de firma criptográfica HMAC-SHA256 (`timingSafeEqual`) y registro en `webhook_events`.
  - [x] Registro y auditoría de transacciones en `payment_transactions`.

### Pacientes y Portal Privado del Paciente (Fase 7)
- [x] **Módulo de Pacientes (`PatientsModule`):**
  - [x] CRUD completo de ficha de paciente (contacto, seguro, contacto de emergencia, alergias).
  - [x] Control estricto de duplicidad de documento de identidad (`national_id`) por clínica.
  - [x] Búsqueda indexada con paginación (`limit`, `offset`) por nombres, DNI, teléfono y correo.
  - [x] Historial consolidado (`GET /patients/:id/history`) unificando citas, tratamientos y pagos.
- [x] **Portal Web Privado del Paciente (`PatientPortal.tsx`):**
  - [x] Pestaña "Mis Citas" con atenciones agendadas, badges de estado y descarga de recordatorio.
  - [x] Pestaña "Mis Tratamientos y Recetas" con barra de progreso de sesiones y pautas domiciliarias.
  - [x] Pestaña "Ficha Médica y Perfil" con datos personales y consentimiento de privacidad Ley 29733.

### Módulo Clínico, Tratamientos, Sesiones y Recetas (Fase 8)
- [x] **Módulo Clínico (`ClinicalModule`):**
  - [x] **Historias Clínicas Digitales:** Formulario estructurado inmutable con anamnesis, examen físico, diagnóstico CIE-10 y escala de dolor EVA (0-10).
  - [x] **Planes de Tratamiento y Sesiones Terapéuticas:** Control de sesiones, cálculo de evolución del dolor (`pain_scale_before` vs `pain_scale_after`), técnicas aplicadas (electroterapia, terapia manual, etc.) y auto-finalización.
  - [x] **Recetas Médicas Digitales:** Emisión estructurada con medicamentos, dosis, vía, frecuencia, duración y firma del profesional.
- [x] **Vista Médica de Consulta y Evolución (`ClinicalConsultationView.tsx`):** Selector interactivo EVA 0-10, chips de técnicas de kinesiología y generador dinámico de recetas.

---

## 🟡 4. Siguiente Paso Inmediato

* **Fase 9: Administración, Caja Chica e Inventario (Kardex):**
  - Apertura, arqueo y cierre diario de caja chica por turno de recepción.
  - Movimientos de ingresos/egresos con balance en tiempo real.
  - Catálogo de insumos médicos con control de stock mínimo y Kardex automatizado por sesión.

---

## 📈 5. Registro de Cambios (Changelog)

| Fecha | Hito / Cambio | Responsable |
| :--- | :--- | :--- |
| **2026-09-02** | Creación de [DOCUMENTO_MAESTRO.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/DOCUMENTO_MAESTRO.md) (113 especificaciones). | Antigravity |
| **2026-09-02** | Creación de [DIRECTIVA_GENTLE_AI.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/DIRECTIVA_GENTLE_AI.md) (Metodología SDD, TDD y Evidencia). | Antigravity |
| **2026-09-02** | Actualización de [ROADMAP.md](file:///c:/Users/Alessander/Desktop/SistemaCitas_OK/ROADMAP.md) estructurado por dependencias y Gates de Evidencia. | Antigravity |
| **2026-09-02** | **Fase 1 Completada:** Infraestructura Monorepo y Schemas SQL DDL (001 a 008). | Antigravity |
| **2026-09-02** | **Fase 2 Completada:** AuthModule, Multi-Tenancy Guard, RBAC Guards y Login View. | Antigravity |
| **2026-09-02** | **Fase 3 Completada:** SpecialtiesModule, ServicesModule, ProfessionalsModule, SchedulesModule. | Antigravity |
| **2026-09-02** | **Fase 4 Completada:** AppointmentsModule (Cálculo de slots `/availability`, anti-colisión y ciclo de vida). | Agente Backend |
| **2026-09-02** | **Fase 5 Completada:** Landing Page pública, Catálogos interactivos y Wizard de 11 pasos. | Antigravity |
| **2026-09-02** | **Fase 6 Completada:** PaymentsModule (Idempotencia, providers, webhooks HMAC). | Antigravity |
| **2026-09-02** | **Fase 7 Completada:** PatientsModule, Historial Consolidado, PatientPortal UI. | Antigravity |
| **2026-09-02** | **Fase 8 Completada:** ClinicalModule, Escala EVA 0-10, Sesiones Terapéuticas, Recetas, ClinicalConsultationView UI y 108 tests en verde. | Antigravity |

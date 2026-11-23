# Glosario de Dominio (Ubiquitous Language) — CitasSistema

Este glosario fija el vocabulario oficial del dominio clínico y operativo de **CitasSistema (Clínica VitalSalud)** para evitar deriva de nombres entre código, base de datos, API y pruebas.

| Término oficial | Significado en el dominio | Ubicación principal |
|---|---|---|
| **Clínica (`clinicId` / Tenant)** | Sede médica aislada lógicamente mediante `TenantGuard` y `clinic_id` en todas las tablas SQL. | `TenantGuard`, `clinics` |
| **Cita (`Appointment`)** | Reserva de un servicio con un profesional en fecha/hora exacta con garantía anti-colisión. Ruta oficial de disponibilidad: `GET /api/appointments/availability`. | `appointments.service.ts` |
| **Triage / Recepción** | Flujo de admisión (`RECEPCION`): confirmación, check-in y cobro rápido en mostrador. | `ReceptionDashboard.tsx` |
| **Escala EVA (`painScale`)** | Escala Visual Analógica de dolor de `0` (sin dolor) a `10` (dolor máximo). Valores `< 0` o `> 10` son inválidos y rechazados. | `clinical-speech-parser.ts` |
| **Mapa de Dolor (`PainMap`)** | Registro espacial 2D/3D de puntos de dolor (`COL_LUMBAR`, etc.) por consulta o sesión terapéutica. El visor 3D se carga bajo demanda (`React.lazy`). | `PainMapPicker.tsx`, `pain_map_points` |
| **Chanfainita** | Asistente clínico de voz bilateral (wake-word configurable por sede en `clinic_voice_settings`). | `clinical-voice-assistant.service.ts` |
| **Modo Ambiental vs. Bilateral** | En `ambient` escucha en silencio sin interrumpir al paciente; al invocar `"Chanfainita"` pasa a `active` y responde por voz humana sin recitar códigos CIE-10 (Doble Canal). | `VoiceConsultationAssistant.tsx` |
| **Kardex (`inventory_movements`)** | Registro auditable de entradas y salidas de insumos clínicos. Los insumos detectados por voz solo se descuentan tras confirmación explícita al guardar la consulta (`deduct-supplies`). | `inventory.service.ts`, `clinical-knowledge.service.ts` |
| **Caja Chica (`CashRegister`)** | Sesión diaria de efectivo con apertura, movimientos y cierre/arqueo (`difference`). Por compatibilidad SQL, `sale` representa ingreso de caja y `purchase` representa egreso. | `cash.service.ts`, `cash_registers` |
| **Anti-IDOR de Paciente** | Regla de seguridad (`assertPatientOwnership`) que garantiza que un usuario con rol `PACIENTE` solo puede consultar o editar registros de su propio `patientId`. | `patient-ownership.util.ts` |

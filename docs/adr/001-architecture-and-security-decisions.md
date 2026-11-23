# ADR-001: Decisiones de Arquitectura, Seguridad y Dominio Clínico

- **Estado:** Aceptado
- **Fecha:** 2026-11-22

## Contexto
Durante la consolidación de CitasSistema (asistente bilateral "Chanfainita", auditoría de seguridad y blindaje de pruebas), se tomaron decisiones estructurales que deben mantenerse estables frente a futuros refactors.

## Decisiones

1. **Doble Canal Clínico ("Chanfainita"):**
   - El canal hablado (`spokenAlert`, `spokenBriefing`, `whatsappMessage`) **nunca** recita códigos CIE-10 (`M54.5`), UUIDs ni siglas técnicas.
   - El canal estructurado (`parsedData.diagnosis`) codifica silenciosamente el CIE-10 oficial para cumplimiento MINSA.
   - El modo por defecto es `ambient` (silencioso) para no interrumpir la conversación médico–paciente.

2. **Fuente Única de Verdad para el Parser Determinista:**
   - `parseClinicalSpeechShared` vive en `@citassistema/shared-types` y es consumido tanto por frontend (`VoiceConsultationAssistant`) como por backend (`ClinicalVoiceAssistantService`), evitando divergencias en reglas de EVA y vías de administración.

3. **Bloqueo Anti-IDOR Horizontal para Rol `PACIENTE`:**
   - Todos los endpoints de lectura/edición por `:id` o `:patientId` accesibles al rol `PACIENTE` ejecutan `assertPatientOwnership` contra `patients` (por email + `clinic_id`), devolviendo `403 Forbidden` ante accesos cruzados.
   - `EmailsController` y `POST /api/clinical/voice-assistant/process` requieren autenticación JWT + `RolesGuard`.

4. **Compatibilidad de Esquema en Caja Chica y Disponibilidad:**
   - Se mantiene `CashMovementType` (`sale` = ingreso, `purchase` = egreso) para preservar compatibilidad con PostgreSQL sin migración disruptiva.
   - La ruta oficial de disponibilidad es `GET /api/appointments/availability`.

5. **Performance del Bundle Clínico:**
   - `PainMap3DViewer` (`three`) se carga de forma diferida (`React.lazy`) dentro de `PainMapPicker` para mantener el chunk inicial de consulta liviano.

# ADR 002: Tipado Estricto de Dominio Clínico y Validación Fail-Fast de Entorno

## Estado
Aceptado

## Contexto
1. En la auditoría técnica bajo los estándares de Matt Pocock (`domain-modeling` y `improve-codebase-architecture`), se identificó que campos clínicos críticos como signos vitales (`vitals`) y zonas de irradiación (`referredArea`) se encontraban tipados con `Record<string, unknown>`, permitiendo estados no válidos y pérdida de autocompletado y validación de tipos entre backend y frontend.
2. La lectura de variables de entorno en el backend se realizaba directamente con `process.env.*` en más de 30 ubicaciones, con fallbacks inseguros que permitían arrancar en producción con secretos por defecto (`citassistema-jwt-secret-key-2026`).

## Decisiones
1. **Modelado Canónico de Signos Vitales (`ClinicalVitals`)**:
   - Se crea en `@citassistema/shared-types` la interfaz `ClinicalVitals` con propiedades fisiológicas estrictas: presión arterial (`systolicBp`, `diastolicBp`), frecuencia cardíaca (`heartRate`), frecuencia respiratoria (`respiratoryRate`), temperatura (`temperature`), saturación de oxígeno (`oxygenSaturation`), peso (`weightKg`), talla (`heightCm`) e IMC (`bmi`).
   - Se modela `PainReferredArea` en `pain-map.ts`.
2. **Validación Fail-Fast de Entorno con Zod (`env.schema.ts`)**:
   - En el bootstrap de NestJS (`apps/backend/src/main.ts`), la función `validateEnv()` ejecuta `envSchema.safeParse(process.env)`.
   - Si la aplicación se ejecuta con `NODE_ENV=production` y `JWT_SECRET` mantiene el valor por defecto o falta `DATABASE_URL`, el servidor se niega a iniciar e imprime un error fatal descriptivo al segundo 0.
   - En entornos locales o de desarrollo, se proveen valores por defecto seguros para evitar fricción al desarrollador.

## Consecuencias
* **Positivas**: Cero vulnerabilidades por claves JWT por defecto en producción; contratos clínicos garantizados de extremo a extremo sin objetos opacos; tests unitarios dedicados para validar la configuración del sistema.

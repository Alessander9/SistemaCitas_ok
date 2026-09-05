# DIRECTIVA DE DESARROLLO CON GENTLE AI — CITASSISTEMA

## Metodología de Desarrollo Orientada a Pruebas, Memoria y Evidencia Verificable

---

# 1. REGLA PRINCIPAL
Construye **CitasSistema** utilizando **Gentle AI como metodología de trabajo**, aplicando Spec-Driven Development (SDD), memoria persistente, pruebas automatizadas y validación con evidencia demostrable.

El objetivo **NO** es simplemente generar código, sino producir un sistema funcional demostrable mediante pruebas y criterios de aceptación cumplidos.

> [!CAUTION]
> **NO se aceptan como evidencia afirmaciones subjetivas:**
> * "Ya funciona."
> * "Ya está probado."
> * "No debería tener errores."
> * "La funcionalidad está lista."
>
> Una funcionalidad solo se considera terminada tras completar el ciclo:
> **ESPECIFICACIÓN → IMPLEMENTACIÓN → PRUEBA → EJECUCIÓN → CORRECCIÓN → PASS → CRITERIO DE ACEPTACIÓN CUMPLIDO**.

---

# 2. CICLO OBLIGATORIO DE IMPLEMENTACIÓN (TDD / SDD)

Para cada módulo o funcionalidad:

```text
1. ENTENDER       → Objetivos, reglas de negocio, actores, datos, permisos y casos límite.
2. ESPECIFICAR    → Spec claro con criterios GIVEN-WHEN-THEN.
3. TEST FIRST     → Diseñar la prueba antes o en paralelo al código.
4. IMPLEMENTAR    → Código limpio respetando Clean Architecture y Multi-Tenancy.
5. EJECUTAR TEST  → Correr suite (unit / integración / E2E).
6. CORREGIR       → Solucionar fallos de inmediato sin saltarse errores.
7. EVIDENCIA      → Registrar resultado PASS y logs correspondientes.
8. REGRESIÓN      → Comprobar que no rompe módulos previos.
```

---

# 3. NIVELES DE PRUEBAS OBLIGATORIAS

| Nivel | Alcance | Ejemplos en CitasSistema |
| :--- | :--- | :--- |
| **Unitarias** | Lógica pura y reglas de dominio | Cálculo de disponibilidad, políticas de cancelación, cálculo de arqueo de caja. |
| **Integración** | Comunicación entre módulos y DB | Creación de cita vinculada a paciente, sesión vinculada a descuento de inventario. |
| **Seguridad / Multi-Tenancy** | Aislamiento estricto de datos | Usuario Clínica A intenta acceder a Paciente Clínica B $\rightarrow$ `403 Forbidden`. |
| **Concurrencia / Anti-Colisión** | Concurrencia transaccional | 2 pacientes reservan el mismo horario a la vez $\rightarrow$ solo 1 tiene éxito. |
| **Idempotencia** | Webhooks y pagos duplicados | Webhook de pago recibido 2 veces $\rightarrow$ procesado solo 1 vez. |
| **E2E Reales** | Flujo completo del usuario | Paciente: Reserva $\rightarrow$ Pago $\rightarrow$ Confirmación $\rightarrow$ Notificación. |

---

# 4. DEFINITION OF DONE (DOD)

Un requerimiento o fase está **DONE** únicamente cuando:
1. **Código:** Implementado y tipado estrictamente (TypeScript sin `any` injustificado).
2. **Tests:** Pruebas unitarias e integración en verde (`PASS`).
3. **Multi-Tenancy:** Verificado aislamiento de `clinic_id` en consultas y mutaciones.
4. **Seguridad & RBAC:** Permisos validados tanto en backend como en interfaz.
5. **UX Completa:** Manejo explícito de estados (`Loading`, `Success`, `Empty`, `Error`).
6. **Auditoría:** Registros en `audit_logs` para acciones clínicas o financieras sensibles.
7. **Sin Regresión:** Suite global ejecutada sin fallos.

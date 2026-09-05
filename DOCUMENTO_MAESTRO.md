# SUPERPROMPT MAESTRO — CITASSISTEMA

## Plataforma integral de gestión de citas, pacientes y operación clínica

---

# 1. IDENTIDAD DEL PRODUCTO

## Nombre

**CitasSistema**

## Descripción

CitasSistema es una plataforma web integral para clínicas, centros de rehabilitación física, fisioterapia, terapias, consultorios y otros establecimientos de atención al paciente.

La plataforma permitirá administrar en un solo lugar:

* Página web.
* Servicios.
* Especialidades.
* Profesionales.
* Horarios.
* Citas.
* Pacientes.
* Historias clínicas.
* Tratamientos.
* Sesiones.
* Recetas.
* Documentos.
* Pagos.
* Caja.
* Inventario.
* Comunicaciones.
* Recordatorios.
* Portal del paciente.
* Notificaciones por Telegram.
* Correos electrónicos.
* Asistente de inteligencia artificial.
* Reportes.
* Auditoría.
* Configuración.

CitasSistema debe ser diseñado como un **producto independiente de INSTEIP**.

No compartir datos, usuarios, tablas ni lógica de negocio con INSTEIP.

---

# 2. VISIÓN DEL PRODUCTO

El objetivo es crear un sistema que acompañe todo el recorrido del paciente:

**Descubre la clínica**
↓
**Consulta servicios**
↓
**Elige especialidad**
↓
**Elige profesional**
↓
**Consulta horarios**
↓
**Reserva**
↓
**Realiza pago**
↓
**Recibe confirmación**
↓
**Recibe recordatorio**
↓
**Asiste**
↓
**Recibe atención**
↓
**Se registra evolución**
↓
**Continúa su tratamiento**
↓
**Recibe seguimiento**
↓
**Puede reservar nuevamente**

Y al mismo tiempo permitir que la clínica:

**Capte → Organice → Atienda → Cobre → Controle → Comunique → Fidelice → Analice**

---

# 3. VISIÓN A FUTURO: SAAS MULTICLÍNICA

Aunque la primera implementación pueda realizarse para una sola clínica, CitasSistema debe diseñarse desde el inicio para soportar múltiples organizaciones.

Conceptualmente:

```text
CitasSistema
├── Clínica A
├── Clínica B
├── Clínica C
├── Clínica D
└── Clínica N
```

Cada clínica tendrá información completamente separada.

Debe existir una entidad principal:

**Tenant / Organization / Clinic**

Cada registro operativo importante debe estar asociado a una clínica.

Ejemplo:

* clinic_id
* patient_id
* professional_id
* appointment_id
* service_id
* payment_id

Debe evitarse completamente que un usuario de una clínica pueda consultar información de otra.

---

# 4. PRINCIPIOS DEL SISTEMA

El desarrollo debe seguir estos principios:

### Seguridad primero
La información clínica y personal debe protegerse cuidadosamente.

### Simplicidad
El usuario debe entender el sistema sin conocimientos técnicos.

### Automatización
Todo proceso repetitivo que pueda automatizarse debe diseñarse para ser automatizable.

### Modularidad
Cada módulo debe tener responsabilidades claras.

### Escalabilidad
El sistema debe poder crecer sin necesidad de rehacer toda la aplicación.

### Trazabilidad
Las operaciones importantes deben poder auditarse.

### Experiencia móvil
El paciente debe poder hacer la mayor parte de sus acciones desde su celular.

### Configurabilidad
Cada clínica debe poder adaptar horarios, servicios, políticas y comunicaciones.

---

# 5. ARQUITECTURA TECNOLÓGICA

Utilizar la siguiente arquitectura base:

## Frontend
React + TypeScript.

## Backend
NestJS + TypeScript.

## API
REST.

## Base de datos
PostgreSQL mediante Supabase.

## Archivos
Supabase Storage.

## Autenticación
JWT y control de acceso por roles/permisos.

## Arquitectura
**Modular Monolith + Clean Architecture pragmática.**

No utilizar microservicios sin una necesidad real.

---

# 6. SEPARACIÓN DE CAPAS

Separar:

### Presentación
Interfaz de usuario.

### Aplicación
Casos de uso.

### Dominio
Reglas de negocio.

### Infraestructura
Base de datos, correo, pagos, Telegram, almacenamiento y proveedores externos.

La lógica importante nunca debe depender directamente de la interfaz.

---

# 7. MULTI-TENANCY

Implementar aislamiento por clínica.

Cada usuario pertenece a una clínica.

Un usuario puede tener:

* clinic_id
* role
* permissions

Toda consulta debe considerar el contexto de la clínica.

Ejemplo conceptual:

```text
Usuario
  ↓
Clínica
  ↓
Recursos de esa clínica
```

Nunca confiar únicamente en filtros enviados por el frontend.

El backend debe determinar la clínica asociada al usuario autenticado.

---

# 8. ROLES PRINCIPALES

Crear inicialmente:

## SUPER ADMIN
Administrador global de CitasSistema.
Puede gestionar:
* Clínicas.
* Configuración global.
* Suscripciones futuras.
* Usuarios globales.
* Soporte.
* Auditoría global.

## ADMINISTRADOR DE CLÍNICA
Administra una clínica.
Puede gestionar:
* Usuarios.
* Profesionales.
* Pacientes.
* Servicios.
* Especialidades.
* Agenda.
* Citas.
* Pagos.
* Caja.
* Inventario.
* Reportes.
* Comunicaciones.
* Configuración.

## RECEPCIÓN
Puede:
* Registrar pacientes.
* Crear citas.
* Modificar citas.
* Cancelar.
* Reprogramar.
* Ver agenda.
* Registrar pagos.
* Gestionar caja.

## PROFESIONAL
Puede:
* Ver su agenda.
* Ver pacientes autorizados.
* Consultar historia clínica.
* Registrar tratamientos.
* Registrar sesiones.
* Registrar evolución.
* Crear recetas.
* Subir documentos.

## PACIENTE
Puede:
* Ver perfil.
* Reservar.
* Ver próximas citas.
* Ver historial.
* Ver tratamiento.
* Ver sesiones autorizadas.
* Ver recetas.
* Ver documentos.
* Ver pagos.
* Gestionar preferencias.

---

# 9. MODELO DE PERMISOS

Implementar RBAC.

Ejemplos:
* appointments.read
* appointments.create
* appointments.update
* appointments.cancel
* appointments.reschedule
* patients.read
* patients.create
* patients.update
* medical_records.read
* medical_records.create
* medical_records.update
* payments.read
* payments.create
* cash.read
* cash.close
* inventory.read
* inventory.manage
* reports.read
* users.manage
* settings.manage
* audit.read

No basar seguridad únicamente en el menú visual.

---

# 10. SITIO WEB PÚBLICO

Cada clínica podrá disponer de una web pública.

Secciones:
* Inicio.
* Nosotros.
* Servicios.
* Especialidades.
* Profesionales.
* Preguntas frecuentes.
* Contacto.
* Ubicación.
* Reserva de cita.

La web debe estar orientada a convertir visitantes en reservas.

---

# 11. PÁGINA DE INICIO

Debe incluir:
* Presentación.
* Propuesta de valor.
* Servicios destacados.
* Especialidades.
* Profesionales.
* Beneficios.
* Testimonios cuando corresponda.
* Preguntas frecuentes.
* Ubicación.
* Botón de reservar.

CTA principal:
**Reservar una cita**

---

# 12. ESPECIALIDADES

Entidad:
* id
* clinic_id
* nombre
* slug
* descripción
* imagen
* estado
* orden
* metadatos SEO

Permitir:
* Crear.
* Editar.
* Activar.
* Desactivar.
* Ordenar.

---

# 13. SERVICIOS

Cada servicio debe tener:
* Nombre.
* Especialidad.
* Descripción.
* Duración.
* Precio.
* Moneda.
* Estado.
* Imagen.
* Indicaciones.
* Tiempo mínimo de anticipación.
* Política de cancelación.
* Política de reprogramación.

---

# 14. PROFESIONALES

Datos:
* Nombre.
* Apellidos.
* Documento.
* Foto.
* Biografía.
* Formación.
* Experiencia.
* Especialidades.
* Servicios.
* Estado.

Relaciones:

```text
Profesional
→ Especialidades
→ Servicios
→ Horarios
→ Citas
→ Pacientes
```

---

# 15. HORARIOS

Cada profesional podrá definir:
* Día.
* Hora inicial.
* Hora final.
* Duración.
* Descansos.

Además:
* Vacaciones.
* Feriados.
* Bloqueos.
* Horarios excepcionales.

---

# 16. MOTOR DE DISPONIBILIDAD

Crear un único servicio centralizado para calcular disponibilidad.

Debe considerar:
* Horarios.
* Duración.
* Citas.
* Bloqueos.
* Feriados.
* Vacaciones.
* Anticipación.
* Políticas.
* Zona horaria.

La disponibilidad definitiva siempre debe validarse en backend.

---

# 17. PREVENCIÓN DE DOBLE RESERVA

Implementar protección contra reservas simultáneas.

Debe utilizar:
* Validación de backend.
* Restricciones apropiadas.
* Transacciones.
* Control de concurrencia.

Dos usuarios nunca deben poder confirmar la misma franja.

---

# 18. RESERVA PÚBLICA

Flujo:

1. **Paso 1**: Especialidad.
2. **Paso 2**: Servicio.
3. **Paso 3**: Profesional.
4. **Paso 4**: Fecha.
5. **Paso 5**: Hora.
6. **Paso 6**: Datos del paciente.
7. **Paso 7**: Resumen.
8. **Paso 8**: Aceptación de políticas.
9. **Paso 9**: Pago.
10. **Paso 10**: Confirmación.
11. **Paso 11**: Notificaciones.

---

# 19. DATOS DEL PACIENTE

Durante la reserva solicitar:
* Nombre.
* Apellido.
* Documento.
* Teléfono.
* Correo.
* Fecha de nacimiento cuando sea necesaria.

No solicitar información clínica sensible durante una reserva pública salvo necesidad justificada.

---

# 20. CITAS

Cada cita tendrá:
* id
* clinic_id
* patient_id
* professional_id
* specialty_id
* service_id
* start_at
* end_at
* status
* amount
* payment_status
* notes
* source
* created_at
* updated_at

Estados:
* PENDIENTE
* PENDIENTE_PAGO
* CONFIRMADA
* ATENDIDA
* CANCELADA
* REPROGRAMADA
* NO_ASISTIO

---

# 21. FUENTES DE RESERVA

Registrar cómo se creó la cita:
* Web.
* Recepción.
* Administración.
* Telegram.
* API.
* Otros.

---

# 22. POLÍTICAS DE CITAS

Configurables por clínica:
* Anticipación mínima.
* Máximo de días para reservar.
* Tiempo límite de cancelación.
* Tiempo límite de reprogramación.
* Pago obligatorio.
* Pago parcial.
* Confirmación manual.
* Confirmación automática.

---

# 23. CANCELACIÓN

Al cancelar:
* Cambiar estado.
* Registrar usuario.
* Registrar fecha.
* Registrar motivo cuando corresponda.
* Liberar horario según reglas.
* Ejecutar notificaciones.

---

# 24. REPROGRAMACIÓN

Debe verificar nuevamente disponibilidad.

Registrar:
* Fecha anterior.
* Fecha nueva.
* Usuario que realizó el cambio.
* Fecha del cambio.
* Motivo cuando corresponda.

---

# 25. PAGOS

Crear módulo de pagos.

Datos:
* ID.
* Clínica.
* Paciente.
* Cita.
* Monto.
* Moneda.
* Método.
* Estado.
* Referencia externa.
* Fecha.

Estados:
* PENDIENTE
* PROCESANDO
* APROBADO
* RECHAZADO
* CANCELADO
* DEVUELTO

---

# 26. PASARELA DE PAGOS

Diseñar una capa independiente:
`PaymentProvider`

Implementar inicialmente el proveedor definido por el proyecto.

Debe ser posible agregar posteriormente otros proveedores.

Nunca considerar un pago iniciado como pago confirmado.

La confirmación debe venir del mecanismo oficial del proveedor.

---

# 27. MÉTODOS DE PAGO

Preparar:
* Pasarela online.
* Tarjeta.
* Transferencia.
* Efectivo.
* Yape.
* Plin.
* Otros configurables.

---

# 28. CAJA

Crear:

### Apertura
* Fecha.
* Usuario.
* Monto inicial.

### Movimientos
* Ingreso.
* Egreso.
* Concepto.
* Método.

### Cierre
* Total esperado.
* Total contado.
* Diferencia.
* Observaciones.
* Usuario.

---

# 29. PACIENTES

Crear ficha central.

Secciones:
* Información personal.
* Contacto.
* Antecedentes.
* Alergias.
* Citas.
* Historia clínica.
* Tratamientos.
* Sesiones.
* Recetas.
* Documentos.
* Pagos.
* Comunicaciones.

---

# 30. HISTORIA CLÍNICA

Crear una historia clínica digital.

Secciones:
* Motivo de consulta.
* Antecedentes.
* Alergias.
* Evaluación.
* Diagnóstico.
* Objetivos.
* Plan.
* Observaciones.

Permitir historial cronológico.

No sobrescribir información clínica histórica de manera destructiva.

---

# 31. EVOLUCIÓN

Cada evolución debe registrar:
* Fecha.
* Profesional.
* Sesión.
* Observaciones.
* Procedimientos.
* Evolución.
* Indicaciones.

---

# 32. TRATAMIENTOS

Campos:
* Paciente.
* Profesional.
* Diagnóstico.
* Objetivos.
* Fecha inicio.
* Fecha fin.
* Sesiones previstas.
* Frecuencia.
* Estado.

Estados:
* PLANIFICADO
* ACTIVO
* PAUSADO
* FINALIZADO
* CANCELADO

---

# 33. SESIONES

Cada sesión deberá permitir:
* Número.
* Fecha.
* Tratamiento.
* Profesional.
* Dolor inicial.
* Dolor final.
* Procedimientos.
* Observaciones.
* Evolución.
* Indicaciones.
* Insumos.

---

# 34. RECETAS

Registrar:
* Profesional.
* Paciente.
* Fecha.
* Indicaciones.
* Medicamentos cuando corresponda.
* Dosis.
* Frecuencia.
* Duración.
* Recomendaciones.

Permitir generar documento.

---

# 35. DOCUMENTOS

Tipos:
* Consentimientos.
* Informes.
* Recetas.
* Evaluaciones.
* Resultados.
* Documentación administrativa.

Todo documento debe tener:
* Tipo.
* Nombre.
* Fecha.
* Autor.
* Paciente.
* Visibilidad.

---

# 36. ALMACENAMIENTO SEGURO

Los documentos clínicos:
* No deben ser públicos.
* Deben tener permisos.
* Deben utilizar URLs seguras.
* Deben validar acceso antes de descargar.

---

# 37. CONSENTIMIENTOS

Crear módulo de consentimiento.

Tipos:
* Tratamiento.
* Privacidad.
* Comunicaciones.
* Marketing.
* Otros configurables.

Guardar:
* Versión.
* Fecha.
* Usuario.
* Estado.

---

# 38. PORTAL DEL PACIENTE

Crear portal privado.

Dashboard:
* Próxima cita.
* Tratamiento.
* Próxima sesión.
* Pagos.
* Notificaciones.

Menú:
* Inicio.
* Mis citas.
* Reservar.
* Historial.
* Tratamientos.
* Sesiones.
* Recetas.
* Documentos.
* Pagos.
* Perfil.

---

# 39. PANEL DE PROFESIONAL

Dashboard:
* Citas del día.
* Próximas citas.
* Pacientes.
* Tratamientos.
* Sesiones.

Debe poder:
* Abrir ficha.
* Ver agenda.
* Registrar atención.
* Crear sesión.
* Registrar evolución.
* Crear receta.
* Adjuntar documento.

---

# 40. PANEL DE RECEPCIÓN

Debe estar optimizado para operación rápida.

Accesos:
* Agenda.
* Nueva cita.
* Buscar paciente.
* Nuevo paciente.
* Cobro.
* Caja.

---

# 41. DASHBOARD ADMINISTRATIVO

Indicadores:
* Citas del día.
* Próximas.
* Confirmadas.
* Canceladas.
* No asistencias.
* Pacientes nuevos.
* Ingresos.
* Tratamientos activos.
* Sesiones realizadas.

---

# 42. REPORTES

Crear reportes:

## Citas
* Por fecha.
* Estado.
* Profesional.
* Servicio.
* Especialidad.

## Pacientes
* Nuevos.
* Recurrentes.
* Activos.

## Ingresos
* Día.
* Semana.
* Mes.
* Método de pago.
* Servicio.

## Tratamientos
* Activos.
* Finalizados.

## Inventario
* Stock.
* Consumo.
* Productos críticos.

---

# 43. EXPORTACIONES

Permitir:
* CSV.
* Excel.
* PDF cuando corresponda.

Aplicar permisos.

---

# 44. INVENTARIO

Crear:

## Productos
* Nombre.
* Código.
* Categoría.
* Unidad.
* Stock.
* Stock mínimo.
* Proveedor.
* Estado.

## Movimientos
* Entrada.
* Salida.
* Ajuste.

Alertar:
**Stock actual <= stock mínimo**

---

# 45. INSUMOS POR SESIÓN

Permitir registrar los insumos utilizados durante una sesión.

Ejemplo:
Sesión #8
→ Producto A: 2 unidades
→ Producto B: 1 unidad

Esto debe descontar inventario cuando corresponda.

---

# 46. SISTEMA DE CORREOS

Crear motor de correo transaccional.

Eventos:
* Cita creada.
* Cita confirmada.
* Cita cancelada.
* Cita reprogramada.
* Pago confirmado.
* Recordatorio.
* Próxima sesión.
* Seguimiento.
* Comunicación institucional.
* Promoción.

---

# 47. RECORDATORIOS

Configurar reglas.

Ejemplos:
* 48 horas antes.
* 24 horas antes.
* 2 horas antes.

Las reglas deben ser configurables.

No enviar duplicados.

---

# 48. SEGUIMIENTO

Después de una atención:
* Enviar mensaje.
* Solicitar retroalimentación.
* Recordar próxima sesión.
* Invitar a continuar tratamiento cuando corresponda.

Debe poder configurarse por servicio o tratamiento.

---

# 49. CAMPAÑAS

Crear base para comunicaciones comerciales.

Segmentación futura por:
* Servicio.
* Especialidad.
* Última atención.
* Pacientes activos.
* Pacientes inactivos.
* Consentimiento.

Nunca enviar marketing a pacientes que no hayan dado el consentimiento correspondiente.

---

# 50. PLANTILLAS DE CORREO

Variables:
* `{{patient_name}}`
* `{{professional_name}}`
* `{{service_name}}`
* `{{appointment_date}}`
* `{{appointment_time}}`
* `{{clinic_name}}`
* `{{clinic_phone}}`

Permitir:
* Activar.
* Desactivar.
* Editar.

---

# 51. HISTORIAL DE CORREOS

Guardar:
* Destinatario.
* Tipo.
* Evento.
* Fecha.
* Estado.
* Error.

---

# 52. TELEGRAM

Crear Bot de Telegram.

Funciones:

### Nueva cita
Notificar a profesional o usuario autorizado.

### Cancelación
Notificar.

### Reprogramación
Notificar.

### Resumen
Enviar agenda.

### Consultas
Consultar información permitida.

---

# 53. RESUMEN DE LAS 9:00 P. M.

Cada día a las 9:00 p. m.:
Enviar resumen de citas del día siguiente.

Mostrar:
* Hora.
* Paciente.
* Servicio.
* Profesional.
* Estado.

Evitar información clínica innecesaria.

---

# 54. CONSULTAS DESDE TELEGRAM

Preparar comandos:
* `/hoy`
* `/manana`
* `/semana`
* `/mes`
* `/citas`
* `/pendientes`
* `/ingresos`

Siempre validar:
* Identidad.
* Clínica.
* Rol.
* Permisos.

---

# 55. APROBACIÓN DE CITAS

Para clínicas que requieran aprobación:

```text
Nueva cita
↓
Estado: PENDIENTE
↓
Telegram
↓
[ACEPTAR] [RECHAZAR]
↓
Actualizar estado
↓
Registrar usuario
↓
Notificar paciente.
```

---

# 56. ASISTENTE DE IA

Crear asistente para el sitio público.

Debe poder:
* Responder preguntas.
* Explicar servicios.
* Mostrar especialidades.
* Mostrar profesionales.
* Informar horarios.
* Explicar proceso de reserva.
* Guiar hacia una cita.

No debe diagnosticar ni sustituir al profesional.

---

# 57. BASE DE CONOCIMIENTO

El asistente debe responder utilizando información controlada de la clínica.

Fuentes:
* Servicios.
* Especialidades.
* Profesionales.
* Preguntas frecuentes.
* Horarios.
* Políticas.
* Información institucional.

Evitar inventar información.

---

# 58. ESCALAMIENTO A HUMANO

El asistente debe detectar situaciones que requieran atención humana.

Mostrar:
**"Para esta consulta te recomendamos comunicarte con recepción."**

Permitir botones:
* WhatsApp.
* Llamar.
* Contacto.

---

# 59. NOTIFICACIONES INTERNAS

Crear sistema de notificaciones.

Ejemplos:
* Nueva cita.
* Pago.
* Cancelación.
* Reprogramación.
* Stock bajo.
* Documento nuevo.

---

# 60. AUDITORÍA

Registrar acciones importantes.

Ejemplos:
* Login.
* Logout.
* Crear usuario.
* Cambiar permisos.
* Crear paciente.
* Modificar paciente.
* Consultar historia.
* Modificar historia.
* Crear cita.
* Cancelar.
* Reprogramar.
* Registrar pago.
* Modificar caja.
* Modificar inventario.
* Descargar documento.

Registrar:
* Usuario.
* Clínica.
* Acción.
* Recurso.
* ID.
* Fecha.
* Resultado.

---

# 61. SEGURIDAD

Implementar:
* HTTPS.
* JWT.
* Refresh tokens.
* Hash de contraseñas.
* Rate limiting.
* Validación.
* Sanitización.
* CORS.
* Protección de endpoints.
* Autorización.
* Control por clínica.
* Gestión segura de archivos.

No exponer secretos al frontend.

---

# 62. INFORMACIÓN CLÍNICA

Aplicar mínimo privilegio.

No todos los usuarios pueden ver:
* Historia clínica.
* Diagnósticos.
* Recetas.
* Documentos.
* Notas clínicas.

La información debe visualizarse solamente según permisos.

---

# 63. PRIVACIDAD

Preparar el sistema para cumplir las obligaciones de protección de datos personales aplicables en Perú.

Implementar:
* Consentimientos.
* Registro de acceso.
* Permisos.
* Auditoría.
* Control de documentos.
* Gestión de comunicaciones.

No presentar el sistema como "certificado legalmente" a menos que exista una certificación real.

---

# 64. ZONA HORARIA

Usar:
**America/Lima**

La agenda y comunicaciones deben respetar el horario local de la clínica.

---

# 65. CONFIGURACIÓN DE LA CLÍNICA

Cada clínica podrá configurar:
* Nombre.
* Logo.
* Colores.
* Dirección.
* Teléfono.
* Correo.
* Redes sociales.
* Horarios.
* Moneda.
* Políticas.
* Anticipación.
* Cancelación.
* Reprogramación.
* Comunicaciones.

---

# 66. MARCA BLANCA

Preparar arquitectura para futura personalización:
* Logo.
* Nombre.
* Colores.
* Dominio.
* Mensajes.

Esto permitirá ofrecer CitasSistema como plataforma para diferentes clínicas.

---

# 67. DISEÑO VISUAL

Crear una interfaz moderna de software médico.

Debe transmitir:
* Confianza.
* Profesionalismo.
* Limpieza.
* Tecnología.
* Cercanía.

Evitar interfaces excesivamente cargadas.

---

# 68. RESPONSIVE

Prioridad:

### Paciente
Mobile First.

### Administración
Desktop First + adaptación tablet.

---

# 69. ACCESIBILIDAD

Considerar:
* Contraste.
* Tipografía.
* Navegación por teclado.
* Labels.
* Mensajes de error.
* Áreas táctiles.

---

# 70. SEO

Para cada clínica:
* Título.
* Meta description.
* URL amigable.
* Open Graph.
* Sitemap.
* Robots.
* Encabezados.
* Datos estructurados cuando correspondan.

---

# 71. RENDIMIENTO

Optimizar:
* Imágenes.
* Lazy loading.
* Carga de código.
* Consultas.
* Paginación.
* Caché cuando corresponda.

---

# 72. BÚSQUEDA

### Pacientes
* Nombre.
* Documento.
* Teléfono.
* Correo.

### Citas
* Paciente.
* Profesional.
* Fecha.
* Estado.

### Productos
* Nombre.
* Código.

---

# 73. PAGINACIÓN

Utilizar paginación en listas grandes.

Nunca devolver miles de registros innecesarios.

---

# 74. VALIDACIONES

Validar:
* Campos requeridos.
* Fechas.
* Correos.
* Teléfonos.
* Montos.
* Estados.
* Relaciones.

No permitir estados imposibles.

---

# 75. MANEJO DE ERRORES

El usuario debe recibir mensajes claros.

Ejemplo:
**"No fue posible reservar este horario porque acaba de ser ocupado."**

No mostrar:
* Stack traces.
* Errores SQL.
* Información interna.

---

# 76. IDEMPOTENCIA

Aplicar protección especialmente a:
* Pagos.
* Webhooks.
* Correos.
* Confirmaciones.
* Creación de citas.

Evitar duplicados.

---

# 77. WEBHOOKS

Cuando una integración externa utilice webhooks:
1. Validar origen.
2. Validar firma cuando exista.
3. Registrar evento.
4. Garantizar idempotencia.
5. Procesar.
6. Registrar resultado.

---

# 78. TAREAS PROGRAMADAS

Crear sistema para tareas automáticas:
* Recordatorios.
* Resúmenes.
* Seguimientos.
* Limpieza.
* Procesamiento de notificaciones.

Debe ser posible monitorear tareas fallidas.

---

# 79. COLA DE NOTIFICACIONES

Diseñar un mecanismo para no depender de que el usuario espere la respuesta del servidor para enviar correos o Telegram.

Preparar arquitectura para cola de trabajos.

---

# 80. LOGS

Separar:

### Logs técnicos
Errores y operaciones del sistema.

### Auditoría
Acciones realizadas por usuarios.

No mezclar ambos conceptos.

---

# 81. BACKUPS

Preparar:
* Backup de base de datos.
* Backup de documentos.
* Recuperación.
* Restauración.

Documentar procedimiento.

---

# 82. CONFIGURACIÓN DE PRODUCCIÓN

Preparar:
* Dominio.
* HTTPS.
* Variables.
* Producción.
* Logs.
* Backups.
* Monitoreo.
* Alertas.

---

# 83. API

RESTful.

Ejemplos:

```text
POST /auth/login
POST /auth/refresh

GET /clinics
POST /clinics

GET /patients
POST /patients
GET /patients/:id
PATCH /patients/:id

GET /professionals
POST /professionals

GET /services
POST /services

GET /availability

GET /appointments
POST /appointments
PATCH /appointments/:id
POST /appointments/:id/cancel
POST /appointments/:id/reschedule

GET /payments
POST /payments

GET /treatments
POST /treatments

GET /sessions
POST /sessions
```

Los endpoints reales deben seguir una convención homogénea.

---

# 84. DOCUMENTACIÓN DE API

Utilizar Swagger/OpenAPI.

Documentar:
* Endpoint.
* Parámetros.
* Autenticación.
* Request.
* Response.
* Errores.

---

# 85. BASE DE DATOS

Crear como mínimo las entidades conceptuales:
* `clinics`
* `users`
* `roles`
* `permissions`
* `user_roles`
* `patients`
* `professionals`
* `specialties`
* `services`
* `professional_services`
* `professional_schedules`
* `schedule_blocks`
* `appointments`
* `appointment_status_history`
* `payments`
* `payment_transactions`
* `cash_registers`
* `cash_movements`
* `medical_records`
* `treatments`
* `treatment_sessions`
* `prescriptions`
* `documents`
* `consents`
* `inventory_products`
* `inventory_movements`
* `email_templates`
* `email_logs`
* `notification_logs`
* `telegram_accounts`
* `audit_logs`

Agregar otras entidades cuando sean necesarias.

---

# 86. HISTORIAL DE ESTADOS

Para procesos importantes registrar cambios de estado.

Ejemplo:
Cita: `PENDIENTE` → `CONFIRMADA` → `ATENDIDA`

El sistema debe poder conocer quién realizó cada cambio.

---

# 87. ELIMINACIÓN LÓGICA

No eliminar físicamente información clínica importante sin un mecanismo controlado.

Utilizar soft delete cuando corresponda.

---

# 88. DISEÑO DE MENÚ

## Administración
* Dashboard
* Agenda
* Pacientes
* Profesionales
* Especialidades
* Servicios
* Tratamientos
* Sesiones
* Pagos
* Caja
* Inventario
* Reportes
* Comunicaciones
* Usuarios
* Configuración
* Auditoría

## Recepción
* Dashboard
* Agenda
* Nueva cita
* Pacientes
* Cobros
* Caja

## Profesional
* Dashboard
* Mi agenda
* Pacientes
* Historias clínicas
* Tratamientos
* Sesiones
* Recetas
* Documentos

## Paciente
* Inicio
* Mis citas
* Reservar
* Historial
* Tratamientos
* Sesiones
* Recetas
* Documentos
* Pagos
* Perfil

---

# 89. FLUJO ADMINISTRATIVO COMPLETO

```text
Administrador:
Configura clínica
↓
Crea especialidades
↓
Crea servicios
↓
Registra profesionales
↓
Configura horarios
↓
Publica servicios
↓
Paciente reserva
↓
Pago
↓
Confirmación
↓
Recordatorio
↓
Atención
↓
Sesión
↓
Evolución
↓
Pago/caja
↓
Seguimiento
↓
Nueva cita.
```

---

# 90. FLUJO DE RECEPCIÓN

```text
Recepción:
Busca paciente
↓
Selecciona profesional
↓
Consulta agenda
↓
Crea cita
↓
Registra pago
↓
Confirma
↓
Paciente recibe comunicación.
```

---

# 91. FLUJO DEL PROFESIONAL

```text
Profesional:
Inicia sesión
↓
Ve agenda
↓
Selecciona paciente
↓
Consulta información autorizada
↓
Abre tratamiento
↓
Registra sesión
↓
Registra evolución
↓
Genera receta/documento
↓
Finaliza atención.
```

---

# 92. FLUJO DEL PACIENTE

```text
Paciente:
Entra a web
↓
Consulta servicio
↓
Consulta profesional
↓
Selecciona horario
↓
Registra datos
↓
Paga
↓
Confirma
↓
Recibe correo
↓
Recibe recordatorio
↓
Asiste
↓
Consulta historial.
```

---

# 93. ETAPAS DE DESARROLLO

## FASE 0 — DEFINICIÓN
* Requerimientos.
* Flujos.
* Roles.
* Casos de uso.
* Modelo conceptual.

## FASE 1 — FUNDACIONES
* Repositorio.
* Arquitectura.
* Base de datos.
* Autenticación.
* Tenancy.
* Roles.
* Permisos.

## FASE 2 — WEB PÚBLICA
* Inicio.
* Servicios.
* Especialidades.
* Profesionales.
* Contacto.
* FAQ.

## FASE 3 — AGENDA Y CITAS
* Horarios.
* Disponibilidad.
* Reserva.
* Cancelación.
* Reprogramación.
* Agenda.

## FASE 4 — PAGOS
* Pasarela.
* Confirmación.
* Estados.
* Historial.

## FASE 5 — PACIENTES
* Ficha.
* Historial.
* Documentos.

## FASE 6 — MÓDULO CLÍNICO
* Historia.
* Tratamientos.
* Sesiones.
* Evolución.
* Recetas.

## FASE 7 — ADMINISTRACIÓN
* Caja.
* Inventario.
* Reportes.

## FASE 8 — COMUNICACIONES
* Email.
* Recordatorios.
* Seguimientos.

## FASE 9 — TELEGRAM
* Bot.
* Notificaciones.
* Resúmenes.
* Consultas.

## FASE 10 — IA
* Asistente.
* Base de conocimiento.
* Orientación.
* Reserva.

## FASE 11 — QA
* Funcional.
* Seguridad.
* Responsive.
* Rendimiento.

## FASE 12 — PRODUCCIÓN
* Dominio.
* SSL.
* Backups.
* Monitoreo.

---

# 94. METODOLOGÍA DE DESARROLLO

No desarrollar todo de una sola vez.

Cada módulo deberá seguir:

**Diseño → Modelo → Backend → Frontend → Integración → Pruebas → Correcciones → Documentación → Aprobación**

---

# 95. REGLA DE NO ROMPER FUNCIONALIDADES EXISTENTES

Antes de modificar una funcionalidad:
* Revisar dependencias.
* Revisar API.
* Revisar base de datos.
* Revisar permisos.
* Ejecutar pruebas.

Una nueva funcionalidad no debe romper las existentes.

---

# 96. PRUEBAS

Crear pruebas:

### Autenticación
Login, Logout, Refresh, Permisos.

### Tenancy
Usuario Clínica A no puede acceder a Clínica B.

### Agenda
Disponibilidad, Horario ocupado, Doble reserva.

### Citas
Crear, Cancelar, Reprogramar, Atender, No asistió.

### Pagos
Aprobado, Rechazado, Duplicado, Webhook.

### Historia clínica
Acceso, Creación, Edición, Auditoría.

### Inventario
Entrada, Salida, Stock bajo.

### Comunicaciones
Email, Telegram, Recordatorios.

---

# 97. CRITERIOS DE ACEPTACIÓN

## Paciente
Debe poder:
* Consultar servicios.
* Ver profesionales.
* Reservar.
* Pagar.
* Recibir confirmación.
* Consultar citas.
* Gestionarlas.
* Consultar información autorizada.

## Recepción
Debe poder:
* Gestionar agenda.
* Registrar pacientes.
* Crear citas.
* Cobrar.
* Gestionar caja.

## Profesional
Debe poder:
* Consultar agenda.
* Consultar pacientes.
* Registrar sesiones.
* Registrar evolución.
* Gestionar tratamientos.

## Administración
Debe poder:
* Gestionar usuarios.
* Configurar servicios.
* Gestionar profesionales.
* Gestionar horarios.
* Consultar reportes.
* Gestionar pagos.
* Gestionar inventario.
* Configurar comunicaciones.

---

# 98. DATOS DE PRUEBA

Crear datos ficticios.

Nunca utilizar información clínica real durante desarrollo.

Seed:
* Clínica demo.
* Usuarios.
* Profesionales.
* Especialidades.
* Servicios.
* Pacientes.
* Citas.
* Tratamientos.
* Productos.

---

# 99. README

Crear README con:
* Descripción.
* Arquitectura.
* Instalación.
* Variables.
* Desarrollo.
* Pruebas.
* Producción.

---

# 100. DOCUMENTACIÓN PARA EL CLIENTE

Crear manual no técnico:
* Cómo entrar.
* Cómo registrar paciente.
* Cómo crear cita.
* Cómo cambiar horario.
* Cómo atender paciente.
* Cómo registrar sesión.
* Cómo cobrar.
* Cómo cerrar caja.
* Cómo consultar reportes.
* Cómo gestionar servicios.

---

# 101. VARIABLES DE ENTORNO

Ejemplo:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

JWT_SECRET=
JWT_REFRESH_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

TELEGRAM_BOT_TOKEN=

PAYMENT_API_KEY=
PAYMENT_SECRET=

AI_API_KEY=
```

No colocar secretos directamente en código.

---

# 102. REGLAS PARA IA DE DESARROLLO

Si eres un agente de inteligencia artificial construyendo este proyecto:

### NO
* Inventes módulos sin avisar.
* Elimines información.
* Cambies arquitectura sin justificar.
* Rompas APIs existentes.
* Expongas secretos.
* Mezcles clínicas.
* Omitas validaciones.
* Supongas que el frontend es una barrera de seguridad.

### SÍ
* Mantén consistencia.
* Documenta decisiones.
* Reutiliza componentes.
* Reutiliza lógica.
* Escribe código mantenible.
* Agrega pruebas.
* Respeta permisos.
* Mantén aislamiento de clínicas.

---

# 103. REGLAS PARA LA EXPERIENCIA DE USUARIO

El usuario no debe necesitar conocer términos técnicos.

Mensajes:

* **Incorrecto:** "HTTP 409 conflict"
* **Correcto:** "Este horario acaba de ser reservado por otra persona."

* **Incorrecto:** "JWT expired"
* **Correcto:** "Tu sesión ha expirado. Vuelve a iniciar sesión."

---

# 104. DISEÑO DE COMPONENTES

Crear componentes reutilizables:
* Button.
* Input.
* Select.
* DatePicker.
* Modal.
* Drawer.
* Table.
* Pagination.
* Badge.
* Card.
* EmptyState.
* Loading.
* ErrorState.
* ConfirmationDialog.

Mantener consistencia visual.

---

# 105. FORMULARIOS

Los formularios deben:
* Mostrar etiquetas.
* Validar en tiempo real cuando tenga sentido.
* Mostrar errores cercanos.
* Mantener datos cuando exista error.
* Prevenir envíos duplicados.

---

# 106. ESTADOS DE INTERFAZ

Cada pantalla debe contemplar:
* Loading.
* Success.
* Empty.
* Error.
* Unauthorized.
* Not found.

No dejar pantallas vacías.

---

# 107. DASHBOARDS

No saturar con gráficos innecesarios.

Priorizar:
* Indicadores.
* Alertas.
* Próximas acciones.
* Información relevante.

---

# 108. PREPARACIÓN PARA CRECIMIENTO

La arquitectura debe permitir posteriormente agregar:
* WhatsApp.
* Aplicación móvil.
* Facturación electrónica.
* Multi-sede.
* Suscripciones.
* Planes SaaS.
* Agenda grupal.
* Telemedicina.
* Firma digital.
* Integraciones externas.

No es necesario implementar estas funciones inicialmente.
Solo preparar una arquitectura que no las bloquee.

---

# 109. MULTI-SEDE

Preparar la posibilidad futura de que una clínica tenga:
* Sede central.
* Sede norte.
* Sede sur.
* Otras sedes.

Estructura:
```text
Clínica
↓
Sedes
↓
Profesionales
↓
Horarios
↓
Citas.
```

No necesariamente implementar toda la funcionalidad en la primera versión, pero no bloquearla arquitectónicamente.

---

# 110. FUTURO MODELO SAAS

Preparar conceptualmente:
* Organización.
* Suscripción.
* Plan.
* Límites.
* Usuarios.
* Módulos habilitados.

Ejemplo futuro:

* **Plan Básico**: Agenda + pacientes.
* **Plan Profesional**: Agenda + pacientes + historia clínica.
* **Plan Premium**: Todos los módulos + automatizaciones + IA.

No implementar facturación SaaS mientras no esté dentro del alcance.

---

# 111. RESULTADO FINAL

CitasSistema debe terminar siendo una plataforma donde:

### PACIENTE
Descubre → consulta → reserva → paga → recibe confirmación → recibe recordatorio → asiste → recibe atención → consulta su información → continúa su tratamiento.

### PROFESIONAL
Consulta agenda → atiende → registra evolución → administra tratamiento → documenta.

### RECEPCIÓN
Organiza → agenda → confirma → cobra → atiende.

### ADMINISTRACIÓN
Configura → controla → analiza → automatiza → mejora la operación.

---

# 112. DEFINICIÓN DE "TERMINADO"

Un módulo solamente se considera terminado cuando:
* Funciona correctamente.
* Tiene validaciones.
* Tiene manejo de errores.
* Tiene permisos.
* Respeta el aislamiento por clínica.
* Es usable.
* Está conectado con los demás módulos.
* Tiene pruebas.
* Está documentado.
* No contiene secretos.
* No rompe funcionalidades existentes.

---

# 113. REGLA FINAL

Construye CitasSistema como un **producto profesional de software**, no como una colección de pantallas.

Cada decisión debe considerar:
**Paciente + profesional + recepción + administración + seguridad + escalabilidad + automatización.**

La prioridad siempre será:
1. **Seguridad**
2. **Integridad de datos**
3. **Correcto funcionamiento de citas**
4. **Experiencia de usuario**
5. **Automatización**
6. **Mantenibilidad**
7. **Escalabilidad**

El sistema debe poder comenzar como una solución para una clínica y evolucionar posteriormente hasta convertirse en una plataforma SaaS para múltiples clínicas.

No mezclar nunca CitasSistema con INSTEIP.

CitasSistema es un producto independiente, con su propia arquitectura, datos, usuarios, configuración, marca y evolución.

# FIN DEL SUPERPROMPT MAESTRO

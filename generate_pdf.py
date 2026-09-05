import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "CitasSistema — Documento Resumen de Funcionalidades y Estado")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.75)
            self.line(54, 744, 558, 744)

        # Footer (all pages)
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "Confidencial & Privado — CitasSistema SaaS Médico")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(54, 46, 558, 46)
        
        self.restoreState()

def build_pdf():
    pdf_filename = "SistemaCitasResumen.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Slate 900
    accent_color = colors.HexColor("#2563eb")  # Blue 600
    teal_color = colors.HexColor("#0d9488")    # Teal 600
    text_dark = colors.HexColor("#1e293b")     # Slate 800
    bg_light = colors.HexColor("#f8fafc")      # Slate 50
    border_color = colors.HexColor("#cbd5e1")  # Slate 300

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=accent_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=accent_color,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_dark,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_dark,
        leftIndent=12,
        spaceAfter=3
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=text_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0f172a")
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    story = []

    # Title & Metadata Banner
    story.append(Paragraph("CitasSistema — Informe Integral del Sistema", title_style))
    story.append(Paragraph("Plataforma SaaS Integral de Gestión de Citas, Pacientes y Operación Clínica", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceBefore=0, spaceAfter=10))

    # Resumen Ejecutivo
    exec_summary = (
        "<b>CitasSistema</b> es una plataforma web modular de alto rendimiento diseñada para clínicas, consultorios "
        "médicos y centros de rehabilitación física/fisioterapia. El sistema centraliza el ciclo completo del paciente "
        "(descubrimiento, agendamiento online en 11 pasos, asistencia con IA, recepción presencial, historia clínica digital inmutable, "
        "planes de tratamiento con escala EVA, recetas electrónicas, arqueo de caja chica, inventario kardex, notificaciones transaccionales y bot operativo de Telegram)."
    )
    story.append(Paragraph(exec_summary, body_style))
    story.append(Spacer(1, 6))

    # SECCIÓN 1: INVENTARIO DE FUNCIONALIDADES
    story.append(Paragraph("1. Catálogo Completo de Funcionalidades por Módulos", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=0, spaceAfter=6))

    story.append(Paragraph("🌐 Módulo I: Portal Público, Pacientes y Asistencia Virtual", h2_style))
    story.append(Paragraph("• <b>Landing Page Médica Premium:</b> Hero section interactivo, buscador de servicios y directorio médico con filtros por especialidad y tarifa.", bullet_style))
    story.append(Paragraph("• <b>Asistente IA RAG en Web:</b> Chatbot flotante con base de conocimiento clínica; orienta pacientes, previene diagnósticos y deriva a reservas.", bullet_style))
    story.append(Paragraph("• <b>Wizard de Reserva Online (11 Pasos):</b> Especialidad → Servicio → Profesional → Fecha → Hora → Paciente (DNI) → Resumen → Consentimiento Ley 29733 → Pago → Confirmación (CIT-2026-XXXX) → Google Calendar y PDF.", bullet_style))
    story.append(Paragraph("• <b>Portal Privado del Paciente:</b> Próxima cita con cuenta regresiva, historial de citas, reprogramación, consulta de sesiones y recetas.", bullet_style))

    story.append(Paragraph("⚡ Módulo II: Motor de Disponibilidad, Agenda y Anti-Colisión", h2_style))
    story.append(Paragraph("• <b>Cálculo de Slots en Tiempo Real (/availability):</b> Cruce de horarios, descansos y bloqueos en zona horaria America/Lima.", bullet_style))
    story.append(Paragraph("• <b>Motor Anti-Colisión Transaccional:</b> Prevención de reservas duplicadas simultáneas en base de datos (409 Conflict).", bullet_style))
    story.append(Paragraph("• <b>Máquina de Estados de Citas:</b> Pendiente → Confirmada → Check-in (En Espera) → En Consulta → Completada / Cancelada / No Asistió.", bullet_style))
    story.append(Paragraph("• <b>Auditoría Inmutable:</b> Registro histórico de cambios de estado con autor, fecha y motivo.", bullet_style))

    story.append(Paragraph("🩺 Módulo III: Módulo Clínico, Tratamientos y Recetas", h2_style))
    story.append(Paragraph("• <b>Historia Clínica Digital:</b> Formulario estructurado inmutable, signos vitales (PA, FC, SPO2, Temp, Peso), anamnesis y diagnóstico.", bullet_style))
    story.append(Paragraph("• <b>Planes de Tratamiento Multisesión:</b> Evolución sesión a sesión, registro comparativo de dolor EVA (0-10) y finalización automática.", bullet_style))
    story.append(Paragraph("• <b>Generador de Recetas Digitales:</b> Fármacos estructurados (dosis, vía, frecuencia, duración) con indicaciones generales.", bullet_style))

    story.append(Paragraph("💰 Módulo IV: Finanzas, Caja Chica e Inventario Kardex", h2_style))
    story.append(Paragraph("• <b>Pasarela de Pagos & Webhooks:</b> Pagos con tarjeta y manuales (POS, Efectivo, Yape, Plin), Idempotencia y firmas HMAC-SHA256.", bullet_style))
    story.append(Paragraph("• <b>Caja Chica y Arqueo Diario:</b> Apertura con monto base, registro de ingresos/egresos, cálculo de balance y detección de diferencias.", bullet_style))
    story.append(Paragraph("• <b>Inventario Kardex:</b> Catálogo de insumos, stock mínimo con alertas automáticas y registro de entradas/salidas/ajustes.", bullet_style))

    story.append(Paragraph("📩 Módulo V: Automatización, Emails y Bot de Telegram", h2_style))
    story.append(Paragraph("• <b>Emails Transaccionales:</b> Plantillas HTML y Cron Jobs de recordatorios automáticos 24h y 2h antes de la cita.", bullet_style))
    story.append(Paragraph("• <b>Bot de Telegram para Médicos:</b> Comandos (/hoy, /citas, /ingresos), alertas push, botones inline [ACEPTAR]/[RECHAZAR] y resumen 9:00 PM.", bullet_style))

    story.append(Spacer(1, 8))

    # SECCIÓN 2: FLUJOS DE TRABAJO
    story.append(Paragraph("2. Flujos de Trabajo Operativos (Workflows)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=0, spaceAfter=6))

    story.append(Paragraph("• <b>Flujo 1: Reserva Pública y Auto-Agendamiento:</b> Paciente ingresa a la web → Selecciona servicio/médico/slot → Completa datos y DNI → Acepta políticas de privacidad → Realiza pago → Recibe confirmación en pantalla y email.", bullet_style))
    story.append(Paragraph("• <b>Flujo 2: Recepción, Check-in y Cobro en Caja:</b> Recepcionista abre caja con monto base → Paciente llega y se busca por DNI → Se marca Check-in (pasa a En Espera) → Se registra el cobro en caja chica → Pasa a sala de espera.", bullet_style))
    story.append(Paragraph("• <b>Flujo 3: Atención Clínica del Profesional:</b> Médico abre agenda → Inicia consulta (En Consulta) → Registra signos vitales e Historia Clínica → Registra sesión de tratamiento con EVA → Emite receta médica → Cierra la cita (Completada).", bullet_style))
    story.append(Paragraph("• <b>Flujo 4: Automatización Diaria y Cierre:</b> Sistema envía recordatorios automáticos por email → Bot de Telegram notifica citas a médicos → A las 9:00 PM envía resumen de agenda del día siguiente → Recepción realiza arqueo y cierre formal de caja.", bullet_style))

    story.append(Spacer(1, 8))

    # SECCIÓN 3: MATRIZ DE ROLES Y PERMISOS (RBAC)
    story.append(Paragraph("3. Matriz de Roles y Permisos (RBAC)", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=0, spaceAfter=6))

    rbac_data = [
        [
            Paragraph("Módulo / Capacidad", table_header),
            Paragraph("SUPER_ADMIN", table_header),
            Paragraph("ADMIN_CLINIC", table_header),
            Paragraph("RECEPCION", table_header),
            Paragraph("PROFESIONAL", table_header),
            Paragraph("PACIENTE", table_header)
        ],
        [
            Paragraph("Gestión Multi-Sede Global", table_cell_bold),
            Paragraph("Total", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Modo Supervisión de Sede", table_cell_bold),
            Paragraph("Sí (Master)", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Médicos, Servicios y Tarifas", table_cell_bold),
            Paragraph("Total", table_cell),
            Paragraph("Su Sede", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Agenda y Agendamiento Rápido", table_cell_bold),
            Paragraph("Total", table_cell),
            Paragraph("Su Sede", table_cell),
            Paragraph("Su Sede", table_cell),
            Paragraph("Su Agenda", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Check-in de Pacientes", table_cell_bold),
            Paragraph("Total", table_cell),
            Paragraph("Su Sede", table_cell),
            Paragraph("Su Sede", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Historia Clínica & Recetas", table_cell_bold),
            Paragraph("No (Privacidad)", table_cell),
            Paragraph("No (Privacidad)", table_cell),
            Paragraph("No", table_cell),
            Paragraph("Atendidos", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Caja Chica & Arqueo Diario", table_cell_bold),
            Paragraph("Auditoría", table_cell),
            Paragraph("Auditoría", table_cell),
            Paragraph("Operación", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Inventario Kardex", table_cell_bold),
            Paragraph("Total", table_cell),
            Paragraph("Total", table_cell),
            Paragraph("Salidas", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Bot de Telegram", table_cell_bold),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("Su Cuenta", table_cell),
            Paragraph("No", table_cell)
        ],
        [
            Paragraph("Portal / Mis Citas & Recetas", table_cell_bold),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("No", table_cell),
            Paragraph("Propias", table_cell)
        ],
    ]

    rbac_table = Table(rbac_data, colWidths=[120, 75, 75, 75, 80, 75])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(rbac_table)

    story.append(Spacer(1, 8))

    # SECCIÓN 4: REGLAS DE NEGOCIO Y RESTRICCIONES
    story.append(Paragraph("4. Reglas de Negocio y Restricciones del Sistema", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=0, spaceAfter=6))

    story.append(Paragraph("1. <b>Aislamiento Multi-Tenant Estricto:</b> Toda petición exige <code>clinic_id</code>. Un usuario jamás puede ver ni alterar datos de otra clínica (403 Forbidden).", bullet_style))
    story.append(Paragraph("2. <b>Anti-Colisión de Horarios:</b> Prevención transaccional de doble reserva sobre un mismo slot y profesional (409 Conflict).", bullet_style))
    story.append(Paragraph("3. <b>Inmutabilidad de la Historia Clínica:</b> Registros cronológicos inalterables (append-only) para validez legal y médica.", bullet_style))
    story.append(Paragraph("4. <b>Tratamientos Completados:</b> Al finalizar el 100% de sesiones, se bloquea la adición de nuevas sesiones sin un nuevo plan.", bullet_style))
    story.append(Paragraph("5. <b>Idempotencia en Pagos:</b> Llave única <code>idempotency_key</code> y validación de firma HMAC-SHA256 en webhooks.", bullet_style))
    story.append(Paragraph("6. <b>Restricción Ética de IA:</b> Prohibido emitir diagnósticos médicos; orienta siempre a agendar con un especialista.", bullet_style))
    story.append(Paragraph("7. <b>Ley N° 29733 (Protección de Datos - Perú):</b> Consentimiento explícito de datos y trazabilidad en la ficha del paciente.", bullet_style))

    story.append(Spacer(1, 8))

    # SECCIÓN 5: PORCENTAJE GLOBAL DE DESARROLLO
    story.append(Paragraph("5. Porcentaje Global de Desarrollo Actual: ~86%", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=0, spaceAfter=6))

    progress_data = [
        [
            Paragraph("Capa / Módulo", table_header),
            Paragraph("Avance", table_header),
            Paragraph("Estado Técnico Actual", table_header)
        ],
        [
            Paragraph("Backend & Base de Datos", table_cell_bold),
            Paragraph("<b>95%</b>", table_cell),
            Paragraph("DDL Postgres, NestJS, RBAC, Anti-colisión, Lógica clínica, Pagos, Emails, Telegram, IA y 187 tests en verde.", table_cell)
        ],
        [
            Paragraph("Frontend UI/UX y Vistas", table_cell_bold),
            Paragraph("<b>88%</b>", table_cell),
            Paragraph("Landing, Wizard 11 pasos, 5 Dashboards por rol, Módulo Clínico, Caja Chica, Inventario y Bot maquetados.", table_cell)
        ],
        [
            Paragraph("Integración APIs HTTP", table_cell_bold),
            Paragraph("<b>75%</b>", table_cell),
            Paragraph("Vistas operativas con estado reactivo; falta conectar cliente HTTP con llamadas a controladores de NestJS.", table_cell)
        ],
        [
            Paragraph("Infraestructura & Despliegue", table_cell_bold),
            Paragraph("<b>25%</b>", table_cell),
            Paragraph("Entorno local listo; faltan variables de producción, Swagger formal y backups automatizados.", table_cell)
        ],
        [
            Paragraph("PROMEDIO GLOBAL", table_cell_bold),
            Paragraph("<b>~86%</b>", table_cell_bold),
            Paragraph("<b>Fase de Integración Final y Ajuste Fino hacia Producción</b>", table_cell_bold)
        ],
    ]

    progress_table = Table(progress_data, colWidths=[130, 60, 310])
    progress_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8fafc")]),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(progress_table)

    story.append(Spacer(1, 8))

    # SECCIÓN 6: QUÉ FALTA CONSTRUIR
    story.append(Paragraph("6. Tareas Pendientes para el 100% de Construcción", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=0, spaceAfter=6))

    story.append(Paragraph("1. <b>Capa Centralizada de API en Frontend (<code>apiClient.ts</code>):</b> Configurar cliente HTTP con interceptores JWT (Bearer) y header <code>x-clinic-id</code> para reemplazar los mocks por llamadas directas al backend.", bullet_style))
    story.append(Paragraph("2. <b>Persistencia de Sesión y Auth State:</b> Guardar token JWT y datos de usuario en <code>localStorage</code> para mantener sesión y redireccionar automáticamente por rol.", bullet_style))
    story.append(Paragraph("3. <b>Vinculación en Vivo con Telegram:</b> Conectar botón en UI médica para generar el link deep-link <code>https://t.me/TuBot?start=TOKEN</code> y asociar <code>chat_id</code>.", bullet_style))
    story.append(Paragraph("4. <b>Fase 14 — Producción y Documentación:</b> Swagger OpenAPI formal (/api/docs), variables <code>.env.production</code> y backups diarios de base de datos.", bullet_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {pdf_filename}")

if __name__ == "__main__":
    build_pdf()

import React, { useState } from 'react';
import './PatientDashboard.css';
import './ClinicalDashboard.css';
import { IconSearch } from '../../components/ui/Icons';

interface PatientDashboardProps {
  patientName?: string;
  onBookAppointment: () => void;
  onLogout?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patientName = 'Juan Pérez Quispe',
  onBookAppointment,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'receipts' | 'eva'>('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Motivos laborales o de estudio');

  // Reschedule form state
  const [rescheduleDate, setRescheduleDate] = useState('Viernes, 11 de Septiembre');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');

  // Express Booking Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedBookingService, setSelectedBookingService] = useState<string>('plan_lumbar');
  const [bookingMode, setBookingMode] = useState<'presencial' | 'teleconsulta'>('presencial');
  const [bookingDate, setBookingDate] = useState<string>('Lunes, 14 Sep');
  const [bookingTime, setBookingTime] = useState<string>('10:30 AM');
  const [bookingPayment, setBookingPayment] = useState<'clinica' | 'yape' | 'eps'>('clinica');

  const handleOpenBookingModal = () => {
    onBookAppointment?.();
    setBookingStep(1);
    setIsBookingModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const historyAppointments = [
    {
      id: 'h-1',
      date: '24 Ago',
      fullDate: '24 de Agosto, 2026 · 09:30 AM',
      title: 'Evaluación Inicial y Diagnóstico Biomecánico',
      doctor: 'Dra. María González · Fisioterapia & Rehabilitación',
      status: 'Atendida',
      doctorCmp: 'CMP 48291',
      notes: 'Diagnóstico: Lumbalgia mecánica aguda. Inicio de plan de 10 sesiones.',
    },
    {
      id: 'h-2',
      date: '18 Ago',
      fullDate: '18 de Agosto, 2026 · 11:00 AM',
      title: 'Sesión 1/5: Terapia Manual y Descompresión Lumbar',
      doctor: 'Lic. Andrés Paredes · Terapia Física',
      status: 'Atendida',
      doctorCmp: 'CTMP 14920',
      notes: 'Aplicación de diatermia y tracción manual axial con alivio inmediato.',
    },
  ];

  const prescriptions = [
    {
      id: 'rx-1',
      code: 'Receta Digital #RX-2026-088',
      medication: 'Ibuprofeno 400mg · Cada 8 horas por 3 días',
      instructions: 'Tomar después de alimentos. Aplicar compresas de hielo 15 min.',
      date: '10 de Septiembre, 2026',
      doctor: 'Dra. María González (CMP 48291)',
      validUntil: '15 de Septiembre, 2026',
    },
    {
      id: 'rx-2',
      code: 'Receta Digital #RX-2026-042',
      medication: 'Complejo B Forte · 1 ampolla intramuscular interdiaria (3 dosis)',
      instructions: 'Aplicación en tópico de enfermería de la clínica.',
      date: '24 de Agosto, 2026',
      doctor: 'Dra. María González (CMP 48291)',
      validUntil: '30 de Agosto, 2026',
    },
  ];

  const receipts = [
    {
      id: 'rec-1',
      number: 'Boleta Electrónica B001-000491',
      description: 'Pago de Cita Fisioterapia · S/ 80.00',
      method: 'Pagado con Tarjeta (Visa)',
      amount: 'S/ 80.00',
      status: 'Aprobado SUNAT',
      date: '24 de Agosto, 2026',
      ruc: '20601234567',
    },
    {
      id: 'rec-2',
      number: 'Boleta Electrónica B001-000420',
      description: 'Consulta Inicial Diagnóstica · S/ 120.00',
      method: 'Pagado con Yape',
      amount: 'S/ 120.00',
      status: 'Aprobado SUNAT',
      date: '18 de Agosto, 2026',
      ruc: '20601234567',
    },
  ];

  const evaHistory = [
    { session: 'Sesión 1', date: '18 Ago', score: 8, label: 'Dolor Severo', trend: 'high', note: 'Inicio de tratamiento' },
    { session: 'Sesión 3', date: '25 Ago', score: 6, label: 'Dolor Moderado', trend: 'mid', note: 'Mejoría en flexión' },
    { session: 'Sesión 5', date: '01 Sep', score: 4, label: 'Dolor Leve-Mod', trend: 'mid', note: 'Mayor movilidad' },
    { session: 'Sesión 8', date: '08 Sep', score: 2, label: 'Dolor Mínimo', trend: 'low', note: 'Recuperación 75%' },
  ];

  return (
    <div className="patient-portal-canvas">
      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: '14px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.84rem',
          fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.5rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="patient-header-banner">
        <div className="patient-identity-cluster">
          <div className="patient-avatar-large">
            JP
            <span className="patient-avatar-dot" />
          </div>
          <div className="patient-title-group">
            <div className="patient-meta-badges">
              <span className="badge-verified-patient">● Paciente Activo · DNI 74918230</span>
              <span className="badge-clinic-scope">🏥 Clínica Sanitas Lima</span>
            </div>
            <h1>Portal del Paciente</h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569' }}>
              Bienvenido(a), <strong style={{ color: '#0f172a' }}>{patientName}</strong>. Gestiona tus citas, recetas y evolución clínica.
            </p>
          </div>
        </div>

        <div className="patient-header-actions">
          <button
            type="button"
            className="btn-book-primary"
            onClick={handleOpenBookingModal}
          >
            <span>📅</span>
            <span>+ Reservar Nueva Cita</span>
          </button>

          <button
            type="button"
            className="btn-ghost-secondary"
            onClick={() => showToast('📥 Generando expediente clínico completo en PDF...')}
          >
            <span>📑</span>
            <span>Descargar Historial</span>
          </button>

          {onLogout && (
            <button
              type="button"
              className="btn-ghost-secondary"
              onClick={onLogout}
              style={{ color: '#64748b' }}
            >
              <span>⎋</span>
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Grid: Next Appointment Hero + Health Insights */}
      <div className="patient-top-grid">
        {/* Next Appointment Card */}
        <div className="next-appointment-card">
          <div>
            <div className="appointment-status-strip">
              <span className="badge-status-confirmed">
                <span className="dot-pulse-green" />
                Próxima Cita Confirmada
              </span>
              <span className="appointment-countdown-pill">
                En 7 días · Recordatorio Activo
              </span>
            </div>

            <div className="appointment-main-info" style={{ marginTop: '1rem' }}>
              <h2>Terapia Manual Ortopédica (45 minutos)</h2>
              
              <div className="appointment-doctor-row">
                <div className="doctor-avatar-circle">
                  MG
                </div>
                <div className="doctor-info-text">
                  <h4>Dra. María González</h4>
                  <p>Fisioterapia y Rehabilitación · CMP 48291</p>
                </div>
              </div>

              <div className="appointment-meta-grid">
                <div className="meta-info-box">
                  <span className="meta-icon">📅</span>
                  <div>
                    <span className="meta-label">Fecha y Hora</span>
                    <span className="meta-value">Jueves, 10 de Septiembre · 10:00 AM</span>
                  </div>
                </div>

                <div className="meta-info-box">
                  <span className="meta-icon">📍</span>
                  <div>
                    <span className="meta-label">Ubicación y Sala</span>
                    <span className="meta-value">Sede San Isidro · Box 102 (Piso 1)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="appointment-action-bar">
            <button
              type="button"
              className="btn-reschedule"
              onClick={() => setIsRescheduleOpen(true)}
            >
              <span>🔄</span>
              <span>Reprogramar Fecha</span>
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsCancelOpen(true)}
            >
              <span>✕</span>
              <span>Cancelar Cita</span>
            </button>
          </div>
        </div>

        {/* Health Insights Column */}
        <div className="patient-insights-col">
          {/* Treatment Progress Card */}
          <div className="widget-card">
            <div className="widget-header">
              <div className="widget-title-wrap">
                <div className="widget-icon teal">🎯</div>
                <div>
                  <h3 className="widget-title">Plan de Tratamiento Activo</h3>
                  <p className="widget-subtitle">Rehabilitación de Columna Lumbar</p>
                </div>
              </div>
              <span className="progress-counter-badge">8 de 10 Sesiones</span>
            </div>

            <div className="treatment-progress-bar">
              <div className="progress-fill-gradient" style={{ width: '80%' }} />
            </div>

            <div className="treatment-footer-notes">
              <span>Iniciado: 12 de Agosto, 2026</span>
              <span style={{ color: '#047857', fontWeight: 800 }}>✓ 80% completado (Alta cercana)</span>
            </div>
          </div>

          {/* Quick Health Metrics Micro-Grid */}
          <div className="health-stats-grid">
            <div className="stat-metric-card">
              <span className="stat-icon">📈</span>
              <div>
                <span className="stat-label">Alivio EVA</span>
                <span className="stat-value" style={{ color: '#16a34a' }}>8/10 ➔ 2/10 (-75%)</span>
              </div>
            </div>

            <div className="stat-metric-card">
              <span className="stat-icon">💊</span>
              <div>
                <span className="stat-label">Recetas Activas</span>
                <span className="stat-value" style={{ color: '#7c3aed' }}>2 Emitidas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Records & Clinical History Section */}
      <div className="patient-records-container">
        <div className="records-toolbar">
          <div className="tab-segmented-group">
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <span>📅</span>
              <span>Mis Citas Anteriores ({historyAppointments.length})</span>
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              <span>💊</span>
              <span>Recetas Médicas ({prescriptions.length})</span>
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'receipts' ? 'active' : ''}`}
              onClick={() => setActiveTab('receipts')}
            >
              <span>🧾</span>
              <span>Comprobantes de Pago ({receipts.length})</span>
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === 'eva' ? 'active' : ''}`}
              onClick={() => setActiveTab('eva')}
            >
              <span>📊</span>
              <span>Evolución EVA</span>
            </button>
          </div>

          <div className="records-search-wrap">
            <span className="search-icon-pos">
              <IconSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar en mi historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-field"
            />
          </div>
        </div>

        {/* TAB 1: Appointments History */}
        {activeTab === 'appointments' && (
          <div>
            {historyAppointments
              .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.doctor.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(apt => (
                <div key={apt.id} className="history-card-item">
                  <div className="history-item-left">
                    <div className="history-date-badge">
                      <span className="day-num">{apt.date.split(' ')[0]}</span>
                      <span className="month-label">{apt.date.split(' ')[1]}</span>
                    </div>
                    <div className="history-details-text">
                      <h3>{apt.title}</h3>
                      <p>{apt.doctor} · {apt.fullDate}</p>
                      <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>{apt.notes}</p>
                    </div>
                  </div>

                  <div className="history-item-actions">
                    <span className="badge-attended-pill">
                      ✓ {apt.status}
                    </span>
                    <button
                      type="button"
                      className="btn-download-record"
                      onClick={() => showToast(`📥 Descarga iniciada: Ficha de Atención #${apt.id} con Firma Digital.`)}
                    >
                      <span>📥</span>
                      <span>Ficha Clínica (PDF)</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* TAB 2: Digital Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Prescripciones Médicas Digitales con Firma Colegiada
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Recetas oficiales con código QR y validez farmacéutica a nivel nacional (Ley N° 27269).
                </p>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                🛡️ Firma Digital MINSA Activa
              </span>
            </div>

            {prescriptions
              .filter(r => r.medication.toLowerCase().includes(searchTerm.toLowerCase()) || r.code.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(rx => (
                <div key={rx.id} className="prescription-card-item" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <div>
                    <div className="rx-header-strip">
                      <span className="rx-code-tag">{rx.code}</span>
                      <span className="rx-date-tag">Emitida: {rx.date}</span>
                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>● Válida hasta {rx.validUntil}</span>
                    </div>
                    <h3 className="rx-medication-title">{rx.medication}</h3>
                    <p className="rx-instruction-text">📋 <strong>Posología:</strong> {rx.instructions}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Médico: {rx.doctor}</span>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
                        🏥 Aceptada en Boticas & Farmacias
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-download-rx"
                      style={{ background: '#7c3aed', color: '#ffffff', border: 'none', boxShadow: '0 4px 12px -2px rgba(124, 58, 237, 0.35)' }}
                      onClick={() => showToast(`📄 Descargando ${rx.code} con Firma Digital MINSA y Código QR (PDF)...`)}
                    >
                      <span>📥</span>
                      <span>Descargar Receta (PDF)</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* TAB 3: Receipts / Vouchers */}
        {activeTab === 'receipts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Comprobantes de Pago Electrónicos (SUNAT)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Boletas y facturas electrónicas emitidas por tus atenciones en Clínica Sanitas.
                </p>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                ✓ 100% Declarado ante SUNAT
              </span>
            </div>

            {receipts
              .filter(rec => rec.number.toLowerCase().includes(searchTerm.toLowerCase()) || rec.description.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(rec => (
                <div key={rec.id} className="receipt-card-item">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 className="receipt-code-title" style={{ margin: 0 }}>{rec.number} · {rec.date}</h3>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        ✓ {rec.status}
                      </span>
                    </div>
                    <p className="receipt-desc-text">{rec.description}</p>
                    <span className="receipt-pay-tag">
                      <span>💳</span>
                      <span>{rec.method} · Emisor RUC {rec.ruc}</span>
                    </span>
                  </div>

                  <div className="receipt-action-col">
                    <span className="receipt-amount-display">{rec.amount}</span>
                    <button
                      type="button"
                      className="btn-download-receipt"
                      onClick={() => showToast(`📥 Descarga iniciada: ${rec.number} autorizada por SUNAT (PDF).`)}
                    >
                      <span>📥</span>
                      <span>Descargar Boleta</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* TAB 4: EVA Pain Evolution */}
        {activeTab === 'eva' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Evolución del Nivel de Dolor (Escala EVA 0 a 10)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Monitoreo clínico sesión tras sesión registrado por el médico tratante.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', background: '#ecfdf5', padding: '0.3rem 0.75rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                🎉 Reducción total de dolor: -75%
              </span>
            </div>

            <div className="eva-timeline-grid">
              {evaHistory.map((item, idx) => (
                <div key={idx} className={`eva-step-card ${idx === evaHistory.length - 1 ? 'current' : ''}`}>
                  <span className="eva-session-num">{item.session} · {item.date}</span>
                  <div className={`eva-score-large ${item.trend}`}>
                    {item.score}/10
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: item.trend === 'low' ? '#16a34a' : item.trend === 'mid' ? '#d97706' : '#dc2626' }}>
                    {item.label}
                  </span>
                  <p className="eva-note-mini" style={{ marginTop: '4px' }}>{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Reprogramación */}
      {isRescheduleOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsRescheduleOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '96%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bae6fd' }}>
                  🔄
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Reprogramar mi Cita Médica
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Cita actual: Jueves, 10 Sep · 10:00 AM con Dra. María González
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Tarjeta 1: Fecha */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title">
                    <span>📅</span>
                    Selecciona Nueva Fecha
                  </h4>
                  <span className="form-section-badge">DISPONIBILIDAD</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['Viernes, 11 Sep', 'Sábado, 12 Sep', 'Lunes, 14 Sep', 'Martes, 15 Sep', 'Miércoles, 16 Sep', 'Jueves, 17 Sep'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setRescheduleDate(d)}
                      style={{
                        padding: '0.65rem 0.35rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${rescheduleDate === d ? '#0284c7' : '#cbd5e1'}`,
                        background: rescheduleDate === d ? '#f0f9ff' : '#ffffff',
                        color: rescheduleDate === d ? '#0284c7' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 120ms ease'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarjeta 2: Turnos */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title">
                    <span>⏰</span>
                    Horarios Disponibles para {rescheduleDate}
                  </h4>
                  <span className="form-section-badge">TURNO</span>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Mañana:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.25rem' }}>
                    {['09:00 AM', '10:30 AM', '11:45 AM'].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setRescheduleTime(h)}
                        style={{
                          padding: '0.5rem 0.25rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${rescheduleTime === h ? '#0284c7' : '#cbd5e1'}`,
                          background: rescheduleTime === h ? '#f0f9ff' : '#ffffff',
                          color: rescheduleTime === h ? '#0284c7' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Tarde:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.25rem' }}>
                    {['03:00 PM', '04:30 PM', '06:00 PM'].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setRescheduleTime(h)}
                        style={{
                          padding: '0.5rem 0.25rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${rescheduleTime === h ? '#0284c7' : '#cbd5e1'}`,
                          background: rescheduleTime === h ? '#f0f9ff' : '#ffffff',
                          color: rescheduleTime === h ? '#0284c7' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Notificación */}
              <div className="form-section-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#166534', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📲</span>
                  <span>Te enviaremos la confirmación de tu nueva fecha y recordatorio por WhatsApp y correo electrónico.</span>
                </p>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => setIsRescheduleOpen(false)}
              >
                Volver
              </button>
              <button
                type="button"
                className="cash-btn primary"
                style={{ background: '#0284c7', borderColor: '#0284c7', boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.35)' }}
                onClick={() => {
                  showToast(`✓ Cita reprogramada para el ${rescheduleDate} a las ${rescheduleTime}. Enviamos confirmación a tu WhatsApp.`);
                  setIsRescheduleOpen(false);
                }}
              >
                ✓ Confirmar Reprogramación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelación */}
      {isCancelOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsCancelOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '96%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fecaca' }}>
                  ✕
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>
                    Cancelar Cita Médica
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Liberación de cupo para la sala de espera
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
              <div className="form-section-card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
                  ⚠️ Según la política de la clínica, puedes cancelar o reprogramar sin penalidad hasta 2 horas antes de tu horario asignado.
                </p>
              </div>

              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title">
                    <span>📋</span>
                    Motivo de la Cancelación
                  </h4>
                  <span className="form-section-badge">OPCIONAL</span>
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Selecciona el motivo principal</label>
                  <select
                    className="modern-form-input"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  >
                    <option value="Motivos laborales o de estudio">Motivos laborales o de estudio</option>
                    <option value="Inconveniente de salud o movilidad">Inconveniente de salud o movilidad</option>
                    <option value="Viaje no planificado">Viaje no planificado</option>
                    <option value="Otro">Otro motivo personal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => setIsCancelOpen(false)}
              >
                Conservar mi Cita
              </button>
              <button
                type="button"
                className="cash-btn primary"
                style={{ background: '#dc2626', borderColor: '#dc2626', boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.35)' }}
                onClick={() => {
                  showToast('✓ Cita cancelada. Tu turno ha sido liberado para la sala de espera.');
                  setIsCancelOpen(false);
                }}
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamiento Express en 3 Pasos del Paciente */}
      {isBookingModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsBookingModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '96%', padding: 0, overflow: 'hidden' }}>
            {/* Header del Modal */}
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.4)' }}>
                  📅
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Agendar Cita Médica Express
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Paciente: <strong>{patientName}</strong> (DNI 74918230)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Step Indicator (Solo en pasos 1, 2, 3) */}
            {bookingStep <= 3 && (
              <div className="booking-step-indicator">
                <div className={`step-node ${bookingStep === 1 ? 'active' : bookingStep > 1 ? 'completed' : ''}`}>
                  <span className="step-number">{bookingStep > 1 ? '✓' : '1'}</span>
                  <span>Tratamiento</span>
                </div>
                <span style={{ color: '#cbd5e1' }}>➔</span>
                <div className={`step-node ${bookingStep === 2 ? 'active' : bookingStep > 2 ? 'completed' : ''}`}>
                  <span className="step-number">{bookingStep > 2 ? '✓' : '2'}</span>
                  <span>Fecha & Turno</span>
                </div>
                <span style={{ color: '#cbd5e1' }}>➔</span>
                <div className={`step-node ${bookingStep === 3 ? 'active' : ''}`}>
                  <span className="step-number">3</span>
                  <span>Pago & Confirmación</span>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div style={{ padding: '1.35rem 1.5rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* PASO 1: Selección de Tratamiento o Consulta */}
              {bookingStep === 1 && (
                <div>
                  <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    ¿Qué tipo de atención médica necesitas agendar?
                  </h4>

                  {/* Opción 1: Recomendada (Continuar Plan Activo) */}
                  <div
                    className={`service-option-card recommended ${selectedBookingService === 'plan_lumbar' ? 'selected' : ''}`}
                    onClick={() => setSelectedBookingService('plan_lumbar')}
                  >
                    <div>
                      <span className="badge-recommended">⭐ Recomendado · Tu Plan Activo</span>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                        Rehabilitación de Columna Lumbar (Sesión 9 de 10)
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569' }}>
                        🩺 Médico asignado: <strong>Dra. María González</strong> · Sede San Isidro
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#15803d' }}>S/ 80.00</span>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Tarifa Preferencial</span>
                    </div>
                  </div>

                  {/* Opción 2: Nueva Consulta Fisioterapia */}
                  <div
                    className={`service-option-card ${selectedBookingService === 'fisio_general' ? 'selected' : ''}`}
                    onClick={() => setSelectedBookingService('fisio_general')}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        Evaluación & Diagnóstico Inicial de Fisioterapia
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                        Evaluación biomecánica completa (45 min) · Dra. María González
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>S/ 100.00</span>
                    </div>
                  </div>

                  {/* Opción 3: Consulta Traumatología */}
                  <div
                    className={`service-option-card ${selectedBookingService === 'trauma' ? 'selected' : ''}`}
                    onClick={() => setSelectedBookingService('trauma')}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        Consulta Médica con Traumatología
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                        Revisión de imágenes y evaluación articular (30 min) · Dr. Carlos Mendoza
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>S/ 150.00</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Modalidad, Fecha y Horarios */}
              {bookingStep === 2 && (
                <div>
                  <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    1. Modalidad de Atención:
                  </h4>
                  <div className="booking-mode-group">
                    <button
                      type="button"
                      className={`booking-mode-btn ${bookingMode === 'presencial' ? 'selected' : ''}`}
                      onClick={() => setBookingMode('presencial')}
                    >
                      <span>🏥</span>
                      <span>Presencial (Sede San Isidro)</span>
                    </button>
                    <button
                      type="button"
                      className={`booking-mode-btn ${bookingMode === 'teleconsulta' ? 'selected' : ''}`}
                      onClick={() => setBookingMode('teleconsulta')}
                    >
                      <span>💻</span>
                      <span>Teleconsulta Online</span>
                    </button>
                  </div>

                  <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    2. Selecciona el Día de tu Cita:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {['Lunes, 14 Sep', 'Martes, 15 Sep', 'Miércoles, 16 Sep', 'Jueves, 17 Sep', 'Viernes, 18 Sep', 'Sábado, 19 Sep'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setBookingDate(d)}
                        style={{
                          padding: '0.65rem 0.35rem',
                          borderRadius: '10px',
                          border: `1.5px solid ${bookingDate === d ? '#0284c7' : '#cbd5e1'}`,
                          background: bookingDate === d ? '#f0f9ff' : '#ffffff',
                          color: bookingDate === d ? '#0284c7' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    3. Horarios Disponibles ({bookingDate}):
                  </h4>
                  <div style={{ marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Turno Mañana:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.25rem' }}>
                      {['09:00 AM', '10:30 AM', '11:45 AM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBookingTime(t)}
                          style={{
                            padding: '0.5rem 0.25rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${bookingTime === t ? '#0284c7' : '#cbd5e1'}`,
                            background: bookingTime === t ? '#f0f9ff' : '#ffffff',
                            color: bookingTime === t ? '#0284c7' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Turno Tarde:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginTop: '0.25rem' }}>
                      {['03:00 PM', '04:30 PM', '06:00 PM'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBookingTime(t)}
                          style={{
                            padding: '0.5rem 0.25rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${bookingTime === t ? '#0284c7' : '#cbd5e1'}`,
                            background: bookingTime === t ? '#f0f9ff' : '#ffffff',
                            color: bookingTime === t ? '#0284c7' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: Método de Pago y Confirmación */}
              {bookingStep === 3 && (
                <div>
                  {/* Resumen Card */}
                  <div style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Resumen de Cita Médica</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>● Cupo Reservado (10 min)</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                      Rehabilitación de Columna Lumbar (Sesión 9/10)
                    </h4>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: '#475569' }}>
                      🩺 Dra. María González · {bookingMode === 'presencial' ? 'Sede San Isidro (Box 102)' : 'Teleconsulta por Video HD'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>📅 {bookingDate} · {bookingTime}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284c7' }}>S/ 80.00</span>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    Selecciona tu Método de Pago:
                  </h4>

                  <div
                    className={`payment-method-card ${bookingPayment === 'clinica' ? 'selected' : ''}`}
                    onClick={() => setBookingPayment('clinica')}
                  >
                    <span>🏢</span>
                    <div style={{ flex: 1 }}>
                      <div>Pagar en Clínica al Asistir</div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>Efectivo, Tarjetas POS o Yape en el mostrador de recepción</span>
                    </div>
                    <input type="radio" checked={bookingPayment === 'clinica'} readOnly />
                  </div>

                  <div
                    className={`payment-method-card ${bookingPayment === 'yape' ? 'selected' : ''}`}
                    onClick={() => setBookingPayment('yape')}
                  >
                    <span>📱</span>
                    <div style={{ flex: 1 }}>
                      <div>Pagar ahora con Yape / Plin</div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>Confirmación inmediata con comprobante digital automático</span>
                    </div>
                    <input type="radio" checked={bookingPayment === 'yape'} readOnly />
                  </div>

                  <div
                    className={`payment-method-card ${bookingPayment === 'eps' ? 'selected' : ''}`}
                    onClick={() => setBookingPayment('eps')}
                  >
                    <span>🛡️</span>
                    <div style={{ flex: 1 }}>
                      <div>Convenio con Seguro Médico / EPS</div>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>Pacífico, Rímac, Sanitas, Mapfre (Copago S/ 0.00 a S/ 25.00)</span>
                    </div>
                    <input type="radio" checked={bookingPayment === 'eps'} readOnly />
                  </div>

                  <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                    <span>📲</span>
                    <span style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 600 }}>
                      Enviaremos el recordatorio con GPS y enlace a tu WhatsApp (+51 987 654 321).
                    </span>
                  </div>
                </div>
              )}

              {/* PASO 4: Confirmación Exitosa */}
              {bookingStep === 4 && (
                <div className="booking-success-view">
                  <div className="success-icon-animated">✓</div>
                  <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                    ¡Tu Cita Médica está Confirmada!
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Hemos agendado tu turno en el sistema de la <strong>Dra. María González</strong>.
                  </p>

                  <div className="booking-code-box">
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Código de Cita Médica</span>
                    <span className="booking-code-value">#CIT-2026-9812</span>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.95rem 1.15rem', textAlign: 'left', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Fecha y Hora</span>
                        <strong style={{ color: '#0f172a' }}>{bookingDate} · {bookingTime}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', fontWeight: 600, display: 'block' }}>Sede / Sala</span>
                        <strong style={{ color: '#0f172a' }}>San Isidro · Box 102</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="cash-btn ghost"
                      style={{ flex: 1, padding: '0.65rem', fontSize: '0.8rem' }}
                      onClick={() => showToast('📅 Evento añadido a tu calendario.')}
                    >
                      <span>📅</span>
                      <span>Añadir a Google Calendar</span>
                    </button>
                    <button
                      type="button"
                      className="cash-btn primary"
                      style={{ flex: 1, padding: '0.65rem', fontSize: '0.8rem', background: '#0284c7', borderColor: '#0284c7' }}
                      onClick={() => setIsBookingModalOpen(false)}
                    >
                      🚀 Volver a Mi Portal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Solo en pasos 1, 2, 3) */}
            {bookingStep <= 3 && (
              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                {bookingStep > 1 ? (
                  <button
                    type="button"
                    className="cash-btn ghost"
                    onClick={() => setBookingStep((prev) => prev - 1)}
                  >
                    ← Anterior
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cash-btn ghost"
                    onClick={() => setIsBookingModalOpen(false)}
                  >
                    Cancelar
                  </button>
                )}

                {bookingStep < 3 ? (
                  <button
                    type="button"
                    className="cash-btn primary"
                    style={{ background: '#0284c7', borderColor: '#0284c7', boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.35)' }}
                    onClick={() => setBookingStep((prev) => prev + 1)}
                  >
                    <span>Continuar</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cash-btn primary"
                    style={{ background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)', borderColor: '#0284c7', boxShadow: '0 4px 14px -2px rgba(5, 150, 105, 0.45)' }}
                    onClick={() => {
                      showToast(`✓ ¡Cita agendada para el ${bookingDate} a las ${bookingTime}! Recordatorio enviado a tu WhatsApp.`);
                      setBookingStep(4);
                    }}
                  >
                    <span>✓ Confirmar y Agendar Cita</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;


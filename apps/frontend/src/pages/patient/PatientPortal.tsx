import React, { useState } from 'react';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  PatientPrescriptionsPanel,
  PatientPaymentsPanel,
  PatientPrescription,
  PatientReceipt,
  RescheduleModal,
  CancelAppointmentModal,
  PatientUpcomingAppointment,
} from '../../components/patient';
import '../dashboards/PatientDashboard.css';
import './PatientPortal.css';

interface PatientPortalProps {
  onLogout: () => void;
  onBookAppointment: () => void;
}

interface PortalAppointment {
  id: string;
  serviceName: string;
  professionalName: string;
  date: string;
  day: string;
  month: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'pending';
  notes: string;
}

const INITIAL_UPCOMING_APPOINTMENTS: PortalAppointment[] = [
  {
    id: 'appt-101',
    serviceName: 'Sesión de Fisioterapia y Punción Seca',
    professionalName: 'Dra. María González Flores',
    date: '2026-09-08',
    day: '08',
    month: 'Sep',
    time: '10:00 AM',
    duration: '45 min',
    status: 'confirmed',
    notes: 'Sesión 7 de 10 — Fortalecimiento lumbar y electroterapia.',
  },
  {
    id: 'appt-102',
    serviceName: 'Evaluación y Control Traumatológico',
    professionalName: 'Dr. Carlos Mendoza Ruiz',
    date: '2026-09-22',
    day: '22',
    month: 'Sep',
    time: '04:30 PM',
    duration: '30 min',
    status: 'pending',
    notes: 'Control post-tratamiento de hombro.',
  },
];

export const PatientPortal: React.FC<PatientPortalProps> = ({
  onLogout,
  onBookAppointment,
}) => {
  const [activeTab, setActiveTab] = useState<'citas' | 'tratamientos' | 'perfil' | 'pagos'>('citas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<PortalAppointment[]>(INITIAL_UPCOMING_APPOINTMENTS);
  const [reschedulingAppt, setReschedulingAppt] = useState<PatientUpcomingAppointment | null>(null);
  const [cancellingAppt, setCancellingAppt] = useState<PortalAppointment | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmReschedule = (newDate: string, newTime: string) => {
    if (!reschedulingAppt) return;
    const parts = newDate.replace(',', '').split(' ');
    const day = parts.length > 1 ? parts[1].padStart(2, '0') : '15';
    const month = parts.length > 2 ? parts[2] : 'Sep';

    setUpcomingAppointments((prev) =>
      prev.map((a) =>
        a.id === reschedulingAppt.id
          ? {
              ...a,
              day,
              month,
              time: newTime,
              notes: `Reprogramada con éxito para el ${newDate} a las ${newTime}.`,
            }
          : a
      )
    );
    showToast(`Cita reprogramada con éxito para el ${newDate} a las ${newTime}.`);
    setReschedulingAppt(null);
  };

  const handleConfirmCancel = (reason: string) => {
    if (!cancellingAppt) return;
    setUpcomingAppointments((prev) => prev.filter((a) => a.id !== cancellingAppt.id));
    showToast(`Cita cancelada con éxito (${reason}). Horario liberado.`);
    setCancellingAppt(null);
  };

  // Simulated Patient Data
  const patient = {
    firstName: 'Juan Carlos',
    lastName: 'Pérez Gómez',
    nationalId: '73829104',
    email: 'paciente@clinica.pe',
    phone: '+51 987 654 321',
    birthDate: '1992-05-14',
    bloodType: 'O+',
    allergies: 'Ninguna conocida',
    emergencyContact: 'María Gómez (Madre) - +51 991 223 344',
    consentGranted: true,
  };

  const activeTreatments = [
    {
      id: 'treat-1',
      title: 'Plan de Readaptación Lumbar y Postural',
      prescribedBy: 'Dra. María González Flores (CMP 48291)',
      totalSessions: 10,
      completedSessions: 6,
      diagnostics: 'Lumbalgia mecánica postural por sedentarismo laboral.',
      homeExercises: 'Estiramientos isquiotibiales 2 veces al día y pausas activas cada 2 horas.',
    },
  ];

  const digitalPrescriptions = [
    {
      id: 'rx-2026-088',
      code: 'Receta Digital #RX-2026-088',
      medication: 'Ibuprofeno 400mg Comprimidos Recubiertos',
      dosage: '1 tableta cada 8 horas por 3 días después de alimentos.',
      date: '10 de Septiembre, 2026',
      validity: 'Vigente hasta 15 Sep 2026',
      doctor: 'Dra. María González Flores · CMP 48291 · RNE 19283',
      instructions: 'Aplicar frío local (compresas de gel) 15 minutos tras la sesión de fisioterapia.',
    },
    {
      id: 'rx-2026-042',
      code: 'Receta Digital #RX-2026-042',
      medication: 'Complejo B Forte Ampollas Inyectables (3 Dosis)',
      dosage: '1 ampolla intramuscular interdiaria en tópico de enfermería.',
      date: '24 de Agosto, 2026',
      validity: 'Tratamiento completado',
      doctor: 'Dra. María González Flores · CMP 48291',
      instructions: 'Administración en tópico de enfermería de Clínica Sanitas Sede San Isidro.',
    },
  ];

  const paymentReceipts = [
    {
      id: 'rec-001',
      number: 'Boleta Electrónica B001-000491',
      service: 'Terapia Manual Ortopédica & Descompresión',
      amount: 'S/ 80.00',
      date: '24 de Agosto, 2026',
      method: 'Pagado con Tarjeta Visa (POS)',
      authCode: 'AUTH-948102',
      status: 'Aprobado SUNAT',
    },
    {
      id: 'rec-002',
      number: 'Boleta Electrónica B001-000420',
      service: 'Consulta Médica de Evaluación Inicial',
      amount: 'S/ 120.00',
      date: '18 de Agosto, 2026',
      method: 'Pagado con Yape (App Móvil)',
      authCode: 'YAPE-839102',
      status: 'Aprobado SUNAT',
    },
  ];

  return (
    <div className="portal-container">
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
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}
            title="Cerrar notificación"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="portal-main">
        {/* Hero Greeting & Quick Action */}
        <div className="portal-hero-row">
          <div className="portal-greeting">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.65rem', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <span>● PACIENTE ACTIVO · DNI {patient.nationalId}</span>
            </div>
            <h1>¡Hola, {patient.firstName}!</h1>
            <p>Bienvenido(a) a tu panel de salud, recetas médicas y comprobantes electrónicos.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-book-cta"
              onClick={onBookAppointment}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Agendar Nueva Cita
            </button>

            {onLogout && (
              <button
                type="button"
                className="btn-logout"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="portal-tabs">
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveTab('citas')}
          >
            <MaterialIcon name="calendar_month" size={18} /> Mis Citas ({upcomingAppointments.length})
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'tratamientos' ? 'active' : ''}`}
            onClick={() => setActiveTab('tratamientos')}
          >
            <MaterialIcon name="medical_services" size={18} /> Mis Tratamientos y Recetas ({digitalPrescriptions.length})
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagos')}
          >
            <MaterialIcon name="receipt_long" size={18} /> Mis Comprobantes de Pago ({paymentReceipts.length})
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <MaterialIcon name="person" size={18} /> Ficha Médica y Perfil
          </button>
        </div>

        {/* TAB 1: Mis Citas */}
        {activeTab === 'citas' && (
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
              Próximas Atenciones Agendadas
            </h2>
            <div>
              {upcomingAppointments.length === 0 ? (
                <div className="portal-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#64748b' }}>
                    <MaterialIcon name="event_busy" size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                    No tienes citas agendadas por el momento
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    Puedes agendar una nueva consulta o control terapéutico cuando lo necesites.
                  </p>
                  <button
                    type="button"
                    className="portal-action-btn primary"
                    style={{ margin: '0 auto' }}
                    onClick={onBookAppointment}
                  >
                    <MaterialIcon name="add_circle" size={16} />
                    <span>Agendar Nueva Cita</span>
                  </button>
                </div>
              ) : (
                upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="portal-card">
                    <div className="appt-card-inner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="appt-date-block">
                          <div className="appt-day">{appt.day}</div>
                          <div className="appt-month">{appt.month}</div>
                        </div>
                        <div className="appt-info-block">
                          <h3>{appt.serviceName}</h3>
                          <p>
                            Especialista: <strong>{appt.professionalName}</strong> • {appt.time} ({appt.duration})
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', background: appt.status === 'confirmed' ? '#ecfdf5' : '#fffbeb', color: appt.status === 'confirmed' ? '#065f46' : '#92400e', border: `1px solid ${appt.status === 'confirmed' ? '#a7f3d0' : '#fde68a'}`, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MaterialIcon name={appt.status === 'confirmed' ? 'check_circle' : 'schedule'} size={13} />
                              <span>{appt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}</span>
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {appt.notes}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="portal-card-actions">
                        <button
                          type="button"
                          className="portal-action-btn primary"
                          onClick={() => showToast(`Recordatorio de cita ${appt.id} descargado.`)}
                        >
                          <MaterialIcon name="description" size={15} />
                          <span>Recordatorio</span>
                        </button>
                        <button
                          type="button"
                          className="portal-action-btn reschedule"
                          onClick={() => {
                            setReschedulingAppt({
                              id: appt.id,
                              title: appt.serviceName,
                              durationLabel: appt.duration,
                              doctorName: appt.professionalName,
                              doctorSpecialty: 'Especialista',
                              doctorInitials: appt.professionalName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2),
                              dateLabel: `${appt.day} de ${appt.month}, 2026`,
                              timeLabel: appt.time,
                              countdownLabel: 'Próxima',
                              mode: 'presencial',
                              locationLabel: 'Sede Principal · Sanitas Lima',
                              status: appt.status,
                            });
                          }}
                        >
                          <MaterialIcon name="edit_calendar" size={15} />
                          <span>Reprogramar</span>
                        </button>
                        <button
                          type="button"
                          className="portal-action-btn danger"
                          onClick={() => setCancellingAppt(appt)}
                        >
                          <MaterialIcon name="cancel" size={15} />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 2: Mis Tratamientos y Recetas */}
        {activeTab === 'tratamientos' && (
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
              Plan Terapéutico en Curso
            </h2>
            {activeTreatments.map((t) => {
              const progressPct = Math.round((t.completedSessions / t.totalSessions) * 100);
              return (
                <div key={t.id} className="treatment-card">
                  <div className="treatment-header">
                    <div>
                      <h3 className="treatment-title">{t.title}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0' }}>
                        Médico Tratante: <strong>{t.prescribedBy}</strong>
                      </p>
                    </div>
                    <span className="treatment-progress-badge">
                      {t.completedSessions} de {t.totalSessions} Sesiones Completadas
                    </span>
                  </div>

                  <div className="treatment-bar-wrap">
                    <div className="treatment-bar-fill" style={{ width: `${progressPct}%` }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginTop: '1rem' }}>
                    <div className="treatment-meta-box">
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                        <MaterialIcon name="medical_services" size={16} />
                        <span>Diagnóstico Clínico</span>
                      </strong>
                      <span>{t.diagnostics}</span>
                    </div>
                    <div className="treatment-meta-box">
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                        <MaterialIcon name="assignment" size={16} />
                        <span>Pautas y Ejercicios Domiciliarios</span>
                      </strong>
                      <span>{t.homeExercises}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Recetas Médicas */}
            <div style={{ marginTop: '1.75rem' }}>
              <PatientPrescriptionsPanel
                prescriptions={digitalPrescriptions.map<PatientPrescription>((rx) => ({
                  id: rx.id,
                  code: rx.code,
                  medication: rx.medication,
                  schedule: rx.dosage,
                  instructions: rx.instructions,
                  issuedDate: rx.date,
                  validUntil: rx.validity.replace(/^Vigente hasta\s*/i, ''),
                  doctorName: rx.doctor.split('·')[0].trim(),
                  isActive: rx.validity.toLowerCase().includes('vigente'),
                }))}
                onDownload={(rx) =>
                  showToast(`Descargando receta de ${rx.medication} en PDF...`)
                }
              />
            </div>
          </section>
        )}

        {/* TAB 3: Mis Comprobantes de Pago */}
        {activeTab === 'pagos' && (
          <section>
            <PatientPaymentsPanel
              receipts={paymentReceipts.map<PatientReceipt>((rec) => ({
                id: rec.id,
                number: rec.number.replace(/^Boleta Electrónica\s*/i, ''),
                concept: rec.service,
                date: rec.date,
                paymentMethod: rec.method
                  .replace(/^Pagado con\s*/i, '')
                  .replace(/\s*\((POS|App Móvil)\)/gi, ''),
                amount: rec.amount,
              }))}
              pendingBalance={0}
              onDownload={(rec) =>
                showToast(`Descargando boleta ${rec.number} (${rec.amount}) en PDF...`)
              }
            />
          </section>
        )}

        {/* TAB 4: Mi Ficha Médica y Perfil */}
        {activeTab === 'perfil' && (
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
              Ficha Maestra del Paciente
            </h2>
            <div className="profile-grid">
              <div className="profile-field-box">
                <span className="profile-field-label">Nombres y Apellidos</span>
                <span className="profile-field-val">{patient.firstName} {patient.lastName}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Documento de Identidad (DNI)</span>
                <span className="profile-field-val">{patient.nationalId}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Correo Electrónico</span>
                <span className="profile-field-val">{patient.email}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Teléfono de Contacto</span>
                <span className="profile-field-val">{patient.phone}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Fecha de Nacimiento</span>
                <span className="profile-field-val">{patient.birthDate}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Grupo Sanguíneo</span>
                <span className="profile-field-val">{patient.bloodType}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Alergias Registradas</span>
                <span className="profile-field-val">{patient.allergies}</span>
              </div>
              <div className="profile-field-box">
                <span className="profile-field-label">Contacto de Emergencia</span>
                <span className="profile-field-val">{patient.emergencyContact}</span>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1.5px solid #e2e8f0', paddingTop: '1rem', background: '#ecfdf5', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <span className="profile-field-label" style={{ color: '#047857' }}>Consentimiento de Privacidad</span>
                <div style={{ color: '#065f46', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <MaterialIcon name="verified_user" size={16} />
                  <span>Consentimiento de tratamiento de datos personales aceptado conforme a la Ley N° 29733 (Perú).</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modales Interactivos de Reprogramación y Cancelación */}
      {reschedulingAppt && (
        <RescheduleModal
          appointment={reschedulingAppt}
          onClose={() => setReschedulingAppt(null)}
          onConfirm={handleConfirmReschedule}
        />
      )}

      {cancellingAppt && (
        <CancelAppointmentModal
          onClose={() => setCancellingAppt(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};

export default PatientPortal;

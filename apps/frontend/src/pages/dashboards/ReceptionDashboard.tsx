import React, { useState } from 'react';
import './ClinicalDashboard.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  IconCash,
  IconCalendar,
  IconStethoscope,
  IconSearch,
} from '../../components/ui/Icons';
import { ReceptionKanbanBoard, KanbanAppointment } from '../../components/reception/ReceptionKanbanBoard';
import { WhatsAppReminderModal } from '../../components/reception/WhatsAppReminderModal';
import { DigitalPrescriptionModal } from '../../components/clinical/DigitalPrescriptionModal';
import { WaitingTimeBadge } from '../../components/common/WaitingTimeBadge';
import { soundEffects } from '../../utils/soundEffects';

interface ReceptionDashboardProps {
  onNavigateToBooking: () => void;
  onNavigateToCash: () => void;
}

interface AppointmentReception {
  id: string;
  time: string;
  patientName: string;
  dni: string;
  doctor: string;
  service: string;
  price: string;
  status: 'waiting' | 'in_consultation' | 'pending_arrival';
  statusLabel: string;
  paid: boolean;
  temperature?: string;
  bloodPressure?: string;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({
  onNavigateToBooking,
  onNavigateToCash,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'in_consultation' | 'pending_arrival'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeWhatsApp, setActiveWhatsApp] = useState<AppointmentReception | null>(null);
  const [activeRx, setActiveRx] = useState<AppointmentReception | null>(null);
  const [triageAppointment, setTriageAppointment] = useState<AppointmentReception | null>(null);
  const [paymentAppointment, setPaymentAppointment] = useState<AppointmentReception | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Yape' | 'Plin' | 'POS Tarjeta'>('Yape');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del Modal de Agendamiento Express en Ventanilla
  const [isFastBookingOpen, setIsFastBookingOpen] = useState(false);
  const [newPatientDni, setNewPatientDni] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newService, setNewService] = useState('Rehabilitación Deportiva');
  const [newDoctor, setNewDoctor] = useState('Lic. María González');
  const [newTime, setNewTime] = useState('12:15 PM');
  const [newPrice, setNewPrice] = useState('S/ 100.00');
  const [newPayMode, setNewPayMode] = useState<'immediate' | 'post_consultation'>('immediate');
  const [isUrgent, setIsUrgent] = useState(false);

  // Estado del Modal de Cita Normal / Ficha Completa de Admisión
  const [isFullBookingOpen, setIsFullBookingOpen] = useState(false);
  const [fullTab, setFullTab] = useState<'patient' | 'clinical' | 'schedule' | 'billing'>('patient');
  const [fullDni, setFullDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullBirthDate, setFullBirthDate] = useState('1992-05-14');
  const [fullGender, setFullGender] = useState('Femenino');
  const [fullPhone, setFullPhone] = useState('');
  const [fullEmail, setFullEmail] = useState('');
  const [fullAddress, setFullAddress] = useState('Av. Javier Prado Este 2450, San Borja');
  const [fullSpecialty, setFullSpecialty] = useState('Fisioterapia y Rehabilitación');
  const [fullService, setFullService] = useState('Rehabilitación Deportiva');
  const [fullPrice, setFullPrice] = useState('S/ 100.00');
  const [fullReason, setFullReason] = useState('Dolor lumbar agudo tras esfuerzo físico');
  const [fullAllergies, setFullAllergies] = useState('Ninguna conocida');
  const [fullDoctor, setFullDoctor] = useState('Lic. María González');
  const [fullRoom, setFullRoom] = useState('Box 101');
  const [fullDate, setFullDate] = useState('2026-09-13');
  const [fullTime, setFullTime] = useState('11:00 AM');
  const [fullDocType, setFullDocType] = useState<'Boleta' | 'Factura'>('Boleta');
  const [fullPayMethod, setFullPayMethod] = useState<'Yape' | 'Plin' | 'POS Tarjeta' | 'Efectivo' | 'Convenio EPS'>('Yape');
  const [fullPayStatus, setFullPayStatus] = useState<'immediate' | 'post_consultation'>('immediate');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickPatientSelect = (dni: string, name: string, phone: string) => {
    setNewPatientDni(dni);
    setNewPatientName(name);
    setNewPatientPhone(phone);
    showToast(`Datos del paciente ${name} cargados automáticamente.`);
  };

  const handleQuickFullPatient = (dni: string, name: string, phone: string, email: string) => {
    setFullDni(dni);
    setFullName(name);
    setFullPhone(phone);
    setFullEmail(email);
    showToast(`Datos de filiación de ${name} cargados.`);
  };

  const handleConfirmFastBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientDni.trim()) {
      showToast('Por favor ingresa el DNI y Nombre del paciente.');
      return;
    }

    const newApt: AppointmentReception = {
      id: `rec-${Date.now()}`,
      time: newTime,
      patientName: newPatientName.trim(),
      dni: newPatientDni.trim(),
      doctor: newDoctor,
      service: newService,
      price: newPrice,
      status: 'pending_arrival',
      statusLabel: isUrgent ? 'Urgencia / Pendiente Llegada' : 'Confirmada / Pendiente Llegada',
      paid: newPayMode === 'immediate',
    };

    setAppointments((prev) => [newApt, ...prev]);
    showToast(`¡Cita agendada con éxito! Paciente: ${newPatientName} · ${newTime}. Notificación enviada a WhatsApp.`);
    setIsFastBookingOpen(false);

    // Reset Form
    setNewPatientDni('');
    setNewPatientName('');
    setNewPatientPhone('');
  };

  const handleConfirmFullBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !fullDni.trim()) {
      showToast('Por favor ingresa el DNI y Nombre del paciente.');
      return;
    }

    const newApt: AppointmentReception = {
      id: `rec-full-${Date.now()}`,
      time: fullTime,
      patientName: fullName.trim(),
      dni: fullDni.trim(),
      doctor: fullDoctor,
      service: fullService,
      price: fullPrice,
      status: 'pending_arrival',
      statusLabel: 'Confirmada / Cita Completa',
      paid: fullPayStatus === 'immediate',
    };

    setAppointments((prev) => [newApt, ...prev]);
    showToast(`¡Cita Normal Completa Registrada! Paciente: ${fullName} · ${fullDoctor} (${fullRoom}) a las ${fullTime}.`);
    setIsFullBookingOpen(false);
    setFullTab('patient');

    // Reset
    setFullDni('');
    setFullName('');
    setFullPhone('');
  };

  const [appointments, setAppointments] = useState<AppointmentReception[]>([
    {
      id: 'rec-1',
      time: '09:30 AM',
      patientName: 'María Santos López',
      dni: '45892110',
      doctor: 'Lic. María González',
      service: 'Terapia Manual Ortopédica',
      price: 'S/ 80.00',
      status: 'waiting',
      statusLabel: 'En Sala de Espera',
      paid: true,
      temperature: '36.5 °C',
      bloodPressure: '120/80',
    },
    {
      id: 'rec-2',
      time: '10:00 AM',
      patientName: 'Carlos Benítez Vega',
      dni: '72109845',
      doctor: 'Lic. María González',
      service: 'Rehabilitación Deportiva',
      price: 'S/ 100.00',
      status: 'in_consultation',
      statusLabel: 'En Consulta',
      paid: true,
      temperature: '36.4 °C',
      bloodPressure: '118/75',
    },
    {
      id: 'rec-3',
      time: '11:00 AM',
      patientName: 'Rosa Morales Silva',
      dni: '09843211',
      doctor: 'Dr. Carlos Mendoza',
      service: 'Consulta Traumatológica',
      price: 'S/ 150.00',
      status: 'pending_arrival',
      statusLabel: 'Confirmada / Pendiente Llegada',
      paid: false,
    },
    {
      id: 'rec-4',
      time: '11:45 AM',
      patientName: 'Jorge Ramírez Castro',
      dni: '41209384',
      doctor: 'Lic. María González',
      service: 'Descarga Muscular Completa',
      price: 'S/ 70.00',
      status: 'pending_arrival',
      statusLabel: 'Confirmada / Pendiente Llegada',
      paid: true,
    },
  ]);

  const handleCheckIn = (id: string, temp = '36.5 °C', bp = '120/80') => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: 'waiting', statusLabel: 'En Sala de Espera', temperature: temp, bloodPressure: bp } : apt,
      ),
    );
    const p = appointments.find(a => a.id === id);
    showToast(`Check-In completado para ${p?.patientName || 'paciente'}. Asignado a Sala de Espera.`);
    setTriageAppointment(null);
  };

  const handleMarkPaid = (id: string, method: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, paid: true } : apt)),
    );
    const p = appointments.find(a => a.id === id);
    showToast(`Cobro de ${p?.price} procesado vía ${method} para ${p?.patientName}.`);
    setPaymentAppointment(null);
  };

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.dni.includes(searchTerm) ||
      a.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const kanbanAppointments: KanbanAppointment[] = filtered.map((apt) => ({
    id: apt.id,
    time: apt.time,
    patientName: apt.patientName,
    patient: { name: apt.patientName, dni: apt.dni },
    doctorName: apt.doctor,
    doctor: { name: apt.doctor },
    service: apt.service,
    status: apt.status === 'in_consultation' ? 'IN_PROGRESS' : apt.status === 'waiting' ? 'WAITING' : 'PROGRAMADA',
    price: apt.price,
    paid: apt.paid,
  }));

  const handleKanbanStatusChange = (apptId: string, newStatus: string) => {
    let mappedStatus: 'waiting' | 'in_consultation' | 'pending_arrival' = 'waiting';
    let mappedLabel = 'En Sala de Espera';
    if (newStatus === 'IN_PROGRESS') {
      mappedStatus = 'in_consultation';
      mappedLabel = 'En Consulta';
    } else if (newStatus === 'PENDING_PAYMENT') {
      mappedStatus = 'waiting';
      mappedLabel = 'Pendiente Pago en Caja';
    } else if (newStatus === 'COMPLETED') {
      mappedStatus = 'waiting';
      mappedLabel = 'Atendido & Alta';
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: mappedStatus, statusLabel: mappedLabel } : a)),
    );
    const p = appointments.find((a) => a.id === apptId);
    showToast(`Estado de ${p?.patientName || 'paciente'} actualizado a: ${mappedLabel}`);
  };

  return (
    <div style={{ width: '100%' }}>
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
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="clinic-badge">
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#16a34a', display: 'inline-block' }}></span>
            Mesa de Entrada & Triaje · Recepción Sede Sanitas
          </div>
          <h1 className="dashboard-title">
            Mostrador de Atención al Paciente
          </h1>
          <p className="dashboard-subtitle">
            Control de ingresos presenciales, triaje de signos vitales y cobranza de caja rápida.
          </p>
        </div>

        <div className="header-actions">
          {onNavigateToBooking && (
            <button
              type="button"
              className="btn-secondary"
              style={{ background: '#faf5ff', borderColor: '#e9d5ff', color: '#7c3aed', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={onNavigateToBooking}
              title="Abrir vista de agenda médica por box y profesional"
            >
              <MaterialIcon name="calendar_today" size={16} />
              <span>Ver Calendario Completo ↗</span>
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={onNavigateToCash}
          >
            <MaterialIcon name="point_of_sale" size={16} />
            <span>Abrir Caja Chica</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => setIsFastBookingOpen(true)}
          >
            <MaterialIcon name="bolt" size={16} />
            <span>Cita Rápida (Ventanilla)</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => setIsFullBookingOpen(true)}
          >
            <MaterialIcon name="assignment" size={16} />
            <span>+ Agendar Cita Normal (Completa)</span>
          </button>
        </div>
      </div>

      {/* Nivel 1: KPIs de Recepción */}
      <div className="kpi-grid">
        {/* KPI 1: Caja Chica */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Caja Chica Activa</span>
            <div className="kpi-icon-wrap kpi-icon-sky">
              <IconCash className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">S/ 1,420.00</div>
          <div className="kpi-footer">
            <span style={{ color: '#0284c7', fontWeight: 700 }}>
              ● 6 Cobros procesados hoy
            </span>
          </div>
        </div>

        {/* KPI 2: En Sala de Espera */}
        <div className="kpi-card" style={{ borderColor: '#fde68a', background: 'linear-gradient(180deg, #ffffff 0%, #fffbeb 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: '#b45309' }}>En Sala de Espera</span>
            <div className="kpi-icon-wrap kpi-icon-amber">
              <span>⏳</span>
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#d97706' }}>
            {appointments.filter((a) => a.status === 'waiting').length} Pacientes
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#b45309', fontWeight: 600 }}>
              ● María Santos (09:30 AM)
            </span>
          </div>
        </div>

        {/* KPI 3: Por Llegar Hoy */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Por Llegar Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-purple">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">
            {appointments.filter((a) => a.status === 'pending_arrival').length} Pacientes
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>
              ● Rosa Morales & Jorge Ramírez
            </span>
          </div>
        </div>

        {/* KPI 4: En Consulta Médica */}
        <div className="kpi-card" style={{ borderColor: '#86efac', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: '#166534' }}>En Consulta Médica</span>
            <div className="kpi-icon-wrap kpi-icon-emerald">
              <IconStethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#15803d' }}>
            {appointments.filter((a) => a.status === 'in_consultation').length} Paciente
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#166534', fontWeight: 600 }}>
              ● Carlos Benítez (Box 101)
            </span>
          </div>
        </div>
      </div>

      {/* Nivel 2: Registro de Citas y Check-in */}
      <div className="table-card">
        {/* Título de la Sección + Selector de Modo Kanban / Lista */}
        <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">Flujo de Atención en Recepción</h2>
            <p className="section-desc">
              Triaje de signos vitales, gestión de sala de espera y cobranza de caja rápida.
            </p>
          </div>

          <div style={{ display: 'flex', background: 'var(--border-color, #f1f5f9)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setViewMode('kanban');
              }}
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'kanban' ? '#0ea5e9' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : '#64748b',
                boxShadow: viewMode === 'kanban' ? '0 2px 6px rgba(14,165,233,0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <MaterialIcon name="view_kanban" size={16} />
              <span>Tablero Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setViewMode('table');
              }}
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'table' ? '#0ea5e9' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(14,165,233,0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <MaterialIcon name="format_list_bulleted" size={16} />
              <span>Vista Lista</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="toolbar-row" style={{ marginBottom: '1.25rem' }}>
          {/* Segmented Filter Pills */}
          <div className="segmented-pills">
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Todos ({appointments.length})
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'pending_arrival' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending_arrival')}
            >
              ● Por Llegar ({appointments.filter(a => a.status === 'pending_arrival').length})
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'waiting' ? 'active' : ''}`}
              onClick={() => setStatusFilter('waiting')}
            >
              ● En Espera ({appointments.filter(a => a.status === 'waiting').length})
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'in_consultation' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in_consultation')}
            >
              ● En Consulta ({appointments.filter(a => a.status === 'in_consultation').length})
            </button>
          </div>

          {/* Search Box + Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '290px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                <IconSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Escribe DNI o Apellidos para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {filtered.length} de {appointments.length} citas hoy
            </span>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <ReceptionKanbanBoard
            appointments={kanbanAppointments}
            onStatusChange={handleKanbanStatusChange}
          />
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Hora</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Paciente & DNI</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Médico Asignado</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Servicio</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Triaje de Entrada</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Estado de Pago</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>Ubicación Actual</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 800, textAlign: 'right' }}>Acción de Recepción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#ffffff', fontSize: '0.82rem' }}>
                        No se encontraron citas con el filtro o búsqueda actual.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((apt) => {
                      const initials = apt.patientName.split(' ').map(n => n[0]).slice(0, 2).join('');
                      return (
                        <tr
                          key={apt.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: apt.status === 'in_consultation' ? '#f0fdf4' : apt.status === 'waiting' ? '#fffdf7' : '#ffffff',
                            transition: 'background 120ms ease'
                          }}
                        >
                          {/* Hora */}
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 800, color: '#0369a1' }}>
                            {apt.time}
                          </td>

                          {/* Paciente */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{apt.patientName}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>DNI {apt.dni}</div>
                              </div>
                            </div>
                          </td>

                          {/* Médico */}
                          <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>
                            {apt.doctor}
                          </td>

                          {/* Servicio */}
                          <td style={{ padding: '0.85rem 1rem', color: '#0284c7', fontWeight: 700 }}>
                            {apt.service}
                          </td>

                          {/* Triaje */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {apt.temperature && apt.bloodPressure ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f0fdf4', border: '1px solid #86efac', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>
                                <MaterialIcon name="thermostat" size={14} />
                                <span>{apt.temperature}</span>
                                <span>·</span>
                                <MaterialIcon name="favorite" size={14} />
                                <span>{apt.bloodPressure}</span>
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                                Pendiente
                              </span>
                            )}
                          </td>

                          {/* Pago */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {apt.paid ? (
                              <span className="badge-status badge-attended" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <MaterialIcon name="check" size={12} />
                                <span>Pagado ({apt.price})</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn-action-ghost"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem', background: '#fef3c7', borderColor: '#fde68a', color: '#b45309', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => setPaymentAppointment(apt)}
                              >
                                <MaterialIcon name="credit_card" size={14} />
                                <span>Cobrar {apt.price}</span>
                              </button>
                            )}
                          </td>

                          {/* Estado */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className={`badge-status ${
                                apt.status === 'in_consultation'
                                  ? 'badge-waiting'
                                  : apt.status === 'waiting'
                                    ? 'badge-waiting'
                                    : 'badge-confirmed'
                              }`}
                              style={{
                                background: apt.status === 'in_consultation' ? '#ecfdf5' : apt.status === 'waiting' ? '#fef3c7' : '#f0f9ff',
                                borderColor: apt.status === 'in_consultation' ? '#86efac' : apt.status === 'waiting' ? '#fde68a' : '#bae6fd',
                                color: apt.status === 'in_consultation' ? '#15803d' : apt.status === 'waiting' ? '#b45309' : '#0369a1'
                              }}
                            >
                              <span>●</span> {apt.statusLabel}
                            </span>
                            {apt.status === 'waiting' && (
                              <div style={{ marginTop: '4px' }}>
                                <WaitingTimeBadge arrivalTime={apt.time} />
                              </div>
                            )}
                          </td>

                          {/* Acción */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                              <button
                                type="button"
                                title="Enviar WhatsApp"
                                onClick={() => setActiveWhatsApp(apt)}
                                style={{ background: 'none', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <MaterialIcon name="smartphone" size={14} />
                              </button>
                              <button
                                type="button"
                                title="Ver Receta Oficial"
                                onClick={() => setActiveRx(apt)}
                                style={{ background: 'none', border: '1px solid #bae6fd', color: '#0284c7', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <MaterialIcon name="description" size={14} />
                              </button>
                              {apt.status === 'pending_arrival' ? (
                                <button
                                  type="button"
                                  className="btn-call-consultation primary"
                                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.76rem', background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  onClick={() => setTriageAppointment(apt)}
                                >
                                  <MaterialIcon name="how_to_reg" size={14} />
                                  <span>Llegada</span>
                                </button>
                              ) : apt.status === 'waiting' ? (
                                <button
                                  type="button"
                                  className="btn-action-ghost"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.74rem', background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  onClick={() => showToast(`Notificación enviada al médico: ${apt.patientName} espera en sala.`)}
                                >
                                  <MaterialIcon name="chat" size={14} />
                                  <span>Avisar</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <MaterialIcon name="radio_button_checked" size={12} />
                                  <span>En Atención</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>

      {/* Modal de Triaje y Check-In Rápido */}
      {triageAppointment && (
        <div className="modal-overlay-custom" onClick={() => setTriageAppointment(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '96%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bbf7d0' }}>
                  <MaterialIcon name="medical_services" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Triaje de Admisión: {triageAppointment.patientName}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    DNI: {triageAppointment.dni} · Cita: {triageAppointment.time} · {triageAppointment.service}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTriageAppointment(null)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Tarjeta 1: Constantes Vitales */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="thermostat" size={18} />
                    <span>Signos Vitales de Ingreso</span>
                  </h4>
                  <span className="form-section-badge">NORMATIVA MINSA</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Temperatura (°C)</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left">
                        <MaterialIcon name="thermostat" size={16} />
                      </span>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="36.5 °C"
                        defaultValue="36.5 °C"
                        id="tri-temp"
                      />
                    </div>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">Presión Arterial (PA)</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left">
                        <MaterialIcon name="favorite" size={16} />
                      </span>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="120/80 mmHg"
                        defaultValue="120/80"
                        id="tri-bp"
                      />
                    </div>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">Saturación de Oxígeno (SpO2)</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left">
                        <MaterialIcon name="air" size={16} />
                      </span>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="98%"
                        defaultValue="98%"
                        id="tri-spo2"
                      />
                    </div>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">Frecuencia Cardíaca (Pulso)</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left">
                        <MaterialIcon name="schedule" size={16} />
                      </span>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="72 bpm"
                        defaultValue="72 bpm"
                        id="tri-hr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Prioridad de Atención & Destino */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="meeting_room" size={18} />
                    <span>Prioridad y Asignación de Sala</span>
                  </h4>
                  <span className="form-section-badge">UBICACIÓN</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Nivel de Prioridad</label>
                    <select className="modern-form-input" defaultValue="Normal (Por Orden de Cita)">
                      <option value="Normal (Por Orden de Cita)">Normal (Por Orden de Cita)</option>
                      <option value="Preferencial (Adulto Mayor / Gestante)">Preferencial (Adulto Mayor / Gestante)</option>
                      <option value="Urgencia Menor (Dolor Agudo)">Urgencia Menor (Dolor Agudo)</option>
                    </select>
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-label">Sala de Espera Asignada</label>
                    <select className="modern-form-input" defaultValue="Sala Principal (Piso 1)">
                      <option value="Sala Principal (Piso 1)">Sala Principal (Piso 1)</option>
                      <option value="Sala Fisioterapia (Piso 2)">Sala Fisioterapia (Piso 2)</option>
                      <option value="Gimnasio Terapéutico (Piso 1)">Gimnasio Terapéutico (Piso 1)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-action-ghost"
                onClick={() => setTriageAppointment(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-call-consultation primary"
                style={{ background: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => {
                  const temp = (document.getElementById('tri-temp') as HTMLInputElement)?.value || '36.5 °C';
                  const bp = (document.getElementById('tri-bp') as HTMLInputElement)?.value || '120/80';
                  handleCheckIn(triageAppointment.id, temp, bp);
                }}
              >
                <MaterialIcon name="check" size={16} />
                <span>Confirmar Check-In & Enviar a Sala</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cobro Rápido en Recepción */}
      {paymentAppointment && (
        <div className="modal-overlay-custom" onClick={() => setPaymentAppointment(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '96%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fde68a' }}>
                  <MaterialIcon name="credit_card" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Cobro de Consulta / Sesión
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Paciente: {paymentAppointment.patientName} · DNI: {paymentAppointment.dni}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentAppointment(null)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
              {/* Tarjeta de Monto */}
              <div style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '14px', padding: '1.15rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto a Liquidar</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>{paymentAppointment.price}</div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Concepto: {paymentAppointment.service}</span>
              </div>

              {/* Selector de Método de Pago */}
              <div className="form-section-card">
                <label className="input-field-label">Selecciona Método de Pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
                  {(['Yape', 'Plin', 'POS Tarjeta', 'Efectivo'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${paymentMethod === method ? '#0284c7' : '#cbd5e1'}`,
                        background: paymentMethod === method ? '#f0f9ff' : '#ffffff',
                        color: paymentMethod === method ? '#0369a1' : '#334155',
                        fontWeight: paymentMethod === method ? 800 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 140ms ease'
                      }}
                    >
                      {method === 'Yape' && <MaterialIcon name="smartphone" size={16} />}
                      {method === 'Plin' && <MaterialIcon name="account_balance_wallet" size={16} />}
                      {method === 'POS Tarjeta' && <MaterialIcon name="credit_card" size={16} />}
                      {method === 'Efectivo' && <MaterialIcon name="payments" size={16} />}
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-action-ghost"
                onClick={() => setPaymentAppointment(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-call-consultation primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => handleMarkPaid(paymentAppointment.id, paymentMethod)}
              >
                <MaterialIcon name="check" size={16} />
                <span>Registrar Cobro & Emitir Boleta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamiento Express en Ventanilla (Flujo Recepción) */}
      {isFastBookingOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsFastBookingOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '96%', padding: 0, overflow: 'hidden' }}>
            {/* Header del Modal */}
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bae6fd' }}>
                  <MaterialIcon name="bolt" size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Agendamiento Express (Ventanilla & Teléfono)
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Asignación instantánea de citas sin pasar por el formulario web del paciente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFastBookingOpen(false)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleConfirmFastBooking}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
                
                {/* Sección 1: Datos del Paciente */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MaterialIcon name="person" size={18} />
                      <span>Datos del Paciente</span>
                    </h4>
                    <span className="form-section-badge">IDENTIFICACIÓN</span>
                  </div>

                  {/* Atajos de Pacientes Frecuentes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Auto-completar:</span>
                    <button
                      type="button"
                      className="btn-action-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={() => handleQuickPatientSelect('74819203', 'Luciana Paredes Soto', '987 654 321')}
                    >
                      <MaterialIcon name="bolt" size={14} />
                      <span>Luciana Paredes (DNI 74819203)</span>
                    </button>
                    <button
                      type="button"
                      className="btn-action-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={() => handleQuickPatientSelect('48291044', 'Gonzalo Salazar Diez', '912 345 678')}
                    >
                      <MaterialIcon name="bolt" size={14} />
                      <span>Gonzalo Salazar (DNI 48291044)</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr', gap: '0.65rem' }}>
                    <div className="input-field-wrap">
                      <label className="input-field-label">DNI / Documento *</label>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="72109845"
                        required
                        value={newPatientDni}
                        onChange={(e) => setNewPatientDni(e.target.value)}
                      />
                    </div>
                    <div className="input-field-wrap">
                      <label className="input-field-label">Nombre Completo *</label>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="Nombres y Apellidos"
                        required
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                      />
                    </div>
                    <div className="input-field-wrap">
                      <label className="input-field-label">WhatsApp Recordatorio</label>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="991 223 344"
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Especialidad, Servicio y Médico */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MaterialIcon name="medical_services" size={18} />
                      <span>Servicio Clínico & Profesional Asignado</span>
                    </h4>
                    <span className="form-section-badge">ASIGNACIÓN</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.65rem' }}>
                    <div className="input-field-wrap">
                      <label className="input-field-label">Servicio Médico</label>
                      <select
                        className="modern-form-input"
                        value={newService}
                        onChange={(e) => {
                          const s = e.target.value;
                          setNewService(s);
                          if (s.includes('150')) setNewPrice('S/ 150.00');
                          else if (s.includes('80')) setNewPrice('S/ 80.00');
                          else if (s.includes('70')) setNewPrice('S/ 70.00');
                          else if (s.includes('90')) setNewPrice('S/ 90.00');
                          else setNewPrice('S/ 100.00');
                        }}
                      >
                        <option value="Rehabilitación Deportiva">Rehabilitación Deportiva (S/ 100.00)</option>
                        <option value="Terapia Manual Ortopédica">Terapia Manual Ortopédica (S/ 80.00)</option>
                        <option value="Consulta Traumatológica">Consulta Traumatológica (S/ 150.00)</option>
                        <option value="Descarga Muscular Completa">Descarga Muscular Completa (S/ 70.00)</option>
                        <option value="Punción Seca y Electroterapia">Punción Seca y Electroterapia (S/ 90.00)</option>
                      </select>
                    </div>

                    <div className="input-field-wrap">
                      <label className="input-field-label">Médico Tratante</label>
                      <select
                        className="modern-form-input"
                        value={newDoctor}
                        onChange={(e) => setNewDoctor(e.target.value)}
                      >
                        <option value="Lic. María González">Lic. María González (Fisioterapia · Box 101)</option>
                        <option value="Dr. Carlos Mendoza">Dr. Carlos Mendoza (Traumatología · Box 102)</option>
                        <option value="Lic. Andrea Ruiz">Lic. Andrea Ruiz (Kinesiología · Box 103)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Fecha, Horario y Cobro */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MaterialIcon name="calendar_today" size={18} />
                      <span>Fecha, Franja Horaria y Cobro</span>
                    </h4>
                    <span className="form-section-badge">HORARIO & CAJA</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                    <div className="input-field-wrap">
                      <label className="input-field-label">Día de Atención</label>
                      <select className="modern-form-input" defaultValue="Hoy (Miércoles 13 Sep)">
                        <option value="Hoy (Miércoles 13 Sep)">Hoy (Miércoles 13 Sep)</option>
                        <option value="Mañana (Jueves 14 Sep)">Mañana (Jueves 14 Sep)</option>
                        <option value="Viernes 15 Sep">Viernes 15 Sep</option>
                        <option value="Sábado 16 Sep">Sábado 16 Sep</option>
                      </select>
                    </div>

                    <div className="input-field-wrap">
                      <label className="input-field-label">Horario Disponible</label>
                      <select
                        className="modern-form-input"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      >
                        <option value="12:15 PM">12:15 PM (Próximo Libre)</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="03:00 PM">03:00 PM (Turno Tarde)</option>
                        <option value="04:15 PM">04:15 PM</option>
                        <option value="05:30 PM">05:30 PM</option>
                        <option value="06:45 PM">06:45 PM</option>
                      </select>
                    </div>

                    <div className="input-field-wrap">
                      <label className="input-field-label">Estado de Pago</label>
                      <select
                        className="modern-form-input"
                        value={newPayMode}
                        onChange={(e) => setNewPayMode(e.target.value as any)}
                      >
                        <option value="immediate">Cobrado Inmediato ({newPrice})</option>
                        <option value="post_consultation">Pagar al Salir de Consulta</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <input
                      type="checkbox"
                      id="chk-urgent"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="chk-urgent" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MaterialIcon name="warning" size={16} style={{ color: '#d97706' }} />
                      <span>Sobrecupo de Urgencia / Dolor Agudo (Prioridad de atención en consultorio)</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Footer de Acciones */}
              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={() => setIsFastBookingOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-call-consultation primary"
                  style={{
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <MaterialIcon name="bolt" size={16} />
                  <span>Confirmar Cita & Notificar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cita Normal / Formulario de Admisión Completo */}
      {isFullBookingOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsFullBookingOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', width: '96%', padding: 0, overflow: 'hidden' }}>
            {/* Header del Modal */}
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bfdbfe' }}>
                  <MaterialIcon name="assignment" size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 900, color: '#0f172a' }}>
                    Nueva Cita Normal (Ficha Completa de Admisión)
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Registro integral con antecedentes clínicos, asignación de box y facturación.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullBookingOpen(false)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            {/* Pestañas de Navegación del Formulario */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 1.5rem' }}>
              {[
                { key: 'patient', label: '1. Filiación & Contacto', icon: 'person' },
                { key: 'clinical', label: '2. Motivo & Clínica', icon: 'medical_services' },
                { key: 'schedule', label: '3. Médico & Horario', icon: 'calendar_today' },
                { key: 'billing', label: '4. Facturación & Pago', icon: 'credit_card' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFullTab(tab.key as any)}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: fullTab === tab.key ? '2.5px solid #0284c7' : '2.5px solid transparent',
                    color: fullTab === tab.key ? '#0284c7' : '#64748b',
                    fontWeight: fullTab === tab.key ? 800 : 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 120ms ease'
                  }}
                >
                  <MaterialIcon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Contenido del Formulario */}
            <form onSubmit={handleConfirmFullBooking}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '68vh', overflowY: 'auto' }}>
                
                {/* Tab 1: Filiación & Contacto */}
                {fullTab === 'patient' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Autocompletar paciente registrado:</span>
                      <button
                        type="button"
                        className="btn-action-ghost"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => handleQuickFullPatient('74819203', 'Luciana Paredes Soto', '987 654 321', 'luciana.paredes@gmail.com')}
                      >
                        <MaterialIcon name="bolt" size={14} />
                        <span>Luciana Paredes (DNI 74819203)</span>
                      </button>
                      <button
                        type="button"
                        className="btn-action-ghost"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => handleQuickFullPatient('48291044', 'Gonzalo Salazar Diez', '912 345 678', 'gonzalo.salazar@outlook.com')}
                      >
                        <MaterialIcon name="bolt" size={14} />
                        <span>Gonzalo Salazar (DNI 48291044)</span>
                      </button>
                    </div>

                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MaterialIcon name="person" size={18} />
                          <span>Datos Personales y Documento</span>
                        </h4>
                        <span className="form-section-badge">IDENTIFICACIÓN</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">DNI / Carné de Extranjería *</label>
                          <input
                            type="text"
                            className="modern-form-input"
                            placeholder="72109845"
                            required
                            value={fullDni}
                            onChange={(e) => setFullDni(e.target.value)}
                          />
                        </div>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Nombre Completo del Paciente *</label>
                          <input
                            type="text"
                            className="modern-form-input"
                            placeholder="Nombres y Apellidos"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.65rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Fecha de Nacimiento</label>
                          <input
                            type="date"
                            className="modern-form-input"
                            value={fullBirthDate}
                            onChange={(e) => setFullBirthDate(e.target.value)}
                          />
                        </div>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Sexo Biológico</label>
                          <select
                            className="modern-form-input"
                            value={fullGender}
                            onChange={(e) => setFullGender(e.target.value)}
                          >
                            <option value="Femenino">Femenino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Otro">Otro / No especificar</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MaterialIcon name="location_on" size={18} />
                          <span>Información de Contacto y Residencia</span>
                        </h4>
                        <span className="form-section-badge">UBICACIÓN</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '0.75rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Teléfono WhatsApp *</label>
                          <input
                            type="text"
                            className="modern-form-input"
                            placeholder="991 223 344"
                            value={fullPhone}
                            onChange={(e) => setFullPhone(e.target.value)}
                          />
                        </div>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Correo Electrónico</label>
                          <input
                            type="email"
                            className="modern-form-input"
                            placeholder="paciente@correo.com"
                            value={fullEmail}
                            onChange={(e) => setFullEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="input-field-wrap" style={{ marginTop: '0.65rem' }}>
                        <label className="input-field-label">Dirección / Distrito</label>
                        <input
                          type="text"
                          className="modern-form-input"
                          placeholder="Av. Principal 123, Distrito"
                          value={fullAddress}
                          onChange={(e) => setFullAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Tab 2: Motivo & Clínica */}
                {fullTab === 'clinical' && (
                  <>
                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MaterialIcon name="medical_services" size={18} />
                          <span>Especialidad y Servicio Terapéutico</span>
                        </h4>
                        <span className="form-section-badge">ÁREA MÉDICA</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.75rem' }}>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Especialidad</label>
                          <select
                            className="modern-form-input"
                            value={fullSpecialty}
                            onChange={(e) => setFullSpecialty(e.target.value)}
                          >
                            <option value="Fisioterapia y Rehabilitación">Fisioterapia y Rehabilitación</option>
                            <option value="Traumatología y Ortopedia">Traumatología y Ortopedia</option>
                            <option value="Terapia Ocupacional">Terapia Ocupacional</option>
                          </select>
                        </div>
                        <div className="input-field-wrap">
                          <label className="input-field-label">Servicio Solicitado</label>
                          <select
                            className="modern-form-input"
                            value={fullService}
                            onChange={(e) => {
                              const s = e.target.value;
                              setFullService(s);
                              if (s.includes('150')) setFullPrice('S/ 150.00');
                              else if (s.includes('80')) setFullPrice('S/ 80.00');
                              else if (s.includes('70')) setFullPrice('S/ 70.00');
                              else if (s.includes('90')) setFullPrice('S/ 90.00');
                              else setFullPrice('S/ 100.00');
                            }}
                          >
                            <option value="Rehabilitación Deportiva">Rehabilitación Deportiva (S/ 100.00)</option>
                            <option value="Terapia Manual Ortopédica">Terapia Manual Ortopédica (S/ 80.00)</option>
                            <option value="Consulta Traumatológica">Consulta Traumatológica (S/ 150.00)</option>
                            <option value="Descarga Muscular Completa">Descarga Muscular Completa (S/ 70.00)</option>
                            <option value="Punción Seca y Electroterapia">Punción Seca y Electroterapia (S/ 90.00)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-section-card">
                      <div className="form-section-header">
                        <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MaterialIcon name="edit_note" size={18} />
                          <span>Motivo de Consulta & Antecedentes</span>
                        </h4>
                        <span className="form-section-badge">HISTORIA CLÍNICA</span>
                      </div>

                      <div className="input-field-wrap">
                        <label className="input-field-label">Motivo Principal / Síntomas Referidos</label>
                        <input
                          type="text"
                          className="modern-form-input"
                          placeholder="Ej: Dolor cervical intenso tras accidente, limitación al caminar..."
                          value={fullReason}
                          onChange={(e) => setFullReason(e.target.value)}
                        />
                      </div>

                      <div className="input-field-wrap" style={{ marginTop: '0.65rem' }}>
                        <label className="input-field-label">Alergias o Enfermedades Crónicas</label>
                        <input
                          type="text"
                          className="modern-form-input"
                          placeholder="Ej: Alergia a la penicilina, HTA, Diabetes, Asma..."
                          value={fullAllergies}
                          onChange={(e) => setFullAllergies(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Tab 3: Médico & Horario */}
                {fullTab === 'schedule' && (
                  <div className="form-section-card">
                    <div className="form-section-header">
                      <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MaterialIcon name="calendar_today" size={18} />
                        <span>Asignación de Profesional, Box y Horario</span>
                      </h4>
                      <span className="form-section-badge">AGENDA</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.75rem' }}>
                      <div className="input-field-wrap">
                        <label className="input-field-label">Médico Asignado</label>
                        <select
                          className="modern-form-input"
                          value={fullDoctor}
                          onChange={(e) => {
                            const d = e.target.value;
                            setFullDoctor(d);
                            if (d.includes('Mendoza')) setFullRoom('Box 102');
                            else if (d.includes('Ruiz')) setFullRoom('Box 103');
                            else setFullRoom('Box 101');
                          }}
                        >
                          <option value="Lic. María González">Lic. María González (Fisioterapia · Box 101)</option>
                          <option value="Dr. Carlos Mendoza">Dr. Carlos Mendoza (Traumatología · Box 102)</option>
                          <option value="Lic. Andrea Ruiz">Lic. Andrea Ruiz (Kinesiología · Box 103)</option>
                        </select>
                      </div>
                      <div className="input-field-wrap">
                        <label className="input-field-label">Consultorio / Box</label>
                        <select
                          className="modern-form-input"
                          value={fullRoom}
                          onChange={(e) => setFullRoom(e.target.value)}
                        >
                          <option value="Box 101">Box 101 (Terapia Manual)</option>
                          <option value="Box 102">Box 102 (Traumatología)</option>
                          <option value="Box 103">Box 103 (Kinesiología)</option>
                          <option value="Gimnasio Terapéutico">Gimnasio Terapéutico</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div className="input-field-wrap">
                        <label className="input-field-label">Fecha Programada</label>
                        <input
                          type="date"
                          className="modern-form-input"
                          value={fullDate}
                          onChange={(e) => setFullDate(e.target.value)}
                        />
                      </div>
                      <div className="input-field-wrap">
                        <label className="input-field-label">Horario</label>
                        <select
                          className="modern-form-input"
                          value={fullTime}
                          onChange={(e) => setFullTime(e.target.value)}
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="06:00 PM">06:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Facturación & Pago */}
                {fullTab === 'billing' && (
                  <div className="form-section-card">
                    <div className="form-section-header">
                      <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MaterialIcon name="credit_card" size={18} />
                        <span>Comprobante y Liquidación</span>
                      </h4>
                      <span className="form-section-badge">CAJA</span>
                    </div>

                    <div style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Total a Facturar</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{fullPrice}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Concepto: {fullService}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.75rem' }}>
                      <div className="input-field-wrap">
                        <label className="input-field-label">Tipo de Comprobante</label>
                        <select
                          className="modern-form-input"
                          value={fullDocType}
                          onChange={(e) => setFullDocType(e.target.value as any)}
                        >
                          <option value="Boleta">Boleta de Venta Electrónica</option>
                          <option value="Factura">Factura con RUC</option>
                        </select>
                      </div>
                      <div className="input-field-wrap">
                        <label className="input-field-label">Medio de Pago</label>
                        <select
                          className="modern-form-input"
                          value={fullPayMethod}
                          onChange={(e) => setFullPayMethod(e.target.value as any)}
                        >
                          <option value="Yape">Yape</option>
                          <option value="Plin">Plin</option>
                          <option value="POS Tarjeta">Tarjeta Débito / Crédito</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Convenio EPS">Seguro / Convenio EPS</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-field-wrap" style={{ marginTop: '0.75rem' }}>
                      <label className="input-field-label">Estado del Cobro</label>
                      <select
                        className="modern-form-input"
                        value={fullPayStatus}
                        onChange={(e) => setFullPayStatus(e.target.value as any)}
                      >
                        <option value="immediate">Cobrado en este Momento ({fullPrice})</option>
                        <option value="post_consultation">Cobrar al Finalizar la Consulta</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer de Navegación y Envío */}
              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {fullTab !== 'patient' && (
                    <button
                      type="button"
                      className="btn-action-ghost"
                      onClick={() => {
                        if (fullTab === 'billing') setFullTab('schedule');
                        else if (fullTab === 'schedule') setFullTab('clinical');
                        else if (fullTab === 'clinical') setFullTab('patient');
                      }}
                    >
                      ← Anterior
                    </button>
                  )}
                  {fullTab !== 'billing' && (
                    <button
                      type="button"
                      className="btn-action-ghost"
                      style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1', fontWeight: 700 }}
                      onClick={() => {
                        if (fullTab === 'patient') setFullTab('clinical');
                        else if (fullTab === 'clinical') setFullTab('schedule');
                        else if (fullTab === 'schedule') setFullTab('billing');
                      }}
                    >
                      Siguiente →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-action-ghost"
                    onClick={() => setIsFullBookingOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-call-consultation primary"
                    style={{
                      padding: '0.65rem 1.6rem',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <MaterialIcon name="check" size={16} />
                    <span>Registrar Cita Completa & Notificar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Envío WhatsApp 1-Clic */}
      {activeWhatsApp && (
        <WhatsAppReminderModal
          isOpen={!!activeWhatsApp}
          onClose={() => setActiveWhatsApp(null)}
          data={{
            patientName: activeWhatsApp.patientName,
            patientPhone: '51987654321',
            doctorName: activeWhatsApp.doctor,
            timeStr: activeWhatsApp.time,
            serviceType: activeWhatsApp.service,
          }}
        />
      )}

      {/* Modal de Receta Electrónica Oficial con QR */}
      {activeRx && (
        <DigitalPrescriptionModal
          isOpen={!!activeRx}
          onClose={() => setActiveRx(null)}
          data={{
            patientName: activeRx.patientName,
            patientDni: activeRx.dni,
            doctorName: activeRx.doctor,
            diagnosis: 'Dolor y Contractura Cervico-Dorsal Aguda',
            cie10: 'M54.2',
            items: [
              {
                medication: 'Ibuprofeno 400mg Comprimidos',
                dosage: '1 comprimido (400mg)',
                frequency: 'Cada 8 horas con alimentos',
                duration: '5 días',
                instructions: 'Tomar después de los alimentos con abundante agua.',
              },
              {
                medication: 'Complejo B + Tiamina 100mg',
                dosage: '1 cápsula blanda al día',
                frequency: 'Cada 24 horas en el desayuno',
                duration: '15 días',
                instructions: 'Coadyuvante en regeneración neuromuscular.',
              },
            ],
            indications: 'Reposo relativo articular. Aplicar termoterapia local (compresa tibia) por 20 minutos 2 veces al día. Continuar con plan fisioterapéutico prescrito.',
          }}
        />
      )}
    </div>
  );
};

export default ReceptionDashboard;



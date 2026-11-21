import React, { useState } from 'react';
import './ClinicalDashboard.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  IconCalendar,
  IconCash,
  IconChart,
  IconAlert,
  IconInventory,
  IconMail,
  IconBot,
  IconPlus,
  IconArrowRight,
  IconSearch,
} from '../../components/ui/Icons';

interface ClinicAdminDashboardProps {
  onNavigate: (view: string) => void;
  clinicName?: string;
  adminName?: string;
}

interface AppointmentItem {
  id: string;
  time: string;
  patient: string;
  dni: string;
  doctor: string;
  specialty: string;
  service: string;
  room?: string;
  status: 'in_consultation' | 'waiting' | 'confirmed' | 'attended';
  statusText: string;
  statusClass: string;
  price: string;
  paid: boolean;
}

export const ClinicAdminDashboard: React.FC<ClinicAdminDashboardProps> = ({
  onNavigate,
  clinicName = 'Clínica Sanitas Lima',
  adminName = 'Alessander (Director Médico)',
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_consultation' | 'waiting' | 'confirmed' | 'attended'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: 'apt-1',
      time: '09:00 AM',
      patient: 'Carlos Benítez Vega',
      dni: '72109845',
      doctor: 'Dra. María González',
      specialty: 'Fisioterapia y Rehabilitación',
      service: 'Rehabilitación Deportiva (Sesión 3/5)',
      room: 'Cons. 101',
      status: 'in_consultation',
      statusText: 'En Consulta',
      statusClass: 'status-in_consultation',
      price: 'S/ 100.00',
      paid: true,
    },
    {
      id: 'apt-2',
      time: '09:45 AM',
      patient: 'Rosa Morales Silva',
      dni: '09843211',
      doctor: 'Dr. Carlos Mendoza',
      specialty: 'Traumatología',
      service: 'Evaluación y Diagnóstico Inicial',
      room: 'Cons. 102',
      status: 'waiting',
      statusText: 'En Sala de Espera',
      statusClass: 'status-waiting',
      price: 'S/ 150.00',
      paid: true,
    },
    {
      id: 'apt-3',
      time: '10:30 AM',
      patient: 'Jorge Ramírez Castro',
      dni: '41209384',
      doctor: 'Dra. María González',
      specialty: 'Fisioterapia y Rehabilitación',
      service: 'Terapia Manual Ortopédica',
      room: 'Cons. 101',
      status: 'confirmed',
      statusText: 'Confirmada',
      statusClass: 'status-confirmed',
      price: 'S/ 80.00',
      paid: false,
    },
    {
      id: 'apt-4',
      time: '08:15 AM',
      patient: 'Lucía Fernández Quispe',
      dni: '78341902',
      doctor: 'Lic. Andrés Paredes',
      specialty: 'Terapia Física',
      service: 'Descarga Muscular Completa',
      room: 'Cons. 103',
      status: 'attended',
      statusText: 'Atendida',
      statusClass: 'status-attended',
      price: 'S/ 70.00',
      paid: true,
    },
  ]);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient.toLowerCase().includes(searchFilter.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchFilter.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchFilter.toLowerCase()) ||
      apt.dni.includes(searchFilter);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-canvas">
      {/* Header & Context */}
      <header className="dashboard-header">
        <div>
          <div className="clinic-badge">
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#0284c7', display: 'inline-block' }} />
            Centro Operativo · {clinicName}
          </div>
          <h1 className="dashboard-title">
            Gestión Operativa y Financiera
          </h1>
          <p className="dashboard-subtitle">
            Director Médico a cargo: <strong style={{ color: '#0f172a' }}>{adminName}</strong>
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('cash-register')}
          >
            <IconCash className="w-4 h-4 text-slate-500" />
            <span>Ver Caja Chica</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('inventory')}
          >
            <IconInventory className="w-4 h-4 text-slate-500" />
            <span>Ver Inventario</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate('booking')}
          >
            <IconPlus className="w-4 h-4" />
            <span>+ Agendar Cita</span>
          </button>
        </div>
      </header>

      {/* Nivel 1: Tarjetas KPI Limpias */}
      <section className="kpi-grid">
        {/* KPI 1: Citas */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Citas de Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-sky">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">142</div>
          <div className="kpi-footer">
            <span className="kpi-trend">
              ↑ +12.4%
            </span>
            <span style={{ color: '#94a3b8' }}>vs. día anterior</span>
          </div>
        </div>

        {/* KPI 2: Caja Chica */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Caja Chica Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-emerald">
              <IconCash className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">S/ 1,420.00</div>
          <div className="kpi-footer">
            <span style={{ color: '#16a34a', fontWeight: 600 }}>● Turno Mañana Abierto</span>
            <button
              type="button"
              className="kpi-link"
              onClick={() => onNavigate('cash-register')}
            >
              Arqueo →
            </button>
          </div>
        </div>

        {/* KPI 3: Ocupación */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Tasa de Ocupación</span>
            <div className="kpi-icon-wrap kpi-icon-teal">
              <IconChart className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">82.5%</div>
          <div className="kpi-footer">
            <span><strong>4 consultorios</strong> activos</span>
            <span style={{ color: '#0d9488', fontWeight: 600 }}>Alta Demanda</span>
          </div>
        </div>

        {/* KPI 4: Stock */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Insumos Críticos</span>
            <div className="kpi-icon-wrap kpi-icon-amber">
              <IconAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#d97706' }}>2 Alertas</div>
          <div className="kpi-footer">
            <span>Gel ultrasonido & agujas</span>
            <button
              type="button"
              className="kpi-link"
              onClick={() => onNavigate('inventory')}
            >
              Kardex →
            </button>
          </div>
        </div>
      </section>

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

      {/* Nivel 2: Agenda Próxima & Citas de Hoy */}
      <section className="table-card">
        {/* Fila 1: Título y Acción de Agendamiento */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1.25rem',
          borderBottom: '1.5px solid #f1f5f9',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 className="table-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Agenda de Citas del Día
            </h2>
            <p className="table-subtitle" style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              Pacientes citados hoy en {clinicName}, horario asignado y estado clínico en tiempo real.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="kpi-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
              onClick={() => onNavigate('booking')}
            >
              <span>Ver Calendario Completo</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="cash-btn primary"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                borderColor: '#0284c7',
                boxShadow: '0 4px 14px -2px rgba(2, 132, 199, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '12px'
              }}
              onClick={() => onNavigate('booking')}
            >
              <IconPlus className="w-4 h-4" />
              <span>+ Agendar Cita</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Barra de Filtros y Búsqueda */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.15rem 0 1.25rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Segmented Filter Pills */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                color: statusFilter === 'all' ? '#0284c7' : '#64748b',
                boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Todas ({appointments.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_consultation')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'in_consultation' ? '#ffffff' : 'transparent',
                color: statusFilter === 'in_consultation' ? '#0284c7' : '#64748b',
                boxShadow: statusFilter === 'in_consultation' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              ● En Consulta ({appointments.filter(a => a.status === 'in_consultation').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('waiting')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'waiting' ? '#ffffff' : 'transparent',
                color: statusFilter === 'waiting' ? '#d97706' : '#64748b',
                boxShadow: statusFilter === 'waiting' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              ● En Espera ({appointments.filter(a => a.status === 'waiting').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'confirmed' ? '#ffffff' : 'transparent',
                color: statusFilter === 'confirmed' ? '#16a34a' : '#64748b',
                boxShadow: statusFilter === 'confirmed' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              ● Confirmadas ({appointments.filter(a => a.status === 'confirmed').length})
            </button>
          </div>

          {/* Search Box + Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                <IconSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar paciente, DNI o servicio..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
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
              {filteredAppointments.length} de {appointments.length} citas
            </span>
          </div>
        </div>

        <div className="clinical-table-wrapper">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Profesional</th>
                <th>Servicio Clínico</th>
                <th>Monto</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No se encontraron citas con el filtro aplicado.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span className="time-badge">{apt.time}</span>
                    </td>
                    <td>
                      <div className="patient-name-cell">{apt.patient}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>DNI: {apt.dni}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{apt.doctor}</span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#0284c7' }}>{apt.room || 'Box 1'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{apt.service}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{apt.price}</span>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: apt.paid ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                        {apt.paid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MaterialIcon name="check" size={12} />
                            <span>Pagado</span>
                          </span>
                        ) : (
                          '● Pendiente'
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${apt.statusClass}`}>
                        <span>●</span> {apt.statusText}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="table-action-btn"
                          style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          Gestionar →
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onNavigate('clinical-consultation')}
                        >
                          Ver Ficha →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Gestión de Cita */}
      {selectedAppointment && (
        <div className="modal-overlay-custom" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '96%' }}>
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bae6fd' }}>
                  <IconCalendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Cita: {selectedAppointment.patient}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    Horario: <strong>{selectedAppointment.time}</strong> · DNI: {selectedAppointment.dni}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Tarjeta 1: Servicio y Profesional */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="medical_services" size={18} />
                    <span>Detalles del Servicio & Profesional</span>
                  </h4>
                  <span className="status-pill status-confirmed" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                    {selectedAppointment.price}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Servicio Clínico</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left">
                        <MaterialIcon name="medical_services" size={16} />
                      </span>
                      <input
                        type="text"
                        className="modern-form-input"
                        value={selectedAppointment.service}
                        onChange={(e) => setSelectedAppointment({ ...selectedAppointment, service: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Profesional Asignado</label>
                    <div className="input-with-icon">
                      <span className="input-icon-left">
                        <MaterialIcon name="person" size={16} />
                      </span>
                      <input
                        type="text"
                        className="modern-form-input"
                        value={selectedAppointment.doctor}
                        onChange={(e) => setSelectedAppointment({ ...selectedAppointment, doctor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Operativa y Consultorio */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="settings" size={18} />
                    <span>Estado de Atención, Horario y Consultorio</span>
                  </h4>
                  <span className="form-section-badge">SEDE {clinicName.toUpperCase()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.9fr', gap: '0.75rem' }}>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Estado de la Cita</label>
                    <select
                      className="modern-form-input"
                      value={selectedAppointment.status}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        const labelMap: Record<string, { text: string; cls: string }> = {
                          in_consultation: { text: 'En Consulta', cls: 'status-in_consultation' },
                          waiting: { text: 'En Sala de Espera', cls: 'status-waiting' },
                          confirmed: { text: 'Confirmada', cls: 'status-confirmed' },
                          attended: { text: 'Atendida', cls: 'status-attended' },
                        };
                        setSelectedAppointment({
                          ...selectedAppointment,
                          status: val,
                          statusText: labelMap[val]?.text || val,
                          statusClass: labelMap[val]?.cls || 'status-confirmed',
                        });
                      }}
                    >
                      <option value="waiting">En Sala de Espera</option>
                      <option value="in_consultation">En Consulta Médica</option>
                      <option value="confirmed">Confirmada / Por Llegar</option>
                      <option value="attended">Atendida / Finalizada</option>
                    </select>
                  </div>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Consultorio / Box</label>
                    <select
                      className="modern-form-input"
                      value={selectedAppointment.room || 'Cons. 101'}
                      onChange={(e) => setSelectedAppointment({ ...selectedAppointment, room: e.target.value })}
                    >
                      <option value="Cons. 101">Consultorio 101 (Fisioterapia)</option>
                      <option value="Cons. 102">Consultorio 102 (Traumatología)</option>
                      <option value="Cons. 103">Consultorio 103 (Terapia Manual)</option>
                      <option value="Cons. 104">Consultorio 104 (Evaluación)</option>
                    </select>
                  </div>
                  <div className="input-field-wrap">
                    <label className="input-field-label">Hora Asignada</label>
                    <input
                      type="text"
                      className="modern-form-input monospace"
                      value={selectedAppointment.time}
                      onChange={(e) => setSelectedAppointment({ ...selectedAppointment, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Notas Administrativas */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="edit_note" size={18} />
                    <span>Notas Internas de Recepción</span>
                  </h4>
                  <span className="form-section-badge">INTERNO</span>
                </div>
                <textarea
                  rows={2}
                  className="modern-form-input"
                  style={{ height: 'auto', padding: '0.65rem' }}
                  placeholder="Observaciones de admisión, requerimiento de boleta o seguro particular..."
                  defaultValue="Paciente puntual con orden médica previa de traumatología."
                />
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="cash-btn primary"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderColor: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => {
                  const updated = appointments.map(a => a.id === selectedAppointment.id ? { ...selectedAppointment, status: 'in_consultation' as const, statusText: 'En Consulta', statusClass: 'status-in_consultation' } : a);
                  setAppointments(updated);
                  showToast(`Paciente ${selectedAppointment.patient} llamado a ${selectedAppointment.room || 'Cons. 101'}.`);
                  setSelectedAppointment(null);
                  onNavigate('clinical-consultation');
                }}
              >
                <MaterialIcon name="medical_services" size={16} />
                <span>Llamar a Consulta y Abrir Ficha</span>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="cash-btn ghost"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="cash-btn primary"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  onClick={() => {
                    setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? selectedAppointment : a));
                    showToast(`Cita de ${selectedAppointment.patient} actualizada con éxito.`);
                    setSelectedAppointment(null);
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nivel 3: Módulos Administrativos & Operativos */}
      <section>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>
          Módulos Administrativos
        </h2>
        <div className="modules-grid">
          {/* Módulo 1: Caja Chica */}
          <div
            onClick={() => onNavigate('cash-register')}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-emerald">
                <IconCash className="w-6 h-6" />
              </div>
              <h3 className="module-title">Caja Chica & Arqueo</h3>
              <p className="module-desc">
                Apertura de turno, cobro de citas, registro de egresos y cálculo automático de diferencias en el arqueo diario.
              </p>
            </div>
            <span className="module-link" style={{ color: '#059669' }}>
              <span>Gestionar Caja Chica</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Módulo 2: Kardex */}
          <div
            onClick={() => onNavigate('inventory')}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-indigo">
                <IconInventory className="w-6 h-6" />
              </div>
              <h3 className="module-title">Kardex de Inventario</h3>
              <p className="module-desc">
                Control de insumos médicos, trazabilidad de consumos por sesión de terapia y alertas automáticas de reposición.
              </p>
            </div>
            <span className="module-link" style={{ color: '#4f46e5' }}>
              <span>Ver Kardex e Insumos</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Módulo 3: Emails */}
          <div
            onClick={() => onNavigate('communications')}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-sky">
                <IconMail className="w-6 h-6" />
              </div>
              <h3 className="module-title">Emails & Recordatorios 24h</h3>
              <p className="module-desc">
                Plantillas automáticas con variables, trazabilidad de entrega y barrido diario de confirmación para reducir ausentismo.
              </p>
            </div>
            <span className="module-link" style={{ color: '#0284c7' }}>
              <span>Configurar Comunicaciones</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Módulo 4: Telegram */}
          <div
            onClick={() => onNavigate('telegram-bot')}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-blue">
                <IconBot className="w-6 h-6" />
              </div>
              <h3 className="module-title">Bot de Telegram</h3>
              <p className="module-desc">
                Vinculación de profesionales con /start, comandos interactivos para consultar agenda y notificaciones push en tiempo real.
              </p>
            </div>
            <span className="module-link" style={{ color: '#2563eb' }}>
              <span>Administrar Bot</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClinicAdminDashboard;

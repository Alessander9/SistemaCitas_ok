import React, { useState } from 'react';
import './AdminDashboard.css';

interface AdminDashboardProps {
  userRole?: string;
  userName?: string;
  onNavigate: (view: 'clinical-consultation' | 'cash-register' | 'inventory' | 'communications' | 'telegram-bot' | 'booking' | 'patient-portal' | 'landing') => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userRole = 'Super Administrador',
  userName = 'Alessander (Director Médico)',
  onNavigate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'kpis'>('today');

  const todayAppointments = [
    {
      id: 'apt-101',
      time: '09:00 AM',
      patient: 'María Santos López',
      doc: 'DNI 45892110',
      service: 'Terapia Manual Ortopédica',
      specialty: 'Fisioterapia',
      doctor: 'Lic. María González',
      status: 'completed',
      statusLabel: 'Atendida',
      amount: 'S/ 80.00',
    },
    {
      id: 'apt-102',
      time: '10:00 AM',
      patient: 'Carlos Benítez Vega',
      doc: 'DNI 72109845',
      service: 'Rehabilitación Deportiva',
      specialty: 'Fisioterapia',
      doctor: 'Lic. María González',
      status: 'in_progress',
      statusLabel: 'En Consulta',
      amount: 'S/ 100.00',
    },
    {
      id: 'apt-103',
      time: '11:00 AM',
      patient: 'Rosa Morales Silva',
      doc: 'DNI 09843211',
      service: 'Consulta Traumatológica',
      specialty: 'Traumatología',
      doctor: 'Dr. Carlos Mendoza',
      status: 'confirmed',
      statusLabel: 'Confirmada',
      amount: 'S/ 150.00',
    },
    {
      id: 'apt-104',
      time: '12:00 PM',
      patient: 'Jorge Ramírez Castro',
      doc: 'DNI 41209384',
      service: 'Descarga Muscular',
      specialty: 'Fisioterapia',
      doctor: 'Lic. María González',
      status: 'confirmed',
      statusLabel: 'Confirmada',
      amount: 'S/ 70.00',
    },
    {
      id: 'apt-105',
      time: '03:30 PM',
      patient: 'Lucía Fernández Quispe',
      doc: 'DNI 78341902',
      service: 'Evaluación y Diagnóstico Inicial',
      specialty: 'Fisioterapia',
      doctor: 'Lic. María González',
      status: 'pending',
      statusLabel: 'Por Pagar',
      amount: 'S/ 120.00',
    },
  ];

  return (
    <div className="admin-dashboard-container">
      {/* Header Banner */}
      <header className="dashboard-header">
        <div className="dashboard-welcome">
          <div className="user-avatar-badge">👨‍⚕️</div>
          <div>
            <div className="badge-role">
              <span className="dot-online"></span>
              {userRole} · Clínica Sanitas Lima
            </div>
            <h1 className="welcome-title">Panel de Control General</h1>
            <p className="welcome-sub">Bienvenido, <strong>{userName}</strong>. Aquí tienes el resumen operativo en tiempo real.</p>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="btn-dash-action cta"
            onClick={() => onNavigate('clinical-consultation')}
          >
            🩺 Nueva Consulta Clínica (EVA)
          </button>
          <button
            type="button"
            className="btn-dash-action"
            onClick={() => onNavigate('booking')}
          >
            📅 Agendar Nueva Cita
          </button>
          <button
            type="button"
            className="btn-dash-logout"
            onClick={onLogout}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        <div className="kpi-card teal">
          <div className="kpi-header">
            <span className="kpi-title">Citas de Hoy</span>
            <span className="kpi-icon">📅</span>
          </div>
          <div className="kpi-value">14</div>
          <div className="kpi-footer">
            <span className="kpi-tag success">▲ 18%</span> vs. ayer (3 completadas, 1 en curso)
          </div>
        </div>

        <div className="kpi-card blue">
          <div className="kpi-header">
            <span className="kpi-title">Ingresos Caja Hoy</span>
            <span className="kpi-icon">💰</span>
          </div>
          <div className="kpi-value">S/ 1,420.00</div>
          <div className="kpi-footer">
            <span className="kpi-tag success">Abierta</span> Fondo inicial: S/ 150.00
          </div>
        </div>

        <div className="kpi-card indigo">
          <div className="kpi-header">
            <span className="kpi-title">Pacientes Atendidos</span>
            <span className="kpi-icon">👥</span>
          </div>
          <div className="kpi-value">8 / 14</div>
          <div className="kpi-footer">
            <span className="kpi-tag info">57%</span> Avance de la jornada
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-header">
            <span className="kpi-title">Alertas de Inventario</span>
            <span className="kpi-icon">📦</span>
          </div>
          <div className="kpi-value">2</div>
          <div className="kpi-footer">
            <span className="kpi-tag warning">Stock Bajo</span> Gel Ultrasonido & Agujas
          </div>
        </div>
      </section>

      {/* Operational Modules Quick Navigation */}
      <section className="dashboard-section">
        <h2 className="section-heading">⚡ Módulos y Operaciones Clínicas</h2>
        <div className="modules-grid">
          <div className="module-card" onClick={() => onNavigate('clinical-consultation')}>
            <div className="module-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>🩺</div>
            <div className="module-info">
              <h3>Historia Clínica & Escala EVA</h3>
              <p>Registro de anamnesis, dolor 0-10, diagnósticos CIE-10 y prescripciones médicas.</p>
              <span className="module-link">Abrir Consulta →</span>
            </div>
          </div>

          <div className="module-card" onClick={() => onNavigate('cash-register')}>
            <div className="module-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>🏦</div>
            <div className="module-info">
              <h3>Caja Chica & Arqueo Diario</h3>
              <p>Apertura, cobro de citas, registro de egresos, cálculo de sobrantes/faltantes y cierre.</p>
              <span className="module-link">Gestionar Caja →</span>
            </div>
          </div>

          <div className="module-card" onClick={() => onNavigate('inventory')}>
            <div className="module-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>📦</div>
            <div className="module-info">
              <h3>Kardex de Inventario</h3>
              <p>Control de insumos médicos, movimientos de entrada/salida y alertas de stock mínimo.</p>
              <span className="module-link">Ver Kardex →</span>
            </div>
          </div>

          <div className="module-card" onClick={() => onNavigate('communications')}>
            <div className="module-icon" style={{ background: 'rgba(13, 148, 136, 0.2)', color: '#2dd4bf' }}>✉️</div>
            <div className="module-info">
              <h3>Emails & Recordatorios 24h</h3>
              <p>Editor de plantillas dinámicas, auditoría de envíos y disparador del barrido de recordatorios.</p>
              <span className="module-link">Configurar Envíos →</span>
            </div>
          </div>

          <div className="module-card" onClick={() => onNavigate('telegram-bot')}>
            <div className="module-icon" style={{ background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8' }}>🤖</div>
            <div className="module-info">
              <h3>Bot de Telegram</h3>
              <p>Vinculación de cuentas médicas mediante código /start, comandos /hoy y alertas push.</p>
              <span className="module-link">Ver Bot Telegram →</span>
            </div>
          </div>

          <div className="module-card" onClick={() => onNavigate('patient-portal')}>
            <div className="module-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>👤</div>
            <div className="module-info">
              <h3>Portal del Paciente</h3>
              <p>Vista del paciente con historial de citas, descarga de recetas y comprobantes de pago.</p>
              <span className="module-link">Simular Paciente →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Agenda Table */}
      <section className="dashboard-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-heading">📋 Agenda en Vivo de Hoy</h2>
            <p className="section-subtext">Citas programadas para la fecha actual · 02 de Septiembre, 2026</p>
          </div>
          <div className="tab-filters">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Todas las Citas (5)
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Especialidad / Servicio</th>
                <th>Profesional</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td className="font-mono"><strong>{apt.time}</strong></td>
                  <td>
                    <div className="cell-patient">
                      <span className="p-name">{apt.patient}</span>
                      <span className="p-doc">{apt.doc}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-service">
                      <span className="s-name">{apt.service}</span>
                      <span className="s-spec">{apt.specialty}</span>
                    </div>
                  </td>
                  <td>{apt.doctor}</td>
                  <td className="font-bold">{apt.amount}</td>
                  <td>
                    <span className={`status-pill ${apt.status}`}>
                      {apt.statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-row">
                      <button
                        type="button"
                        className="btn-table-action primary"
                        title="Atender en Consulta"
                        onClick={() => onNavigate('clinical-consultation')}
                      >
                        🩺 Atender
                      </button>
                      <button
                        type="button"
                        className="btn-table-action secondary"
                        title="Cobrar en Caja"
                        onClick={() => onNavigate('cash-register')}
                      >
                        💳 Cobro
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

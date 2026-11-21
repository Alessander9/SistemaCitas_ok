import React, { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  IconStethoscope,
  IconSearch,
  IconCalendar,
  IconFileText,
} from '../../components/ui/Icons';
import {
  VoiceConsultationAssistant,
  ParsedClinicalVoiceData,
} from '../../components/clinical/VoiceConsultationAssistant';

interface DoctorDashboardProps {
  doctorName?: string;
  specialty?: string;
  initialTab?: 'queue' | 'weekly';
  onOpenConsultation: () => void;
}

interface PatientQueueItem {
  id: string;
  time: string;
  patientName: string;
  initials: string;
  age: string;
  dni: string;
  service: string;
  status: 'waiting' | 'in_progress' | 'completed';
  statusText: string;
  statusClass: string;
  evaLast: number;
  evaTrend?: 'down' | 'equal' | 'up';
  treatmentPhase?: string;
  appliedTechniques?: string[];
  homeRecommendations?: string;
  reason: string;
  sessionProgress: string;
  notes?: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorName = 'Dra. María González',
  specialty = 'Fisioterapia y Rehabilitación',
  initialTab = 'queue',
  onOpenConsultation,
}) => {
  const [mainView, setMainView] = useState<'queue' | 'weekly'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setMainView(initialTab);
    }
  }, [initialTab]);

  const [selectedDay, setSelectedDay] = useState('mie');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('Capacitación Médica');
  const [blockTime, setBlockTime] = useState('12:00 PM - 01:00 PM');

  const weeklyScheduleData: Record<string, { date: string; dayName: string; dayNum: string; isToday?: boolean; appointments: { time: string; patient?: string; service?: string; room: string; status: 'occupied' | 'available' | 'blocked'; note?: string }[] }> = {
    lun: {
      date: 'Lunes 11 de Septiembre',
      dayName: 'Lun',
      dayNum: '11',
      appointments: [
        { time: '08:30 AM', patient: 'Mariana Ríos Soto', service: 'Rehabilitación Post-Cirugía LCA', room: 'Box 101', status: 'occupied' },
        { time: '09:45 AM', patient: 'Gonzalo Vera Paz', service: 'Terapia Manual Columna', room: 'Box 102', status: 'occupied' },
        { time: '11:00 AM', patient: 'Carla Quispe Ramos', service: 'Electroterapia y Magneto', room: 'Box 101', status: 'occupied' },
        { time: '12:15 PM', status: 'available', room: 'Box 101', note: 'Horario libre para evaluación rápida' },
        { time: '03:30 PM', patient: 'Eduardo Flores Diez', service: 'Descarga Muscular Deportiva', room: 'Box 103', status: 'occupied' },
        { time: '05:00 PM', status: 'available', room: 'Box 101', note: 'Horario disponible' },
      ]
    },
    mar: {
      date: 'Martes 12 de Septiembre',
      dayName: 'Mar',
      dayNum: '12',
      appointments: [
        { time: '08:00 AM', patient: 'Renato Silva Cano', service: 'Kinesiología Funcional', room: 'Gimnasio', status: 'occupied' },
        { time: '09:30 AM', patient: 'Elena Campos Lara', service: 'Terapia Manual Cervical', room: 'Box 101', status: 'occupied' },
        { time: '11:00 AM', status: 'blocked', room: 'Box 101', note: 'Pausa Médica / Capacitación Interna' },
        { time: '03:00 PM', patient: 'Sofía Navarro Cruz', service: 'Ultrasonido Tendinitis Hombro', room: 'Box 102', status: 'occupied' },
        { time: '04:30 PM', patient: 'Mateo Cárdenas Vega', service: 'Rehabilitación de Tobillo', room: 'Box 101', status: 'occupied' },
      ]
    },
    mie: {
      date: 'Miércoles 13 de Septiembre (Hoy)',
      dayName: 'Mié',
      dayNum: '13',
      isToday: true,
      appointments: [
        { time: '08:00 AM', patient: 'Lucía Fernández Quispe', service: 'Evaluación y Diagnóstico Físico', room: 'Box 101', status: 'occupied', note: 'Atendida' },
        { time: '09:00 AM', patient: 'Carlos Benítez Vega', service: 'Rehabilitación Deportiva (Sesión 3/5)', room: 'Box 101', status: 'occupied', note: 'En Consulta' },
        { time: '10:00 AM', patient: 'Rosa Morales Silva', service: 'Terapia Manual Ortopédica', room: 'Box 102', status: 'occupied', note: 'En Sala de Espera' },
        { time: '11:15 AM', patient: 'Jorge Ramírez Castro', service: 'Descarga Muscular Completa', room: 'Box 101', status: 'occupied', note: 'Confirmado' },
        { time: '12:30 PM', status: 'available', room: 'Box 101', note: 'Horario disponible para sobrecupo' },
        { time: '03:00 PM', patient: 'Andrés Mendoza Alva', service: 'Punción Seca y Electroterapia', room: 'Box 103', status: 'occupied' },
        { time: '04:30 PM', patient: 'Valeria Paredes Soto', service: 'Reeducación Postural Global (RPG)', room: 'Box 101', status: 'occupied' },
        { time: '06:00 PM', status: 'blocked', room: 'Box 101', note: 'Capacitación Médica MINSA' },
      ]
    },
    jue: {
      date: 'Jueves 14 de Septiembre',
      dayName: 'Jue',
      dayNum: '14',
      appointments: [
        { time: '08:30 AM', patient: 'Diego Herrera Solís', service: 'Fisioterapia Lumbar Avanzada', room: 'Box 101', status: 'occupied' },
        { time: '10:00 AM', patient: 'Camila Peña Bravo', service: 'Mapeo Postural y Ergonómico', room: 'Box 102', status: 'occupied' },
        { time: '11:30 AM', status: 'available', room: 'Box 101', note: 'Horario libre disponible' },
        { time: '03:00 PM', patient: 'Víctor Toledo Mora', service: 'Terapia Manual y Crioterapia', room: 'Box 101', status: 'occupied' },
        { time: '05:00 PM', status: 'available', room: 'Box 103', note: 'Horario libre disponible' },
      ]
    },
    vie: {
      date: 'Viernes 15 de Septiembre',
      dayName: 'Vie',
      dayNum: '15',
      appointments: [
        { time: '08:00 AM', patient: 'Patricia Gil Díaz', service: 'Control y Alta de Fisioterapia', room: 'Box 101', status: 'occupied' },
        { time: '09:15 AM', patient: 'Raúl Montenegro Vega', service: 'Rehabilitación Manguito Rotador', room: 'Box 101', status: 'occupied' },
        { time: '10:45 AM', patient: 'Fabiola Ruiz Pinto', service: 'Terapia Miofascial Instrumental', room: 'Box 102', status: 'occupied' },
        { time: '12:00 PM', status: 'available', room: 'Box 101', note: 'Horario libre' },
        { time: '03:30 PM', patient: 'Joaquín Rivas Castro', service: 'Descarga de Piernas y TENS', room: 'Gimnasio', status: 'occupied' },
        { time: '05:00 PM', patient: 'Estela Morales Neyra', service: 'Evaluación de Columna', room: 'Box 101', status: 'occupied' },
      ]
    },
    sab: {
      date: 'Sábado 16 de Septiembre',
      dayName: 'Sáb',
      dayNum: '16',
      appointments: [
        { time: '08:30 AM', patient: 'Guillermo Paz Loyola', service: 'Sesión Especial Deportistas', room: 'Box 101', status: 'occupied' },
        { time: '10:00 AM', patient: 'Luciana Beltrán Arce', service: 'Terapia Manual Express', room: 'Box 102', status: 'occupied' },
        { time: '11:30 AM', status: 'available', room: 'Box 101', note: 'Cierre de Jornada Matutina' },
      ]
    }
  };

  const currentDayData = weeklyScheduleData[selectedDay] || weeklyScheduleData.mie;

  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [patientsQueue, setPatientsQueue] = useState<PatientQueueItem[]>([
    {
      id: 'p-1',
      time: '09:00 AM',
      patientName: 'Carlos Benítez Vega',
      initials: 'CB',
      age: '34 años',
      dni: '72109845',
      service: 'Rehabilitación Deportiva (Sesión 3/5)',
      status: 'in_progress',
      statusText: 'En Consulta Ahora',
      statusClass: 'badge-waiting',
      evaLast: 6,
      evaTrend: 'down',
      treatmentPhase: 'Fase 2 · Restauración de Movilidad y Rango Articular',
      appliedTechniques: ['Terapia Manual', 'Ultrasonido', 'Electroterapia TENS'],
      homeRecommendations: 'Aplicar compresas frías 15 min y estiramientos de isquiotibiales.',
      reason: 'Desgarro muscular en isquiotibiales derecho',
      sessionProgress: '3 de 5 sesiones',
      notes: 'Paciente refiere disminución del dolor punzante tras termoterapia.',
    },
    {
      id: 'p-2',
      time: '10:00 AM',
      patientName: 'Rosa Morales Silva',
      initials: 'RM',
      age: '48 años',
      dni: '09843211',
      service: 'Terapia Manual Ortopédica',
      status: 'waiting',
      statusText: 'En Sala de Espera',
      statusClass: 'badge-confirmed',
      evaLast: 8,
      evaTrend: 'equal',
      treatmentPhase: 'Fase 1 · Control del Dolor e Inflamación Aguda',
      appliedTechniques: ['Terapia Manual', 'Crioterapia'],
      homeRecommendations: 'Reposo relativo y evitar flexiones lumbares bruscas.',
      reason: 'Lumbalgia aguda con irradiación ciática',
      sessionProgress: '1 de 10 sesiones',
      notes: 'Primera sesión post evaluación diagnóstica. Movilidad lumbar reducida.',
    },
    {
      id: 'p-3',
      time: '11:15 AM',
      patientName: 'Jorge Ramírez Castro',
      initials: 'JR',
      age: '29 años',
      dni: '41209384',
      service: 'Descarga Muscular Completa',
      status: 'waiting',
      statusText: 'Confirmado / En Camino',
      statusClass: 'badge-confirmed',
      evaLast: 4,
      evaTrend: 'down',
      treatmentPhase: 'Fase 4 · Readaptación Funcional y Prevención',
      appliedTechniques: ['Terapia Manual', 'Kinesiotape'],
      homeRecommendations: 'Hidratación abundante y estiramientos suaves post-carrera.',
      reason: 'Sobrecarga en gemelos y sóleo post-maratón',
      sessionProgress: 'Sesión única',
      notes: 'Sobrecarga simétrica bilateral. Sin desgarro aparente.',
    },
    {
      id: 'p-4',
      time: '08:00 AM',
      patientName: 'Lucía Fernández Quispe',
      initials: 'LF',
      age: '52 años',
      dni: '78341902',
      service: 'Evaluación y Diagnóstico Físico Inicial',
      status: 'completed',
      statusText: 'Atendida / Receta Emitida',
      statusClass: 'badge-attended',
      evaLast: 7,
      evaTrend: 'equal',
      treatmentPhase: 'Fase 1 · Control del Dolor e Inflamación Aguda',
      appliedTechniques: ['Evaluación', 'Termoterapia'],
      homeRecommendations: 'Comenzar ciclo de fisioterapia 3 veces por semana.',
      reason: 'Tendinitis de manguito rotador hombro izquierdo',
      sessionProgress: 'Evaluación completada',
      notes: 'Se prescriben 10 sesiones de ultrasonido y ejercicios de fortalecimiento.',
    },
  ]);

  const filteredQueue = patientsQueue.filter((p) => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dni.includes(searchTerm) ||
      p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getEvaColor = (score: number) => {
    if (score <= 3) return { color: '#16a34a', bg: '#f0fdf4', label: 'Leve' };
    if (score <= 6) return { color: '#d97706', bg: '#fffbeb', label: 'Moderado' };
    return { color: '#dc2626', bg: '#fef2f2', label: 'Severo' };
  };

  const handleDoctorVoiceData = useCallback((data: ParsedClinicalVoiceData) => {
    if (selectedPatient) {
      setSelectedPatient((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: data.notes || data.chiefComplaint || prev.notes,
          homeRecommendations: data.homeRecommendations || prev.homeRecommendations,
          evaLast: data.painScale !== undefined ? data.painScale : prev.evaLast,
          appliedTechniques: data.techniques && data.techniques.length > 0
            ? Array.from(new Set([...(prev.appliedTechniques || []), ...data.techniques]))
            : prev.appliedTechniques,
        };
      });
      showToast(`Ficha de ${selectedPatient.patientName} actualizada por voz.`);
    } else {
      // Si no hay paciente seleccionado, actualizar el paciente en consulta
      const inConsultation = patientsQueue.find(p => p.status === 'in_progress');
      if (inConsultation) {
        setPatientsQueue(prev => prev.map(p => {
          if (p.id === inConsultation.id) {
            return {
              ...p,
              notes: data.notes || data.chiefComplaint || p.notes,
              homeRecommendations: data.homeRecommendations || p.homeRecommendations,
              evaLast: data.painScale !== undefined ? data.painScale : p.evaLast,
              appliedTechniques: data.techniques && data.techniques.length > 0
                ? Array.from(new Set([...(p.appliedTechniques || []), ...data.techniques]))
                : p.appliedTechniques,
            };
          }
          return p;
        }));
        showToast(`Notas por voz registradas para ${inConsultation.patientName}.`);
      } else {
        showToast(`Dictado recibido. Abre una ficha para autollenar todos los campos.`);
      }
    }
  }, [selectedPatient, patientsQueue]);

  return (
    <div className="dashboard-canvas">
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
          border: '1.5px solid rgba(255,255,255,0.15)',
          fontSize: '0.85rem',
          fontWeight: 700,
        }}>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <div className="clinic-badge">
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#0284c7', display: 'inline-block' }}></span>
            Médico Tratante · {specialty}
          </div>
          <h1 className="dashboard-title">
            Mi Agenda de Consultas y Pacientes
          </h1>
          <p className="dashboard-subtitle">
            Bienvenido(a), <strong style={{ color: '#0f172a' }}>{doctorName}</strong>. Tienes pacientes en sala de espera.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.84rem' }}
            onClick={onOpenConsultation}
          >
            <IconStethoscope className="w-4 h-4" />
            <span>Abrir Ficha Clínica (Escala EVA)</span>
          </button>
        </div>
      </div>

      {/* Nivel 1: Métricas de Consulta (KPI Cards) */}
      <div className="kpi-grid">
        {/* KPI 1: Pacientes Citados */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Pacientes Citados Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-sky">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{patientsQueue.length} Pacientes</div>
          <div className="kpi-footer">
            <span style={{ color: '#0284c7', fontWeight: 700 }}>
              ● {patientsQueue.filter(p => p.status === 'waiting').length} en espera de llamado
            </span>
          </div>
        </div>

        {/* KPI 2: En Consulta Ahora */}
        <div className="kpi-card" style={{ borderColor: '#86efac', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: '#166534' }}>Consulta en Curso</span>
            <div className="kpi-icon-wrap kpi-icon-emerald">
              <IconStethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#15803d' }}>Carlos Benítez</div>
          <div className="kpi-footer">
            <span style={{ color: '#166534', fontWeight: 600 }}>
              EVA Previo: 6/10 · Desgarro
            </span>
          </div>
        </div>

        {/* KPI 3: Recetas Digitales */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Recetas Digitales Emitidas</span>
            <div className="kpi-icon-wrap kpi-icon-purple">
              <IconFileText className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">
            {patientsQueue.filter(p => p.status === 'completed').length} Recetas
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#7c3aed', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <MaterialIcon name="check" size={14} />
              <span>Firmada digitalmente con validez MINSA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Switcher de Vistas: Cola de Hoy vs Mi Agenda Semanal */}
      <div className="doctor-view-switcher">
        <button
          type="button"
          onClick={() => setMainView('queue')}
          className={`clinical-tab-btn ${mainView === 'queue' ? 'active' : ''}`}
        >
          <MaterialIcon name="bolt" size={16} />
          <span>Cola de Pacientes Hoy ({patientsQueue.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMainView('weekly')}
          className={`clinical-tab-btn ${mainView === 'weekly' ? 'active' : ''}`}
        >
          <MaterialIcon name="calendar_today" size={16} />
          <span>Mi Agenda Semanal (11 - 16 Sep)</span>
        </button>
      </div>

      {/* VISTA 1: COLA DE PACIENTES DE HOY */}
      {mainView === 'queue' && (
        <div className="table-card">
          {/* Fila 1: Título y Contexto */}
          <div className="table-card-header">
            <div>
              <h2 className="section-title">Cola de Pacientes y Sesiones de Hoy</h2>
              <p className="section-desc">
                Selecciona un paciente para registrar evolución, dolor en escala EVA y prescripciones.
              </p>
            </div>
          </div>

          {/* Fila 2: Barra de Filtros y Búsqueda */}
          <div className="toolbar-row" style={{ marginBottom: '1.25rem' }}>
            {/* Segmented Filter Pills */}
            <div className="segmented-pills">
              <button
                type="button"
                className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todos ({patientsQueue.length})
              </button>
              <button
                type="button"
                className={`pill-btn ${filter === 'waiting' ? 'active' : ''}`}
                onClick={() => setFilter('waiting')}
              >
                ● En Espera ({patientsQueue.filter(p => p.status === 'waiting').length})
              </button>
              <button
                type="button"
                className={`pill-btn ${filter === 'in_progress' ? 'active' : ''}`}
                onClick={() => setFilter('in_progress')}
              >
                ● En Consulta ({patientsQueue.filter(p => p.status === 'in_progress').length})
              </button>
              <button
                type="button"
                className={`pill-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                ● Atendidos ({patientsQueue.filter(p => p.status === 'completed').length})
              </button>
            </div>

            {/* Search Box + Counter */}
            <div className="doctor-toolbar-actions">
              <div className="doctor-search-box">
                <span className="doctor-search-icon">
                  <IconSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar paciente, DNI o motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="doctor-search-input"
                />
              </div>

              <span className="doctor-results-counter">
                Mostrando {filteredQueue.length} de {patientsQueue.length}
              </span>
            </div>
          </div>

          {/* Listado de Pacientes Estructurado */}
          <div className="doctor-queue-container">
            {filteredQueue.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '14px', border: '1.5px dashed #cbd5e1', fontSize: '0.82rem' }}>
                No se encontraron pacientes con el filtro o búsqueda actual.
              </div>
            ) : (
              filteredQueue.map((patient) => {
                const evaInfo = getEvaColor(patient.evaLast);
                const isInProgress = patient.status === 'in_progress';
                const isWaiting = patient.status === 'waiting';
                const isCompleted = patient.status === 'completed';

                const getProgressPct = (str: string) => {
                  if (str.includes('3 de 5')) return 60;
                  if (str.includes('1 de 10')) return 10;
                  if (str.includes('Sesión única') || str.includes('Evaluación')) return 100;
                  return 30;
                };
                const progressPct = getProgressPct(patient.sessionProgress);

                return (
                  <div
                    key={patient.id}
                    className={`doctor-patient-card ${isInProgress ? 'in-progress' : ''}`}
                  >
                    {/* Fila Superior: Badge Turno + Avatar + Nombre/DNI + Píldora EVA */}
                    <div className="patient-card-top-header">
                      <div className="patient-main-identity">
                        <div className={`patient-time-badge ${isInProgress ? 'in-progress' : ''}`}>
                          <span className="time-val">{patient.time}</span>
                          <span className="time-label">{isInProgress ? 'EN CURSO' : 'TURNO'}</span>
                        </div>

                        <div className="patient-avatar-badge">
                          {patient.initials}
                        </div>

                        <div className="patient-name-dni-group">
                          <h3 className="patient-name-title">{patient.patientName}</h3>
                          <span className="patient-dni-tag">
                            {patient.age} · DNI {patient.dni}
                          </span>
                        </div>
                      </div>

                      {/* EVA Score Pill */}
                      <div
                        className="eva-card-pill"
                        style={{
                          background: evaInfo.bg,
                          borderColor: evaInfo.color,
                          color: evaInfo.color,
                        }}
                      >
                        <span className="eva-title">Dolor EVA</span>
                        <span className="eva-score">{patient.evaLast}/10</span>
                        <span className="eva-label">{evaInfo.label}</span>
                      </div>
                    </div>

                    {/* Fila de Estado de Consulta */}
                    <div className="patient-status-row">
                      {isInProgress && (
                        <span className="patient-status-indicator in-progress" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MaterialIcon name="radio_button_checked" size={12} />
                          <span>En Consulta Médica (Box 101)</span>
                        </span>
                      )}
                      {isWaiting && (
                        <span className="patient-status-indicator waiting" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MaterialIcon name="hourglass_empty" size={12} />
                          <span>En Sala de Espera</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="patient-status-indicator completed" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MaterialIcon name="check" size={12} />
                          <span>Atendido · Receta Firmada</span>
                        </span>
                      )}
                    </div>

                    {/* Fila de Servicio y Motivo */}
                    <div className="patient-middle-row">
                      <div className="patient-service-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MaterialIcon name="medical_services" size={14} />
                        <span>{patient.service}</span>
                      </div>

                      <div className="patient-reason-box" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MaterialIcon name="flag" size={14} />
                        <span>Motivo: "{patient.reason}"</span>
                      </div>
                    </div>

                    {/* Fila de Técnicas y Progreso */}
                    <div className="patient-bottom-row">
                      {patient.appliedTechniques && patient.appliedTechniques.length > 0 && (
                        <div className="patient-tags-row">
                          {patient.appliedTechniques.slice(0, 3).map((tec) => (
                            <span key={tec} className="patient-clinical-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <MaterialIcon name="bolt" size={12} />
                              <span>{tec}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="patient-progress-container">
                        <div className="patient-progress-labels">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MaterialIcon name="bar_chart" size={14} />
                            <span>Progreso: <strong style={{ color: '#0284c7' }}>{patient.sessionProgress}</strong></span>
                          </span>
                          <span style={{ color: progressPct === 100 ? '#16a34a' : '#0284c7', fontWeight: 800 }}>{progressPct}%</span>
                        </div>
                        <div className="session-progress-bar-track">
                          <div
                            className={`session-progress-bar-fill ${progressPct === 100 ? 'completed' : ''}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fila de Botones de Acción */}
                    <div className="patient-card-actions-bar">
                      <button
                        type="button"
                        className="btn-action-ghost"
                        onClick={() => setSelectedPatient(patient)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <MaterialIcon name="assignment" size={14} />
                        <span>Ficha Rápida</span>
                      </button>
                      <button
                        type="button"
                        className={`btn-call-consultation ${isInProgress ? 'in-progress' : 'primary'}`}
                        onClick={() => {
                          const updated = patientsQueue.map(p => p.id === patient.id ? { ...p, status: 'in_progress' as const, statusText: 'En Consulta Ahora' } : p);
                          setPatientsQueue(updated);
                          showToast(`Paciente ${patient.patientName} llamado al consultorio.`);
                          onOpenConsultation();
                        }}
                      >
                        {isInProgress ? (
                          <>
                            <span>▶</span>
                            <span>Continuar Consulta</span>
                          </>
                        ) : (
                          <>
                            <IconStethoscope className="w-3.5 h-3.5" />
                            <span>Llamar a Consulta</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: MI AGENDA SEMANAL */}
      {mainView === 'weekly' && (
        <div className="table-card">
          {/* Header y Navegación de la Semana */}
          <div className="weekly-nav-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="btn-action-ghost"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => showToast('Cargando semana anterior...')}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="btn-action-ghost"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 800, background: '#f0f9ff', borderColor: '#bae6fd', color: '#0284c7' }}
                  onClick={() => {
                    setSelectedDay('mie');
                    showToast('Semana actual seleccionada.');
                  }}
                >
                  Semana Actual (11 – 16 Sep)
                </button>
                <button
                  type="button"
                  className="btn-action-ghost"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => showToast('Cargando próxima semana...')}
                >
                  →
                </button>
              </div>
            </div>

            {/* KPI Strip de Rendimiento Semanal */}
            <div className="weekly-stats-strip">
              <span className="weekly-stat-pill" style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MaterialIcon name="bar_chart" size={14} />
                <span><strong>28 Citas</strong> esta semana</span>
              </span>
              <span className="weekly-stat-pill" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MaterialIcon name="schedule" size={14} />
                <span><strong>88%</strong> Ocupación</span>
              </span>
              <span className="weekly-stat-pill" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MaterialIcon name="check_circle" size={14} />
                <span><strong>6 Libres</strong></span>
              </span>
              <span className="weekly-stat-pill" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MaterialIcon name="lock" size={14} />
                <span><strong>2 Bloqueos</strong></span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-action-ghost"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => setIsBlockModalOpen(true)}
              >
                <MaterialIcon name="block" size={14} />
                <span>Bloquear Franja</span>
              </button>
            </div>
          </div>

          {/* Selector de 6 Días de la Semana con Carga y Densidad */}
          <div className="weekly-days-grid">
            {Object.entries(weeklyScheduleData).map(([key, day]) => {
              const isSelected = selectedDay === key;
              const occupiedCount = day.appointments.filter(a => a.status === 'occupied').length;
              const totalSlots = day.appointments.length;
              const pct = Math.round((occupiedCount / totalSlots) * 100);

              return (
                <div
                  key={key}
                  className={`weekly-day-card ${isSelected ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDay(key)}
                >
                  <span className="day-name">{day.dayName}</span>
                  <span className="day-number">{day.dayNum}</span>
                  {day.isToday ? (
                    <span className="day-citas-badge today-badge">● HOY ({occupiedCount})</span>
                  ) : (
                    <span className={`day-citas-badge ${occupiedCount >= 5 ? 'full' : 'normal'}`}>
                      {occupiedCount} citas · {pct}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detalle Clínico de la Agenda del Día Seleccionado */}
          <div className="doctor-day-schedule-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MaterialIcon name="calendar_today" size={24} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                    Agenda Médica: {currentDayData.date}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                    Turnos asignados en consultorios y áreas de rehabilitación de Sede Sanitas.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', fontWeight: 800 }}>
                <span style={{ color: '#0284c7', background: '#f0f9ff', padding: '0.25rem 0.75rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  ● {currentDayData.appointments.filter(a => a.status === 'occupied').length} Citas Programadas
                </span>
                <span style={{ color: '#16a34a', background: '#f0fdf4', padding: '0.25rem 0.75rem', borderRadius: '8px', border: '1px solid #86efac' }}>
                  ● {currentDayData.appointments.filter(a => a.status === 'available').length} Disponibles
                </span>
              </div>
            </div>

            {/* Turno Mañana */}
            <div>
              <div className="shift-group-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MaterialIcon name="wb_sunny" size={16} />
                  <span>Turno Mañana (08:00 AM – 01:00 PM)</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  {currentDayData.appointments.filter(a => a.time.includes('AM') && a.status === 'occupied').length} pacientes citados
                </span>
              </div>

              <div className="shift-slots-grid">
                {currentDayData.appointments.filter(a => a.time.includes('AM')).map((slot, idx) => {
                  const initials = slot.patient ? slot.patient.split(' ').map(n => n[0]).slice(0, 2).join('') : '';
                  return (
                    <div
                      key={idx}
                      className={`schedule-slot-card ${slot.status}`}
                    >
                      {/* Columna 1: Horario */}
                      <div className="slot-time-col">
                        <span className="time-main">{slot.time}</span>
                        <span className="time-dur">{slot.status === 'available' ? 'LIBRE' : '45 MIN'}</span>
                      </div>

                      {/* Columna 2: Datos del Paciente / Estado */}
                      <div className="slot-details-col">
                        {slot.status === 'occupied' && (
                          <>
                            <div className="slot-patient-row">
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                {initials}
                              </div>
                              <h4 className="slot-patient-title">{slot.patient}</h4>
                              <span className="slot-type-badge">{slot.note || 'Sesión Programada'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginTop: '3px' }}>
                              <div className="slot-service-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MaterialIcon name="medical_services" size={14} />
                                <span>{slot.service}</span>
                              </div>
                              <span className="slot-box-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MaterialIcon name="location_on" size={12} />
                                <span>{slot.room}</span>
                              </span>
                            </div>
                          </>
                        )}

                        {slot.status === 'available' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div>
                              <div className="slot-patient-title" style={{ color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MaterialIcon name="check_circle" size={14} />
                                <span>Horario Libre Disponible</span>
                              </div>
                              <div className="slot-service-sub" style={{ color: '#64748b' }}>
                                {slot.note || 'Espacio habilitado para agendar sobrecupo o urgencia'}
                              </div>
                            </div>
                          </div>
                        )}

                        {slot.status === 'blocked' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div>
                              <div className="slot-patient-title" style={{ color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MaterialIcon name="lock" size={14} />
                                <span>Franja Horaria Bloqueada</span>
                              </div>
                              <div className="slot-service-sub" style={{ color: '#b91c1c' }}>
                                Motivo: {slot.note || 'Capacitación o pausa médica'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Columna 3: Acciones Rápidas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {slot.status === 'occupied' && (
                          <>
                            <button
                              type="button"
                              className="btn-action-ghost"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => {
                                showToast(`Notificación enviada a recepción para preparar al paciente.`);
                              }}
                            >
                              <MaterialIcon name="chat" size={14} />
                              <span>Avisar</span>
                            </button>
                            <button
                              type="button"
                              className="btn-call-consultation primary"
                              style={{ padding: '0.4rem 0.95rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={onOpenConsultation}
                            >
                              <MaterialIcon name="medical_services" size={14} />
                              <span>Atender →</span>
                            </button>
                          </>
                        )}

                        {slot.status === 'available' && (
                          <button
                            type="button"
                            className="btn-action-ghost"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem', background: '#f0fdf4', borderColor: '#86efac', color: '#15803d', fontWeight: 800 }}
                            onClick={() => {
                              showToast(`Abriendo formulario para agendar en horario ${slot.time}...`);
                            }}
                          >
                            + Asignar Paciente
                          </button>
                        )}

                        {slot.status === 'blocked' && (
                          <button
                            type="button"
                            className="btn-action-ghost"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.76rem', borderColor: '#fca5a5', color: '#dc2626' }}
                            onClick={() => {
                              showToast(`Franja horaria ${slot.time} desbloqueada.`);
                            }}
                          >
                            Desbloquear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Turno Tarde */}
            <div>
              <div className="shift-group-title" style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MaterialIcon name="bedtime" size={16} />
                  <span>Turno Tarde (02:30 PM – 07:30 PM)</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  {currentDayData.appointments.filter(a => a.time.includes('PM') && a.status === 'occupied').length} pacientes citados
                </span>
              </div>

              <div className="shift-slots-grid">
                {currentDayData.appointments.filter(a => a.time.includes('PM')).map((slot, idx) => {
                  const initials = slot.patient ? slot.patient.split(' ').map(n => n[0]).slice(0, 2).join('') : '';
                  return (
                    <div
                      key={idx}
                      className={`schedule-slot-card ${slot.status}`}
                    >
                      {/* Columna 1: Horario */}
                      <div className="slot-time-col">
                        <span className="time-main">{slot.time}</span>
                        <span className="time-dur">{slot.status === 'available' ? 'LIBRE' : '45 MIN'}</span>
                      </div>

                      {/* Columna 2: Datos del Paciente / Estado */}
                      <div className="slot-details-col">
                        {slot.status === 'occupied' && (
                          <>
                            <div className="slot-patient-row">
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                {initials}
                              </div>
                              <h4 className="slot-patient-title">{slot.patient}</h4>
                              <span className="slot-type-badge">{slot.note || 'Sesión Programada'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginTop: '3px' }}>
                              <div className="slot-service-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MaterialIcon name="medical_services" size={14} />
                                <span>{slot.service}</span>
                              </div>
                              <span className="slot-box-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MaterialIcon name="location_on" size={12} />
                                <span>{slot.room}</span>
                              </span>
                            </div>
                          </>
                        )}

                        {slot.status === 'available' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div>
                              <div className="slot-patient-title" style={{ color: '#059669', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MaterialIcon name="check_circle" size={14} />
                                <span>Horario Libre Disponible</span>
                              </div>
                              <div className="slot-service-sub" style={{ color: '#64748b' }}>
                                {slot.note || 'Espacio habilitado para agendar sobrecupo o urgencia'}
                              </div>
                            </div>
                          </div>
                        )}

                        {slot.status === 'blocked' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div>
                              <div className="slot-patient-title" style={{ color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MaterialIcon name="lock" size={14} />
                                <span>Franja Horaria Bloqueada</span>
                              </div>
                              <div className="slot-service-sub" style={{ color: '#b91c1c' }}>
                                Motivo: {slot.note || 'Capacitación o pausa médica'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Columna 3: Acciones Rápidas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {slot.status === 'occupied' && (
                          <>
                            <button
                              type="button"
                              className="btn-action-ghost"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => {
                                showToast(`Notificación enviada a recepción para preparar al paciente.`);
                              }}
                            >
                              <MaterialIcon name="chat" size={14} />
                              <span>Avisar</span>
                            </button>
                            <button
                              type="button"
                              className="btn-call-consultation primary"
                              style={{ padding: '0.4rem 0.95rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={onOpenConsultation}
                            >
                              <MaterialIcon name="medical_services" size={14} />
                              <span>Atender →</span>
                            </button>
                          </>
                        )}

                        {slot.status === 'available' && (
                          <button
                            type="button"
                            className="btn-action-ghost"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem', background: '#f0fdf4', borderColor: '#86efac', color: '#15803d', fontWeight: 800 }}
                            onClick={() => {
                              showToast(`Abriendo formulario para agendar en horario ${slot.time}...`);
                            }}
                          >
                            + Asignar Paciente
                          </button>
                        )}

                        {slot.status === 'blocked' && (
                          <button
                            type="button"
                            className="btn-action-ghost"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.76rem', borderColor: '#fca5a5', color: '#dc2626' }}
                            onClick={() => {
                              showToast(`Franja horaria ${slot.time} desbloqueada.`);
                            }}
                          >
                            Desbloquear
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloquear Horario Médico */}
      {isBlockModalOpen && (

        <div className="modal-overlay-custom" onClick={() => setIsBlockModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '96%' }}>
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcon name="block" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Bloquear Franja Horaria
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    Reserva tiempo en tu agenda para actividades no clínicas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
              <div className="form-section-card">
                <div className="input-field-wrap">
                  <label className="input-field-label">Motivo del Bloqueo</label>
                  <select
                    className="modern-form-input"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  >
                    <option value="Capacitación Médica">Capacitación Médica / Junta de Servicio</option>
                    <option value="Pausa Activa / Almuerzo">Pausa Activa / Almuerzo</option>
                    <option value="Permiso Médico / Trámite">Permiso Médico / Trámite Personal</option>
                    <option value="Emergencia Externa">Emergencia Externa</option>
                  </select>
                </div>

                <div className="input-field-wrap" style={{ marginTop: '0.5rem' }}>
                  <label className="input-field-label">Franja Horaria a Bloquear</label>
                  <select
                    className="modern-form-input"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                  >
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="01:00 PM - 02:30 PM">01:00 PM - 02:30 PM (Almuerzo)</option>
                    <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => setIsBlockModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="cash-btn primary"
                style={{ background: '#dc2626', borderColor: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => {
                  showToast(`Horario ${blockTime} bloqueado por ${blockReason}.`);
                  setIsBlockModalOpen(false);
                }}
              >
                <MaterialIcon name="lock" size={14} />
                <span>Confirmar Bloqueo</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal de Ficha Rápida del Paciente */}
      {selectedPatient && (
        <div className="modal-overlay-custom" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '96%' }}>
            <div className="modal-header-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconStethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Ficha Rápida: {selectedPatient.patientName}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    {selectedPatient.age} · DNI: {selectedPatient.dni} · Cita: {selectedPatient.time}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                aria-label="Cerrar"
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Tarjeta 1: Escala EVA */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="medical_services" size={18} />
                    <span>Control de Dolor (Escala EVA)</span>
                  </h4>
                  <span className="status-pill status-confirmed" style={{ fontSize: '0.72rem' }}>
                    EVA Actual: {selectedPatient.evaLast}/10
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = selectedPatient.evaLast === num;
                    const info = getEvaColor(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedPatient({ ...selectedPatient, evaLast: num })}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          border: `1.5px solid ${isSelected ? info.color : '#cbd5e1'}`,
                          background: isSelected ? info.bg : '#ffffff',
                          color: isSelected ? info.color : '#334155',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Tendencia del dolor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Evolución del dolor:</span>
                  {[
                    { id: 'down', label: '↓ Disminuyó el dolor', color: '#16a34a', bg: '#f0fdf4' },
                    { id: 'equal', label: '= Dolor estable', color: '#0284c7', bg: '#f0f9ff' },
                    { id: 'up', label: '↑ Dolor exacerbado', color: '#dc2626', bg: '#fef2f2' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedPatient({ ...selectedPatient, evaTrend: t.id as any })}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: `1.5px solid ${selectedPatient.evaTrend === t.id ? t.color : '#e2e8f0'}`,
                        background: selectedPatient.evaTrend === t.id ? t.bg : '#ffffff',
                        color: selectedPatient.evaTrend === t.id ? t.color : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarjeta 2: Fase de Tratamiento y Técnicas */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="bolt" size={18} />
                    <span>Fase de Rehabilitación & Técnicas Aplicadas</span>
                  </h4>
                  <span className="form-section-badge">SESIÓN {selectedPatient.sessionProgress}</span>
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Fase del Plan Terapéutico</label>
                  <select
                    className="modern-form-input"
                    value={selectedPatient.treatmentPhase || 'Fase 2 · Restauración de Movilidad y Rango'}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, treatmentPhase: e.target.value })}
                  >
                    <option value="Fase 1 · Control del Dolor e Inflamación Aguda">Fase 1 · Control del Dolor e Inflamación Aguda</option>
                    <option value="Fase 2 · Restauración de Movilidad y Rango">Fase 2 · Restauración de Movilidad y Rango Articular</option>
                    <option value="Fase 3 · Fortalecimiento y Carga Muscular">Fase 3 · Fortalecimiento y Carga Muscular Progresiva</option>
                    <option value="Fase 4 · Readaptación Funcional y Prevención">Fase 4 · Readaptación Funcional y Prevención</option>
                  </select>
                </div>

                <div className="input-field-wrap" style={{ marginTop: '0.5rem' }}>
                  <label className="input-field-label">Técnicas Fisioterapéuticas Utilizadas Hoy</label>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      'Terapia Manual',
                      'Ultrasonido',
                      'Electroterapia TENS',
                      'Crioterapia',
                      'Termoterapia',
                      'Kinesiotape',
                      'Ejercicios Terapéuticos'
                    ].map((tec) => {
                      const selected = (selectedPatient.appliedTechniques || ['Terapia Manual', 'Ultrasonido']).includes(tec);
                      return (
                        <button
                          key={tec}
                          type="button"
                          onClick={() => {
                            const current = selectedPatient.appliedTechniques || ['Terapia Manual', 'Ultrasonido'];
                            const updated = selected ? current.filter(t => t !== tec) : [...current, tec];
                            setSelectedPatient({ ...selectedPatient, appliedTechniques: updated });
                          }}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            border: `1.5px solid ${selected ? '#0284c7' : '#e2e8f0'}`,
                            background: selected ? '#f0f9ff' : '#ffffff',
                            color: selected ? '#0284c7' : '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          {selected ? (
                            <>
                              <MaterialIcon name="check" size={12} />
                              <span>{tec}</span>
                            </>
                          ) : (
                            tec
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Notas de Evolución & Recomendaciones */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <h4 className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="edit_note" size={18} />
                    <span>Notas de Evolución & Indicaciones al Paciente</span>
                  </h4>
                  <span className="form-section-badge">HISTORIA CLÍNICA</span>
                </div>

                <div className="input-field-wrap">
                  <label className="input-field-label">Evolución Clínica y Observaciones</label>
                  <textarea
                    rows={3}
                    className="modern-form-input"
                    style={{ height: 'auto', padding: '0.65rem' }}
                    placeholder="Anotaciones médicas de la sesión, respuesta al tratamiento y signos de mejora..."
                    value={selectedPatient.notes || ''}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, notes: e.target.value })}
                  />
                </div>

                <div className="input-field-wrap" style={{ marginTop: '0.5rem' }}>
                  <label className="input-field-label">Recomendaciones para el Hogar</label>
                  <input
                    type="text"
                    className="modern-form-input"
                    placeholder="ej. Aplicar compresas frías por 15 min, realizar estiramientos 2 veces al día."
                    value={selectedPatient.homeRecommendations || 'Aplicar compresas frías 15 min y estiramientos suaves.'}
                    onChange={(e) => setSelectedPatient({ ...selectedPatient, homeRecommendations: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="cash-btn primary"
                style={{ background: '#0284c7', borderColor: '#0284c7' }}
                onClick={() => {
                  setPatientsQueue(prev => prev.map(p => p.id === selectedPatient.id ? selectedPatient : p));
                  showToast(`Evolución de ${selectedPatient.patientName} registrada.`);
                  setSelectedPatient(null);
                  onOpenConsultation();
                }}
              >
                Abrir Ficha Clínica Completa →
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="cash-btn ghost"
                  onClick={() => setSelectedPatient(null)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="cash-btn primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => {
                    setPatientsQueue(prev => prev.map(p => p.id === selectedPatient.id ? selectedPatient : p));
                    showToast(`Notas guardadas para ${selectedPatient.patientName}.`);
                    setSelectedPatient(null);
                  }}
                >
                  Guardar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asistente Flotante de Dictado por Voz (Mobile & Desktop) */}
      <VoiceConsultationAssistant onApplyVoiceData={handleDoctorVoiceData} activeContext="quick-note" />
    </div>
  );
};

export default DoctorDashboard;

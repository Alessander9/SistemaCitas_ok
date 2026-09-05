import React, { useState } from 'react';
import '../dashboards/ClinicalDashboard.css';
import {
  IconCalendar,
  IconSearch,
  IconStethoscope,
  IconCash,
} from '../../components/ui/Icons';

interface ReceptionBookingPageProps {
  onNavigateToCash?: () => void;
  onBack?: () => void;
}

interface SlotItem {
  id: string;
  time: string;
  doctor: string;
  room: string;
  patient?: string;
  dni?: string;
  service?: string;
  price?: string;
  paid?: boolean;
  status: 'occupied' | 'available' | 'blocked';
  statusLabel?: string;
}

export const ReceptionBookingPage: React.FC<ReceptionBookingPageProps> = ({
  onNavigateToCash,
  onBack,
}) => {
  const [selectedDay, setSelectedDay] = useState('mie');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fast Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [prefilledSlot, setPrefilledSlot] = useState<SlotItem | null>(null);
  const [newDni, setNewDni] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newService, setNewService] = useState('Rehabilitación Deportiva');
  const [newDoctor, setNewDoctor] = useState('Lic. María González');
  const [newRoom, setNewRoom] = useState('Box 101');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newPrice, setNewPrice] = useState('S/ 100.00');
  const [newPayMode, setNewPayMode] = useState<'immediate' | 'post_consultation'>('immediate');
  const [isUrgent, setIsUrgent] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBooking = (slot?: SlotItem) => {
    if (slot) {
      setPrefilledSlot(slot);
      setNewTime(slot.time);
      setNewDoctor(slot.doctor);
      setNewRoom(slot.room);
    } else {
      setPrefilledSlot(null);
    }
    setIsBookingModalOpen(true);
  };

  const handleQuickPatient = (dni: string, name: string, phone: string) => {
    setNewDni(dni);
    setNewName(name);
    setNewPhone(phone);
    showToast(`✓ Datos del paciente ${name} cargados.`);
  };

  const [slotsData, setSlotsData] = useState<Record<string, SlotItem[]>>({
    mie: [
      {
        id: 's-1',
        time: '08:30 AM',
        doctor: 'Lic. María González',
        room: 'Box 101',
        patient: 'María Santos López',
        dni: '45892110',
        service: 'Terapia Manual Ortopédica',
        price: 'S/ 80.00',
        paid: true,
        status: 'occupied',
        statusLabel: 'En Sala de Espera',
      },
      {
        id: 's-2',
        time: '09:15 AM',
        doctor: 'Dr. Carlos Mendoza',
        room: 'Box 102',
        status: 'available',
      },
      {
        id: 's-3',
        time: '10:00 AM',
        doctor: 'Lic. María González',
        room: 'Box 101',
        patient: 'Carlos Benítez Vega',
        dni: '72109845',
        service: 'Rehabilitación Deportiva',
        price: 'S/ 100.00',
        paid: true,
        status: 'occupied',
        statusLabel: 'En Consulta Médica',
      },
      {
        id: 's-4',
        time: '11:00 AM',
        doctor: 'Dr. Carlos Mendoza',
        room: 'Box 102',
        patient: 'Rosa Morales Silva',
        dni: '09843211',
        service: 'Consulta Traumatológica',
        price: 'S/ 150.00',
        paid: false,
        status: 'occupied',
        statusLabel: 'Por Llegar',
      },
      {
        id: 's-5',
        time: '11:45 AM',
        doctor: 'Lic. María González',
        room: 'Box 101',
        patient: 'Jorge Ramírez Castro',
        dni: '41209384',
        service: 'Descarga Muscular Completa',
        price: 'S/ 70.00',
        paid: true,
        status: 'occupied',
        statusLabel: 'Por Llegar',
      },
      {
        id: 's-6',
        time: '12:30 PM',
        doctor: 'Lic. Andrea Ruiz',
        room: 'Box 103',
        status: 'available',
      },
      // Tarde
      {
        id: 's-7',
        time: '03:00 PM',
        doctor: 'Lic. Andrea Ruiz',
        room: 'Box 103',
        patient: 'Andrés Mendoza Alva',
        dni: '47829103',
        service: 'Punción Seca y Electroterapia',
        price: 'S/ 90.00',
        paid: true,
        status: 'occupied',
        statusLabel: 'Confirmada',
      },
      {
        id: 's-8',
        time: '04:00 PM',
        doctor: 'Lic. María González',
        room: 'Box 101',
        status: 'available',
      },
      {
        id: 's-9',
        time: '05:00 PM',
        doctor: 'Dr. Carlos Mendoza',
        room: 'Box 102',
        status: 'blocked',
        service: 'Junta Médica Traumatología',
      },
      {
        id: 's-10',
        time: '06:00 PM',
        doctor: 'Lic. Andrea Ruiz',
        room: 'Gimnasio Terapéutico',
        status: 'available',
      },
    ],
  });

  const currentSlots = slotsData[selectedDay] || slotsData.mie;

  const filteredSlots = currentSlots.filter((slot) => {
    const matchesDoctor = doctorFilter === 'all' || slot.doctor === doctorFilter;
    const matchesRoom = roomFilter === 'all' || slot.room === roomFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      (slot.patient && slot.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (slot.dni && slot.dni.includes(searchTerm)) ||
      (slot.service && slot.service.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDoctor && matchesRoom && matchesSearch;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDni.trim()) {
      showToast('⚠️ Por favor completa DNI y Nombre del paciente.');
      return;
    }

    const newSlot: SlotItem = {
      id: `slot-${Date.now()}`,
      time: newTime,
      doctor: newDoctor,
      room: newRoom,
      patient: newName.trim(),
      dni: newDni.trim(),
      service: newService,
      price: newPrice,
      paid: newPayMode === 'immediate',
      status: 'occupied',
      statusLabel: isUrgent ? '🚨 Urgencia / Pendiente' : 'Confirmada / Pendiente',
    };

    setSlotsData((prev) => {
      const dayList = prev[selectedDay] || prev.mie;
      // Replace available slot if prefilled
      const updated = prefilledSlot
        ? dayList.map((s) => (s.id === prefilledSlot.id ? newSlot : s))
        : [newSlot, ...dayList];
      return { ...prev, [selectedDay]: updated };
    });

    showToast(`✓ ¡Cita agendada con éxito para ${newName} a las ${newTime}! Notificación enviada a WhatsApp.`);
    setIsBookingModalOpen(false);
    setNewDni('');
    setNewName('');
    setNewPhone('');
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
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.5rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="clinic-badge">
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#0284c7', display: 'inline-block' }}></span>
            Mesa de Admisión & Agenda de Sede · Sanitas Lima
          </div>
          <h1 className="dashboard-title">
            Agenda & Agendamiento de Citas
          </h1>
          <p className="dashboard-subtitle">
            Visualización global de consultorios, asignación de turnos médicos y agendamiento express en ventanilla.
          </p>
        </div>

        <div className="header-actions">
          {onBack && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
              title="Regresar al panel de triage y mesa de admisión"
            >
              ← Mesa de Admisión
            </button>
          )}
          {onNavigateToCash && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateToCash}
              title="Abrir la ventana de caja chica y cobros"
            >
              <IconCash className="w-4 h-4" />
              <span>🏦 Caja Chica</span>
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleOpenBooking()}
          >
            <IconCalendar className="w-4 h-4" />
            <span>⚡ + Nueva Cita Express</span>
          </button>
        </div>
      </div>

      {/* Nivel 1: KPIs de Agenda */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Citas Programadas Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-sky">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{currentSlots.filter((s) => s.status === 'occupied').length} Pacientes</div>
          <div className="kpi-footer">
            <span style={{ color: '#0284c7', fontWeight: 700 }}>
              ● 88% de capacidad en sede
            </span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderColor: '#86efac', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
          <div className="kpi-header">
            <span className="kpi-label" style={{ color: '#166534' }}>Horarios Disponibles</span>
            <div className="kpi-icon-wrap kpi-icon-emerald">
              <span>🟢</span>
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#15803d' }}>
            {currentSlots.filter((s) => s.status === 'available').length} Libres
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#166534', fontWeight: 600 }}>
              ✓ Habilitados para ventanilla
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Médicos en Atención</span>
            <div className="kpi-icon-wrap kpi-icon-purple">
              <IconStethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">3 Doctores</div>
          <div className="kpi-footer">
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>
              ● Boxes 101, 102 y 103 activos
            </span>
          </div>
        </div>
      </div>

      {/* Nivel 2: Selector de Días de la Semana */}
      <div className="weekly-days-grid" style={{ marginBottom: '1.25rem' }}>
        {[
          { key: 'lun', dayName: 'Lun', dayNum: '11', citas: 7 },
          { key: 'mar', dayName: 'Mar', dayNum: '12', citas: 8 },
          { key: 'mie', dayName: 'Mié', dayNum: '13', citas: 8, isToday: true },
          { key: 'jue', dayName: 'Jue', dayNum: '14', citas: 6 },
          { key: 'vie', dayName: 'Vie', dayNum: '15', citas: 7 },
          { key: 'sab', dayName: 'Sáb', dayNum: '16', citas: 4 },
        ].map((d) => (
          <div
            key={d.key}
            className={`weekly-day-card ${selectedDay === d.key ? 'active' : ''} ${d.isToday ? 'today' : ''}`}
            onClick={() => setSelectedDay(d.key)}
          >
            <span className="day-name">{d.dayName}</span>
            <span className="day-number">{d.dayNum}</span>
            {d.isToday ? (
              <span className="day-citas-badge today-badge">● HOY ({d.citas})</span>
            ) : (
              <span className="day-citas-badge normal">{d.citas} citas</span>
            )}
          </div>
        ))}
      </div>

      {/* Nivel 3: Tabla y Tarjeta de Slots de la Agenda */}
      <div className="table-card">
        {/* Header & Filtros */}
        <div className="table-card-header">
          <div>
            <h2 className="section-title">Horarios y Turnos Médicos (Ventanilla)</h2>
            <p className="section-desc">
              Haz clic en cualquier horario libre para agendar inmediatamente al paciente.
            </p>
          </div>
        </div>

        {/* Toolbar de Filtros */}
        <div className="toolbar-row" style={{ marginBottom: '1.25rem', gap: '0.75rem' }}>
          {/* Filtro por Médico */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>Doctor:</label>
            <select
              className="modern-form-input"
              style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option value="all">Todos los Doctores</option>
              <option value="Lic. María González">Lic. María González (Fisioterapia)</option>
              <option value="Dr. Carlos Mendoza">Dr. Carlos Mendoza (Traumatología)</option>
              <option value="Lic. Andrea Ruiz">Lic. Andrea Ruiz (Kinesiología)</option>
            </select>
          </div>

          {/* Filtro por Consultorio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>Box / Sala:</label>
            <select
              className="modern-form-input"
              style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="all">Todos los Boxes</option>
              <option value="Box 101">Box 101</option>
              <option value="Box 102">Box 102</option>
              <option value="Box 103">Box 103</option>
              <option value="Gimnasio Terapéutico">Gimnasio Terapéutico</option>
            </select>
          </div>

          {/* Buscador */}
          <div style={{ position: 'relative', width: '260px', marginLeft: 'auto' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar paciente o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                paddingLeft: '34px',
                paddingRight: '12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Listado de Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredSlots.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '14px', border: '1.5px dashed #cbd5e1', fontSize: '0.82rem' }}>
              No se encontraron horarios con los filtros seleccionados.
            </div>
          ) : (
            filteredSlots.map((slot) => {
              const isOccupied = slot.status === 'occupied';
              const isAvailable = slot.status === 'available';
              const isBlocked = slot.status === 'blocked';
              const initials = slot.patient ? slot.patient.split(' ').map((n) => n[0]).slice(0, 2).join('') : '';

              return (
                <div
                  key={slot.id}
                  className={`schedule-slot-card ${slot.status}`}
                  style={{ padding: '0.95rem 1.25rem' }}
                >
                  {/* Horario */}
                  <div className="slot-time-col">
                    <span className="time-main">{slot.time}</span>
                    <span className="time-dur">{isAvailable ? 'LIBRE' : '45 MIN'}</span>
                  </div>

                  {/* Detalles */}
                  <div className="slot-details-col">
                    {isOccupied && (
                      <>
                        <div className="slot-patient-row">
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                            {initials}
                          </div>
                          <h4 className="slot-patient-title">{slot.patient}</h4>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>DNI {slot.dni}</span>
                          {slot.paid ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #86efac' }}>
                              ✓ Pagado ({slot.price})
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid #fde68a' }}>
                              💳 Pendiente ({slot.price})
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginTop: '3px' }}>
                          <span className="slot-service-sub">🩺 {slot.service}</span>
                          <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 700 }}>👨‍⚕️ {slot.doctor}</span>
                          <span className="slot-box-pill">📍 {slot.room}</span>
                        </div>
                      </>
                    )}

                    {isAvailable && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                          <div className="slot-patient-title" style={{ color: '#059669', fontSize: '0.92rem' }}>
                            🟢 Horario Libre Disponible para Ventanilla
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>👨‍⚕️ {slot.doctor}</span>
                            <span className="slot-box-pill">📍 {slot.room}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {isBlocked && (
                      <div>
                        <div className="slot-patient-title" style={{ color: '#dc2626', fontSize: '0.92rem' }}>
                          🔒 Franja Horaria Bloqueada
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#b91c1c' }}>
                          {slot.service || 'Capacitación o pausa médica programada'} · {slot.doctor} ({slot.room})
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {isOccupied && (
                      <button
                        type="button"
                        className="btn-action-ghost"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.76rem' }}
                        onClick={() => showToast(`Notificación enviada a ${slot.doctor} para preparar el consultorio.`)}
                      >
                        💬 Avisar Doctor
                      </button>
                    )}

                    {isAvailable && (
                      <button
                        type="button"
                        className="btn-call-consultation primary"
                        style={{ padding: '0.45rem 1.15rem', fontSize: '0.78rem', background: '#16a34a', borderColor: '#16a34a' }}
                        onClick={() => handleOpenBooking(slot)}
                      >
                        + Agendar en este Horario
                      </button>
                    )}

                    {isBlocked && (
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Agendamiento Express */}
      {isBookingModalOpen && (
        <div className="modal-overlay-custom" onClick={() => setIsBookingModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '96%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header-custom" style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderBottom: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bae6fd', fontSize: '1.35rem' }}>
                  ⚡
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Agendamiento Express (Ventanilla & Teléfono)
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Asignación instantánea de citas para recepción sin pasar por el formulario web.
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

            <form onSubmit={handleConfirmBooking}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', maxHeight: '72vh', overflowY: 'auto' }}>
                
                {/* Sección 1: Datos del Paciente */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title">
                      <span>👤</span> Datos del Paciente
                    </h4>
                    <span className="form-section-badge">IDENTIFICACIÓN</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Auto-completar:</span>
                    <button
                      type="button"
                      className="btn-action-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7' }}
                      onClick={() => handleQuickPatient('74819203', 'Luciana Paredes Soto', '987 654 321')}
                    >
                      ⚡ Luciana Paredes (DNI 74819203)
                    </button>
                    <button
                      type="button"
                      className="btn-action-ghost"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#ffffff', borderColor: '#bae6fd', color: '#0284c7' }}
                      onClick={() => handleQuickPatient('48291044', 'Gonzalo Salazar Diez', '912 345 678')}
                    >
                      ⚡ Gonzalo Salazar (DNI 48291044)
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
                        value={newDni}
                        onChange={(e) => setNewDni(e.target.value)}
                      />
                    </div>
                    <div className="input-field-wrap">
                      <label className="input-field-label">Nombre Completo *</label>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="Nombres y Apellidos"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="input-field-wrap">
                      <label className="input-field-label">WhatsApp Recordatorio</label>
                      <input
                        type="text"
                        className="modern-form-input"
                        placeholder="991 223 344"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Especialidad, Servicio y Médico */}
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h4 className="form-section-title">
                      <span>🩺</span> Servicio Clínico & Profesional Asignado
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
                        onChange={(e) => {
                          const d = e.target.value;
                          setNewDoctor(d);
                          if (d.includes('Mendoza')) setNewRoom('Box 102');
                          else if (d.includes('Ruiz')) setNewRoom('Box 103');
                          else setNewRoom('Box 101');
                        }}
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
                    <h4 className="form-section-title">
                      <span>📅</span> Fecha, Franja Horaria y Cobro
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
                      <label className="input-field-label">Horario</label>
                      <select
                        className="modern-form-input"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      >
                        <option value="08:30 AM">08:30 AM</option>
                        <option value="09:15 AM">09:15 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="11:45 AM">11:45 AM</option>
                        <option value="12:30 PM">12:30 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>

                    <div className="input-field-wrap">
                      <label className="input-field-label">Modalidad de Cobro</label>
                      <select
                        className="modern-form-input"
                        value={newPayMode}
                        onChange={(e) => setNewPayMode(e.target.value as any)}
                      >
                        <option value="immediate">Cobrado en Ventanilla ({newPrice})</option>
                        <option value="post_consultation">Pagar al Salir de Consulta</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <input
                      type="checkbox"
                      id="chk-urgent-booking"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="chk-urgent-booking" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', cursor: 'pointer' }}>
                      🚨 Sobrecupo de Urgencia / Dolor Agudo (Prioridad de atención en consultorio)
                    </label>
                  </div>
                </div>

              </div>

              <div className="modal-footer-custom" style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn-action-ghost"
                  onClick={() => setIsBookingModalOpen(false)}
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
                  }}
                >
                  ⚡ Confirmar Cita & Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionBookingPage;

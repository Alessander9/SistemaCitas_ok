import React, { useState, useEffect } from 'react';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS } from '../../data/mockData';
import { Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import { fetchSpecialties, fetchServices, fetchProfessionals, createAppointment } from '../../services/api';
import './BookingWizard.css';

interface BookingWizardProps {
  onBackToHome: () => void;
  preselectedSpecialtyId?: string;
  preselectedServiceId?: string;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  onBackToHome,
  preselectedSpecialtyId,
  preselectedServiceId,
}) => {
  const [step, setStep] = useState<number>(() => {
    if (preselectedServiceId) return 3;
    if (preselectedSpecialtyId) return 2;
    return 1;
  });

  // Live Database State
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>(MOCK_SPECIALTIES);
  const [servicesList, setServicesList] = useState<MedicalService[]>(MOCK_SERVICES);
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(MOCK_PROFESSIONALS);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchSpecialties(), fetchServices(), fetchProfessionals()])
      .then(([specs, servs, profs]) => {
        if (isMounted) {
          if (specs && specs.length > 0) setSpecialtiesList(specs);
          if (servs && servs.length > 0) setServicesList(servs);
          if (profs && profs.length > 0) setProfessionalsList(profs);
        }
      })
      .catch((err) => console.warn('BookingWizard database sync:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Booking State
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(() => {
    return MOCK_SPECIALTIES.find((s) => s.id === preselectedSpecialtyId) || null;
  });

  const [selectedService, setSelectedService] = useState<MedicalService | null>(() => {
    return MOCK_SERVICES.find((s) => s.id === preselectedServiceId) || null;
  });

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-03');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');

  // Patient Info (Step 6)
  const [patientDocType, setPatientDocType] = useState<string>('DNI');
  const [patientDocNumber, setPatientDocNumber] = useState<string>('');
  const [patientFirstName, setPatientFirstName] = useState<string>('');
  const [patientLastName, setPatientLastName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');

  // Policies (Step 8)
  const [acceptCancellationPolicy, setAcceptCancellationPolicy] = useState<boolean>(false);
  const [acceptDataProtection, setAcceptDataProtection] = useState<boolean>(false);

  // Payment (Step 9)
  const [paymentMethod, setPaymentMethod] = useState<'CLINICA' | 'TARJETA'>('CLINICA');

  // Confirmation Details (Step 10 & 11)
  const [bookingCode, setBookingCode] = useState<string>('CIT-2026-8491');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filtered Services based on chosen Specialty
  const availableServices = selectedSpecialty
    ? servicesList.filter((s) => s.specialtyId === selectedSpecialty.id)
    : servicesList;

  // Next 7 available dates
  const nextDates = [
    { date: '2026-09-03', weekday: 'Jue', day: '03', month: 'Sep' },
    { date: '2026-09-04', weekday: 'Vie', day: '04', month: 'Sep' },
    { date: '2026-09-05', weekday: 'Sáb', day: '05', month: 'Sep' },
    { date: '2026-09-07', weekday: 'Lun', day: '07', month: 'Sep' },
    { date: '2026-09-08', weekday: 'Mar', day: '08', month: 'Sep' },
    { date: '2026-09-09', weekday: 'Mié', day: '09', month: 'Sep' },
  ];

  const morningSlots = ['08:00', '08:45', '09:30', '10:15', '11:00', '11:45'];
  const afternoonSlots = ['14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30'];

  const handleNext = async () => {
    setFormError(null);

    if (step === 1 && !selectedSpecialty) {
      setFormError('Por favor selecciona una especialidad para continuar.');
      return;
    }
    if (step === 2 && !selectedService) {
      setFormError('Por favor selecciona un servicio o terapia para continuar.');
      return;
    }
    if (step === 6) {
      if (!patientDocNumber.trim() || !patientFirstName.trim() || !patientLastName.trim() || !patientPhone.trim() || !patientEmail.trim()) {
        setFormError('Por favor completa todos los campos obligatorios del paciente.');
        return;
      }
    }
    if (step === 8) {
      if (!acceptCancellationPolicy || !acceptDataProtection) {
        setFormError('Debes aceptar las políticas de cancelación y de protección de datos personales.');
        return;
      }
    }
    if (step === 9) {
      setIsSubmitting(true);
      try {
        const appointmentRes = await createAppointment({
          professionalId: selectedProfessional?.id || professionalsList[0]?.id || 'e0000000-0000-4000-a000-000000000001',
          serviceId: selectedService?.id || servicesList[0]?.id || 'd0000000-0000-4000-a000-000000000001',
          appointmentDate: selectedDate,
          startTime: selectedTime,
          patientDocType,
          patientDocNumber,
          patientFirstName,
          patientLastName,
          patientPhone,
          patientEmail,
          notes: patientNotes,
          paymentMethod,
        });
        if (appointmentRes?.bookingCode) {
          setBookingCode(appointmentRes.bookingCode);
        }
      } catch (err) {
        console.warn('Booking creation error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }

    setStep((prev) => Math.min(prev + 1, 11));
  };

  const handleBack = () => {
    setFormError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const progressPercentage = Math.round((step / 11) * 100);

  return (
    <div className="wizard-page-container">
      <div className="wizard-shell">
        {/* Topbar with Progress */}
        <div className="wizard-topbar">
          <div className="wizard-title-row">
            <div className="wizard-badge">
              <span>🩺</span>
              Reserva en Línea
            </div>
            <span className="step-indicator">
              Paso {step} de 11 ({progressPercentage}%)
            </span>
          </div>
          <div className="wizard-progress-track">
            <div className="wizard-progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Error Alert */}
        {formError && (
          <div style={{ margin: '1.5rem 2.5rem 0' }} className="alert-box alert-danger">
            <span>⚠️ {formError}</span>
          </div>
        )}

        {/* Content Body based on step */}
        <div className="wizard-content">
          {/* PASO 1: Especialidad */}
          {step === 1 && (
            <div>
              <div className="step-header">
                <h2>1. Selecciona la Especialidad Médica</h2>
                <p>Elige el área de atención requerida para ver los tratamientos disponibles.</p>
              </div>
              <div className="cards-grid">
                {specialtiesList.map((spec) => {
                  const icon = spec.name.includes('Fisio') ? '🏃‍♂️' : spec.name.includes('Trauma') ? '🦴' : spec.name.includes('Ocupacional') ? '🤲' : '🥗';
                  const badge = spec.name.includes('Fisio') ? '5 Médicos · Fisioterapia & Dolor' : spec.name.includes('Trauma') ? '3 Traumatólogos · Evaluación Articular' : spec.name.includes('Ocupacional') ? 'Ergonomía & Readaptación' : 'Nutrición Clínica & Planes';
                  return (
                    <button
                      type="button"
                      key={spec.id}
                      className={`selectable-card ${selectedSpecialty?.id === spec.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedSpecialty(spec);
                        setSelectedService(null);
                      }}
                    >
                      <div>
                        <div className="card-icon" aria-hidden="true">
                          <span>{icon}</span>
                        </div>
                        <span className="card-badge-pill">{badge}</span>
                        <h3 className="card-title">{spec.name}</h3>
                        <p className="card-desc">{spec.description}</p>
                      </div>
                      <div className="card-meta">
                        <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.82rem' }}>Ver Tratamientos →</span>
                        <span className="duration-tag">Sede San Isidro</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 2: Servicio */}
          {step === 2 && (
            <div>
              <div className="step-header">
                <h2>2. Selecciona el Servicio o Terapia</h2>
                <p>
                  Especialidad: <strong>{selectedSpecialty?.name || 'Todas'}</strong>
                </p>
              </div>
              <div className="cards-grid">
                {availableServices.map((serv) => (
                  <button
                    type="button"
                    key={serv.id}
                    className={`selectable-card ${selectedService?.id === serv.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(serv)}
                  >
                    <div>
                      <h3 className="card-title">{serv.name}</h3>
                      <p className="card-desc">{serv.description}</p>
                    </div>
                    <div className="card-meta">
                      <span className="price-tag">S/ {serv.price.toFixed(2)}</span>
                      <span className="duration-tag">⏱️ {serv.durationMinutes} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3: Profesional */}
          {step === 3 && (
            <div>
              <div className="step-header">
                <h2>3. Elige a tu Profesional de Confianza</h2>
                <p>Puedes seleccionar un especialista específico o permitir que el sistema asigne el primero disponible.</p>
              </div>
              <div className="cards-grid">
                <button
                  type="button"
                  className={`selectable-card ${selectedProfessional === null ? 'selected' : ''}`}
                  onClick={() => setSelectedProfessional(null)}
                >
                  <div>
                    <div className="card-icon" aria-hidden="true">
                      <span>✨</span>
                    </div>
                    <h3 className="card-title">Cualquier Profesional Disponible</h3>
                    <p className="card-desc">Asigna automáticamente al especialista con mayor disponibilidad en la fecha elegida.</p>
                  </div>
                </button>

                {professionalsList.map((prof) => (
                  <button
                    type="button"
                    key={prof.id}
                    className={`selectable-card ${selectedProfessional?.id === prof.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProfessional(prof)}
                  >
                    <div>
                      <div className="prof-card-top">
                        <img src={prof.avatarUrl} alt={prof.firstName} className="prof-avatar" />
                        <div>
                          <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
                            {prof.firstName} {prof.lastName}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary-300)' }}>
                            {prof.licenseNumber}
                          </span>
                        </div>
                      </div>
                      <p className="card-desc">{prof.bio}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 4: Fecha & Horarios del Día de Apertura */}
          {step === 4 && (
            <div>
              <div className="step-header">
                <h2>4. Selecciona el Día de tu Cita</h2>
                <p>Horarios adaptados a la zona horaria America/Lima · Visualiza todas las horas de atención de la clínica para este día.</p>
              </div>

              {/* Day Selector Pills */}
              <div className="dates-grid">
                {nextDates.map((item) => (
                  <div
                    key={item.date}
                    className={`date-pill ${selectedDate === item.date ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(item.date)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="date-weekday">{item.weekday}</div>
                    <div className="date-day">{item.day}</div>
                    <div className="date-month">{item.month}</div>
                  </div>
                ))}
              </div>

              {/* Daily Operation & Open Hours Schedule Board (Salesforce Daily Operation Style) */}
              <div className="daily-operation-board">
                {/* Board Top Header */}
                <div className="board-header">
                  <div className="board-header-main">
                    <div className="board-kicker">
                      <span className="board-pulse-dot" />
                      <span>Horario de Operación de la Clínica</span>
                    </div>
                    <h3 className="board-title">
                      Programación Diaria — {nextDates.find((d) => d.date === selectedDate)?.weekday || ''} {nextDates.find((d) => d.date === selectedDate)?.day || ''} de {nextDates.find((d) => d.date === selectedDate)?.month || 'Sep'}
                    </h3>
                    <p className="board-subtitle">
                      Sede Principal San Isidro · Abierto de <strong>08:00 AM a 08:30 PM</strong> (12.5 horas continuas de atención clínica)
                    </p>
                  </div>

                  {/* Operational Metrics Bar */}
                  <div className="board-kpi-bar">
                    <div className="kpi-chip">
                      <span className="kpi-num">12.5h</span>
                      <span className="kpi-lbl">Horas Abiertas</span>
                    </div>
                    <div className="kpi-chip green">
                      <span className="kpi-num">18</span>
                      <span className="kpi-lbl">Cupos Libres</span>
                    </div>
                    <div className="kpi-chip purple">
                      <span className="kpi-num">4</span>
                      <span className="kpi-lbl">Especialistas</span>
                    </div>
                  </div>
                </div>

                {/* Selected Time Banner */}
                <div className="selected-time-banner">
                  <div className="time-banner-info">
                    <span className="time-banner-icon">⏰</span>
                    <span>
                      Hora seleccionada: <strong>{selectedTime} hrs</strong> para el <strong>{selectedDate}</strong>
                    </span>
                  </div>
                  <span className="time-banner-badge">
                    {selectedTime < '12:00' ? '☀️ Turno Mañana' : selectedTime < '17:00' ? '🌤️ Turno Tarde' : '🌙 Turno Noche'}
                  </span>
                </div>

                {/* 3-Column Daily Schedule Grid (Morning / Afternoon / Night) */}
                <div className="daily-columns-grid">
                  {/* Column 1: Mañana */}
                  <div className="daily-col col-morning">
                    <div className="col-header-bar">
                      <div className="col-title-wrap">
                        <span className="col-badge purple">Mañana</span>
                        <h4 className="col-title">08:00 AM — 12:00 PM</h4>
                      </div>
                      <span className="col-count">6 turnos</span>
                    </div>

                    <div className="col-cards-stack">
                      {[
                        { time: '08:00', label: 'Evaluación y Diagnóstico Físico', doc: 'Dra. María González', spec: 'Fisioterapia & Dolor', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '08:45', label: 'Terapia Manual & Punción', doc: 'Dra. María González', spec: 'Fisioterapia', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '09:30', label: 'Consulta Traumatológica Articular', doc: 'Dr. Carlos Mendoza', spec: 'Traumatología', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', dur: '30 min' },
                        { time: '10:15', label: 'Readaptación de Movilidad', doc: 'Lic. Patricia Vega', spec: 'Terapia Ocupacional', avatar: 'https://images.unsplash.com/photo-1594824813580-c081e7d806a6?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '11:00', label: 'Consulta Nutricional InBody', doc: 'Lic. Andrea Palacios', spec: 'Nutrición', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '11:45', label: 'Terapia Descompresiva Lumbar', doc: 'Dra. María González', spec: 'Fisioterapia', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                      ].map((slot) => {
                        const isChosen = selectedTime === slot.time;
                        return (
                          <div
                            key={slot.time}
                            className={`schedule-slot-card lilac ${isChosen ? 'is-selected' : ''}`}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            <div className="slot-card-top">
                              <div className="slot-time-pill">
                                <strong>{slot.time}</strong>
                                <span className="slot-ampm">AM</span>
                              </div>
                              <span className="slot-duration">⏱️ {slot.dur}</span>
                              <span className={`slot-state-dot ${isChosen ? 'active' : ''}`} />
                            </div>

                            <p className="slot-card-label">{slot.label}</p>

                            <div className="slot-card-doc">
                              <img src={slot.avatar} alt={slot.doc} className="slot-doc-avatar" />
                              <div className="slot-doc-info">
                                <span className="slot-doc-name">{slot.doc}</span>
                                <span className="slot-doc-spec">{slot.spec}</span>
                              </div>
                            </div>

                            <div className="slot-card-footer">
                              <span className={`slot-select-btn ${isChosen ? 'active' : ''}`}>
                                {isChosen ? '✓ Turno Seleccionado' : 'Elegir esta hora →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Tarde */}
                  <div className="daily-col col-afternoon">
                    <div className="col-header-bar">
                      <div className="col-title-wrap">
                        <span className="col-badge amber">Tarde</span>
                        <h4 className="col-title">02:00 PM — 05:30 PM</h4>
                      </div>
                      <span className="col-count">5 turnos</span>
                    </div>

                    <div className="col-cards-stack">
                      {[
                        { time: '14:00', label: 'Evaluación Articular y Rodilla', doc: 'Dr. Carlos Mendoza', spec: 'Traumatología', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '14:45', label: 'Terapia Manual y Fortalecimiento', doc: 'Dra. María González', spec: 'Fisioterapia', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '15:30', label: 'Rehabilitación Ergonómica Postural', doc: 'Lic. Patricia Vega', spec: 'Terapia Ocupacional', avatar: 'https://images.unsplash.com/photo-1594824813580-c081e7d806a6?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '16:15', label: 'Control Nutricional y Bioimpedancia', doc: 'Lic. Andrea Palacios', spec: 'Nutrición', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '17:00', label: 'Fisioterapia Deportiva y Descarga', doc: 'Dra. María González', spec: 'Fisioterapia', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                      ].map((slot) => {
                        const isChosen = selectedTime === slot.time;
                        return (
                          <div
                            key={slot.time}
                            className={`schedule-slot-card yellow ${isChosen ? 'is-selected' : ''}`}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            <div className="slot-card-top">
                              <div className="slot-time-pill amber">
                                <strong>{slot.time}</strong>
                                <span className="slot-ampm">PM</span>
                              </div>
                              <span className="slot-duration">⏱️ {slot.dur}</span>
                              <span className={`slot-state-dot ${isChosen ? 'active' : ''}`} />
                            </div>

                            <p className="slot-card-label">{slot.label}</p>

                            <div className="slot-card-doc">
                              <img src={slot.avatar} alt={slot.doc} className="slot-doc-avatar" />
                              <div className="slot-doc-info">
                                <span className="slot-doc-name">{slot.doc}</span>
                                <span className="slot-doc-spec">{slot.spec}</span>
                              </div>
                            </div>

                            <div className="slot-card-footer">
                              <span className={`slot-select-btn ${isChosen ? 'active' : ''}`}>
                                {isChosen ? '✓ Turno Seleccionado' : 'Elegir esta hora →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Noche */}
                  <div className="daily-col col-night">
                    <div className="col-header-bar">
                      <div className="col-title-wrap">
                        <span className="col-badge teal">Noche</span>
                        <h4 className="col-title">05:45 PM — 08:30 PM</h4>
                      </div>
                      <span className="col-count">4 turnos</span>
                    </div>

                    <div className="col-cards-stack">
                      {[
                        { time: '17:45', label: 'Terapia Manual Intensiva', doc: 'Dra. María González', spec: 'Fisioterapia', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '18:30', label: 'Rehabilitación de Tendón de Aquiles', doc: 'Dr. Carlos Mendoza', spec: 'Traumatología', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '19:15', label: 'Readaptación Funcional Ocupacional', doc: 'Lic. Patricia Vega', spec: 'Terapia Ocupacional', avatar: 'https://images.unsplash.com/photo-1594824813580-c081e7d806a6?auto=format&fit=crop&q=80&w=200', dur: '45 min' },
                        { time: '20:00', label: 'Sesión Final de Descarga Muscular', doc: 'Dra. María González', spec: 'Fisioterapia', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', dur: '30 min' },
                      ].map((slot) => {
                        const isChosen = selectedTime === slot.time;
                        return (
                          <div
                            key={slot.time}
                            className={`schedule-slot-card teal ${isChosen ? 'is-selected' : ''}`}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            <div className="slot-card-top">
                              <div className="slot-time-pill teal">
                                <strong>{slot.time}</strong>
                                <span className="slot-ampm">PM</span>
                              </div>
                              <span className="slot-duration">⏱️ {slot.dur}</span>
                              <span className={`slot-state-dot ${isChosen ? 'active' : ''}`} />
                            </div>

                            <p className="slot-card-label">{slot.label}</p>

                            <div className="slot-card-doc">
                              <img src={slot.avatar} alt={slot.doc} className="slot-doc-avatar" />
                              <div className="slot-doc-info">
                                <span className="slot-doc-name">{slot.doc}</span>
                                <span className="slot-doc-spec">{slot.spec}</span>
                              </div>
                            </div>

                            <div className="slot-card-footer">
                              <span className={`slot-select-btn ${isChosen ? 'active' : ''}`}>
                                {isChosen ? '✓ Turno Seleccionado' : 'Elegir esta hora →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 5: Hora */}
          {step === 5 && (
            <div>
              <div className="step-header">
                <h2>5. Selecciona la Franja Horaria</h2>
                <p>Fecha seleccionada: <strong>{selectedDate}</strong></p>
              </div>
              <div className="slots-section-title">
                <span>☀️</span> Turno Mañana
              </div>
              <div className="slots-grid">
                {morningSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="slots-section-title" style={{ marginTop: '1.5rem' }}>
                <span>🌤️</span> Turno Tarde / Noche
              </div>
              <div className="slots-grid">
                {afternoonSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 6: Datos del Paciente */}
          {step === 6 && (
            <div>
              <div className="step-header">
                <h2>6. Datos del Paciente</h2>
                <p>Ingresa la información requerida para la apertura o vinculación de tu historia clínica.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label htmlFor="patientDocType" className="input-label">Tipo Doc.</label>
                  <select
                    id="patientDocType"
                    className="auth-input"
                    value={patientDocType}
                    onChange={(e) => setPatientDocType(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carné Ext.</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="patientDocNumber" className="input-label">Número de Documento *</label>
                  <input
                    id="patientDocNumber"
                    type="text"
                    required
                    className="auth-input"
                    placeholder="ej. 73829104"
                    value={patientDocNumber}
                    onChange={(e) => setPatientDocNumber(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label htmlFor="patientFirstName" className="input-label">Nombres *</label>
                  <input
                    id="patientFirstName"
                    type="text"
                    required
                    className="auth-input"
                    placeholder="ej. Juan Carlos"
                    value={patientFirstName}
                    onChange={(e) => setPatientFirstName(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="patientLastName" className="input-label">Apellidos *</label>
                  <input
                    id="patientLastName"
                    type="text"
                    required
                    className="auth-input"
                    placeholder="ej. Pérez Gómez"
                    value={patientLastName}
                    onChange={(e) => setPatientLastName(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group">
                  <label htmlFor="patientPhone" className="input-label">Teléfono WhatsApp *</label>
                  <input
                    id="patientPhone"
                    type="tel"
                    required
                    className="auth-input"
                    placeholder="ej. +51 987 654 321"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="patientEmail" className="input-label">Correo Electrónico *</label>
                  <input
                    id="patientEmail"
                    type="email"
                    required
                    className="auth-input"
                    placeholder="ej. juan.perez@email.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="patientNotes" className="input-label">Motivo de Consulta o Síntomas (Opcional)</label>
                <textarea
                  id="patientNotes"
                  className="auth-input"
                  rows={3}
                  placeholder="Describe brevemente tu dolor o motivo de consulta..."
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>
          )}

          {/* PASO 7: Resumen */}
          {step === 7 && (
            <div>
              <div className="step-header">
                <h2>7. Resumen Detallado de tu Cita</h2>
                <p>Revisa la información antes de continuar al paso de confirmación y pago.</p>
              </div>
              <div className="summary-card">
                <div className="summary-row">
                  <span className="summary-label">Especialidad</span>
                  <span className="summary-value">{selectedSpecialty?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Servicio</span>
                  <span className="summary-value">{selectedService?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Profesional Asignado</span>
                  <span className="summary-value">
                    {selectedProfessional
                      ? `${selectedProfessional.firstName} ${selectedProfessional.lastName}`
                      : 'Asignación automática (Primer disponible)'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Fecha y Hora</span>
                  <span className="summary-value">{selectedDate} a las {selectedTime} hrs</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Duración Estimada</span>
                  <span className="summary-value">{selectedService?.durationMinutes} minutos</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Paciente</span>
                  <span className="summary-value">{patientFirstName} {patientLastName} ({patientDocNumber})</span>
                </div>
                <div className="summary-row summary-total">
                  <span className="summary-label" style={{ fontSize: '1.1rem', color: '#fff' }}>Total a Pagar</span>
                  <span className="summary-value">S/ {selectedService?.price.toFixed(2)} PEN</span>
                </div>
              </div>
            </div>
          )}

          {/* PASO 8: Políticas */}
          {step === 8 && (
            <div>
              <div className="step-header">
                <h2>8. Políticas y Consentimiento</h2>
                <p>Por favor acepta los términos de servicio para proteger tu atención médica.</p>
              </div>
              <div className="policy-group">
                <label className="policy-item">
                  <input
                    type="checkbox"
                    checked={acceptCancellationPolicy}
                    onChange={(e) => setAcceptCancellationPolicy(e.target.checked)}
                  />
                  <div className="policy-text">
                    <h4>Política de Cancelación y Reprogramación</h4>
                    <p>
                      Comprendo que puedo reprogramar o cancelar mi cita sin penalidad hasta con 24 horas de
                      anticipación. En caso de inasistencia sin previo aviso, el horario reservado se considerará perdido.
                    </p>
                  </div>
                </label>

                <label className="policy-item">
                  <input
                    type="checkbox"
                    checked={acceptDataProtection}
                    onChange={(e) => setAcceptDataProtection(e.target.checked)}
                  />
                  <div className="policy-text">
                    <h4>Tratamiento de Datos Personales (Ley N° 29733)</h4>
                    <p>
                      Autorizo el tratamiento de mis datos personales y de contacto con fines exclusivos de gestión de
                      citas, recordatorios automáticos y apertura de historia clínica confidencial.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* PASO 9: Método de Pago */}
          {step === 9 && (
            <div>
              <div className="step-header">
                <h2>9. Selección del Método de Pago</h2>
                <p>Elige la modalidad de pago que prefieras para tu atención.</p>
              </div>
              <div className="cards-grid">
                <button
                  type="button"
                  className={`selectable-card ${paymentMethod === 'CLINICA' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('CLINICA')}
                >
                  <div>
                    <div className="card-icon" aria-hidden="true">
                      <span>🏥</span>
                    </div>
                    <h3 className="card-title">Pago en Clínica al Asistir</h3>
                    <p className="card-desc">Paga directamente en recepción el día de tu cita con efectivo, Yape, Plin o tarjeta.</p>
                  </div>
                  <div className="card-meta">
                    <span style={{ color: 'var(--primary-300)', fontWeight: 600 }}>Sin recargos</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`selectable-card ${paymentMethod === 'TARJETA' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('TARJETA')}
                >
                  <div>
                    <div className="card-icon" aria-hidden="true">
                      <span>💳</span>
                    </div>
                    <h3 className="card-title">Pago en Línea con Tarjeta</h3>
                    <p className="card-desc">Abono seguro mediante pasarela de pagos (Visa, Mastercard, Amex) con confirmación instantánea.</p>
                  </div>
                  <div className="card-meta">
                    <span style={{ color: 'var(--primary-300)', fontWeight: 600 }}>Confirmación Express</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PASO 10: Confirmación */}
          {step === 10 && (
            <div className="confirmation-success-box">
              <div className="success-icon-badge" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2>¡Tu Cita ha sido Reservada con Éxito!</h2>
              <p style={{ color: 'var(--slate-300)', marginTop: '0.5rem' }}>
                Hemos enviado un correo de confirmación a <strong>{patientEmail}</strong> con todos los detalles.
              </p>

              <div className="booking-code-card">
                <div className="booking-code-label">Código de Reserva</div>
                <div className="booking-code-val">{bookingCode}</div>
              </div>

              <div style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem', color: 'var(--slate-400)' }}>
                <span>📅 {selectedDate} a las {selectedTime} hrs</span> • <span>🩺 {selectedService?.name}</span>
              </div>
            </div>
          )}

          {/* PASO 11: Acciones Post-Reserva */}
          {step === 11 && (
            <div className="confirmation-success-box">
              <h2>11. Acciones y Recordatorios</h2>
              <p style={{ color: 'var(--slate-300)' }}>Guarda tu cita o agrégala a tu calendario personal.</p>

              <div className="post-booking-actions">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => alert('Evento generado: cita agendada en tu calendario.')}
                >
                  📅 Añadir a Google Calendar
                </button>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => alert(`Descargando comprobante para código ${bookingCode}...`)}
                >
                  📄 Descargar Comprobante PDF
                </button>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <button type="button" className="btn-wizard-next" onClick={onBackToHome} style={{ margin: '0 auto' }}>
                  Volver a la Página Principal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {step <= 10 && (
          <div className="wizard-footer-nav">
            <button
              type="button"
              className="btn-wizard-back"
              disabled={step === 1}
              onClick={handleBack}
            >
              ← Anterior
            </button>

            <button
              type="button"
              className="btn-wizard-next"
              disabled={isSubmitting}
              onClick={handleNext}
            >
              {isSubmitting
                ? 'Procesando cita...'
                : step === 9
                ? 'Confirmar Reserva 🚀'
                : step === 10
                ? 'Finalizar y Descargar →'
                : 'Siguiente →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

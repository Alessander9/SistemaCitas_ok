import React, { useState, useEffect, useMemo } from 'react';
import { Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import { MOCK_SPECIALTIES, MOCK_SERVICES, MOCK_PROFESSIONALS, MOCK_FAQS } from '../../data/mockData';
import { fetchSpecialties, fetchServices, fetchProfessionals } from '../../services/api';
import { Header } from '../../components/public/Header';
import { Footer } from '../../components/public/Footer';
import { AiChatWidget } from '../../components/ai/AiChatWidget';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import './LandingPage.css';

interface LandingPageProps {
  onStartBooking: (specialtyId?: string, serviceId?: string) => void;
  onNavigateLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBooking,
  onNavigateLogin,
}) => {
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>(MOCK_SPECIALTIES);
  const [servicesList, setServicesList] = useState<MedicalService[]>(MOCK_SERVICES);
  const [professionalsList, setProfessionalsList] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState<string>('ALL');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [heroSelectedSpecialty, setHeroSelectedSpecialty] = useState<string>('');
  const [heroSelectedService, setHeroSelectedService] = useState<string>('');

  // Fetch live database records from backend on mount
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
      .catch((err) => console.warn('Could not sync with live backend DB:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered services for the catalog
  const filteredServices = useMemo(() => {
    return servicesList.filter((serv) => {
      const matchesSpecialty =
        activeSpecialtyFilter === 'ALL' || serv.specialtyId === activeSpecialtyFilter;
      const matchesSearch =
        serviceSearchTerm.trim() === '' ||
        serv.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
        (serv.description &&
          serv.description.toLowerCase().includes(serviceSearchTerm.toLowerCase())) ||
        (serv.specialtyName &&
          serv.specialtyName.toLowerCase().includes(serviceSearchTerm.toLowerCase()));
      return matchesSpecialty && matchesSearch;
    });
  }, [servicesList, activeSpecialtyFilter, serviceSearchTerm]);

  // Services available for Hero quick booking based on selected specialty
  const heroAvailableServices = useMemo(() => {
    if (!heroSelectedSpecialty) return servicesList;
    return servicesList.filter((s) => s.specialtyId === heroSelectedSpecialty);
  }, [servicesList, heroSelectedSpecialty]);

  const handleHeroQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onStartBooking(
      heroSelectedSpecialty || undefined,
      heroSelectedService || undefined
    );
  };

  return (
    <div className="landing-container">
      {/* Global Navigation Header */}
      <Header
        activeView="landing"
        onNavigate={(view) => {
          if (view === 'booking') onStartBooking();
          else if (view === 'login') onNavigateLogin();
        }}
      />

      {/* Hero Section */}
      <section className="hero-section">
        {/* Ambient Glows */}
        <div className="hero-glow hero-glow-1" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />

        <div className="hero-inner">
          {/* Live Status Pill */}
          <div className="hero-pill-badge">
            <span className="live-pulse-dot" />
            <span>Especialistas Disponibles Hoy en Nuestras Sedes</span>
            <span className="pill-divider">•</span>
            <span className="pill-highlight">Reserva 100% Online</span>
          </div>

          <h1 className="hero-title">
            Clínica de Rehabilitación Física y Fisioterapia <span>en Lima</span>
          </h1>

          <p className="hero-subtitle">
            En VitalSalud recuperamos tu movilidad y tratamos el dolor en su raíz con planes de fisioterapia
            personalizados. Reserva tu evaluación inicial en menos de 2 minutos con terapeutas colegiados.
          </p>

          {/* Quick Hero Interactive Booking Card */}
          <div className="hero-booking-card">
            <div className="hero-booking-card-header">
              <span className="hero-booking-card-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <MaterialIcon name="bolt" size={20} />
                <span>Agenda tu Evaluación en Línea</span>
              </span>
              <span className="hero-booking-card-sub">Sin llamadas ni esperas telefónicas</span>
            </div>
            <form onSubmit={handleHeroQuickSearch} className="hero-booking-form">
              <div className="hero-form-field">
                <label htmlFor="hero-spec-select">Especialidad Médica</label>
                <div className="hero-input-wrap">
                  <span className="hero-field-icon"><MaterialIcon name="medical_services" size={18} /></span>
                  <select
                    id="hero-spec-select"
                    value={heroSelectedSpecialty}
                    onChange={(e) => {
                      setHeroSelectedSpecialty(e.target.value);
                      setHeroSelectedService('');
                    }}
                  >
                    <option value="">Todas las especialidades</option>
                    {specialtiesList.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hero-form-field">
                <label htmlFor="hero-serv-select">Servicio o Tratamiento</label>
                <div className="hero-input-wrap">
                  <span className="hero-field-icon"><MaterialIcon name="auto_awesome" size={18} /></span>
                  <select
                    id="hero-serv-select"
                    value={heroSelectedService}
                    onChange={(e) => setHeroSelectedService(e.target.value)}
                  >
                    <option value="">Cualquier servicio / Evaluación inicial</option>
                    {heroAvailableServices.map((serv) => (
                      <option key={serv.id} value={serv.id}>
                        {serv.name} — S/ {serv.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-hero-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Reservar Cita en Línea</span>
              </button>
            </form>

            <div className="hero-quick-perks">
              <div className="quick-perk-item">
                <span className="perk-check"><MaterialIcon name="check" size={14} /></span> Confirmación inmediata por WhatsApp
              </div>
              <div className="quick-perk-item">
                <span className="perk-check"><MaterialIcon name="check" size={14} /></span> Pagos seguros con Yape, Plin y Tarjetas
              </div>
              <div className="quick-perk-item">
                <span className="perk-check"><MaterialIcon name="check" size={14} /></span> Reprogramación sin costo hasta 24 h antes
              </div>
            </div>
          </div>

          {/* Trust Stats Bar */}
          <div className="trust-stats-bar">
            <div className="stat-item">
              <div className="stat-icon-wrap"><MaterialIcon name="groups" size={24} /></div>
              <div className="stat-content">
                <h4>10k+</h4>
                <p>Pacientes Atendidos</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrap"><MaterialIcon name="star" size={24} /></div>
              <div className="stat-content">
                <h4>4.9 / 5</h4>
                <p>Calificación de Pacientes</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrap"><MaterialIcon name="verified_user" size={24} /></div>
              <div className="stat-content">
                <h4>100%</h4>
                <p>Especialistas Colegiados</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrap"><MaterialIcon name="schedule" size={24} /></div>
              <div className="stat-content">
                <h4>15+</h4>
                <p>Años de Experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección "Cómo Funciona" */}
      <section id="como-funciona" className="section-wrapper section-how-it-works">
        <div className="section-header-center">
          <span className="section-badge">Paso a Paso</span>
          <h2 className="section-title">Tu Recuperación en 3 Simples Pasos</h2>
          <p className="section-subtitle">
            Un proceso simple y transparente para que comiences tu tratamiento sin trámites ni demoras.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number-badge">01</div>
            <div className="step-icon"><MaterialIcon name="medical_services" size={28} /></div>
            <h3 className="step-title">Agenda tu Evaluación Inicial</h3>
            <p className="step-desc">
              Reserva en línea tu primera consulta; no necesitas orden médica previa para comenzar tu tratamiento.
            </p>
          </div>

          <div className="step-connector" aria-hidden="true">→</div>

          <div className="step-card">
            <div className="step-number-badge">02</div>
            <div className="step-icon"><MaterialIcon name="assignment" size={28} /></div>
            <h3 className="step-title">Recibe tu Diagnóstico y Plan</h3>
            <p className="step-desc">
              Tu especialista evalúa tu condición y diseña un plan de recuperación personalizado con metas claras.
            </p>
          </div>

          <div className="step-connector" aria-hidden="true">→</div>

          <div className="step-card">
            <div className="step-number-badge">03</div>
            <div className="step-icon"><MaterialIcon name="fitness_center" size={28} /></div>
            <h3 className="step-title">Inicia tu Recuperación</h3>
            <p className="step-desc">
              Comienza tus sesiones con seguimiento constante y reportes de progreso hasta tu alta funcional.
            </p>
          </div>
        </div>
      </section>

      {/* Especialidades Médicas */}
      <section id="especialidades" className="section-wrapper section-specialties">
        <div className="section-header-center">
          <span className="section-badge">Áreas de Atención</span>
          <h2 className="section-title">Especialidades Médicas</h2>
          <p className="section-subtitle">
            Equipos multidisciplinarios y tecnología de vanguardia para tu pronta rehabilitación y bienestar integral.
          </p>
        </div>

        <div className="specialties-grid">
          {specialtiesList.map((spec) => {
              const getIconName = () => {
                if (spec.id === 'spec-1' || spec.name.includes('Fisio')) return 'offline_bolt';
                if (spec.id === 'spec-2' || spec.name.includes('Trauma')) return 'healing';
                if (spec.id === 'spec-3' || spec.name.includes('Ocupacional')) return 'pan_tool';
                return 'restaurant';
              };

              return (
                <div key={spec.id} className="specialty-card">
                  <div>
                    <div className="specialty-card-top">
                      <div className="specialty-icon-box">
                        <MaterialIcon name={getIconName()} size={28} />
                      </div>
                      <span className="specialty-status-tag">Atención Activa</span>
                    </div>
                    <h3 className="specialty-name">{spec.name}</h3>
                    <p className="specialty-desc">{spec.description}</p>
                  </div>

                  <div className="specialty-card-footer">
                    <button
                      type="button"
                      className="btn-card-action"
                      onClick={() => onStartBooking(spec.id)}
                    >
                      <span>Ver Servicios y Agendar</span>
                      <span className="arrow-icon">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Servicios y Terapias Especializadas con Filtro y Búsqueda */}
      <section id="servicios" className="section-wrapper section-services">
        <div className="section-header-center">
          <span className="section-badge">Tratamientos Disponibles</span>
          <h2 className="section-title">Servicios y Terapias Especializadas</h2>
          <p className="section-subtitle">
            Conoce nuestras sesiones individuales y protocolos terapéuticos diseñados a tu medida con precios claros.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="services-toolbar">
          <div className="services-search-box">
            <span className="search-icon"><MaterialIcon name="search" size={18} /></span>
            <input
              type="text"
              placeholder="Buscar por tratamiento o terapia..."
              value={serviceSearchTerm}
              onChange={(e) => setServiceSearchTerm(e.target.value)}
              aria-label="Buscar servicios"
            />
            {serviceSearchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setServiceSearchTerm('')}
              >
                <MaterialIcon name="close" size={16} />
              </button>
            )}
          </div>

          <div className="filter-chips">
            <button
              type="button"
              className={`filter-chip-btn ${activeSpecialtyFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveSpecialtyFilter('ALL')}
            >
              Todos los Servicios ({servicesList.length})
            </button>
            {specialtiesList.map((spec) => (
              <button
                type="button"
                key={spec.id}
                className={`filter-chip-btn ${activeSpecialtyFilter === spec.id ? 'active' : ''}`}
                onClick={() => setActiveSpecialtyFilter(spec.id)}
              >
                {spec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="services-empty-state">
            <span className="empty-icon"><MaterialIcon name="search" size={36} /></span>
            <h3>No se encontraron servicios</h3>
            <p>Intenta con otro término de búsqueda o selecciona otra especialidad.</p>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => {
                setActiveSpecialtyFilter('ALL');
                setServiceSearchTerm('');
              }}
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map((serv) => (
              <div key={serv.id} className="service-card">
                <div>
                  <div className="service-header-row">
                    <span className="service-badge">{serv.specialtyName || 'Medicina'}</span>
                    <span className="service-duration-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MaterialIcon name="schedule" size={14} />
                      <span>{serv.durationMinutes} min</span>
                    </span>
                  </div>
                  <h3 className="service-title">{serv.name}</h3>
                  <p className="service-desc">{serv.description}</p>
                </div>

                <div className="service-card-bottom">
                  <div className="service-pricing-row">
                    <div className="price-container">
                      <span className="price-currency">S/</span>
                      <span className="price-amount">{serv.price.toFixed(2)}</span>
                      <span className="price-tax">PEN (IGV inc.)</span>
                    </div>
                    {serv.requiresDeposit ? (
                      <span className="deposit-tag">Requiere seña S/ {serv.depositAmount}</span>
                    ) : (
                      <span className="no-deposit-tag">Pago en clínica</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-card-action btn-service-book"
                    onClick={() => onStartBooking(serv.specialtyId, serv.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <span>Reservar Este Servicio</span>
                    <MaterialIcon name="calendar_month" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Especialistas / Médicos */}
      <section id="profesionales" className="section-wrapper section-doctors">
        <div className="section-header-center">
          <span className="section-badge">Equipo Clínico</span>
          <h2 className="section-title">Nuestros Especialistas</h2>
          <p className="section-subtitle">
            Profesionales colegiados, certificados y altamente comprometidos con tu recuperación y salud integral.
          </p>
        </div>

        <div className="doctors-grid">
          {professionalsList.map((prof) => (
            <div key={prof.id} className="doctor-card">
              <div className="doctor-img-wrap">
                <img src={prof.avatarUrl} alt={prof.firstName} className="doctor-img" />
                  <div className="doctor-verified-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MaterialIcon name="verified" size={14} /> Verificado
                  </div>
                </div>
                <div className="doctor-body">
                  <div className="doctor-rating-row">
                    <span className="doctor-stars" style={{ display: 'inline-flex', gap: '1px', color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <MaterialIcon key={i} name="star" size={14} />
                      ))}
                    </span>
                    <span className="doctor-score">4.9</span>
                    <span className="doctor-reviews">(+90 opiniones)</span>
                  </div>
                  <h3 className="doctor-name">
                    {prof.firstName} {prof.lastName}
                  </h3>
                  <div className="doctor-license">Colegiatura: {prof.licenseNumber}</div>
                  <p className="doctor-bio">{prof.bio}</p>

                  <div className="doctor-card-footer">
                    <button
                      type="button"
                      className="btn-card-action"
                      onClick={() => onStartBooking()}
                    >
                      <span>Agendar con este Especialista</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
          ))}
            </div>
      </section>

      {/* Por Qué Elegirnos / Ventajas Clínicas */}
      <section className="section-wrapper section-advantages">
        <div className="section-header-center">
          <span className="section-badge">Atención Integral</span>
          <h2 className="section-title">¿Por Qué Elegir VitalSalud?</h2>
          <p className="section-subtitle">
            Unimos la excelencia médica humana con tecnología inteligente para transformar tu cuidado de salud.
          </p>
        </div>

        <div className="advantages-grid">
          <div className="advantage-card">
            <div className="advantage-icon"><MaterialIcon name="bolt" size={24} /></div>
            <h3>Reserva sin Esperas</h3>
            <p>Agenda tu cita en línea en menos de 2 minutos y recibe confirmación inmediata, sin llamadas ni salas de espera.</p>
          </div>

          <div className="advantage-card">
            <div className="advantage-icon"><MaterialIcon name="smartphone" size={24} /></div>
            <h3>Recordatorios por WhatsApp</h3>
            <p>Confirmamos tu cita y te enviamos recordatorios e indicaciones previas a cada sesión en tu celular.</p>
          </div>

          <div className="advantage-card">
            <div className="advantage-icon"><MaterialIcon name="folder_shared" size={24} /></div>
            <h3>Seguimiento de tu Progreso</h3>
            <p>Evaluamos tu evolución sesión a sesión y ajustamos tu plan de tratamiento hasta tu recuperación completa.</p>
          </div>

          <div className="advantage-card">
            <div className="advantage-icon"><MaterialIcon name="verified_user" size={24} /></div>
            <h3>Atención Humanizada</h3>
            <p>El mismo terapeuta te acompaña durante todo el proceso, con trato cercano y planes adaptados a ti.</p>
          </div>
        </div>
      </section>

      {/* Testimonios de Pacientes (Social Proof) */}
      <section className="section-wrapper section-testimonials">
        <div className="section-header-center">
          <span className="section-badge">Experiencias Reales</span>
          <h2 className="section-title">Lo que Dicen Nuestros Pacientes</h2>
          <p className="section-subtitle">
            Historias de recuperación y satisfacción en cada una de nuestras especialidades.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars" style={{ display: 'inline-flex', gap: '2px', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <MaterialIcon key={i} name="star" size={16} />
              ))}
            </div>
            <p className="testimonial-quote">
              "Llegué con un dolor lumbar severo que me impedía trabajar. Con 5 sesiones de fisioterapia y punción seca con la Dra. González recuperé mi movilidad por completo. La reserva online fue comodísima."
            </p>
            <div className="testimonial-patient">
              <div className="patient-avatar">RM</div>
              <div>
                <h4 className="patient-name">Rodrigo Morales</h4>
                <p className="patient-treatment">Paciente de Fisioterapia • Hace 2 semanas</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars" style={{ display: 'inline-flex', gap: '2px', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <MaterialIcon key={i} name="star" size={16} />
              ))}
            </div>
            <p className="testimonial-quote">
              "La atención en traumatología con el Dr. Mendoza fue impecable. Explicó mi diagnóstico con radiografías y la infiltración me alivió de inmediato. Excelente clínica y cero tiempo de espera."
            </p>
            <div className="testimonial-patient">
              <div className="patient-avatar">CA</div>
              <div>
                <h4 className="patient-name">Carmen Alvarado</h4>
                <p className="patient-treatment">Paciente de Traumatología • Hace 1 mes</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars" style={{ display: 'inline-flex', gap: '2px', color: '#f59e0b' }}>
              {[...Array(5)].map((_, i) => (
                <MaterialIcon key={i} name="star" size={16} />
              ))}
            </div>
            <p className="testimonial-quote">
              "El plan nutricional personalizado y las mediciones por bioimpedancia me permitieron recuperarme de mi lesión muscular y mejorar mi rendimiento deportivo. Totalmente recomendado."
            </p>
            <div className="testimonial-patient">
              <div className="patient-avatar">DS</div>
              <div>
                <h4 className="patient-name">Diego Salazar</h4>
                <p className="patient-treatment">Paciente de Nutrición Deportiva • Hace 3 semanas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sedes y Horarios */}
      <section className="section-wrapper section-locations">
        <div className="locations-card">
          <div className="locations-info">
            <span className="section-badge" style={{ color: '#38bdf8' }}>Atención Presencial</span>
            <h2 className="locations-title">Visítanos en Nuestras Sedes</h2>
            <p className="locations-subtitle">
              Gimnasios de rehabilitación equipados, consultorios privados climatizados y estacionamiento propio en ambas sedes.
            </p>

            <div className="locations-list">
              <div className="location-item">
                <div className="location-icon"><MaterialIcon name="location_on" size={22} /></div>
                <div>
                  <h4 className="location-name">Sede Principal — San Isidro</h4>
                  <p className="location-address">Av. Javier Prado Este 2450, San Isidro, Lima</p>
                  <p className="location-hours" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MaterialIcon name="schedule" size={14} /> Lun a Sáb: 7:00 AM – 9:00 PM | Dom: 8:00 AM – 1:00 PM
                  </p>
                </div>
              </div>

              <div className="location-item">
                <div className="location-icon"><MaterialIcon name="location_on" size={22} /></div>
                <div>
                  <h4 className="location-name">Sede Miraflores</h4>
                  <p className="location-address">Av. José Pardo 830, Of. 402, Miraflores, Lima</p>
                  <p className="location-hours" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MaterialIcon name="schedule" size={14} /> Lun a Vie: 8:00 AM – 8:00 PM | Sáb: 8:00 AM – 2:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="locations-cta-row">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => onStartBooking()}
              >
                Agendar Cita en Sede
              </button>
              <a
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-direct"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <MaterialIcon name="chat" size={16} />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="locations-badge-box">
            <div className="pulse-circle"><MaterialIcon name="local_hospital" size={32} /></div>
            <h3>Reservas e Informes</h3>
            <p className="locations-phone">+51 (01) 480-9900</p>
            <p className="locations-email">contacto@vitalsalud.pe</p>
            <div className="locations-status-pill">
              <span className="live-pulse-dot" /> Abierto ahora
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="section-wrapper section-faq">
        <div className="section-header-center">
          <span className="section-badge">Ayuda al Paciente</span>
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <p className="section-subtitle">
            Resolvemos tus dudas sobre horarios, cancelaciones, preparación y atención clínica.
          </p>
        </div>

        <div className="faq-list">
          {MOCK_FAQS.map((faq, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <div key={idx} className={`faq-card ${isExpanded ? 'active' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  aria-expanded={isExpanded}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-toggle-icon">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Conversion Banner Section */}
      <section className="section-wrapper section-cta-banner">
        <div className="cta-banner-box">
          <div className="cta-banner-content">
            <span className="cta-banner-badge">Tu recuperación empieza hoy</span>
            <h2 className="cta-banner-title">
              ¿Listo para vivir sin dolor y recuperar tu movilidad?
            </h2>
            <p className="cta-banner-sub">
              Agenda tu evaluación inicial con un especialista en fisioterapia en menos de 2 minutos.
              Horarios flexibles de lunes a sábado.
            </p>
          </div>
          <div className="cta-banner-actions">
            <button
              type="button"
              className="btn-cta-giant"
              onClick={() => onStartBooking()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <MaterialIcon name="calendar_month" size={20} />
              <span>Agendar Consulta Médica Ahora</span>
            </button>
            <span className="cta-assurance" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <MaterialIcon name="lock" size={14} />
              <span>Sin costos ocultos • Cita confirmada al instante</span>
            </span>
          </div>
        </div>
      </section>

      {/* Floating AI Assistant Widget */}
      <AiChatWidget onStartBooking={onStartBooking} />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};


import React, { useState } from 'react';
import './Header.css';
import { MaterialIcon } from '../ui/MaterialIcon';
import { useClinicBranding } from '../../context/ClinicBrandingContext';

interface HeaderProps {
  onNavigate: (view: 'landing' | 'booking' | 'login') => void;
  activeView: 'landing' | 'booking' | 'login';
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { branding, theme } = useClinicBranding();

  const handleNavClick = (view: 'landing' | 'booking' | 'login', anchorId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <header className="public-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div
          className="brand-container"
          onClick={() => handleNavClick('landing')}
          role="button"
          tabIndex={0}
        >
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.name}
              style={{ height: '34px', maxWidth: '160px', objectFit: 'contain', marginRight: '0.5rem' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="brand-logo-badge"
              aria-hidden="true"
              style={{ background: theme.primary }}
            >
              {branding ? (
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.contrastText }}>
                  {branding.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              )}
            </div>
          )}
          <div className="brand-text-col">
            <span className="brand-name">
              {branding ? (
                branding.name
              ) : (
                <>Vital<span>Salud</span></>
              )}
            </span>
            <span className="brand-tagline">
              {branding?.loginTagline || (branding ? branding.city : 'Clínica de Rehabilitación Física')}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <ul className="nav-links">
            <li>
              <button
                type="button"
                className={`nav-link ${activeView === 'landing' ? 'active' : ''}`}
                onClick={() => handleNavClick('landing')}
              >
                Inicio
              </button>
            </li>
            <li>
              <a
                href="#como-funciona"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing', 'como-funciona');
                }}
              >
                Cómo Funciona
              </a>
            </li>
            <li>
              <a
                href="#especialidades"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing', 'especialidades');
                }}
              >
                Especialidades
              </a>
            </li>
            <li>
              <a
                href="#servicios"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing', 'servicios');
                }}
              >
                Servicios
              </a>
            </li>
            <li>
              <a
                href="#profesionales"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing', 'profesionales');
                }}
              >
                Especialistas
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('landing', 'faq');
                }}
              >
                Preguntas
              </a>
            </li>
          </ul>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-login"
            style={{ color: theme.primary }}
            onClick={() => handleNavClick('login')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Acceder</span>
          </button>

          <button
            type="button"
            className="btn-book-cta"
            style={{
              background: theme.primary,
              borderColor: theme.primaryDark,
              color: theme.contrastText,
            }}
            onClick={() => handleNavClick('booking')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Reservar Cita</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="btn-mobile-toggle"
            aria-label="Abrir menú"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MaterialIcon name="home" size={18} />
            <span>Inicio</span>
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick('landing', 'como-funciona')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MaterialIcon name="bolt" size={18} />
            <span>Cómo Funciona</span>
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick('landing', 'especialidades')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MaterialIcon name="medical_services" size={18} />
            <span>Especialidades Médicas</span>
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick('landing', 'servicios')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MaterialIcon name="healing" size={18} />
            <span>Servicios y Terapias</span>
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick('landing', 'profesionales')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MaterialIcon name="groups" size={18} />
            <span>Médicos y Especialistas</span>
          </button>
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => handleNavClick('landing', 'faq')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MaterialIcon name="help" size={18} />
            <span>Preguntas Frecuentes</span>
          </button>
          <div className="mobile-nav-divider" />
          <button
            type="button"
            className="btn-book-cta w-full"
            onClick={() => handleNavClick('booking')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <MaterialIcon name="calendar_month" size={18} />
            <span>Reservar Cita en Línea</span>
          </button>
          <button
            type="button"
            className="btn-login w-full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => handleNavClick('login')}
          >
            <MaterialIcon name="lock" size={18} />
            <span>Iniciar Sesión / Portal</span>
          </button>
        </div>
      )}
    </header>
  );
};

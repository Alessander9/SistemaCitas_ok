import React from 'react';
import './Footer.css';
import { MaterialIcon } from '../ui/MaterialIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="public-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-header">
            <div className="footer-logo-badge" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <h3>
              Vital<span>Salud</span>
            </h3>
          </div>
          <p>
            Clínica especializada en rehabilitación física, fisioterapia y recuperación funcional.
            Más de 15 años devolviendo movimiento y calidad de vida a nuestros pacientes.
          </p>
          <div className="footer-compliance-badges">
            <span className="badge-ssl" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MaterialIcon name="lock" size={13} /> SSL 256-bit
            </span>
            <span>•</span>
            <span className="badge-law" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MaterialIcon name="verified_user" size={13} /> Ley N° 29733 (Protección de Datos)
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <ul className="footer-links">
            <li>
              <a href="#como-funciona">Cómo Funciona</a>
            </li>
            <li>
              <a href="#especialidades">Especialidades Médicas</a>
            </li>
            <li>
              <a href="#servicios">Servicios y Terapias</a>
            </li>
            <li>
              <a href="#profesionales">Nuestros Especialistas</a>
            </li>
            <li>
              <a href="#faq">Preguntas Frecuentes</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal & Paciente</h4>
          <ul className="footer-links">
            <li>
              <a href="#terminos">Términos de Servicio</a>
            </li>
            <li>
              <a href="#privacidad">Política de Privacidad</a>
            </li>
            <li>
              <a href="#consentimiento">Consentimiento Informado</a>
            </li>
            <li>
              <a href="#libro-reclamaciones" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="menu_book" size={14} /> Libro de Reclamaciones
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Atención & Contacto</h4>
          <div className="footer-contact-item">
            <MaterialIcon name="location_on" size={16} />
            <span>Av. Javier Prado Este 2450, San Isidro, Lima</span>
          </div>
          <div className="footer-contact-item">
            <MaterialIcon name="call" size={16} />
            <span>(01) 480-9900 / +51 987 654 321</span>
          </div>
          <div className="footer-contact-item">
            <MaterialIcon name="schedule" size={16} />
            <span>Lun a Sáb: 7:00 AM – 9:00 PM</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} VitalSalud — Todos los derechos reservados.</span>
        <span>Clínica de Rehabilitación Física — San Isidro y Miraflores, Lima</span>
      </div>
    </footer>
  );
};


import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface BrandSidebarProps {
  branding?: {
    name: string;
    logoUrl?: string;
    city?: string;
    loginTagline?: string;
  } | null;
  theme: {
    primary: string;
    primaryDark?: string;
    contrastText: string;
  };
}

export const BrandSidebar: React.FC<BrandSidebarProps> = ({ branding, theme }) => {
  return (
    <aside className="brand-sidebar">
      <div className="brand-sidebar-top">
        <div className="brand-header-logo">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.name}
              style={{ height: '36px', maxWidth: '140px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="logo-icon-wrap" aria-hidden="true" style={{ background: theme.primary }}>
              {branding ? (
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.contrastText }}>
                  {branding.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
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
          <div>
            <h1 className="brand-title">
              {branding ? branding.name : <>Vital <span>Salud</span></>}
            </h1>
            <span className="brand-subtitle-tag">
              {branding?.loginTagline || (branding ? branding.city : 'Clínica de Rehabilitación Física')}
            </span>
          </div>
        </div>

        <div className="brand-statement">
          <p className="brand-headline">
            Gestión clínica precisa para cada sesión y paciente.
          </p>
          <p className="brand-desc">
            Plataforma interna para especialistas, admisión y dirección médica en sede San Isidro.
          </p>
        </div>

        {/* Structured Capabilities List */}
        <ul className="feature-cards" aria-label="Capacidades de la plataforma">
          <li className="feature-card">
            <div className="feature-card-icon" aria-hidden="true">
              <MaterialIcon name="calendar_today" size={19} />
            </div>
            <div className="feature-card-content">
              <h4>Agenda en tiempo real</h4>
              <p>Control multi-especialista con bloqueo anti-colisiones y recordatorios automáticos.</p>
            </div>
          </li>

          <li className="feature-card">
            <div className="feature-card-icon" aria-hidden="true">
              <MaterialIcon name="mark_email_read" size={19} />
            </div>
            <div className="feature-card-content">
              <h4>Confirmaciones inmediatas</h4>
              <p>Comprobantes y avisos enviados al paciente y a recepción al instante vía Resend.</p>
            </div>
          </li>

          <li className="feature-card">
            <div className="feature-card-icon" aria-hidden="true">
              <MaterialIcon name="payments" size={19} />
            </div>
            <div className="feature-card-content">
              <h4>Caja y cobros en Soles (S/.)</h4>
              <p>Liquidación diaria en moneda nacional para atención presencial y pagos digitales.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Quiet Status & Legal Footer */}
      <footer className="brand-footer">
        <div className="brand-status-row">
          <span className="live-status-dot" aria-hidden="true" />
          <span>Sistema operativo</span>
          <span className="footer-sep" aria-hidden="true">/</span>
          <span>Ley N.° 29733</span>
        </div>
        <p className="brand-legal">
          © {new Date().getFullYear()} Clínica VitalSalud S.A.C. — San Isidro, Lima
        </p>
      </footer>
    </aside>
  );
};

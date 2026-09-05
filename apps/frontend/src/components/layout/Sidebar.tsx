import React from 'react';
import './Sidebar.css';
import {
  IconChart,
  IconCalendar,
  IconStethoscope,
  IconCash,
  IconInventory,
  IconMail,
  IconBot,
  IconBuilding,
  IconFileText,
  IconCheckCircle,
} from '../ui/Icons';

interface SidebarProps {
  currentView: string;
  activeRole: string;
  onNavigate: (view: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeRole,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Configuración estricta por rol (RBAC Puro)
  const getRoleMenu = (): { sectionTitle: string; items: NavItem[] } => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        return {
          sectionTitle: 'Supervisión Red Global',
          items: [
            {
              id: 'dashboard',
              label: 'Panel Multi-Tenant',
              icon: <IconBuilding className="w-4 h-4" />,
            },
            {
              id: 'cash-register',
              label: 'Liquidación & Red',
              icon: <IconCash className="w-4 h-4" />,
            },
          ],
        };

      case 'ADMIN_CLINIC':
        return {
          sectionTitle: 'Gestión de Sede',
          items: [
            {
              id: 'dashboard',
              label: 'Dashboard Operativo',
              icon: <IconChart className="w-4 h-4" />,
            },
            {
              id: 'reception-booking',
              label: 'Agenda & Citas del Día',
              icon: <IconCalendar className="w-4 h-4" />,
            },
            {
              id: 'cash-register',
              label: 'Caja Chica & Arqueo',
              icon: <IconCash className="w-4 h-4" />,
            },
            {
              id: 'inventory',
              label: 'Kardex de Inventario',
              icon: <IconInventory className="w-4 h-4" />,
            },
            {
              id: 'communications',
              label: 'Emails & Recordatorios',
              icon: <IconMail className="w-4 h-4" />,
            },
            {
              id: 'telegram-bot',
              label: 'Bot de Telegram Staff',
              icon: <IconBot className="w-4 h-4" />,
            },
          ],
        };

      case 'PROFESIONAL':
        return {
          sectionTitle: 'Área Médica & Pacientes',
          items: [
            {
              id: 'dashboard',
              label: 'Mi Cola de Consulta',
              icon: <IconStethoscope className="w-4 h-4" />,
            },
            {
              id: 'clinical-consultation',
              label: 'Ficha EVA & Diagnósticos',
              icon: <IconFileText className="w-4 h-4" />,
            },
            {
              id: 'doctor-schedule',
              label: 'Mi Agenda Semanal',
              icon: <IconCalendar className="w-4 h-4" />,
            },
            {
              id: 'telegram-bot',
              label: 'Notificaciones Telegram',
              icon: <IconBot className="w-4 h-4" />,
            },
          ],
        };

      case 'RECEPCION':
        return {
          sectionTitle: 'Admisión y Front-Desk',
          items: [
            {
              id: 'dashboard',
              label: 'Mesa de Admisión (Triage)',
              icon: <IconCheckCircle className="w-4 h-4" />,
            },
            {
              id: 'reception-booking',
              label: 'Agendar Citas',
              icon: <IconCalendar className="w-4 h-4" />,
            },
            {
              id: 'cash-register',
              label: 'Caja & Cobro Rápido',
              icon: <IconCash className="w-4 h-4" />,
            },
          ],
        };

      case 'PACIENTE':
        return {
          sectionTitle: 'Mi Salud & Tratamiento',
          items: [
            {
              id: 'dashboard',
              label: 'Mi Portal de Salud',
              icon: <IconChart className="w-4 h-4" />,
            },
            {
              id: 'booking',
              label: 'Reservar Nueva Cita',
              icon: <IconCalendar className="w-4 h-4" />,
            },
            {
              id: 'patient-portal',
              label: 'Mis Recetas & Pagos',
              icon: <IconFileText className="w-4 h-4" />,
            },
          ],
        };

      default:
        return {
          sectionTitle: 'Menú Principal',
          items: [
            {
              id: 'dashboard',
              label: 'Dashboard General',
              icon: <IconChart className="w-4 h-4" />,
            },
          ],
        };
    }
  };

  const { sectionTitle, items: roleNavItems } = getRoleMenu();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div>
          <div className="sidebar-brand">
            <div
              className="brand-link"
              onClick={() => onNavigate('dashboard')}
              title="CitasSistema — Inicio"
            >
              <div className="brand-icon-box">
                ✚
              </div>
              {!isCollapsed && (
                <div>
                  <div className="brand-text-title">
                    Citas<span>Sistema</span>
                  </div>
                  <span className="brand-text-sub">
                    {activeRole === 'SUPER_ADMIN' ? 'Clúster Multi-Tenant' : 'Salud & Rehabilitación'}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {onToggleCollapse && !isCollapsed && (
                <button
                  type="button"
                  className="collapse-toggle-btn"
                  onClick={onToggleCollapse}
                  title="Minimizar barra lateral (Modo Compacto)"
                >
                  ◀
                </button>
              )}

              {onCloseMobile && (
                <button
                  type="button"
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  onClick={onCloseMobile}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Menu strictly filtered by activeRole */}
          <nav className="sidebar-nav">
            {!isCollapsed && (
              <div className="nav-section-label">
                {sectionTitle}
              </div>
            )}

            {roleNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile?.();
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="nav-icon-wrap">
                    {item.icon}
                  </div>
                  {!isCollapsed && <span className="nav-label-text">{item.label}</span>}
                  {isActive && !isCollapsed && <div className="nav-active-indicator" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Public Web & Footer Status */}
        <div className="sidebar-footer-box">
          <button
            type="button"
            className="public-web-btn"
            onClick={() => onNavigate('landing')}
            title="Ir a Web Pública"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#0d9488' }} />
              {!isCollapsed && <span>Web Pública + IA</span>}
            </span>
            {!isCollapsed && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>↗</span>}
          </button>

          {!isCollapsed && (
            <div className="sidebar-status-row">
              <span>{activeRole === 'SUPER_ADMIN' ? 'v0.4.0 Global Master' : 'v0.4.0 Enterprise'}</span>
              <div className="status-live-badge">
                <span className="live-pulse-dot" />
                <span>En Línea</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

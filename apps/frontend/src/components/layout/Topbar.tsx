import React, { useState, useRef, useEffect, useMemo } from 'react';
import './Topbar.css';
import { MaterialIcon } from '../ui/MaterialIcon';
import { IconSearch } from '../ui/Icons';
import { useTheme } from '../../context/ThemeContext';
import { AccessibilityFontScaler } from './AccessibilityFontScaler';
import { soundEffects } from '../../utils/soundEffects';

interface TopbarProps {
  currentView: string;
  activeRole: string;
  onNavigate?: (view: string) => void;
  onRoleChange?: (role: 'SUPER_ADMIN' | 'ADMIN_CLINIC' | 'PROFESIONAL' | 'RECEPCION' | 'PACIENTE') => void;
  onToggleMobileMenu?: () => void;
  onLogout?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  activeRole,
  onNavigate,
  onRoleChange,
  onToggleMobileMenu,
  onLogout,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Preference states
  const [compactDensity, setCompactDensity] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundEffects.isEnabled());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const quickSearchItems = useMemo(() => {
    const commonByRole: Record<string, Array<{ label: string; sub: string; view: string; icon: string }>> = {
      SUPER_ADMIN: [
        { label: 'Panel Multi-Tenant', sub: 'Red global de sedes', view: 'dashboard', icon: 'public' },
        { label: 'Caja & Liquidación', sub: 'Finanzas de red', view: 'cash-register', icon: 'payments' },
      ],
      ADMIN_CLINIC: [
        { label: 'Dashboard Operativo', sub: 'KPIs, ocupación y alertas', view: 'dashboard', icon: 'monitoring' },
        { label: 'Agenda & Citas del Día', sub: 'Programación de consultorios', view: 'reception-booking', icon: 'calendar_month' },
        { label: 'Caja Chica & Arqueo', sub: 'Ingresos, egresos y cierre', view: 'cash-register', icon: 'payments' },
        { label: 'Kardex de Inventario', sub: 'Stock crítico e insumos', view: 'inventory', icon: 'inventory_2' },
        { label: 'Emails & Recordatorios', sub: 'Plantillas y envíos', view: 'communications', icon: 'mail' },
      ],
      PROFESIONAL: [
        { label: 'Mi Cola de Consulta', sub: 'Carlos Benítez, Rosa Morales, Jorge Ramírez', view: 'dashboard', icon: 'stethoscope' },
        { label: 'Ficha EVA & Diagnósticos', sub: 'Atención clínica y receta digital', view: 'clinical-consultation', icon: 'description' },
        { label: 'Mi Agenda Semanal', sub: 'Turnos y bloqueos semanales', view: 'doctor-schedule', icon: 'calendar_month' },
      ],
      RECEPCION: [
        { label: 'Mesa de Admisión (Triage)', sub: 'Check-in y cobro rápido', view: 'dashboard', icon: 'assignment' },
        { label: 'Agendar Citas', sub: 'Disponibilidad por profesional', view: 'reception-booking', icon: 'calendar_month' },
        { label: 'Caja & Cobro Rápido', sub: 'Arqueo de turno', view: 'cash-register', icon: 'payments' },
      ],
      PACIENTE: [
        { label: 'Mi Portal de Salud', sub: 'Próxima cita, progreso y cuidados', view: 'dashboard', icon: 'favorite' },
        { label: 'Reservar Nueva Cita', sub: 'Agendamiento en línea', view: 'booking', icon: 'calendar_today' },
        { label: 'Mis Recetas & Pagos', sub: 'Citas, recetas digitales y boletas', view: 'patient-portal', icon: 'receipt_long' },
      ],
    };
    const items = commonByRole[activeRole] || commonByRole.ADMIN_CLINIC;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q),
    );
  }, [activeRole, searchQuery]);

  // Close dropdown when clicking outside & handle Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsSearchOpen(false);
        setShowCustomizeModal(false);
        setShowProfileModal(false);
        setShowSecurityModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getBreadcrumb = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Panel de Control Principal';
      case 'doctor-schedule':
        return 'Mi Agenda Semanal & Turnos Médicos';
      case 'reception-booking':
        return 'Agenda & Agendamiento de Citas';
      case 'booking':
        return 'Agenda & Reserva de Citas';
      case 'clinical-consultation':
        return 'Atención Clínica · Ficha EVA & Diagnósticos';
      case 'cash-register':
        return 'Finanzas & Arqueo de Caja Chica';
      case 'inventory':
        return 'Kardex de Inventario Médico';
      case 'communications':
        return 'Emails Transaccionales & Recordatorios';
      case 'telegram-bot':
        return 'Integración Telegram Staff';
      case 'patient-portal':
        return 'Portal de Paciente';
      default:
        return 'Dashboard';
    }
  };

  const getRoleDisplayName = () => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'ADMIN_CLINIC':
        return 'Alessander (Director Médico)';
      case 'PROFESIONAL':
        return 'Dra. María González';
      case 'RECEPCION':
        return 'Recepción y Admisión';
      case 'PACIENTE':
        return 'Juan Pérez (Paciente)';
      default:
        return activeRole;
    }
  };

  const getRoleEmail = () => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        return 'superadmin@citassistema.pe';
      case 'ADMIN_CLINIC':
        return 'director@sanitas.pe';
      case 'PROFESIONAL':
        return 'dra.gonzalez@sanitas.pe';
      case 'RECEPCION':
        return 'admision@sanitas.pe';
      case 'PACIENTE':
        return 'juan.perez@paciente.pe';
      default:
        return 'usuario@citassistema.pe';
    }
  };

  const getRoleBadgeLabel = () => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        return 'Super Admin Global';
      case 'ADMIN_CLINIC':
        return 'Director de Sede';
      case 'PROFESIONAL':
        return 'Médico Especialista';
      case 'RECEPCION':
        return 'Personal de Admisión';
      case 'PACIENTE':
        return 'Paciente Verificado';
      default:
        return activeRole;
    }
  };

  const getUserInitials = () => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        return 'SA';
      case 'ADMIN_CLINIC':
        return 'AL';
      case 'PROFESIONAL':
        return 'MG';
      case 'RECEPCION':
        return 'RC';
      case 'PACIENTE':
        return 'JP';
      default:
        return 'US';
    }
  };

  return (
    <>
      <header className="topbar-header">
        {/* Left: Collapse Toggle & Breadcrumb */}
        <div className="topbar-left">
          {/* Desktop Sidebar Minimizer */}
          {onToggleSidebar && (
            <button
              type="button"
              className="sidebar-toggle-btn hidden lg:flex"
              onClick={onToggleSidebar}
              title={isSidebarCollapsed ? "Expandir barra lateral" : "Minimizar barra lateral"}
            >
              {isSidebarCollapsed ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="sidebar-toggle-btn lg:hidden"
            onClick={onToggleMobileMenu}
            aria-label="Abrir menú móvil"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="topbar-breadcrumb-wrap">
            <div className="breadcrumb-path">
              <span>{activeRole === 'SUPER_ADMIN' ? 'Red Central Multi-Tenant' : 'Sede Principal'}</span>
              <span>/</span>
              <span className="clinic-name">
                {activeRole === 'SUPER_ADMIN' ? 'Clúster Médico Global' : 'Clínica Sanitas Lima'}
              </span>
            </div>
            <div className="breadcrumb-title">
              {getBreadcrumb()}
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar with guaranteed zero overlap */}
        <div className="topbar-search-wrap hidden md:flex" ref={searchWrapRef} style={{ position: 'relative' }}>
          <span className="search-icon-pos">
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Buscar paciente, cita o módulo..."
            aria-label="Búsqueda rápida"
            className="topbar-search-input"
          />
          <kbd className="search-kbd-badge">
            ⌘K
          </kbd>

          {isSearchOpen && (
            <div
              role="listbox"
              aria-label="Resultados de búsqueda rápida"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 16px 36px -8px rgba(15, 23, 42, 0.16)',
                zIndex: 100,
                padding: '0.4rem',
                maxHeight: '280px',
                overflowY: 'auto',
              }}
            >
              {quickSearchItems.length === 0 ? (
                <div style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  No se encontraron accesos para "{searchQuery}"
                </div>
              ) : (
                quickSearchItems.map((item) => (
                  <button
                    key={item.view + item.label}
                    type="button"
                    role="option"
                    onClick={() => {
                      onNavigate?.(item.view);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: currentView === item.view ? '#f0f9ff' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <MaterialIcon name={item.icon} size={18} color="#0284c7" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.sub}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Scope Indicator, Font Scaler, Dark Mode Toggle & User Profile Dropdown */}
        <div className="topbar-right">
          {/* Accessibility Font Scaler */}
          <div className="hidden sm:flex">
            <AccessibilityFontScaler />
          </div>

          {/* Dark Mode Quick Switcher */}
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isDark ? <MaterialIcon name="light_mode" size={18} /> : <MaterialIcon name="dark_mode" size={18} />}
          </button>

          {/* Active Clinic / Scope Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dot-live"></span>
            <span className="font-semibold flex items-center gap-1">
              <MaterialIcon name={activeRole === 'SUPER_ADMIN' ? 'public' : 'local_hospital'} size={14} />
              {activeRole === 'SUPER_ADMIN' ? 'Red Global' : 'Sanitas Lima'}
            </span>
          </div>

          {/* User Profile Interactive Dropdown */}
          <div className="user-dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              id="user-profile-menu-trigger"
              className={`user-profile-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(prev => !prev)}
              aria-expanded={isDropdownOpen}
              title="Abrir menú de usuario y configuración"
            >
              <div className="user-avatar-circle">
                {getUserInitials()}
                <span className="avatar-status-dot" />
              </div>
              <div className="user-info-text hidden xl:flex">
                <span className="user-display-name">
                  {getRoleDisplayName()}
                </span>
                <span className="user-role-label">
                  {getRoleBadgeLabel()}
                </span>
              </div>
              <svg
                className={`user-chevron ${isDropdownOpen ? 'rotate' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown Floating Popover */}
            {isDropdownOpen && (
              <div className="user-dropdown-menu" id="user-dropdown-popover">
                {/* Header with User Info */}
                <div className="dropdown-header">
                  <div className="user-avatar-circle" style={{ width: '40px', height: '40px', fontSize: '0.85rem' }}>
                    {getUserInitials()}
                    <span className="avatar-status-dot" />
                  </div>
                  <div className="dropdown-header-info">
                    <span className="dropdown-header-name">{getRoleDisplayName()}</span>
                    <span className="dropdown-header-email">{getRoleEmail()}</span>
                    <span className="dropdown-header-badge">{getRoleBadgeLabel()}</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="dropdown-menu-list">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowCustomizeModal(true);
                    }}
                  >
                    <span className="dropdown-item-icon"><MaterialIcon name="tune" size={18} /></span>
                    <span>Personalizar Interfaz</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowProfileModal(true);
                    }}
                  >
                    <span className="dropdown-item-icon"><MaterialIcon name="person" size={18} /></span>
                    <span>Mi Perfil Clínico</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowSecurityModal(true);
                    }}
                  >
                    <span className="dropdown-item-icon"><MaterialIcon name="security" size={18} /></span>
                    <span>Seguridad & Auditoría</span>
                  </button>

                  {/* Switch Role Fast Bar for Testing & Multi-Role Staff */}
                  {onRoleChange && (
                    <>
                      <div className="dropdown-divider" />
                      <div style={{ padding: '0.45rem 0.85rem 0.25rem', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                        Cambiar de Rol (Modo Sistema)
                      </div>
                      <button
                        type="button"
                        className={`dropdown-item ${activeRole === 'SUPER_ADMIN' ? 'active' : ''}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onRoleChange('SUPER_ADMIN');
                        }}
                      >
                        <span className="dropdown-item-icon"><MaterialIcon name="public" size={18} /></span>
                        <span>Super Admin (Multi-Tenant)</span>
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item ${activeRole === 'ADMIN_CLINIC' ? 'active' : ''}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onRoleChange('ADMIN_CLINIC');
                        }}
                      >
                        <span className="dropdown-item-icon"><MaterialIcon name="local_hospital" size={18} /></span>
                        <span>Director Médico (Sede)</span>
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item ${activeRole === 'PROFESIONAL' ? 'active' : ''}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onRoleChange('PROFESIONAL');
                        }}
                      >
                        <span className="dropdown-item-icon"><MaterialIcon name="medical_services" size={18} /></span>
                        <span>Dra. González (Médico)</span>
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item ${activeRole === 'RECEPCION' ? 'active' : ''}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onRoleChange('RECEPCION');
                        }}
                      >
                        <span className="dropdown-item-icon"><MaterialIcon name="assignment" size={18} /></span>
                        <span>Recepción / Front-Desk</span>
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item ${activeRole === 'PACIENTE' ? 'active' : ''}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onRoleChange('PACIENTE');
                        }}
                      >
                        <span className="dropdown-item-icon"><MaterialIcon name="person" size={18} /></span>
                        <span>Juan Pérez (Paciente)</span>
                      </button>
                    </>
                  )}

                  <div className="dropdown-divider" />

                  {onLogout && (
                    <button
                      type="button"
                      id="btn-dropdown-logout"
                      className="dropdown-item danger"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      <span className="dropdown-item-icon"><MaterialIcon name="logout" size={18} /></span>
                      <span>Cerrar Sesión Segura</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal 1: Personalizar Interfaz */}
      {showCustomizeModal && (
        <div className="modal-overlay-custom" onClick={() => setShowCustomizeModal(false)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Personalización del Sistema</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowCustomizeModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body-custom">
              <div className="pref-row">
                <div className="pref-info">
                  <h4>Densidad de Pantalla Compacta</h4>
                  <p>Reduce márgenes y paddings para ver más pacientes en pantalla.</p>
                </div>
                <input
                  type="checkbox"
                  checked={compactDensity}
                  onChange={e => {
                    const checked = e.target.checked;
                    setCompactDensity(checked);
                    if (typeof document !== 'undefined') {
                      document.documentElement.classList.toggle('compact-mode', checked);
                    }
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </div>

              <div className="pref-row">
                <div className="pref-info">
                  <h4>Sonidos de Notificación</h4>
                  <p>Alerta acústica al ingresar un nuevo paciente a sala de espera.</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={e => {
                    const checked = e.target.checked;
                    setSoundEnabled(checked);
                    soundEffects.setEnabled(checked);
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </div>

              <div className="pref-row">
                <div className="pref-info">
                  <h4>Actualización Automática (Polling 15s)</h4>
                  <p>Refresca la cola de atención médica en tiempo real.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                />
              </div>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="cash-btn primary"
                onClick={() => setShowCustomizeModal(false)}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px' }}
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Mi Perfil Clínico */}
      {showProfileModal && (
        <div className="modal-overlay-custom" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Perfil del Profesional</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body-custom">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <div className="user-avatar-circle" style={{ width: '52px', height: '52px', fontSize: '1.1rem' }}>
                  {getUserInitials()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{getRoleDisplayName()}</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{getRoleEmail()}</p>
                  <span className="dropdown-header-badge" style={{ marginTop: '4px' }}>{getRoleBadgeLabel()}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    {activeRole === 'PACIENTE' ? 'Documento (DNI)' : activeRole === 'PROFESIONAL' ? 'Registro Profesional' : 'Nivel de Acceso'}
                  </span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a' }}>
                    {activeRole === 'PACIENTE'
                      ? 'DNI 73829104'
                      : activeRole === 'PROFESIONAL'
                        ? 'CMP 48291 / RNE 19283'
                        : activeRole === 'RECEPCION'
                          ? 'Admisión & Caja Turno AM'
                          : activeRole === 'SUPER_ADMIN'
                            ? 'Master Multi-Tenant (RLS)'
                            : 'Dirección Médica de Sede'}
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Sede Activa</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#0f172a' }}>{activeRole === 'SUPER_ADMIN' ? 'Red Multi-Tenant' : 'Sanitas Lima Principal'}</p>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MaterialIcon name="verified_user" size={18} color="#059669" />
                <span>
                  {activeRole === 'PACIENTE'
                    ? 'Tus datos clínicos están protegidos bajo la Ley N° 29733 de Protección de Datos Personales.'
                    : 'Sesión verificada con auditoría inmutable y cumplimiento normativo MINSA / Ley N° 29733.'}
                </span>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="cash-btn ghost"
                onClick={() => setShowProfileModal(false)}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Seguridad & Auditoría */}
      {showSecurityModal && (
        <div className="modal-overlay-custom" onClick={() => setShowSecurityModal(false)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Seguridad & Auditoría Activa</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowSecurityModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>
            <div className="modal-body-custom">
              <div style={{ padding: '0.9rem 1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.84rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MaterialIcon name="verified_user" size={20} color="#059669" />
                <div>
                  <strong>Protocolo de Seguridad Activo</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>
                    Cifrado TLS 256-bit, aislamiento multi-tenant con Row-Level Security (RLS) y bitácora inmutable conforme a la Ley N° 29733.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="cash-btn primary"
                onClick={() => setShowSecurityModal(false)}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '10px' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;

import React, { useState, lazy, Suspense } from 'react';
import { MaterialIcon } from './components/ui/MaterialIcon';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/login/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { SpeedDialFAB } from './components/layout/SpeedDialFAB';
import { SkeletonLoader } from './components/common/SkeletonLoader';

// Lazy-loaded heavy pages and dashboards for optimized bundle splitting
import { BookingWizard } from './components/booking/BookingWizard';
const ClinicalConsultationView = lazy(() => import('./pages/clinical/ClinicalConsultationView').then((m) => ({ default: m.ClinicalConsultationView })));
const CashRegisterPage = lazy(() => import('./pages/admin/CashRegisterPage').then((m) => ({ default: m.CashRegisterPage })));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage').then((m) => ({ default: m.InventoryPage })));
const CommunicationsPage = lazy(() => import('./pages/admin/CommunicationsPage').then((m) => ({ default: m.CommunicationsPage })));
const TelegramBotPage = lazy(() => import('./pages/admin/TelegramBotPage').then((m) => ({ default: m.TelegramBotPage })));
const ReceptionBookingPage = lazy(() => import('./pages/admin/ReceptionBookingPage').then((m) => ({ default: m.ReceptionBookingPage })));
const PatientPortal = lazy(() => import('./pages/patient/PatientPortal').then((m) => ({ default: m.PatientPortal })));
const SuperAdminDashboard = lazy(() => import('./pages/dashboards/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard })));
const ClinicAdminDashboard = lazy(() => import('./pages/dashboards/ClinicAdminDashboard').then((m) => ({ default: m.ClinicAdminDashboard })));
const DoctorDashboard = lazy(() => import('./pages/dashboards/DoctorDashboard').then((m) => ({ default: m.DoctorDashboard })));
const ReceptionDashboard = lazy(() => import('./pages/dashboards/ReceptionDashboard').then((m) => ({ default: m.ReceptionDashboard })));
const PatientDashboard = lazy(() => import('./pages/dashboards/PatientDashboard').then((m) => ({ default: m.PatientDashboard })));

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'SUPER_ADMIN' | 'ADMIN_CLINIC' | 'PROFESIONAL' | 'RECEPCION' | 'PACIENTE'>('ADMIN_CLINIC');
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      const hashView = window.location.hash.replace('#', '');
      const candidate = urlView || hashView;
      const validViews = [
        'landing',
        'booking',
        'login',
        'dashboard',
        'doctor-schedule',
        'reception-booking',
        'clinical-consultation',
        'cash-register',
        'inventory',
        'communications',
        'telegram-bot',
        'patient-portal',
      ];
      if (candidate && validViews.includes(candidate)) {
        return candidate as any;
      }
    }
    return 'landing';
  };

  const [currentView, setCurrentViewState] = useState<
    | 'landing'
    | 'booking'
    | 'login'
    | 'dashboard'
    | 'doctor-schedule'
    | 'reception-booking'
    | 'clinical-consultation'
    | 'cash-register'
    | 'inventory'
    | 'communications'
    | 'telegram-bot'
    | 'patient-portal'
  >(getInitialView);

  const setCurrentView = (view: typeof currentView) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (view === 'landing') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', view);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const [bookingPreselect, setBookingPreselect] = useState<{
    specialtyId?: string;
    serviceId?: string;
  }>({});

  const [supervisedClinic, setSupervisedClinic] = useState<{ id: string; name: string } | null>(null);

  const handleStartBooking = (specialtyId?: string, serviceId?: string) => {
    setBookingPreselect({ specialtyId, serviceId });
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToLogin = () => {
    setSupervisedClinic(null);
    setCurrentView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: { roles: string[] }) => {
    const primaryRole = (user.roles?.[0] as any) || 'ADMIN_CLINIC';
    setActiveRole(primaryRole);
    setSupervisedClinic(null);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboardByRole = () => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        if (supervisedClinic) {
          return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem 3rem 1rem' }}>
              {/* Banner de Supervisión de Sede */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '0.85rem 1.25rem',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                border: '1.5px solid #c4b5fd',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px -2px rgba(124, 58, 237, 0.12)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                    <MaterialIcon name="security" size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#4c1d95' }}>
                      Modo Supervisión Master: {supervisedClinic.name}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#6d28d9' }}>
                      Estás operando con permisos globales sobre la agenda, consultorios y caja de esta sede.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-return-superadmin"
                  onClick={() => setSupervisedClinic(null)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
                    transition: 'transform 120ms ease',
                  }}
                >
                  ← Volver a Red Global Super Admin
                </button>
              </div>

              <ClinicAdminDashboard
                onNavigate={(v) => setCurrentView(v as any)}
                clinicName={supervisedClinic.name}
                adminName="Alessander (Super Admin Global)"
              />
            </div>
          );
        }
        return (
          <SuperAdminDashboard
            onSwitchClinic={(id) => console.log('Switched to clinic:', id)}
            onOpenClinicConsole={(clinic) => {
              setSupervisedClinic(clinic);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigate={(v) => setCurrentView(v as any)}
          />
        );
      case 'ADMIN_CLINIC':
        return (
          <ClinicAdminDashboard
            onNavigate={(v) => setCurrentView(v as any)}
            clinicName="Clínica Sanitas Lima"
            adminName="Alessander (Director Médico)"
          />
        );
      case 'PROFESIONAL':
        return (
          <DoctorDashboard
            doctorName="Dra. María González"
            specialty="Fisioterapia y Rehabilitación"
            onOpenConsultation={() => setCurrentView('clinical-consultation')}
          />
        );
      case 'RECEPCION':
        return (
          <ReceptionDashboard
            onNavigateToBooking={() => setCurrentView('reception-booking')}
            onNavigateToCash={() => setCurrentView('cash-register')}
          />
        );
      case 'PACIENTE':
        return (
          <PatientDashboard
            patientName="Juan Pérez Quispe"
            onBookAppointment={() => handleStartBooking()}
            onLogout={handleNavigateToLogin}
          />
        );
      default:
        return <ClinicAdminDashboard onNavigate={(v) => setCurrentView(v as any)} />;
    }
  };

  const getMobileRole = (): 'public' | 'patient' | 'doctor' | 'receptionist' | 'admin' | 'superadmin' => {
    if (currentView === 'landing' || currentView === 'booking') return 'public';
    if (activeRole === 'PACIENTE') return 'patient';
    if (activeRole === 'PROFESIONAL') return 'doctor';
    if (activeRole === 'RECEPCION') return 'receptionist';
    if (activeRole === 'SUPER_ADMIN') return 'superadmin';
    return 'admin';
  };

  const handleMobileNavigation = (target: string) => {
    if (target === 'home' || target === 'landing') {
      setCurrentView('landing');
    } else if (target === 'booking') {
      handleStartBooking();
    } else if (target === 'patient_dashboard') {
      setActiveRole('PACIENTE');
      setCurrentView('patient-portal');
    } else if (target === 'prescriptions') {
      setActiveRole('PACIENTE');
      setCurrentView('patient-portal');
    } else if (target === 'login') {
      handleNavigateToLogin();
    } else if (target === 'reception_dashboard') {
      setActiveRole('RECEPCION');
      setCurrentView('dashboard');
    } else if (target === 'reception_booking') {
      setActiveRole('RECEPCION');
      setCurrentView('reception-booking');
    } else if (target === 'cash_register') {
      setCurrentView('cash-register');
    } else if (target === 'inventory') {
      setCurrentView('inventory');
    } else if (target === 'doctor_dashboard') {
      setActiveRole('PROFESIONAL');
      setCurrentView('dashboard');
    } else if (target === 'clinical_consultation') {
      setActiveRole('PROFESIONAL');
      setCurrentView('clinical-consultation');
    } else if (target === 'clinic_admin') {
      setActiveRole('ADMIN_CLINIC');
      setCurrentView('dashboard');
    } else if (target === 'telegram_admin') {
      setCurrentView('telegram-bot');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing public landing page or public booking flow, render full screen with mobile nav support
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onStartBooking={handleStartBooking}
          onNavigateLogin={handleNavigateToLogin}
        />
        <MobileBottomNav
          activeView={currentView}
          userRole="public"
          onNavigate={handleMobileNavigation}
          onQuickAction={() => handleStartBooking()}
        />
      </>
    );
  }

  if (currentView === 'booking') {
    return (
      <>
        <Suspense fallback={<div style={{ padding: '2rem' }}><SkeletonLoader count={4} /></div>}>
          <BookingWizard
            onBackToHome={handleBackToLanding}
            preselectedSpecialtyId={bookingPreselect.specialtyId}
            preselectedServiceId={bookingPreselect.serviceId}
          />
        </Suspense>
        <MobileBottomNav
          activeView={currentView}
          userRole="public"
          onNavigate={handleMobileNavigation}
          onQuickAction={() => handleStartBooking()}
        />
      </>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} onBackToHome={handleBackToLanding} />
        <MobileBottomNav
          activeView={currentView}
          userRole="public"
          onNavigate={handleMobileNavigation}
          onQuickAction={() => handleStartBooking()}
        />
      </>
    );
  }

  const handleSpeedDialAction = (action: 'fast_booking' | 'scan_dni' | 'cash_register' | 'clinical_eva' | 'whatsapp') => {
    if (action === 'fast_booking') {
      setActiveRole('RECEPCION');
      setCurrentView('reception-booking');
    } else if (action === 'cash_register') {
      setCurrentView('cash-register');
    } else if (action === 'clinical_eva') {
      setActiveRole('PROFESIONAL');
      setCurrentView('clinical-consultation');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <AppShell
        currentView={currentView}
        activeRole={activeRole}
        onNavigate={(view) => {
          setCurrentView(view as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRoleChange={(role) => {
          setActiveRole(role);
          setSupervisedClinic(null);
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={handleNavigateToLogin}
      >
        <Suspense fallback={<div style={{ padding: '1.5rem' }}><SkeletonLoader count={4} /></div>}>
          {currentView === 'dashboard' && renderDashboardByRole()}

          {currentView === 'doctor-schedule' && (
            <DoctorDashboard
              doctorName="Dra. María González"
              specialty="Fisioterapia y Rehabilitación"
              initialTab="weekly"
              onOpenConsultation={() => setCurrentView('clinical-consultation')}
            />
          )}

          {currentView === 'reception-booking' && (
            <ReceptionBookingPage
              onNavigateToCash={() => setCurrentView('cash-register')}
              onBack={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'clinical-consultation' && (
            <ClinicalConsultationView
              onBack={() => setCurrentView('dashboard')}
              onNavigateToCash={() => setCurrentView('cash-register')}
              onNavigateToBooking={() => setCurrentView('reception-booking')}
            />
          )}

          {currentView === 'cash-register' && (
            <CashRegisterPage
              onNavigateToInventory={() => setCurrentView('inventory')}
              onNavigateToBooking={() => setCurrentView('reception-booking')}
            />
          )}
          {currentView === 'inventory' && (
            <InventoryPage
              onNavigateToCash={() => setCurrentView('cash-register')}
            />
          )}
          {currentView === 'communications' && <CommunicationsPage />}
          {currentView === 'telegram-bot' && <TelegramBotPage />}
          {currentView === 'patient-portal' && (
            <PatientPortal
              onLogout={handleNavigateToLogin}
              onBookAppointment={() => handleStartBooking()}
            />
          )}
        </Suspense>
      </AppShell>

      <SpeedDialFAB onAction={handleSpeedDialAction} />

      <MobileBottomNav
        activeView={currentView}
        userRole={getMobileRole()}
        onNavigate={handleMobileNavigation}
        onQuickAction={() => {
          if (activeRole === 'RECEPCION') {
            setCurrentView('reception-booking');
          } else if (activeRole === 'PROFESIONAL') {
            setCurrentView('clinical-consultation');
          } else {
            handleStartBooking();
          }
        }}
      />
    </>
  );
};

export default App;

import React, { useState } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import { MobileCameraScannerModal } from '../common/MobileCameraScannerModal';
import './MobileBottomNav.css';

export interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  userRole?: 'public' | 'patient' | 'doctor' | 'receptionist' | 'admin' | 'superadmin';
  onQuickAction?: () => void;
  onScanResult?: (data: { dni: string; name: string; service?: string }) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  userRole = 'patient',
  onQuickAction,
  onScanResult,
}) => {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleTabClick = (view: string) => {
    soundEffects.playPop();
    onNavigate(view);
  };

  const handleCenterAction = () => {
    soundEffects.playPop();
    if (userRole === 'receptionist') {
      setScannerOpen(true);
    } else if (onQuickAction) {
      onQuickAction();
    } else {
      onNavigate('booking');
    }
  };

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Navegación Móvil Principal">
        {/* Paciente / Público Navigation */}
        {(userRole === 'patient' || userRole === 'public') && (
          <div className="mobile-nav-grid">
            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'home' || activeView === 'landing' ? 'active' : ''}`}
              onClick={() => handleTabClick('home')}
            >
              <span className="mobile-nav-icon">🏠</span>
              <span className="mobile-nav-label">Inicio</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'appointments' || activeView === 'patient_dashboard' ? 'active' : ''}`}
              onClick={() => handleTabClick('patient_dashboard')}
            >
              <span className="mobile-nav-icon">📅</span>
              <span className="mobile-nav-label">Mis Citas</span>
            </button>

            {/* Central Floating Action Button */}
            <div className="mobile-nav-center-wrap">
              <button
                type="button"
                className="mobile-nav-center-btn"
                onClick={handleCenterAction}
                title="Agendar nueva cita médica"
              >
                <span>➕</span>
              </button>
              <span className="mobile-nav-center-label">Agendar</span>
            </div>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'prescriptions' || activeView === 'recetas' ? 'active' : ''}`}
              onClick={() => handleTabClick('prescriptions')}
            >
              <span className="mobile-nav-icon">💊</span>
              <span className="mobile-nav-label">Recetas</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'profile' || activeView === 'login' ? 'active' : ''}`}
              onClick={() => handleTabClick('login')}
            >
              <span className="mobile-nav-icon">👤</span>
              <span className="mobile-nav-label">Perfil</span>
            </button>
          </div>
        )}

        {/* Recepcionista Navigation */}
        {userRole === 'receptionist' && (
          <div className="mobile-nav-grid">
            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'reception_dashboard' ? 'active' : ''}`}
              onClick={() => handleTabClick('reception_dashboard')}
            >
              <span className="mobile-nav-icon">⏳</span>
              <span className="mobile-nav-label">Espera</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'reception_booking' ? 'active' : ''}`}
              onClick={() => handleTabClick('reception_booking')}
            >
              <span className="mobile-nav-icon">⚡</span>
              <span className="mobile-nav-label">Citas</span>
            </button>

            {/* Central Camera DNI/QR Scanner Button */}
            <div className="mobile-nav-center-wrap">
              <button
                type="button"
                className="mobile-nav-center-btn scanner-highlight"
                onClick={() => setScannerOpen(true)}
                title="Escanear DNI o QR de paciente"
              >
                <span>📷</span>
              </button>
              <span className="mobile-nav-center-label">Escanear</span>
            </div>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'cash_register' ? 'active' : ''}`}
              onClick={() => handleTabClick('cash_register')}
            >
              <span className="mobile-nav-icon">💵</span>
              <span className="mobile-nav-label">Caja</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'inventory' ? 'active' : ''}`}
              onClick={() => handleTabClick('inventory')}
            >
              <span className="mobile-nav-icon">📦</span>
              <span className="mobile-nav-label">Stock</span>
            </button>
          </div>
        )}

        {/* Médico / Doctor Navigation */}
        {userRole === 'doctor' && (
          <div className="mobile-nav-grid">
            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'doctor_dashboard' ? 'active' : ''}`}
              onClick={() => handleTabClick('doctor_dashboard')}
            >
              <span className="mobile-nav-icon">📋</span>
              <span className="mobile-nav-label">Pacientes</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'clinical_consultation' ? 'active' : ''}`}
              onClick={() => handleTabClick('clinical_consultation')}
            >
              <span className="mobile-nav-icon">🩻</span>
              <span className="mobile-nav-label">Ficha EVA</span>
            </button>

            {/* Central Voice Dictation Button */}
            <div className="mobile-nav-center-wrap">
              <button
                type="button"
                className="mobile-nav-center-btn voice-highlight"
                onClick={() => handleTabClick('clinical_consultation')}
                title="Dictado Clínico IA con la voz"
              >
                <span>🎙️</span>
              </button>
              <span className="mobile-nav-center-label">Dictar</span>
            </div>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'schedules' ? 'active' : ''}`}
              onClick={() => handleTabClick('doctor_dashboard')}
            >
              <span className="mobile-nav-icon">📅</span>
              <span className="mobile-nav-label">Mi Turno</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabClick('home')}
            >
              <span className="mobile-nav-icon">⚙️</span>
              <span className="mobile-nav-label">Ajustes</span>
            </button>
          </div>
        )}

        {/* Administrador Navigation */}
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <div className="mobile-nav-grid">
            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'clinic_admin' || activeView === 'superadmin_dashboard' ? 'active' : ''}`}
              onClick={() => handleTabClick('clinic_admin')}
            >
              <span className="mobile-nav-icon">🏢</span>
              <span className="mobile-nav-label">Clínica</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'cash_register' ? 'active' : ''}`}
              onClick={() => handleTabClick('cash_register')}
            >
              <span className="mobile-nav-icon">💵</span>
              <span className="mobile-nav-label">Finanzas</span>
            </button>

            {/* Central Fast Booking Action Button */}
            <div className="mobile-nav-center-wrap">
              <button
                type="button"
                className="mobile-nav-center-btn"
                onClick={handleCenterAction}
                title="Agendar Cita Rápida"
              >
                <span>➕</span>
              </button>
              <span className="mobile-nav-center-label">Nueva</span>
            </div>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'inventory' ? 'active' : ''}`}
              onClick={() => handleTabClick('inventory')}
            >
              <span className="mobile-nav-icon">📦</span>
              <span className="mobile-nav-label">Insumos</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-item ${activeView === 'telegram_admin' ? 'active' : ''}`}
              onClick={() => handleTabClick('telegram_admin')}
            >
              <span className="mobile-nav-icon">🤖</span>
              <span className="mobile-nav-label">Bot</span>
            </button>
          </div>
        )}
      </nav>

      {/* Camera Scanner Modal Triggered from Bottom Nav */}
      <MobileCameraScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(data) => {
          onScanResult?.(data);
        }}
      />
    </>
  );
};

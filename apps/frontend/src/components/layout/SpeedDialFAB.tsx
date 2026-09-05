import React, { useState } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import { MobileCameraScannerModal } from '../common/MobileCameraScannerModal';
import './SpeedDialFAB.css';

interface SpeedDialFABProps {
  onAction: (actionType: 'fast_booking' | 'scan_dni' | 'cash_register' | 'clinical_eva' | 'whatsapp') => void;
}

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const toggleOpen = () => {
    soundEffects.playPop();
    setIsOpen((prev) => !prev);
  };

  const handleActionClick = (actionType: 'fast_booking' | 'scan_dni' | 'cash_register' | 'clinical_eva' | 'whatsapp') => {
    soundEffects.playPop();
    setIsOpen(false);
    if (actionType === 'scan_dni') {
      setScannerOpen(true);
    } else {
      onAction(actionType);
    }
  };

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          className="speed-dial-backdrop"
          onClick={() => {
            soundEffects.playPop();
            setIsOpen(false);
          }}
        />
      )}

      <div className="speed-dial-container">
        {/* Expanded Action Items */}
        <div className={`speed-dial-menu ${isOpen ? 'speed-dial-menu-open' : ''}`}>
          <div className="speed-dial-item-wrap" style={{ transitionDelay: isOpen ? '0.12s' : '0s' }}>
            <span className="speed-dial-label">⚡ Cita Express</span>
            <button
              type="button"
              className="speed-dial-btn speed-dial-btn-sky"
              onClick={() => handleActionClick('fast_booking')}
              title="Agendar Cita Rápida en Mostrador"
            >
              ⚡
            </button>
          </div>

          <div className="speed-dial-item-wrap" style={{ transitionDelay: isOpen ? '0.08s' : '0s' }}>
            <span className="speed-dial-label">📷 Escáner DNI / QR</span>
            <button
              type="button"
              className="speed-dial-btn speed-dial-btn-emerald"
              onClick={() => handleActionClick('scan_dni')}
              title="Escanear DNI o QR de Paciente"
            >
              📷
            </button>
          </div>

          <div className="speed-dial-item-wrap" style={{ transitionDelay: isOpen ? '0.04s' : '0s' }}>
            <span className="speed-dial-label">🏦 Abrir Caja Chica</span>
            <button
              type="button"
              className="speed-dial-btn speed-dial-btn-amber"
              onClick={() => handleActionClick('cash_register')}
              title="Aperturar o Consultar Caja Chica"
            >
              🏦
            </button>
          </div>

          <div className="speed-dial-item-wrap" style={{ transitionDelay: '0s' }}>
            <span className="speed-dial-label">🩻 Ficha Dolor EVA</span>
            <button
              type="button"
              className="speed-dial-btn speed-dial-btn-purple"
              onClick={() => handleActionClick('clinical_eva')}
              title="Abrir Mapeo de Dolor EVA"
            >
              🩻
            </button>
          </div>
        </div>

        {/* Master FAB Trigger Button */}
        <button
          type="button"
          className={`speed-dial-master-btn ${isOpen ? 'speed-dial-master-open' : ''}`}
          onClick={toggleOpen}
          aria-label="Abrir menú de accesos rápidos"
          title="Accesos Rápidos Clínicos"
        >
          <span className="speed-dial-icon-normal">⚡</span>
          <span className="speed-dial-icon-close">✕</span>
        </button>
      </div>

      {/* Optical Scanner Modal */}
      <MobileCameraScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={() => {
          onAction('fast_booking');
        }}
      />
    </>
  );
};

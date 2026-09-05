import React, { useState, useRef, useEffect } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import './MobileCameraScannerModal.css';

interface ScannedPatientData {
  dni: string;
  name: string;
  appointmentCode?: string;
  service?: string;
}

interface MobileCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: ScannedPatientData) => void;
  scanType?: 'dni' | 'qr' | 'both';
}

export const MobileCameraScannerModal: React.FC<MobileCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Back camera on mobile
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Cámara no soportada en este navegador. Usando modo de simulación inteligente.');
      }
    } catch {
      setCameraError('Permiso de cámara no concedido. Puedes usar la simulación táctil rápida.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const triggerMockScan = (preset: 'dni_maria' | 'qr_carlos' | 'dni_jorge') => {
    soundEffects.playCashRegister();
    setScanning(false);

    let data: ScannedPatientData;
    if (preset === 'dni_maria') {
      data = {
        dni: '45892110',
        name: 'María Santos López',
        appointmentCode: 'CITA-2026-081',
        service: 'Terapia Manual Ortopédica',
      };
    } else if (preset === 'qr_carlos') {
      data = {
        dni: '72109845',
        name: 'Carlos Benítez Vega',
        appointmentCode: 'CITA-2026-104',
        service: 'Rehabilitación Deportiva',
      };
    } else {
      data = {
        dni: '41209384',
        name: 'Jorge Ramírez Castro',
        appointmentCode: 'CITA-2026-192',
        service: 'Descarga Muscular Completa',
      };
    }

    setTimeout(() => {
      onScanSuccess(data);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="scanner-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="scanner-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="scanner-header">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <div>
              <h3 className="font-bold text-sm text-white">Escáner Óptico de DNI / QR</h3>
              <p className="text-[11px] text-slate-300">Apunta la cámara al código de barras o QR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder Window */}
        <div className="scanner-viewport-box">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="scanner-video-element"
            />
          ) : (
            <div className="scanner-simulated-preview">
              <div className="text-center p-6 space-y-2">
                <span className="text-4xl animate-bounce">📱</span>
                <p className="text-xs text-slate-300 font-medium max-w-xs">
                  {cameraError || 'Iniciando cámara de alta velocidad...'}
                </p>
              </div>
            </div>
          )}

          {/* Laser Scanner Animation Overlay */}
          <div className="scanner-laser-box">
            <div className="scanner-corner corner-top-left" />
            <div className="scanner-corner corner-top-right" />
            <div className="scanner-corner corner-bottom-left" />
            <div className="scanner-corner corner-bottom-right" />
            {scanning && <div className="scanner-laser-line" />}
          </div>

          <div className="scanner-badge-pill">
            <span>● Sensor Óptico Activo</span>
          </div>
        </div>

        {/* Quick Simulation / Demo Buttons for Instant Testing */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold text-center">
            O toca para simular detección instantánea:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => triggerMockScan('dni_maria')}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all"
            >
              <span>🪪</span>
              <span className="truncate w-full text-center">DNI María</span>
            </button>

            <button
              type="button"
              onClick={() => triggerMockScan('qr_carlos')}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all"
            >
              <span>🏁</span>
              <span className="truncate w-full text-center">QR Carlos</span>
            </button>

            <button
              type="button"
              onClick={() => triggerMockScan('dni_jorge')}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-all"
            >
              <span>🪪</span>
              <span className="truncate w-full text-center">DNI Jorge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

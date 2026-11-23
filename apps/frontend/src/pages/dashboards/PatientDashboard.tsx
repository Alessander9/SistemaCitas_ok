import React, { useState, useRef } from 'react';
import './PatientDashboard.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  usePatientDashboard,
  PatientHeader,
  NextAppointmentCard,
  PatientHealthSummary,
  PatientHistorySection,
  PatientHistoryTab,
  RescheduleModal,
  CancelAppointmentModal,
  QuickBookingModal,
  PatientProfileModal,
} from '../../components/patient';

interface PatientDashboardProps {
  patientName?: string;
  onBookAppointment: () => void;
  onLogout?: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patientName = 'Juan Pérez Quispe',
  onBookAppointment,
  onLogout,
}) => {
  const {
    profile,
    upcomingAppointment,
    pastAppointments,
    prescriptions,
    activePrescription,
    receipts,
    treatment,
    toastMessage,
    clearToast,
    showToast,
    rescheduleAppointment,
    cancelAppointment,
    bookNewAppointment,
  } = usePatientDashboard(patientName);

  const [activeTab, setActiveTab] = useState<PatientHistoryTab>('appointments');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);

  const handleOpenBooking = () => {
    onBookAppointment?.();
    setIsBookingOpen(true);
  };

  const handleJumpToPrescriptions = () => {
    setActiveTab('prescriptions');
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pd-shell">
      {/* Toast de confirmación no bloqueante */}
      {toastMessage && (
        <div className="pd-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button type="button" onClick={clearToast} aria-label="Cerrar aviso">
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Header limpio y directo */}
      <PatientHeader
        patientName={patientName}
        onNewBooking={handleOpenBooking}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={onLogout}
      />

      {/* 2. Bloque Principal: Tu Próxima Cita */}
      <NextAppointmentCard
        appointment={upcomingAppointment}
        onReschedule={() => setIsRescheduleOpen(true)}
        onCancel={() => setIsCancelOpen(true)}
        onAddToCalendar={() => showToast('Recordatorio añadido a tu calendario.')}
        onBookNew={handleOpenBooking}
      />

      {/* 3. Resumen de Hoy: Mi Progreso + Cuidados / Receta Vigente */}
      <PatientHealthSummary
        treatment={treatment}
        activePrescription={activePrescription}
        onDownloadPrescription={(rx) =>
          showToast(`Descargando receta de ${rx.medication} (${rx.code}) en PDF...`)
        }
        onViewAllPrescriptions={handleJumpToPrescriptions}
      />

      {/* 4. Mis Documentos e Historial (3 Pestañas Limpias) */}
      <div ref={historyRef}>
        <PatientHistorySection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pastAppointments={pastAppointments}
          prescriptions={prescriptions}
          receipts={receipts}
          onDownloadVisitSummary={(apt) =>
            showToast(`Descargando resumen de tu visita "${apt.title}" (PDF)...`)
          }
          onDownloadPrescription={(rx) =>
            showToast(`Descargando receta de ${rx.medication} (${rx.code}) en PDF...`)
          }
          onDownloadReceipt={(rec) =>
            showToast(`Descargando boleta ${rec.number} (${rec.amount}) en PDF...`)
          }
        />
      </div>

      {/* Modales de Autoservicio */}
      {isRescheduleOpen && upcomingAppointment && (
        <RescheduleModal
          appointment={upcomingAppointment}
          onClose={() => setIsRescheduleOpen(false)}
          onConfirm={rescheduleAppointment}
        />
      )}

      {isCancelOpen && (
        <CancelAppointmentModal
          onClose={() => setIsCancelOpen(false)}
          onConfirm={cancelAppointment}
        />
      )}

      {isBookingOpen && (
        <QuickBookingModal
          onClose={() => setIsBookingOpen(false)}
          onBooked={bookNewAppointment}
        />
      )}

      {isProfileOpen && (
        <PatientProfileModal
          profile={profile}
          onClose={() => setIsProfileOpen(false)}
          onDownloadFullHistory={() => {
            showToast('Generando tu historial médico completo en PDF...');
            setIsProfileOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PatientDashboard;

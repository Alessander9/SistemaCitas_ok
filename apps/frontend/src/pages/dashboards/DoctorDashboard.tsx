import React, { useState } from 'react';
import './DoctorDashboard.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { VoiceConsultationAssistant } from '../../components/clinical/VoiceConsultationAssistant';
import {
  useDoctorDashboard,
  DoctorHeader,
  ActiveConsultationHero,
  DoctorQueueList,
  DoctorWeeklySchedule,
  QuickClinicalNoteModal,
  BlockSlotModal,
  DoctorMainView,
  DoctorQueuePatient,
} from '../../components/doctor';

interface DoctorDashboardProps {
  doctorName?: string;
  specialty?: string;
  initialTab?: DoctorMainView;
  onOpenConsultation: (patient?: DoctorQueuePatient) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorName = 'Dra. María González',
  specialty = 'Fisioterapia y Rehabilitación',
  initialTab = 'queue',
  onOpenConsultation,
}) => {
  const {
    mainView,
    setMainView,
    filteredQueue,
    activePatient,
    nextWaitingPatient,
    counts,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedPatient,
    setSelectedPatient,
    weeklySchedule,
    selectedDayKey,
    setSelectedDayKey,
    currentDaySchedule,
    weeklyStats,
    toastMessage,
    clearToast,
    callPatientToConsultation,
    completeConsultation,
    saveQuickNote,
    applyVoiceData,
    blockWeeklySlot,
    unblockWeeklySlot,
  } = useDoctorDashboard(initialTab);

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const voiceTarget = selectedPatient || activePatient;

  return (
    <div className="dd-shell">
      {/* Toast de confirmación */}
      {toastMessage && (
        <div className="dd-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button type="button" onClick={clearToast} aria-label="Cerrar aviso">
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Header Clínico Limpio */}
      <DoctorHeader
        doctorName={doctorName}
        specialty={specialty}
        mainView={mainView}
        todayCount={counts.total}
        onChangeView={setMainView}
        onOpenConsultation={() => onOpenConsultation(activePatient || nextWaitingPatient || filteredQueue[0])}
      />

      {/* 2. Vista Hoy: Hero de Consulta Activa + Cola Compacta */}
      {mainView === 'queue' && (
        <>
          <ActiveConsultationHero
            activePatient={activePatient}
            nextWaitingPatient={nextWaitingPatient}
            onOpenConsultation={(patient) => onOpenConsultation(patient || activePatient || nextWaitingPatient || filteredQueue[0])}
            onOpenQuickNote={setSelectedPatient}
            onComplete={completeConsultation}
            onCallNext={(patientId) => {
              callPatientToConsultation(patientId);
              const target = filteredQueue.find((p) => p.id === patientId) || nextWaitingPatient;
              if (target) {
                onOpenConsultation(target);
              }
            }}
          />

          <DoctorQueueList
            patients={filteredQueue}
            counts={counts}
            filter={filter}
            searchTerm={searchTerm}
            onFilterChange={setFilter}
            onSearchChange={setSearchTerm}
            onOpenQuickNote={setSelectedPatient}
            onCallPatient={(patient) => {
              if (patient.status !== 'completed') {
                callPatientToConsultation(patient.id);
              }
              onOpenConsultation(patient);
            }}
          />
        </>
      )}

      {/* 3. Vista Semana: Agenda Semanal Reactiva */}
      {mainView === 'weekly' && (
        <DoctorWeeklySchedule
          days={weeklySchedule}
          selectedDayKey={selectedDayKey}
          currentDay={currentDaySchedule}
          stats={weeklyStats}
          onSelectDay={setSelectedDayKey}
          onOpenBlockModal={() => setIsBlockModalOpen(true)}
          onUnblockSlot={unblockWeeklySlot}
          onOpenConsultation={(slot) => {
            if (slot && slot.patient) {
              const patientName = slot.patient;
              const matching = filteredQueue.find(
                (p) => p.patientName.toLowerCase() === patientName.toLowerCase()
              );
              if (matching) {
                if (matching.status !== 'completed') {
                  callPatientToConsultation(matching.id);
                }
                onOpenConsultation(matching);
                return;
              }
              onOpenConsultation({
                id: slot.id,
                time: slot.time,
                patientName: patientName,
                initials: patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
                age: '35 años',
                dni: '78291044',
                room: slot.room || 'Box 101',
                service: slot.service || 'Terapia Programada',
                reason: slot.service || 'Control médico programado',
                status: 'in_progress',
                evaLast: 5,
                evaTrend: 'equal',
                sessionCurrent: 1,
                sessionTotal: 5,
                sessionLabel: 'Sesión programada',
                treatmentPhase: 'Evaluación y Tratamiento',
                appliedTechniques: ['Terapia Manual'],
                notes: slot.note || 'Cita programada en agenda semanal.',
                homeRecommendations: 'Continuar pautas médicas indicadas.',
              });
              return;
            }
            onOpenConsultation(activePatient || filteredQueue[0]);
          }}
        />
      )}

      {/* Modales */}
      {selectedPatient && (
        <QuickClinicalNoteModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onSave={saveQuickNote}
          onSaveAndOpenFull={(updated) => {
            saveQuickNote(updated);
            onOpenConsultation(updated);
          }}
        />
      )}

      {isBlockModalOpen && (
        <BlockSlotModal
          dayLabel={currentDaySchedule.date}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirm={(time, reason) => blockWeeklySlot(currentDaySchedule.key, time, reason)}
        />
      )}

      {/* Asistente Clínico Bidireccional por Voz conectado al paciente activo */}
      <VoiceConsultationAssistant
        onApplyVoiceData={applyVoiceData}
        activeContext="quick-note"
        currentData={
          voiceTarget
            ? {
                chiefComplaint: voiceTarget.reason,
                painScale: voiceTarget.evaLast,
                techniques: voiceTarget.appliedTechniques,
                notes: voiceTarget.notes,
                homeRecommendations: voiceTarget.homeRecommendations,
              }
            : undefined
        }
      />
    </div>
  );
};

export default DoctorDashboard;

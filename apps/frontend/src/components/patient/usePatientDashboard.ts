import { useState, useCallback, useEffect } from 'react';
import { getAuthToken, getActiveClinicId } from '../../utils/storage';
import {
  PatientUpcomingAppointment,
  PatientPastAppointment,
  PatientPrescription,
  PatientReceipt,
  PatientTreatmentProgress,
  PatientProfileInfo,
  NewBookingInput,
} from './types';

const INITIAL_UPCOMING: PatientUpcomingAppointment = {
  id: 'apt-next-1',
  title: 'Terapia Manual Ortopédica',
  durationLabel: '45 min',
  doctorName: 'Dra. María González',
  doctorSpecialty: 'Fisioterapia y Rehabilitación',
  doctorInitials: 'MG',
  dateLabel: 'Jueves, 10 de Septiembre',
  timeLabel: '10:00 AM',
  countdownLabel: 'En 7 días',
  mode: 'presencial',
  locationLabel: 'Sede San Isidro · Box 102 (Piso 1)',
  status: 'confirmed',
};

const INITIAL_PAST_APPOINTMENTS: PatientPastAppointment[] = [
  {
    id: 'h-1',
    day: '24',
    month: 'Ago',
    fullDate: '24 de Agosto · 09:30 AM',
    title: 'Evaluación Inicial de Columna Lumbar',
    doctorName: 'Dra. María González',
    summary: 'Inicio de plan de 10 sesiones de rehabilitación lumbar con terapia manual.',
  },
  {
    id: 'h-2',
    day: '18',
    month: 'Ago',
    fullDate: '18 de Agosto · 11:00 AM',
    title: 'Sesión de Terapia Manual y Descompresión',
    doctorName: 'Lic. Andrés Paredes',
    summary: 'Aplicación de calor terapéutico y liberación muscular con alivio inmediato.',
  },
];

const INITIAL_PRESCRIPTIONS: PatientPrescription[] = [
  {
    id: 'rx-1',
    code: 'RX-2026-088',
    medication: 'Ibuprofeno 400mg',
    schedule: 'Cada 8 horas por 3 días',
    instructions: 'Tomar después de las comidas. Aplicar compresas de hielo 15 min al llegar a casa.',
    issuedDate: '10 Sep 2026',
    validUntil: '15 Sep 2026',
    doctorName: 'Dra. María González',
    isActive: true,
  },
  {
    id: 'rx-2',
    code: 'RX-2026-042',
    medication: 'Complejo B Forte (3 dosis)',
    schedule: '1 ampolla interdiaria',
    instructions: 'Aplicación en tópico de enfermería de la clínica.',
    issuedDate: '24 Ago 2026',
    validUntil: '30 Ago 2026',
    doctorName: 'Dra. María González',
    isActive: false,
  },
];

const INITIAL_RECEIPTS: PatientReceipt[] = [
  {
    id: 'rec-1',
    number: 'B001-000491',
    concept: 'Sesión de Fisioterapia',
    date: '24 Ago 2026',
    paymentMethod: 'Tarjeta Visa',
    amount: 'S/ 80.00',
  },
  {
    id: 'rec-2',
    number: 'B001-000420',
    concept: 'Consulta Inicial Diagnóstica',
    date: '18 Ago 2026',
    paymentMethod: 'Yape',
    amount: 'S/ 120.00',
  },
];

const INITIAL_TREATMENT: PatientTreatmentProgress = {
  title: 'Rehabilitación de Columna Lumbar',
  completedSessions: 8,
  totalSessions: 10,
  startedDate: '12 Ago 2026',
  homeTip: 'Realiza estiramientos suaves de espalda baja 10 min por la noche y evita cargar peso.',
  painStart: 8,
  painCurrent: 2,
  checkpoints: [
    { session: 'Sesión 1', date: '18 Ago', score: 8, level: 'high', label: 'Dolor alto', note: 'Inicio del tratamiento' },
    { session: 'Sesión 3', date: '25 Ago', score: 6, level: 'mid', label: 'Moderado', note: 'Mejoría al flexionar' },
    { session: 'Sesión 5', date: '01 Sep', score: 4, level: 'mid', label: 'Leve', note: 'Mayor movilidad diaria' },
    { session: 'Sesión 8', date: '08 Sep', score: 2, level: 'low', label: 'Mínimo', note: 'Muy cerca del alta' },
  ],
};

function getInitials(name: string): string {
  const parts = name.replace(/^(Dra?\.|Lic\.)\s*/i, '').trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export function usePatientDashboard(patientName: string) {
  const [upcomingAppointment, setUpcomingAppointment] = useState<PatientUpcomingAppointment | null>(
    INITIAL_UPCOMING,
  );
  const [pastAppointments] = useState<PatientPastAppointment[]>(INITIAL_PAST_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>(INITIAL_PRESCRIPTIONS);
  const [receipts] = useState<PatientReceipt[]>(INITIAL_RECEIPTS);
  const [treatment] = useState<PatientTreatmentProgress>(INITIAL_TREATMENT);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const profile: PatientProfileInfo = {
    fullName: patientName,
    documentNumber: '74918230',
    clinicName: 'Clínica VitalSalud · Sede San Isidro',
    email: 'paciente@clinica.pe',
    phone: '+51 987 654 321',
    bloodType: 'O+',
    allergies: 'Ninguna registrada',
    emergencyContact: 'María Quispe · +51 991 223 344',
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Intento silencioso de hidratar recetas reales si hay sesión autenticada con patientId
  useEffect(() => {
    const token = getAuthToken();
    const storedPatientId = localStorage.getItem('patient_id');
    if (!token || !storedPatientId) return;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    const clinicId = getActiveClinicId();
    if (clinicId) {
      headers['x-clinic-id'] = clinicId;
    }

    fetch(`/api/clinical/prescriptions/patient/${encodeURIComponent(storedPatientId)}`, {
      headers,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((rows) => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        const mapped: PatientPrescription[] = rows.map(
          (
            rx: {
              id?: string;
              createdAt?: string;
              notes?: string;
              instructions?: string;
              validUntil?: string;
              professionalName?: string;
              medications?: Array<{ medicationName?: string; dose?: string; frequency?: string; duration?: string }>;
            },
            idx: number,
          ) => {
          const firstMed = Array.isArray(rx.medications) ? rx.medications[0] : null;
          return {
            id: rx.id || `rx-api-${idx}`,
            code: `RX-${String(rx.id || idx).slice(0, 8).toUpperCase()}`,
            medication: firstMed
              ? `${firstMed.medicationName} ${firstMed.dose || ''}`.trim()
              : 'Prescripción médica',
            schedule: firstMed
              ? `${firstMed.frequency || ''} ${firstMed.duration || ''}`.trim()
              : 'Según indicación médica',
            instructions: rx.instructions || 'Seguir indicaciones del médico tratante.',
            issuedDate: rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('es-PE') : 'Reciente',
            validUntil: rx.validUntil || 'Vigente',
            doctorName: rx.professionalName || 'Médico tratante',
            isActive: idx === 0,
          };
        });
        setPrescriptions(mapped);
      })
      .catch(() => {
        // Mantiene datos locales sin interrumpir al paciente
      });
  }, []);

  const rescheduleAppointment = useCallback(
    (newDate: string, newTime: string) => {
      setUpcomingAppointment((prev) =>
        prev
          ? {
              ...prev,
              dateLabel: newDate,
              timeLabel: newTime,
              countdownLabel: 'Reprogramada',
            }
          : prev,
      );
      showToast(`Tu cita fue reprogramada para el ${newDate} a las ${newTime}.`);
    },
    [showToast],
  );

  const cancelAppointment = useCallback(
    (_reason: string) => {
      setUpcomingAppointment(null);
      showToast('Tu cita ha sido cancelada. Puedes agendar una nueva cuando desees.');
    },
    [showToast],
  );

  const bookNewAppointment = useCallback(
    (input: NewBookingInput) => {
      setUpcomingAppointment({
        id: `apt-${Date.now()}`,
        title: input.serviceTitle,
        durationLabel: input.durationLabel,
        doctorName: input.doctorName,
        doctorSpecialty: input.doctorSpecialty,
        doctorInitials: getInitials(input.doctorName),
        dateLabel: input.dateLabel,
        timeLabel: input.timeLabel,
        countdownLabel: 'Recién agendada',
        mode: input.mode,
        locationLabel:
          input.mode === 'presencial'
            ? 'Sede San Isidro · Box 102'
            : 'Teleconsulta por videollamada',
        status: 'confirmed',
      });
      showToast(`Cita confirmada para el ${input.dateLabel} a las ${input.timeLabel}.`);
    },
    [showToast],
  );

  const activePrescription = prescriptions.find((rx) => rx.isActive) || null;

  return {
    profile,
    upcomingAppointment,
    pastAppointments,
    prescriptions,
    activePrescription,
    receipts,
    treatment,
    toastMessage,
    clearToast: () => setToastMessage(null),
    showToast,
    rescheduleAppointment,
    cancelAppointment,
    bookNewAppointment,
  };
}

import { useState, useMemo, useCallback, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api/http';
import { ParsedClinicalVoiceData } from '../clinical/VoiceConsultationAssistant';
import { soundEffects } from '../../utils/soundEffects';
import {
  DoctorMainView,
  DoctorQueueFilter,
  DoctorQueuePatient,
  WeeklyDaySchedule,
} from './types';

const INITIAL_QUEUE: DoctorQueuePatient[] = [
  {
    id: 'p-1',
    time: '09:00 AM',
    patientName: 'Carlos Benítez Vega',
    initials: 'CB',
    age: '34 años',
    dni: '72109845',
    room: 'Box 101',
    service: 'Rehabilitación Deportiva',
    reason: 'Desgarro muscular en isquiotibiales derecho',
    status: 'in_progress',
    evaLast: 6,
    evaTrend: 'down',
    sessionCurrent: 3,
    sessionTotal: 5,
    sessionLabel: 'Sesión 3 de 5',
    treatmentPhase: 'Fase 2 · Restauración de Movilidad y Rango',
    appliedTechniques: ['Terapia Manual', 'Ultrasonido', 'Electroterapia TENS'],
    notes: 'Paciente refiere disminución del dolor punzante tras termoterapia.',
    homeRecommendations: 'Aplicar compresas frías 15 min y estiramientos suaves de isquiotibiales.',
    physicalExam: 'Palpación dolorosa moderada en vientre muscular de bíceps femoral derecho. Movilidad de rodilla conservada, molestia leve a flexión resistida.',
    diagnosis: 'S76.3 - Traumatismo de músculo y tendón isquiotibial posterior',
    emergencyContact: 'Patricia Vega (Madre) — 991 223 344',
    meds: [
      { medicationName: 'Ibuprofeno 400mg', dose: '1 comprimido', route: 'Oral', frequency: 'Cada 8 horas después de comidas', duration: 'Por 3 días' },
    ],
  },
  {
    id: 'p-2',
    time: '10:00 AM',
    patientName: 'Rosa Morales Silva',
    initials: 'RM',
    age: '48 años',
    dni: '09843211',
    room: 'Box 102',
    service: 'Terapia Manual Ortopédica',
    reason: 'Lumbalgia aguda con irradiación ciática',
    status: 'waiting',
    evaLast: 8,
    evaTrend: 'equal',
    sessionCurrent: 1,
    sessionTotal: 10,
    sessionLabel: 'Sesión 1 de 10',
    treatmentPhase: 'Fase 1 · Control del Dolor e Inflamación Aguda',
    appliedTechniques: ['Terapia Manual', 'Crioterapia'],
    notes: 'Primera sesión post evaluación diagnóstica. Movilidad lumbar reducida.',
    homeRecommendations: 'Reposo relativo y evitar flexiones lumbares bruscas.',
    physicalExam: 'Prueba de Lasègue positiva a 45° pierna derecha. Contractura severa en paravertebrales lumbares L4-S1. Reflejo rotuliano conservado.',
    diagnosis: 'M54.4 - Lumbago con ciática',
    emergencyContact: 'Manuel Silva (Hermano) — 987 112 233',
    meds: [
      { medicationName: 'Celecoxib 200mg', dose: '1 cápsula', route: 'Oral', frequency: 'Cada 12 horas', duration: 'Por 5 días' },
      { medicationName: 'Pregabalina 75mg', dose: '1 cápsula', route: 'Oral', frequency: 'Cada 24 horas (noche)', duration: 'Por 7 días' },
    ],
  },
  {
    id: 'p-3',
    time: '11:15 AM',
    patientName: 'Jorge Ramírez Castro',
    initials: 'JR',
    age: '29 años',
    dni: '41209384',
    room: 'Box 101',
    service: 'Descarga Muscular Completa',
    reason: 'Sobrecarga en gemelos y sóleo post-maratón',
    status: 'waiting',
    evaLast: 4,
    evaTrend: 'down',
    sessionCurrent: 1,
    sessionTotal: 1,
    sessionLabel: 'Sesión única',
    treatmentPhase: 'Fase 4 · Readaptación Funcional y Prevención',
    appliedTechniques: ['Terapia Manual', 'Kinesiotape'],
    notes: 'Sobrecarga simétrica bilateral. Sin desgarro aparente.',
    homeRecommendations: 'Hidratación abundante y estiramientos suaves post-carrera.',
    physicalExam: 'Hipertonía palpable en tríceps sural bilateral y sóleo. Sin equimosis ni dolor a la palpación del tendón calcáneo.',
    diagnosis: 'M62.6 - Distensión y sobrecarga muscular de pantorrilla',
    emergencyContact: 'Andrea Castro (Esposa) — 976 543 210',
    meds: [
      { medicationName: 'Magnesio Quelado 400mg', dose: '1 comprimido', route: 'Oral', frequency: 'Cada 24 horas', duration: 'Por 14 días' },
      { medicationName: 'Gel crioterapéutico árnica', dose: 'Aplicación tópica', route: 'Tópica', frequency: 'Cada 8 horas', duration: 'Por 5 días' },
    ],
  },
  {
    id: 'p-4',
    time: '08:00 AM',
    patientName: 'Lucía Fernández Quispe',
    initials: 'LF',
    age: '52 años',
    dni: '78341902',
    room: 'Box 101',
    service: 'Evaluación y Diagnóstico Inicial',
    reason: 'Tendinitis de manguito rotador hombro izquierdo',
    status: 'completed',
    evaLast: 7,
    evaTrend: 'equal',
    sessionCurrent: 1,
    sessionTotal: 1,
    sessionLabel: 'Evaluación completada',
    treatmentPhase: 'Fase 1 · Control del Dolor e Inflamación Aguda',
    appliedTechniques: ['Evaluación', 'Termoterapia'],
    notes: 'Se prescriben 10 sesiones de ultrasonido y ejercicios de fortalecimiento.',
    homeRecommendations: 'Comenzar ciclo de fisioterapia 3 veces por semana.',
    physicalExam: 'Arco doloroso de hombro izquierdo entre 70° y 120°. Maniobras de Neer y Hawkins positivas. Fuerza motora 4/5.',
    diagnosis: 'M75.1 - Síndrome del manguito rotador izquierdo',
    emergencyContact: 'Ernesto Fernández (Hijo) — 998 765 432',
    meds: [
      { medicationName: 'Meloxicam 15mg', dose: '1 tableta', route: 'Oral', frequency: 'Cada 24 horas con alimentos', duration: 'Por 7 días' },
    ],
  },
];

const INITIAL_WEEKLY_SCHEDULE: WeeklyDaySchedule[] = [
  {
    key: 'lun',
    date: 'Lunes 11 de Septiembre',
    dayName: 'Lun',
    dayNum: '11',
    slots: [
      { id: 'l-1', time: '08:30 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Mariana Ríos Soto', service: 'Rehabilitación Post-Cirugía LCA' },
      { id: 'l-2', time: '09:45 AM', period: 'AM', room: 'Box 102', status: 'occupied', patient: 'Gonzalo Vera Paz', service: 'Terapia Manual Columna' },
      { id: 'l-3', time: '11:00 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Carla Quispe Ramos', service: 'Electroterapia y Magneto' },
      { id: 'l-4', time: '12:15 PM', period: 'AM', room: 'Box 101', status: 'available', note: 'Horario libre' },
      { id: 'l-5', time: '03:30 PM', period: 'PM', room: 'Box 103', status: 'occupied', patient: 'Eduardo Flores Diez', service: 'Descarga Muscular Deportiva' },
      { id: 'l-6', time: '05:00 PM', period: 'PM', room: 'Box 101', status: 'available', note: 'Horario libre' },
    ],
  },
  {
    key: 'mar',
    date: 'Martes 12 de Septiembre',
    dayName: 'Mar',
    dayNum: '12',
    slots: [
      { id: 'ma-1', time: '08:00 AM', period: 'AM', room: 'Gimnasio', status: 'occupied', patient: 'Renato Silva Cano', service: 'Kinesiología Funcional' },
      { id: 'ma-2', time: '09:30 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Elena Campos Lara', service: 'Terapia Manual Cervical' },
      { id: 'ma-3', time: '11:00 AM', period: 'AM', room: 'Box 101', status: 'blocked', note: 'Capacitación Interna' },
      { id: 'ma-4', time: '03:00 PM', period: 'PM', room: 'Box 102', status: 'occupied', patient: 'Sofía Navarro Cruz', service: 'Ultrasonido Tendinitis Hombro' },
      { id: 'ma-5', time: '04:30 PM', period: 'PM', room: 'Box 101', status: 'occupied', patient: 'Mateo Cárdenas Vega', service: 'Rehabilitación de Tobillo' },
    ],
  },
  {
    key: 'mie',
    date: 'Miércoles 13 de Septiembre (Hoy)',
    dayName: 'Mié',
    dayNum: '13',
    isToday: true,
    slots: [
      { id: 'mi-1', time: '08:00 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Lucía Fernández Quispe', service: 'Evaluación Inicial', note: 'Atendida' },
      { id: 'mi-2', time: '09:00 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Carlos Benítez Vega', service: 'Rehabilitación Deportiva (3/5)', note: 'En consulta' },
      { id: 'mi-3', time: '10:00 AM', period: 'AM', room: 'Box 102', status: 'occupied', patient: 'Rosa Morales Silva', service: 'Terapia Manual Ortopédica', note: 'En espera' },
      { id: 'mi-4', time: '11:15 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Jorge Ramírez Castro', service: 'Descarga Muscular Completa', note: 'Confirmado' },
      { id: 'mi-5', time: '12:30 PM', period: 'AM', room: 'Box 101', status: 'available', note: 'Horario libre' },
      { id: 'mi-6', time: '03:00 PM', period: 'PM', room: 'Box 103', status: 'occupied', patient: 'Andrés Mendoza Alva', service: 'Punción Seca y Electroterapia' },
      { id: 'mi-7', time: '04:30 PM', period: 'PM', room: 'Box 101', status: 'occupied', patient: 'Valeria Paredes Soto', service: 'Reeducación Postural Global' },
      { id: 'mi-8', time: '06:00 PM', period: 'PM', room: 'Box 101', status: 'blocked', note: 'Junta Clínica' },
    ],
  },
  {
    key: 'jue',
    date: 'Jueves 14 de Septiembre',
    dayName: 'Jue',
    dayNum: '14',
    slots: [
      { id: 'j-1', time: '08:30 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Diego Herrera Solís', service: 'Fisioterapia Lumbar Avanzada' },
      { id: 'j-2', time: '10:00 AM', period: 'AM', room: 'Box 102', status: 'occupied', patient: 'Camila Peña Bravo', service: 'Mapeo Postural y Ergonómico' },
      { id: 'j-3', time: '11:30 AM', period: 'AM', room: 'Box 101', status: 'available', note: 'Horario libre' },
      { id: 'j-4', time: '03:00 PM', period: 'PM', room: 'Box 101', status: 'occupied', patient: 'Víctor Toledo Mora', service: 'Terapia Manual y Crioterapia' },
      { id: 'j-5', time: '05:00 PM', period: 'PM', room: 'Box 103', status: 'available', note: 'Horario libre' },
    ],
  },
  {
    key: 'vie',
    date: 'Viernes 15 de Septiembre',
    dayName: 'Vie',
    dayNum: '15',
    slots: [
      { id: 'v-1', time: '08:00 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Patricia Gil Díaz', service: 'Control y Alta de Fisioterapia' },
      { id: 'v-2', time: '09:15 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Raúl Montenegro Vega', service: 'Rehabilitación Manguito Rotador' },
      { id: 'v-3', time: '10:45 AM', period: 'AM', room: 'Box 102', status: 'occupied', patient: 'Fabiola Ruiz Pinto', service: 'Terapia Miofascial Instrumental' },
      { id: 'v-4', time: '12:00 PM', period: 'AM', room: 'Box 101', status: 'available', note: 'Horario libre' },
      { id: 'v-5', time: '03:30 PM', period: 'PM', room: 'Gimnasio', status: 'occupied', patient: 'Joaquín Rivas Castro', service: 'Descarga de Piernas y TENS' },
      { id: 'v-6', time: '05:00 PM', period: 'PM', room: 'Box 101', status: 'occupied', patient: 'Estela Morales Neyra', service: 'Evaluación de Columna' },
    ],
  },
  {
    key: 'sab',
    date: 'Sábado 16 de Septiembre',
    dayName: 'Sáb',
    dayNum: '16',
    slots: [
      { id: 's-1', time: '08:30 AM', period: 'AM', room: 'Box 101', status: 'occupied', patient: 'Guillermo Paz Loyola', service: 'Sesión Especial Deportistas' },
      { id: 's-2', time: '10:00 AM', period: 'AM', room: 'Box 102', status: 'occupied', patient: 'Luciana Beltrán Arce', service: 'Terapia Manual Express' },
      { id: 's-3', time: '11:30 AM', period: 'AM', room: 'Box 101', status: 'available', note: 'Cierre jornada matutina' },
    ],
  },
];

let persistedQueue: DoctorQueuePatient[] = INITIAL_QUEUE;
let persistedWeeklySchedule: WeeklyDaySchedule[] = INITIAL_WEEKLY_SCHEDULE;

export function syncClinicalSaveToDoctorQueue(
  patientId: string,
  updates: { evaLast?: number; notes?: string; appliedTechniques?: string[] },
) {
  persistedQueue = persistedQueue.map((p) =>
    p.id === patientId
      ? {
          ...p,
          evaLast: updates.evaLast !== undefined ? updates.evaLast : p.evaLast,
          notes: updates.notes || p.notes,
          appliedTechniques:
            updates.appliedTechniques && updates.appliedTechniques.length > 0
              ? updates.appliedTechniques
              : p.appliedTechniques,
        }
      : p,
  );
}

export function resetDoctorDashboardStore() {
  persistedQueue = INITIAL_QUEUE;
  persistedWeeklySchedule = INITIAL_WEEKLY_SCHEDULE;
}

export function getEvaTone(score: number): { label: string; className: 'low' | 'mid' | 'high' } {
  if (score <= 3) return { label: 'Leve', className: 'low' };
  if (score <= 6) return { label: 'Moderado', className: 'mid' };
  return { label: 'Severo', className: 'high' };
}

export function useDoctorDashboard(initialTab: DoctorMainView = 'queue') {
  const [mainView, setMainView] = useState<DoctorMainView>(initialTab);
  const [patientsQueue, setPatientsQueueState] = useState<DoctorQueuePatient[]>(() => persistedQueue);
  const [weeklySchedule, setWeeklyScheduleState] = useState<WeeklyDaySchedule[]>(() => persistedWeeklySchedule);

  const setPatientsQueue = useCallback(
    (updater: DoctorQueuePatient[] | ((prev: DoctorQueuePatient[]) => DoctorQueuePatient[])) => {
      setPatientsQueueState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persistedQueue = next;
        return next;
      });
    },
    [],
  );

  const setWeeklySchedule = useCallback(
    (updater: WeeklyDaySchedule[] | ((prev: WeeklyDaySchedule[]) => WeeklyDaySchedule[])) => {
      setWeeklyScheduleState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persistedWeeklySchedule = next;
        return next;
      });
    },
    [],
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string>('mie');
  const [filter, setFilter] = useState<DoctorQueueFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<DoctorQueuePatient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMainView(initialTab);
  }, [initialTab]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    let mounted = true;
    const loadDoctorAppointments = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const res = await fetch(`/api/appointments?date=${today}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok && mounted) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mappedQueue: DoctorQueuePatient[] = data.map((a, idx) => {
              const pName = a.patientName || `${a.patientFirstName || ''} ${a.patientLastName || ''}`.trim() || 'Paciente';
              const initials = pName
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'PX';
              const status: DoctorQueuePatient['status'] =
                a.status === 'in_progress' ? 'in_progress' : a.status === 'completed' ? 'completed' : 'waiting';

              return {
                id: a.patientId || a.id || `p-api-${idx}`,
                time: a.startTime ? a.startTime.slice(0, 5) : '09:00',
                patientName: pName,
                initials,
                age: '30 años',
                dni: a.patientDni || a.patientNationalId || '70000000',
                room: a.roomNumber ? `Box ${a.roomNumber}` : 'Box 101',
                service: a.serviceName || 'Consulta Médica',
                reason: a.reason || a.notes || 'Atención ambulatoria',
                status,
                evaLast: 5,
                evaTrend: 'down',
                sessionCurrent: 1,
                sessionTotal: 5,
                diagnosisCie10: 'M54.5',
                diagnosisDesc: 'Lumbago no especificado',
                appliedTechniques: ['Evaluación clínica'],
                nextSessionRecommendation: 'Continuar sesiones pautadas',
                sessionLabel: 'Sesión 1/5',
                treatmentPhase: 'Fase Inicial',
                homeRecommendations: 'Crioterapia 15 min al día',
                notes: a.notes || 'Cita en agenda médica.',
              };
            });
            setPatientsQueue(mappedQueue);
          }
        }
      } catch {
        // En caso de error o sin conexión, se mantiene persistedQueue
      }
    };

    loadDoctorAppointments();
    return () => {
      mounted = false;
    };
  }, [setPatientsQueue]);

  const activePatient = useMemo(
    () => patientsQueue.find((p) => p.status === 'in_progress') || null,
    [patientsQueue],
  );

  const nextWaitingPatient = useMemo(
    () => patientsQueue.find((p) => p.status === 'waiting') || null,
    [patientsQueue],
  );

  const counts = useMemo(
    () => ({
      total: patientsQueue.length,
      waiting: patientsQueue.filter((p) => p.status === 'waiting').length,
      inProgress: patientsQueue.filter((p) => p.status === 'in_progress').length,
      completed: patientsQueue.filter((p) => p.status === 'completed').length,
    }),
    [patientsQueue],
  );

  const filteredQueue = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return patientsQueue.filter((p) => {
      const matchesFilter = filter === 'all' || p.status === filter;
      const matchesSearch =
        !q ||
        p.patientName.toLowerCase().includes(q) ||
        p.dni.includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.reason.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [patientsQueue, filter, searchTerm]);

  const callPatientToConsultation = useCallback(
    (patientId: string) => {
      const target = patientsQueue.find((p) => p.id === patientId);
      setPatientsQueue((prev) =>
        prev.map((p) => {
          if (p.id === patientId) return { ...p, status: 'in_progress' };
          // Solo un paciente en consulta activa a la vez
          if (p.status === 'in_progress') return { ...p, status: 'completed' };
          return p;
        }),
      );
      if (target) {
        soundEffects.playChime();
        showToast(`${target.patientName} llamado(a) a consulta.`);
      }
    },
    [patientsQueue, showToast],
  );

  const completeConsultation = useCallback(
    (patientId: string) => {
      const target = patientsQueue.find((p) => p.id === patientId);
      setPatientsQueue((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'completed' } : p)),
      );
      if (target) {
        showToast(`Consulta finalizada para ${target.patientName}.`);
      }
    },
    [patientsQueue, showToast],
  );

  const saveQuickNote = useCallback(
    (updated: DoctorQueuePatient) => {
      setPatientsQueue((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPatient(null);
      showToast(`Evolución rápida guardada para ${updated.patientName}.`);
    },
    [showToast],
  );

  const applyVoiceData = useCallback(
    (data: ParsedClinicalVoiceData) => {
      const target = selectedPatient || activePatient;
      if (!target) {
        showToast('Dictado recibido. Abre una ficha o llama a un paciente para registrar notas.');
        return;
      }

      const mergePatient = (p: DoctorQueuePatient): DoctorQueuePatient => ({
        ...p,
        notes: data.notes || data.chiefComplaint || p.notes,
        homeRecommendations: data.homeRecommendations || p.homeRecommendations,
        evaLast: data.painScale !== undefined ? data.painScale : p.evaLast,
        appliedTechniques:
          data.techniques && data.techniques.length > 0
            ? Array.from(new Set([...p.appliedTechniques, ...data.techniques]))
            : p.appliedTechniques,
      });

      if (selectedPatient) {
        setSelectedPatient((prev) => (prev ? mergePatient(prev) : prev));
      }
      setPatientsQueue((prev) =>
        prev.map((p) => (p.id === target.id ? mergePatient(p) : p)),
      );
      showToast(`Dictado por voz aplicado a ${target.patientName}.`);
    },
    [selectedPatient, activePatient, showToast],
  );

  const blockWeeklySlot = useCallback(
    (dayKey: string, timeLabel: string, reason: string) => {
      const period: 'AM' | 'PM' = timeLabel.includes('AM') ? 'AM' : 'PM';
      setWeeklySchedule((prev) =>
        prev.map((day) => {
          if (day.key !== dayKey) return day;
          const existingIdx = day.slots.findIndex((s) => s.time === timeLabel);
          if (existingIdx >= 0) {
            const updatedSlots = [...day.slots];
            updatedSlots[existingIdx] = {
              ...updatedSlots[existingIdx],
              status: 'blocked',
              patient: undefined,
              service: undefined,
              note: reason,
            };
            return { ...day, slots: updatedSlots };
          }
          return {
            ...day,
            slots: [
              ...day.slots,
              {
                id: `blk-${Date.now()}`,
                time: timeLabel,
                period,
                room: 'Box 101',
                status: 'blocked',
                note: reason,
              },
            ],
          };
        }),
      );
      showToast(`Franja ${timeLabel} bloqueada (${reason}).`);
    },
    [showToast],
  );

  const unblockWeeklySlot = useCallback(
    (dayKey: string, slotId: string) => {
      setWeeklySchedule((prev) =>
        prev.map((day) => {
          if (day.key !== dayKey) return day;
          return {
            ...day,
            slots: day.slots.map((s) =>
              s.id === slotId ? { ...s, status: 'available', note: 'Horario libre' } : s,
            ),
          };
        }),
      );
      showToast('Franja horaria desbloqueada y disponible.');
    },
    [showToast],
  );

  const weeklyStats = useMemo(() => {
    const allSlots = weeklySchedule.flatMap((d) => d.slots);
    const occupied = allSlots.filter((s) => s.status === 'occupied').length;
    const available = allSlots.filter((s) => s.status === 'available').length;
    const blocked = allSlots.filter((s) => s.status === 'blocked').length;
    const bookable = occupied + available;
    const occupancyPct = bookable > 0 ? Math.round((occupied / bookable) * 100) : 0;
    return { occupied, available, blocked, occupancyPct };
  }, [weeklySchedule]);

  const currentDaySchedule = useMemo(
    () => weeklySchedule.find((d) => d.key === selectedDayKey) || weeklySchedule[2],
    [weeklySchedule, selectedDayKey],
  );

  return {
    mainView,
    setMainView,
    patientsQueue,
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
    clearToast: () => setToastMessage(null),
    showToast,
    callPatientToConsultation,
    completeConsultation,
    saveQuickNote,
    applyVoiceData,
    blockWeeklySlot,
    unblockWeeklySlot,
  };
}

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ClinicAppointmentItem,
  ClinicScheduleFilter,
  DirectorViewMode,
  OperationalAlert,
  ProfessionalStatusItem,
} from './types';

const INITIAL_TEAM: ProfessionalStatusItem[] = [
  {
    id: 'prof-1',
    name: 'Dra. María González',
    initials: 'MG',
    specialty: 'Fisioterapia y Rehabilitación',
    room: 'Cons. 101',
    liveStatus: 'in_consultation',
    bookedSlots: 7,
    totalSlots: 8,
    revenueToday: 640,
  },
  {
    id: 'prof-2',
    name: 'Dr. Carlos Mendoza',
    initials: 'CM',
    specialty: 'Traumatología',
    room: 'Cons. 102',
    liveStatus: 'waiting_patient',
    bookedSlots: 5,
    totalSlots: 6,
    revenueToday: 500,
  },
  {
    id: 'prof-3',
    name: 'Lic. Andrés Paredes',
    initials: 'AP',
    specialty: 'Terapia Física',
    room: 'Cons. 103',
    liveStatus: 'available',
    bookedSlots: 4,
    totalSlots: 6,
    revenueToday: 280,
  },
];

const INITIAL_APPOINTMENTS: ClinicAppointmentItem[] = [
  {
    id: 'apt-1',
    time: '09:00 AM',
    patient: 'Carlos Benítez Vega',
    dni: '72109845',
    doctor: 'Dra. María González',
    specialty: 'Fisioterapia y Rehabilitación',
    service: 'Rehabilitación Deportiva (3/5)',
    room: 'Cons. 101',
    status: 'in_consultation',
    priceAmount: 100,
    priceLabel: 'S/ 100.00',
    paid: true,
  },
  {
    id: 'apt-2',
    time: '09:45 AM',
    patient: 'Rosa Morales Silva',
    dni: '09843211',
    doctor: 'Dr. Carlos Mendoza',
    specialty: 'Traumatología',
    service: 'Evaluación Inicial',
    room: 'Cons. 102',
    status: 'waiting',
    priceAmount: 150,
    priceLabel: 'S/ 150.00',
    paid: true,
  },
  {
    id: 'apt-3',
    time: '10:30 AM',
    patient: 'Jorge Ramírez Castro',
    dni: '41209384',
    doctor: 'Dra. María González',
    specialty: 'Fisioterapia y Rehabilitación',
    service: 'Terapia Manual Ortopédica',
    room: 'Cons. 101',
    status: 'confirmed',
    priceAmount: 80,
    priceLabel: 'S/ 80.00',
    paid: false,
  },
  {
    id: 'apt-4',
    time: '08:15 AM',
    patient: 'Lucía Fernández Quispe',
    dni: '78341902',
    doctor: 'Lic. Andrés Paredes',
    specialty: 'Terapia Física',
    service: 'Descarga Muscular Completa',
    room: 'Cons. 103',
    status: 'attended',
    priceAmount: 70,
    priceLabel: 'S/ 70.00',
    paid: true,
  },
];

export function formatPen(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useClinicAdminDashboard() {
  const [viewMode, setViewMode] = useState<DirectorViewMode>('overview');
  const [team] = useState<ProfessionalStatusItem[]>(INITIAL_TEAM);
  const [appointments, setAppointments] = useState<ClinicAppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClinicScheduleFilter>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const metrics = useMemo(() => {
    const totalBooked = team.reduce((acc, p) => acc + p.bookedSlots, 0);
    const totalCapacity = team.reduce((acc, p) => acc + p.totalSlots, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 1000) / 10 : 0;
    const totalRevenueToday = team.reduce((acc, p) => acc + p.revenueToday, 0);
    const unpaidCount = appointments.filter((a) => !a.paid).length;
    const activeRooms = team.length;

    return {
      totalRevenueToday,
      occupancyRate,
      totalBooked,
      totalCapacity,
      activeRooms,
      unpaidCount,
      criticalStockAlerts: 2,
    };
  }, [team, appointments]);

  const alerts: OperationalAlert[] = useMemo(() => {
    const list: OperationalAlert[] = [
      {
        id: 'alert-stock',
        severity: 'high',
        title: '2 insumos con stock crítico',
        detail: 'Gel ultrasonido (3 uds) y agujas de punción seca por debajo del mínimo.',
        actionLabel: 'Ver Kardex',
        targetView: 'inventory',
      },
    ];

    if (metrics.unpaidCount > 0) {
      list.push({
        id: 'alert-unpaid',
        severity: 'medium',
        title: `${metrics.unpaidCount} cita(s) pendiente(s) de cobro`,
        detail: 'Liquidación pendiente en caja de recepción antes del cierre de turno.',
        actionLabel: 'Ir a Caja',
        targetView: 'cash-register',
      });
    }

    list.push({
      id: 'alert-reminders',
      severity: 'info',
      title: 'Recordatorios de mañana listos',
      detail: 'Envío automático programado para reducir inasistencias del siguiente turno.',
      actionLabel: 'Revisar',
      targetView: 'communications',
    });

    return list;
  }, [metrics.unpaidCount]);

  const filteredAppointments = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return appointments.filter((apt) => {
      const matchesSearch =
        !q ||
        apt.patient.toLowerCase().includes(q) ||
        apt.doctor.toLowerCase().includes(q) ||
        apt.service.toLowerCase().includes(q) ||
        apt.dni.includes(q);
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchFilter, statusFilter]);

  const reassignRoom = useCallback(
    (appointmentId: string, newRoom: string) => {
      const target = appointments.find((a) => a.id === appointmentId);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, room: newRoom } : a)),
      );
      if (target) {
        showToast(`${target.patient} reasignado(a) a ${newRoom}.`);
      }
    },
    [appointments, showToast],
  );

  return {
    viewMode,
    setViewMode,
    team,
    appointments,
    filteredAppointments,
    metrics,
    alerts,
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    toastMessage,
    clearToast: () => setToastMessage(null),
    reassignRoom,
  };
}

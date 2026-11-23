import { useState, useMemo, useCallback, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api/http';
import {
  ClinicAppointmentItem,
  ClinicScheduleFilter,
  DirectorViewMode,
  OperationalAlert,
  ProfessionalStatusItem,
} from './types';

const INITIAL_FALLBACK_TEAM: ProfessionalStatusItem[] = [
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

const INITIAL_FALLBACK_APPOINTMENTS: ClinicAppointmentItem[] = [
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
];

export function formatPen(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useClinicAdminDashboard() {
  const [viewMode, setViewMode] = useState<DirectorViewMode>('overview');
  const [team, setTeam] = useState<ProfessionalStatusItem[]>(INITIAL_FALLBACK_TEAM);
  const [appointments, setAppointments] = useState<ClinicAppointmentItem[]>(INITIAL_FALLBACK_APPOINTMENTS);
  const [criticalStockCount, setCriticalStockCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClinicScheduleFilter>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const [profRes, aptRes, alertRes, cashRes] = await Promise.all([
        fetch('/api/professionals', { headers: getAuthHeaders() }),
        fetch(`/api/appointments?date=${today}`, { headers: getAuthHeaders() }),
        fetch('/api/inventory/alerts', { headers: getAuthHeaders() }),
        fetch('/api/cash/today', { headers: getAuthHeaders() }),
      ]);

      if (profRes.ok) {
        const profData = await profRes.json();
        if (Array.isArray(profData) && profData.length > 0) {
          const mappedTeam: ProfessionalStatusItem[] = profData.map((p) => {
            const initials = `${p.firstName?.[0] || 'D'}${p.lastName?.[0] || 'R'}`.toUpperCase();
            return {
              id: p.id,
              name: `Dr(a). ${p.firstName} ${p.lastName}`,
              initials,
              specialty: p.specialtyName || 'Medicina General',
              room: p.roomNumber ? `Cons. ${p.roomNumber}` : 'Cons. 101',
              liveStatus: p.isAvailable ? 'available' : 'in_consultation',
              bookedSlots: 4,
              totalSlots: 8,
              revenueToday: 320,
            };
          });
          setTeam(mappedTeam);
        } else {
          setTeam(INITIAL_FALLBACK_TEAM);
        }
      } else {
        setTeam(INITIAL_FALLBACK_TEAM);
      }

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        if (Array.isArray(aptData) && aptData.length > 0) {
          const mappedApts: ClinicAppointmentItem[] = aptData.map((a) => {
            const price = Number(a.servicePrice || a.price || 80);
            return {
              id: a.id,
              time: a.startTime ? a.startTime.slice(0, 5) : '09:00',
              patient: a.patientName || `${a.patientFirstName || ''} ${a.patientLastName || ''}`.trim() || 'Paciente',
              dni: a.patientDni || a.patientNationalId || '70000000',
              doctor: a.professionalName || 'Dr. Médico',
              specialty: a.specialtyName || 'Fisioterapia y Rehabilitación',
              service: a.serviceName || 'Consulta Médica',
              room: a.roomNumber ? `Cons. ${a.roomNumber}` : 'Cons. 101',
              status: (a.status === 'in_progress'
                ? 'in_consultation'
                : a.status === 'completed'
                  ? 'attended'
                  : a.status === 'pending'
                    ? 'waiting'
                    : 'confirmed') as ClinicAppointmentItem['status'],
              priceAmount: price,
              priceLabel: `S/ ${price.toFixed(2)}`,
              paid: Boolean(a.paymentStatus === 'paid' || a.isPaid),
            };
          });
          setAppointments(mappedApts);
        } else {
          setAppointments(INITIAL_FALLBACK_APPOINTMENTS);
        }
      } else {
        setAppointments(INITIAL_FALLBACK_APPOINTMENTS);
      }

      if (alertRes.ok) {
        const alertData = await alertRes.json();
        if (Array.isArray(alertData)) {
          setCriticalStockCount(alertData.length);
        }
      }

      if (cashRes.ok) {
        const cashData = await cashRes.json();
        if (cashData && cashData.totalIncome != null) {
          setTodayRevenue(Number(cashData.totalIncome));
        }
      }
    } catch {
      setTeam(INITIAL_FALLBACK_TEAM);
      setAppointments(INITIAL_FALLBACK_APPOINTMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const metrics = useMemo(() => {
    const totalBooked = team.reduce((acc, p) => acc + p.bookedSlots, 0);
    const totalCapacity = team.reduce((acc, p) => acc + p.totalSlots, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 1000) / 10 : 0;
    const unpaidCount = appointments.filter((a) => !a.paid).length;
    const activeRooms = team.length;

    return {
      totalRevenueToday: todayRevenue > 0 ? todayRevenue : team.reduce((acc, p) => acc + p.revenueToday, 0),
      occupancyRate,
      totalBooked,
      totalCapacity,
      activeRooms,
      unpaidCount,
      criticalStockAlerts: criticalStockCount,
    };
  }, [team, appointments, todayRevenue, criticalStockCount]);

  const alerts: OperationalAlert[] = useMemo(() => {
    const list: OperationalAlert[] = [];

    if (criticalStockCount > 0) {
      list.push({
        id: 'alert-stock',
        severity: 'high',
        title: `${criticalStockCount} insumo(s) con stock crítico`,
        detail: 'Insumos por debajo del mínimo en el Kardex. Revisar reposición.',
        actionLabel: 'Ver Kardex',
        targetView: 'inventory',
      });
    }

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
      title: 'Recordatorios de citas listos',
      detail: 'Sistema de notificaciones Brevo y WhatsApp preparado para los siguientes turnos.',
      actionLabel: 'Revisar',
      targetView: 'communications',
    });

    return list;
  }, [criticalStockCount, metrics.unpaidCount]);

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
    isLoading,
    refreshDashboard: loadDashboardData,
  };
}

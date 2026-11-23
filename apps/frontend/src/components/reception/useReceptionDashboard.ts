import { useState, useMemo, useCallback, useEffect } from 'react';
import { getAuthHeaders } from '../../services/api/http';
import {
  ReceptionAppointment,
  ReceptionFilter,
  ReceptionStatus,
  PaymentMethod,
  CreateReceptionBookingInput,
} from './types';
import { soundEffects } from '../../utils/soundEffects';

const INITIAL_FALLBACK_APPOINTMENTS: ReceptionAppointment[] = [
  {
    id: 'rec-1',
    time: '09:30 AM',
    patientName: 'María Santos López',
    dni: '45892110',
    phone: '51987654321',
    doctor: 'Dra. María González',
    service: 'Terapia Manual Ortopédica',
    priceAmount: 80,
    priceLabel: 'S/ 80.00',
    status: 'waiting',
    paid: true,
    paymentMethod: 'Yape',
    room: 'Box 102',
  },
  {
    id: 'rec-2',
    time: '10:00 AM',
    patientName: 'Carlos Benítez Vega',
    dni: '72109845',
    phone: '51981234567',
    doctor: 'Dra. María González',
    service: 'Rehabilitación Deportiva',
    priceAmount: 100,
    priceLabel: 'S/ 100.00',
    status: 'in_consultation',
    paid: true,
    paymentMethod: 'POS Tarjeta',
    room: 'Box 101',
  },
  {
    id: 'rec-3',
    time: '11:00 AM',
    patientName: 'Rosa Morales Silva',
    dni: '09843211',
    phone: '51994561230',
    doctor: 'Dr. Carlos Mendoza',
    service: 'Consulta Traumatológica',
    priceAmount: 150,
    priceLabel: 'S/ 150.00',
    status: 'pending_arrival',
    paid: false,
    room: 'Box 103',
  },
  {
    id: 'rec-4',
    time: '11:45 AM',
    patientName: 'Jorge Ramírez Castro',
    dni: '41209384',
    phone: '51977112233',
    doctor: 'Dra. María González',
    service: 'Descarga Muscular Completa',
    priceAmount: 70,
    priceLabel: 'S/ 70.00',
    status: 'pending_arrival',
    paid: true,
    paymentMethod: 'Plin',
    room: 'Box 102',
  },
];

const OPENING_CASH_COLLECTED = 1170;

export function formatPen(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function useReceptionDashboard() {
  const [appointments, setAppointments] = useState<ReceptionAppointment[]>(INITIAL_FALLBACK_APPOINTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReceptionFilter>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
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

  const loadReceptionAppointments = useCallback(async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(`/api/appointments?date=${today}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ReceptionAppointment[] = data.map((a) => {
            const price = Number(a.servicePrice || a.price || 80);
            let status: ReceptionStatus = 'pending_arrival';
            if (a.status === 'confirmed' || a.status === 'checked_in') status = 'waiting';
            else if (a.status === 'in_progress') status = 'in_consultation';
            else if (a.status === 'completed') status = 'completed';
            else if (a.status === 'cancelled') status = 'cancelled';

            return {
              id: a.id,
              time: a.startTime ? a.startTime.slice(0, 5) : '09:00 AM',
              patientName: a.patientName || `${a.patientFirstName || ''} ${a.patientLastName || ''}`.trim() || 'Paciente',
              dni: a.patientDni || a.patientNationalId || '70000000',
              phone: a.patientPhone || '51900000000',
              doctor: a.professionalName || 'Dr(a). Tratante',
              service: a.serviceName || 'Consulta Médica',
              priceAmount: price,
              priceLabel: `S/ ${price.toFixed(2)}`,
              status,
              paid: Boolean(a.paymentStatus === 'paid' || a.isPaid),
              paymentMethod: (a.paymentMethod || 'Efectivo') as PaymentMethod,
              room: a.roomNumber ? `Box ${a.roomNumber}` : 'Box 101',
            };
          });
          setAppointments(mapped);
        } else {
          setAppointments(INITIAL_FALLBACK_APPOINTMENTS);
        }
      } else {
        setAppointments(INITIAL_FALLBACK_APPOINTMENTS);
      }
    } catch {
      setAppointments(INITIAL_FALLBACK_APPOINTMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceptionAppointments();
  }, [loadReceptionAppointments]);

  const counts = useMemo(() => {
    const pendingArrival = appointments.filter((a) => a.status === 'pending_arrival').length;
    const waiting = appointments.filter((a) => a.status === 'waiting').length;
    const inConsultation = appointments.filter((a) => a.status === 'in_consultation').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const unpaid = appointments.filter((a) => !a.paid).length;
    const paidFromList = appointments
      .filter((a) => a.paid)
      .reduce((acc, a) => acc + a.priceAmount, 0);

    return {
      total: appointments.length,
      pendingArrival,
      waiting,
      inConsultation,
      completed,
      unpaid,
      totalCashToday: OPENING_CASH_COLLECTED + paidFromList,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return appointments.filter((apt) => {
      const matchesQuery =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.dni.includes(q) ||
        apt.doctor.toLowerCase().includes(q) ||
        apt.service.toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'unpaid') return !apt.paid;
      return apt.status === statusFilter;
    });
  }, [appointments, searchTerm, statusFilter]);

  const updateStatus = useCallback(
    async (id: string, nextStatus: ReceptionStatus) => {
      const target = appointments.find((apt) => apt.id === id);
      const targetName = target?.patientName || 'paciente';
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: nextStatus } : apt)),
      );

      // Sincronizar con backend si corresponde
      if (nextStatus === 'waiting') {
        fetch(`/api/appointments/${encodeURIComponent(id)}/check-in`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }).catch(() => {});
        soundEffects.playPop();
        showToast(`Llegada registrada: ${targetName} ya está en sala de espera.`);
      } else if (nextStatus === 'in_consultation') {
        fetch(`/api/appointments/${encodeURIComponent(id)}/start`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }).catch(() => {});
        soundEffects.playChime();
        showToast(`${targetName} pasó a consulta.`);
      } else if (nextStatus === 'completed') {
        fetch(`/api/appointments/${encodeURIComponent(id)}/complete`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        }).catch(() => {});
        soundEffects.playSuccess();
        showToast(`Atención finalizada para ${targetName}.`);
      } else {
        showToast(`Estado actualizado para ${targetName}.`);
      }
    },
    [appointments, showToast],
  );

  const registerPayment = useCallback(
    (id: string, method: PaymentMethod) => {
      const target = appointments.find((apt) => apt.id === id);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, paid: true, paymentMethod: method } : apt,
        ),
      );
      soundEffects.playCashRegister();
      if (target) {
        showToast(`Cobro de ${target.priceLabel} (${method}) registrado para ${target.patientName}.`);
      }
    },
    [appointments, showToast],
  );

  const createBooking = useCallback(
    (input: CreateReceptionBookingInput) => {
      const newApt: ReceptionAppointment = {
        id: `rec-new-${Date.now()}`,
        time: input.time,
        patientName: input.patientName,
        dni: input.dni,
        phone: input.phone,
        doctor: input.doctor,
        service: input.service,
        priceAmount: input.priceAmount,
        priceLabel: `S/ ${input.priceAmount.toFixed(2)}`,
        status: 'pending_arrival',
        paid: input.paid,
        paymentMethod: input.paymentMethod,
        room: input.room,
      };

      setAppointments((prev) => [newApt, ...prev]);
      soundEffects.playSuccess();
      showToast(`Cita agendada para ${input.patientName} a las ${input.time}.`);
    },
    [showToast],
  );

  return {
    appointments,
    filteredAppointments,
    counts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    toastMessage,
    clearToast: () => setToastMessage(null),
    updateStatus,
    registerPayment,
    createBooking,
    isLoading,
    refreshAppointments: loadReceptionAppointments,
  };
}

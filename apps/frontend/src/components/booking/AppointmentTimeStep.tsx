import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AvailabilitySection } from './AvailabilitySection';
import { BookingSummary, BookingSummaryItem } from './BookingSummary';
import { SelectedAppointment } from './SelectedAppointment';
import { SelectedDateHeader } from './SelectedDateHeader';
import { buildDayAvailability, findSlot, toSlotAvailabilityList } from './availabilityCatalog';
import { fetchDayAvailability } from '../../services/api';
import { formatFullDate, formatTimeRange } from './dateUtils';
import type {
  ProfessionalCardModel,
  SelectedSpecialtySummary,
  ServiceCardModel,
  SlotAvailability,
} from './appointmentTypes';
import './AppointmentStep.css';

export interface AppointmentTimeStepProps {
  specialty: SelectedSpecialtySummary;
  service: ServiceCardModel;
  /** null when the patient chose the automatic assignment. */
  professional: ProfessionalCardModel | null;
  professionalId?: string;
  location?: string;
  /** Day chosen in the calendar step (step 4). */
  selectedDate: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  /** Back to the calendar without losing the booking. */
  onChangeDate: () => void;
  onEdit: () => void;
}

const DEFAULT_LOCATION = 'Sede San Isidro';

/**
 * Step 5 — "Elige el horario de tu cita".
 * Owns the day availability request and the slot selection; every visual piece
 * (date banner, agenda, context bar, side panel) stays presentational.
 */
export const AppointmentTimeStep: React.FC<AppointmentTimeStepProps> = ({
  specialty,
  service,
  professional,
  professionalId,
  location = DEFAULT_LOCATION,
  selectedDate,
  selectedTime,
  onSelectTime,
  onChangeDate,
  onEdit,
}) => {
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef(0);

  const query = useMemo(
    () => ({
      startDate: selectedDate,
      durationMinutes: service.durationMinutes,
      professionalId,
      serviceId: service.serviceId,
    }),
    [selectedDate, service.durationMinutes, service.serviceId, professionalId],
  );

  useEffect(() => {
    if (!selectedDate) return undefined;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setIsLoading(true);

    fetchDayAvailability(query)
      .then((daySlots) => {
        if (requestRef.current !== requestId) return;
        setSlots(
          // Only the requested day is shown; the API may answer with a window.
          toSlotAvailabilityList(daySlots.filter((slot) => slot.date === query.startDate)),
        );
        setIsLoading(false);
      })
      .catch(() => {
        if (requestRef.current !== requestId) return;
        setSlots([]);
        setIsLoading(false);
      });

    return undefined;
  }, [query, selectedDate]);

  const day = useMemo(
    () => buildDayAvailability({ date: selectedDate, slots }),
    [selectedDate, slots],
  );

  const selectedSlot = useMemo(
    () => findSlot(slots, selectedDate, selectedTime),
    [slots, selectedDate, selectedTime],
  );

  const isComplete = Boolean(selectedSlot);

  const handleSelectSlot = useCallback(
    (slot: SlotAvailability) => {
      onSelectTime(slot.startTime);
    },
    [onSelectTime],
  );

  const summaryItems: BookingSummaryItem[] = [
    {
      id: 'date',
      icon: 'datetime',
      label: 'Fecha',
      value: selectedDate ? formatFullDate(selectedDate) : 'Por definir',
    },
    { id: 'service', icon: 'service', label: 'Servicio', value: service.name },
    {
      id: 'professional',
      icon: 'professional',
      label: 'Profesional',
      value: professional?.name ?? 'Primero disponible',
      meta: professional?.licenseNumber,
      photoUrl: professional?.photoUrl,
    },
    {
      id: 'duration',
      icon: 'duration',
      label: 'Duración',
      value: `${service.durationMinutes} min`,
    },
    {
      id: 'price',
      icon: 'price',
      label: 'Precio',
      value: `${service.currency === 'PEN' ? 'S/' : service.currency} ${service.price.toFixed(2)}`,
    },
  ];

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="apx-step-title">
            5. Elige el horario de tu cita
          </h2>
          <p className="apx-step__desc">
            Selecciona uno de los horarios disponibles para la fecha que elegiste.
          </p>
        </div>
      </div>

      <BookingSummary items={summaryItems} onEdit={onEdit} />

      <div className="apx-time">
        <div className="apx-time__main">
          <SelectedDateHeader
            dateLabel={selectedDate ? formatFullDate(selectedDate) : 'Elige una fecha'}
            hint={`${specialty.name} · ${service.name}`}
            onChangeDate={onChangeDate}
          />

          <AvailabilitySection
            day={day}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            isLoading={isLoading}
            onSelect={handleSelectSlot}
            onRetry={onChangeDate}
          />
        </div>

        <SelectedAppointment
          isComplete={isComplete}
          title="Tu cita"
          subtitle="Resumen de la reserva"
          dateLabel={selectedDate ? formatFullDate(selectedDate) : undefined}
          timeRangeLabel={
            selectedSlot
              ? formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)
              : undefined
          }
          durationLabel={`${service.durationMinutes} minutos`}
          professionalName={professional?.name ?? 'Primero disponible'}
          professionalLicense={professional?.licenseNumber}
          professionalProfession={professional?.profession}
          professionalPhotoUrl={professional?.photoUrl}
          serviceName={service.name}
          specialtyName={specialty.name}
          specialtyIconKey={specialty.icon}
          location={location}
          priceLabel={`${service.currency === 'PEN' ? 'S/' : service.currency} ${service.price.toFixed(2)}`}
          statusMessage="Puedes continuar con el siguiente paso."
        />
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { Specialty, MedicalService, Professional } from '@citassistema/shared-types';
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconLocation,
  IconLock,
  IconShieldCheck,
  IconUser,
  resolveSpecialtyIcon,
} from './AppointmentIcons';
import { formatLongDate } from './dateUtils';
import './AppointmentStep.css';

export interface StickyBookingSidebarProps {
  step: number;
  totalSteps?: number;
  specialty: Specialty | null;
  service: MedicalService | null;
  professionalRecord: Professional | null;
  autoAssignProfessional: boolean;
  selectedDate?: string;
  selectedTime?: string;
}

export const StickyBookingSidebar: React.FC<StickyBookingSidebarProps> = ({
  step: _step,
  totalSteps: _totalSteps,
  specialty,
  service,
  professionalRecord,
  autoAssignProfessional,
  selectedDate,
  selectedTime,
}) => {
  // 15-minute reservation timer (countdown)
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 52);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs} min`;
  };

  const SpecialtyIcon = resolveSpecialtyIcon(
    (specialty?.icon as any) ?? 'default',
  );

  const price = service?.price ? Number(service.price) : 120;
  const currencySymbol = 'S/.';
  const subtotal = (price / 1.18).toFixed(2);
  const igv = (price - Number(subtotal)).toFixed(2);

  const professionalName = autoAssignProfessional
    ? 'Cualquier médico disponible (Más rápido)'
    : professionalRecord?.user
      ? `Dr(a). ${professionalRecord.user.firstName} ${professionalRecord.user.lastName}`
      : professionalRecord
        ? `Dr(a). ${professionalRecord.firstName} ${professionalRecord.lastName}`
        : 'Especialista asignado';

  return (
    <aside className="apx-sticky-sidebar" aria-label="Resumen de la reserva en tiempo real">
      <div className="apx-sidebar-card">
        {/* Reservation timer bar */}
        <div className="apx-sidebar-timer">
          <div className="apx-sidebar-timer__left">
            <span className="apx-sidebar-timer__pulse" aria-hidden="true" />
            <IconClock size={16} className="apx-sidebar-timer__icon" />
            <span>Tiempo de reserva:</span>
          </div>
          <span className="apx-sidebar-timer__countdown">{formatTimer(secondsLeft)}</span>
        </div>

        <div className="apx-sidebar-body">
          {/* Header */}
          <div className="apx-sidebar-header">
            <div>
              <h3 className="apx-sidebar-title">Resumen de tu Cita</h3>
              <p className="apx-sidebar-sub">Detalle en vivo de tu atención</p>
            </div>
            <span className="apx-sidebar-step-badge">Resumen en vivo</span>
          </div>

          {/* Sede badge */}
          <div className="apx-sidebar-sede">
            <span className="apx-sidebar-sede__icon" aria-hidden="true">
              <IconLocation size={18} />
            </span>
            <div className="apx-sidebar-sede__info">
              <strong>Clínica VitalSalud — Sede San Isidro</strong>
              <small>Av. Javier Prado Este 1234, Lima</small>
              <span className="apx-sidebar-sede__tag">Estacionamiento gratuito para pacientes</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="apx-sidebar-details">
            <h4 className="apx-sidebar-details__title">Detalles de Consulta</h4>

            {/* Specialty */}
            <div className="apx-sidebar-row">
              <span className="apx-sidebar-row__label">
                <SpecialtyIcon size={16} className="apx-icon--primary" />
                <span>Especialidad</span>
              </span>
              <span className={`apx-sidebar-row__value ${!specialty ? 'is-pending' : ''}`}>
                {specialty ? specialty.name : 'Por seleccionar'}
              </span>
            </div>

            {/* Service */}
            <div className="apx-sidebar-row">
              <span className="apx-sidebar-row__label">
                <IconShieldCheck size={16} className="apx-icon--primary" />
                <span>Servicio</span>
              </span>
              <span className={`apx-sidebar-row__value ${!service ? 'is-pending' : ''}`}>
                {service ? `${service.name} (${service.durationMinutes ?? 30}m)` : 'Por seleccionar'}
              </span>
            </div>

            {/* Professional */}
            <div className="apx-sidebar-row">
              <span className="apx-sidebar-row__label">
                <IconUser size={16} className="apx-icon--primary" />
                <span>Especialista</span>
              </span>
              <span className="apx-sidebar-row__value apx-sidebar-row__value--doctor">
                {professionalRecord?.avatarUrl && (
                  <img
                    src={professionalRecord.avatarUrl}
                    alt=""
                    className="apx-sidebar-doctor-thumb"
                  />
                )}
                <span>{professionalName}</span>
              </span>
            </div>

            {/* Date and Time (if selected) */}
            {selectedDate && selectedTime && (
              <div className="apx-sidebar-row apx-sidebar-row--highlight">
                <span className="apx-sidebar-row__label">
                  <IconCalendar size={16} className="apx-icon--primary" />
                  <span>Fecha y Hora</span>
                </span>
                <span className="apx-sidebar-row__value">
                  {formatLongDate(selectedDate)} a las {selectedTime} hrs
                </span>
              </div>
            )}
          </div>

          {/* Pricing Box */}
          <div className="apx-sidebar-pricing">
            <div className="apx-sidebar-pricing__line">
              <span>Subtotal consulta</span>
              <span>{currencySymbol} {subtotal}</span>
            </div>
            <div className="apx-sidebar-pricing__line">
              <span>I.G.V. (18%)</span>
              <span>{currencySymbol} {igv}</span>
            </div>
            <div className="apx-sidebar-pricing__divider" />
            <div className="apx-sidebar-pricing__total">
              <div>
                <strong>Total a pagar:</strong>
                <small>Incluye impuestos y atención</small>
              </div>
              <span className="apx-sidebar-pricing__amount">
                {currencySymbol} {price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Secure Payment Note */}
          <div className="apx-sidebar-secure-note">
            <IconLock size={15} />
            <span>Pago seguro con Tarjetas, Yape, Plin o en recepción de la clínica.</span>
          </div>

          {/* Trust Guarantees */}
          <ul className="apx-sidebar-guarantees">
            <li>
              <IconCheck size={14} className="apx-icon--success" />
              <span>Cancelación gratuita hasta 24h antes</span>
            </li>
            <li>
              <IconCheck size={14} className="apx-icon--success" />
              <span>Recordatorios por WhatsApp y correo</span>
            </li>
            <li>
              <IconCheck size={14} className="apx-icon--success" />
              <span>Médicos certificados por el CMP</span>
            </li>
          </ul>

          {/* Support helpline */}
          <div className="apx-sidebar-help">
            <span>¿Dudas con tu reserva?</span>
            <a href="tel:016409000" className="apx-sidebar-help__phone" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <MaterialIcon name="call" size={15} />
              <span>(01) 640-9000</span>
            </a>
          </div>

          {/* EPS insurance support */}
          <div className="apx-sidebar-eps">
            <span className="apx-sidebar-eps__badge">Convenios EPS</span>
            <p>Atendemos pacientes con seguro Pacífico, Rímac, Mapfre, Sanitas y La Positiva.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

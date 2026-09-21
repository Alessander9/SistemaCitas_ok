import React from 'react';
import { PaymentMethodCard } from './PaymentMethodCard';
import { ReservationTimer } from './ReservationTimer';
import { WhatHappensNext } from './WhatHappensNext';
import {
  IconCalendar,
  IconClock,
  IconHourglass,
  IconLocation,
  IconPencil,
  IconShieldCheck,
  IconUser,
  resolveSpecialtyIcon,
} from './AppointmentIcons';
import { SpecialtyIconKey } from './appointmentTypes';
import './AppointmentStep.css';

export type PaymentMethodId = 'CLINICA' | 'TARJETA';

export interface AppointmentPaymentStepProps {
  paymentMethod: PaymentMethodId;
  onSelectPaymentMethod: (method: PaymentMethodId) => void;
  specialtyName?: string;
  specialtyIconKey?: SpecialtyIconKey;
  serviceName?: string;
  durationLabel?: string;
  professionalName?: string;
  professionalLicense?: string;
  professionalPhotoUrl?: string | null;
  dateLabel?: string;
  timeRangeLabel?: string;
  location?: string;
  locationAddress?: string;
  price?: number;
  currency?: string;
  onEditBooking?: () => void;
  onTimerExpired?: () => void;
}

export const AppointmentPaymentStep: React.FC<AppointmentPaymentStepProps> = ({
  paymentMethod,
  onSelectPaymentMethod,
  specialtyName = 'Fisioterapia y Rehabilitación',
  specialtyIconKey,
  serviceName = 'Evaluación y Diagnóstico Físico Inicial',
  durationLabel = '30 minutos',
  professionalName = 'Dr. Carlos Mendoza Ruiz',
  professionalLicense = 'CMP-51294',
  professionalPhotoUrl,
  dateLabel = 'Jueves, 24 de septiembre de 2026',
  timeRangeLabel = '05:30 PM – 06:00 PM',
  location = 'Sede San Isidro',
  locationAddress = 'Av. Emilio Cavenecia 225, San Isidro, Lima',
  price = 150.0,
  currency = 'PEN',
  onEditBooking,
  onTimerExpired,
}) => {
  const SpecialtyIcon = resolveSpecialtyIcon(specialtyIconKey ?? 'default');
  const currencySymbol = currency === 'PEN' ? 'S/' : currency;
  const formattedPrice = `${currencySymbol} ${price.toFixed(2)}`;

  return (
    <div className="apx-step apx-payment-step">
      {/* Top row: Step intro + dynamic reservation countdown */}
      <div className="apx-payment-top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title">9. Elige cómo realizarás el pago</h2>
          <p className="apx-step__desc">
            Selecciona la modalidad que prefieras para completar tu reserva.
          </p>
        </div>

        <ReservationTimer initialSeconds={582} onExpire={onTimerExpired} />
      </div>

      {/* Main Two-Column Layout */}
      <div className="apx-payment-layout">
        {/* Left Column: Payment Modalities + What Happens Next */}
        <div className="apx-payment-layout__main">
          <section className="apx-payment-section" aria-labelledby="payment-methods-heading">
            <div className="apx-payment-section__header">
              <span className="apx-payment-section__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              <div>
                <h3 className="apx-payment-section__title" id="payment-methods-heading">
                  Métodos de pago
                </h3>
                <p className="apx-payment-section__subtitle">
                  Selecciona una opción para continuar.
                </p>
              </div>
            </div>

            <div className="apx-payment-cards-grid" role="radiogroup" aria-label="Modalidad de pago">
              <PaymentMethodCard
                id="CLINICA"
                isSelected={paymentMethod === 'CLINICA'}
                onSelect={onSelectPaymentMethod}
              />
              <PaymentMethodCard
                id="TARJETA"
                isSelected={paymentMethod === 'TARJETA'}
                onSelect={onSelectPaymentMethod}
              />
            </div>
          </section>

          {/* Timeline banner: What happens next */}
          <WhatHappensNext />
        </div>

        {/* Right Column: Complete Booking Summary Card */}
        <aside className="apx-payment-layout__aside" aria-label="Resumen de tu reserva">
          <div className="apx-payment-summary-card">
            <header className="apx-payment-summary-card__header">
              <div className="apx-payment-summary-card__title-row">
                <span className="apx-payment-summary-card__icon" aria-hidden="true">
                  <IconCalendar size={18} />
                </span>
                <h3 className="apx-payment-summary-card__title">Resumen de tu reserva</h3>
              </div>
              {onEditBooking && (
                <button
                  type="button"
                  className="apx-payment-summary-card__edit-btn"
                  onClick={onEditBooking}
                  aria-label="Editar detalles de la reserva"
                >
                  <IconPencil size={13} />
                  <span>Editar reserva</span>
                </button>
              )}
            </header>

            <dl className="apx-payment-summary-card__list">
              {/* Especialidad */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  <SpecialtyIcon size={16} className="apx-payment-summary-row__icon" />
                  <span>Especialidad</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">{specialtyName}</dd>
              </div>

              {/* Servicio */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="apx-payment-summary-row__icon">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                  <span>Servicio</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">{serviceName}</dd>
              </div>

              {/* Profesional */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  {professionalPhotoUrl ? (
                    <img
                      src={professionalPhotoUrl}
                      alt=""
                      className="apx-payment-summary-row__avatar"
                    />
                  ) : (
                    <IconUser size={16} className="apx-payment-summary-row__icon" />
                  )}
                  <span>Profesional</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">
                  <strong>{professionalName}</strong>
                  {professionalLicense && (
                    <small className="apx-payment-summary-row__license">
                      {professionalLicense}
                    </small>
                  )}
                </dd>
              </div>

              {/* Fecha */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  <IconCalendar size={16} className="apx-payment-summary-row__icon" />
                  <span>Fecha</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">{dateLabel}</dd>
              </div>

              {/* Horario */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  <IconClock size={16} className="apx-payment-summary-row__icon" />
                  <span>Horario</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">{timeRangeLabel}</dd>
              </div>

              {/* Duración */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  <IconHourglass size={16} className="apx-payment-summary-row__icon" />
                  <span>Duración</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">{durationLabel}</dd>
              </div>

              {/* Sede */}
              <div className="apx-payment-summary-row">
                <dt className="apx-payment-summary-row__dt">
                  <IconLocation size={16} className="apx-payment-summary-row__icon" />
                  <span>Sede</span>
                </dt>
                <dd className="apx-payment-summary-row__dd">
                  <strong>{location}</strong>
                  {locationAddress && (
                    <small className="apx-payment-summary-row__address">
                      {locationAddress}
                    </small>
                  )}
                </dd>
              </div>
            </dl>

            {/* Prominent Price Highlight Box */}
            <div className="apx-payment-price-box">
              <span className="apx-payment-price-box__tag-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </span>
              <div className="apx-payment-price-box__text">
                <span className="apx-payment-price-box__label">
                  {paymentMethod === 'CLINICA' ? 'Total de la reserva' : 'Monto total a pagar'}
                </span>
                <strong className="apx-payment-price-box__amount">
                  {formattedPrice} <span className="apx-payment-price-box__currency">{currency}</span>
                </strong>
                {paymentMethod === 'CLINICA' && (
                  <span className="apx-payment-price-box__subnote">
                    Monto a pagar ahora: <strong>S/ 0.00</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Notification notice card */}
            <div className="apx-payment-notice">
              <span className="apx-payment-notice__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <p className="apx-payment-notice__text">
                Te enviaremos los detalles de tu cita por WhatsApp y correo electrónico.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

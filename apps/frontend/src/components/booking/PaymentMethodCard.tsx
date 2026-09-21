import React from 'react';
import { IconCheck, IconInfo, IconShieldCheck } from './AppointmentIcons';
import {
  IconCash,
  IconPosTerminal,
  LogoAmex,
  LogoMastercard,
  LogoPlin,
  LogoVisa,
  LogoYape,
} from './PaymentBrandLogos';
import './AppointmentStep.css';

export type PaymentMethodId = 'CLINICA' | 'TARJETA';

export interface PaymentMethodCardProps {
  id: PaymentMethodId;
  isSelected: boolean;
  onSelect: (id: PaymentMethodId) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  id,
  isSelected,
  onSelect,
}) => {
  const isClinic = id === 'CLINICA';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      className={`apx-payment-card${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      id={`payment-method-${id.toLowerCase()}`}
    >
      {/* Top row: Method Icon + Badge & Selection Check */}
      <div className="apx-payment-card__header">
        <div className="apx-payment-card__header-left">
          <span
            className={`apx-payment-card__icon-badge${
              isClinic ? ' apx-payment-card__icon-badge--clinic' : ' apx-payment-card__icon-badge--online'
            }`}
            aria-hidden="true"
          >
            {isClinic ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            )}
          </span>
          <div className="apx-payment-card__title-group">
            <div className="apx-payment-card__title-row">
              <h3 className="apx-payment-card__title">
                {isClinic ? 'Pago en clínica' : 'Pago online'}
              </h3>
              <span
                className={`apx-payment-card__tag${
                  isClinic ? ' apx-payment-card__tag--clinic' : ' apx-payment-card__tag--online'
                }`}
              >
                {isClinic ? 'Pago al asistir' : 'Confirmación inmediata'}
              </span>
            </div>
          </div>
        </div>

        <div className="apx-payment-card__selection" aria-hidden="true">
          <span className={`apx-payment-card__check-indicator${isSelected ? ' is-active' : ''}`}>
            {isSelected ? <IconCheck size={14} /> : <span className="apx-payment-card__radio-dot" />}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="apx-payment-card__desc">
        {isClinic
          ? 'Realiza el pago directamente en recepción el día de tu cita.'
          : 'Realiza el pago ahora mediante nuestra pasarela de pagos segura.'}
      </p>

      {/* Available payment methods */}
      <div className="apx-payment-card__methods-section">
        <span className="apx-payment-card__methods-title">Métodos disponibles</span>
        <div className="apx-payment-card__methods-grid">
          {isClinic ? (
            <>
              <div className="apx-payment-badge">
                <IconCash size={18} className="apx-payment-badge__icon" />
                <span>Efectivo</span>
              </div>
              <div className="apx-payment-badge">
                <LogoYape size={18} />
                <span>Yape</span>
              </div>
              <div className="apx-payment-badge">
                <LogoPlin size={18} />
                <span>Plin</span>
              </div>
              <div className="apx-payment-badge">
                <IconPosTerminal size={18} className="apx-payment-badge__icon" />
                <span>Tarjeta en clínica</span>
              </div>
            </>
          ) : (
            <>
              <div className="apx-payment-badge">
                <LogoVisa height={14} />
                <span>Visa</span>
              </div>
              <div className="apx-payment-badge">
                <LogoMastercard size={18} />
                <span>Mastercard</span>
              </div>
              <div className="apx-payment-badge">
                <LogoAmex height={13} />
                <span>American Express</span>
              </div>
              <div className="apx-payment-badge">
                <LogoYape size={18} />
                <span>Yape</span>
              </div>
              <div className="apx-payment-badge">
                <LogoPlin size={18} />
                <span>Plin</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom info callout */}
      <div
        className={`apx-payment-card__callout${
          isClinic ? ' apx-payment-card__callout--clinic' : ' apx-payment-card__callout--online'
        }`}
      >
        <span className="apx-payment-card__callout-icon" aria-hidden="true">
          {isClinic ? <IconInfo size={17} /> : <IconShieldCheck size={17} />}
        </span>
        <div className="apx-payment-card__callout-text">
          <strong>{isClinic ? 'Sin cobro online' : 'Pago seguro'}</strong>
          <p>
            {isClinic
              ? 'Tu reserva quedará confirmada. Realizarás el pago en recepción el día de tu cita.'
              : 'Tus datos de pago se procesan de forma segura mediante nuestra pasarela de pagos.'}
          </p>
        </div>
      </div>
    </div>
  );
};

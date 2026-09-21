import React from 'react';

export interface CashPaymentConfirmationProps {
  price: number;
  currency?: string;
  location?: string;
  locationAddress?: string;
}

export const CashPaymentConfirmation: React.FC<CashPaymentConfirmationProps> = ({
  price,
  currency = 'PEN',
  location = 'Sede San Isidro',
  locationAddress = 'Av. Emilio Cavenecia 225, San Isidro, Lima',
}) => {
  const formattedPrice = `${currency === 'USD' ? '$' : 'S/'} ${price.toFixed(2)}`;

  return (
    <div className="apx-clinic-confirm" aria-label="Confirmación de pago en clínica">
      {/* Banner status */}
      <div className="apx-clinic-confirm__status-box">
        <div className="apx-clinic-confirm__icon-wrap">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="apx-clinic-confirm__status-text">
          <span className="apx-clinic-confirm__status-badge">Tu reserva está lista</span>
          <h3 className="apx-clinic-confirm__title">Pago directo en recepción</h3>
          <p className="apx-clinic-confirm__desc">
            Tu cita quedará agendada y asegurada. Realizarás el pago en recepción el mismo día de tu atención antes de ingresar a la consulta médica.
          </p>
        </div>
      </div>

      {/* Financial breakdown card */}
      <div className="apx-clinic-breakdown">
        <h4 className="apx-clinic-breakdown__title">Detalle del importe</h4>
        <div className="apx-clinic-breakdown__grid">
          <div className="apx-clinic-breakdown__item">
            <span className="apx-clinic-breakdown__label">Total del servicio</span>
            <span className="apx-clinic-breakdown__value">{formattedPrice}</span>
          </div>
          <div className="apx-clinic-breakdown__item">
            <span className="apx-clinic-breakdown__label">Pagado ahora online</span>
            <span className="apx-clinic-breakdown__value apx-clinic-breakdown__value--zero">
              {currency === 'USD' ? '$' : 'S/'} 0.00
            </span>
          </div>
          <div className="apx-clinic-breakdown__item apx-clinic-breakdown__item--highlight">
            <span className="apx-clinic-breakdown__label">Total pendiente en clínica</span>
            <span className="apx-clinic-breakdown__value apx-clinic-breakdown__value--pending">
              {formattedPrice} {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Accepted payment methods at clinic */}
      <div className="apx-clinic-methods">
        <h4 className="apx-clinic-methods__title">Medios de pago aceptados en caja</h4>
        <div className="apx-clinic-methods__list">
          <div className="apx-clinic-methods__card">
            <div className="apx-clinic-methods__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="12" x="2" y="6" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
            <div>
              <strong className="apx-clinic-methods__name">Efectivo</strong>
              <p className="apx-clinic-methods__hint">Moneda nacional (Soles) y Dólares al cambio oficial del día.</p>
            </div>
          </div>

          <div className="apx-clinic-methods__card">
            <div className="apx-clinic-methods__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <div>
              <strong className="apx-clinic-methods__name">Tarjetas de Débito y Crédito</strong>
              <p className="apx-clinic-methods__hint">Aceptamos Visa, Mastercard, Diners y Amex en POS sin recargo.</p>
            </div>
          </div>

          <div className="apx-clinic-methods__card">
            <div className="apx-clinic-methods__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <div>
              <strong className="apx-clinic-methods__name">Billeteras Digitales</strong>
              <p className="apx-clinic-methods__hint">Yape y Plin mediante código QR oficial en el counter de atención.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Arrival recommendation */}
      <div className="apx-clinic-instructions">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <p>
          Te recomendamos llegar <strong>10 a 15 minutos antes</strong> a {location} ({locationAddress}) para validar tu documento de identidad y recibir tu pase de atención médica.
        </p>
      </div>
    </div>
  );
};

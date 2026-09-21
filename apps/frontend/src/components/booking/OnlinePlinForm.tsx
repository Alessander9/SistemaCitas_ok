import React from 'react';
import { PlinPaymentFormValues } from './appointmentTypes';

export interface OnlinePlinFormProps {
  values: PlinPaymentFormValues;
  onChange: (values: PlinPaymentFormValues) => void;
  price: number;
  currency?: string;
  disabled?: boolean;
}

export const OnlinePlinForm: React.FC<OnlinePlinFormProps> = ({
  values,
  onChange,
  price,
  currency = 'PEN',
  disabled = false,
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    onChange({ ...values, phoneNumber: raw });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange({ ...values, otpCode: raw });
  };

  return (
    <div className="apx-wallet-form apx-wallet-form--plin" aria-label="Pago con Plin">
      <div className="apx-wallet-form__header">
        <div className="apx-wallet-badge apx-wallet-badge--plin">
          <span className="apx-wallet-badge__logo">plin</span>
          <span className="apx-wallet-badge__text">BBVA, Interbank, Scotiabank, BanBif</span>
        </div>
      </div>

      <div className="apx-wallet-form__grid">
        {/* QR Section */}
        <div className="apx-wallet-qr-box">
          <div className="apx-wallet-qr-frame">
            <svg
              viewBox="0 0 120 120"
              className="apx-wallet-qr-svg"
              aria-label="Código QR Plin"
            >
              <rect width="120" height="120" fill="#ffffff" rx="8" />
              <rect x="12" y="12" width="32" height="32" rx="4" fill="#0080FF" />
              <rect x="18" y="18" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="23" y="23" width="10" height="10" rx="1" fill="#0080FF" />

              <rect x="76" y="12" width="32" height="32" rx="4" fill="#0080FF" />
              <rect x="82" y="18" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="87" y="23" width="10" height="10" rx="1" fill="#0080FF" />

              <rect x="12" y="76" width="32" height="32" rx="4" fill="#0080FF" />
              <rect x="18" y="82" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="23" y="87" width="10" height="10" rx="1" fill="#0080FF" />

              <rect x="52" y="14" width="8" height="8" rx="1" fill="#0080FF" />
              <rect x="64" y="22" width="6" height="6" rx="1" fill="#0080FF" />
              <rect x="48" y="48" width="24" height="24" rx="3" fill="#0080FF" />
              <rect x="54" y="54" width="12" height="12" rx="2" fill="#00C48C" />
              <rect x="80" y="52" width="8" height="12" rx="1" fill="#0080FF" />
              <rect x="52" y="80" width="12" height="8" rx="1" fill="#0080FF" />
              <rect x="70" y="84" width="8" height="12" rx="1" fill="#0080FF" />
              <rect x="80" y="96" width="14" height="12" rx="1" fill="#0080FF" />
            </svg>
          </div>
          <div className="apx-wallet-qr-amount">
            Monto a plinear:{' '}
            <strong>
              {currency === 'USD' ? '$' : 'S/'} {price.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Inputs */}
        <div className="apx-wallet-fields">
          <div className="apx-field">
            <label htmlFor="plin-phone" className="apx-field__label">
              Número celular registrado en Plin
            </label>
            <input
              id="plin-phone"
              type="tel"
              inputMode="numeric"
              placeholder="987 654 321"
              className="apx-input"
              value={values.phoneNumber}
              onChange={handlePhoneChange}
              disabled={disabled}
              maxLength={9}
            />
          </div>

          <div className="apx-field">
            <label htmlFor="plin-otp" className="apx-field__label">
              Código de confirmación / Clave dinámica
            </label>
            <input
              id="plin-otp"
              type="password"
              inputMode="numeric"
              placeholder="123456"
              className="apx-input apx-input--code"
              value={values.otpCode}
              onChange={handleOtpChange}
              disabled={disabled}
              maxLength={6}
            />
          </div>

          <div className="apx-wallet-instructions">
            <p>1. Transfiere mediante Plin desde tu app bancaria (BBVA, Interbank, Scotiabank).</p>
            <p>2. Ingresa el número de operación o clave temporal generada.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

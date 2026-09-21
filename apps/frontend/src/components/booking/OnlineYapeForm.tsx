import React from 'react';
import { YapePaymentFormValues } from './appointmentTypes';

export interface OnlineYapeFormProps {
  values: YapePaymentFormValues;
  onChange: (values: YapePaymentFormValues) => void;
  price: number;
  currency?: string;
  disabled?: boolean;
}

export const OnlineYapeForm: React.FC<OnlineYapeFormProps> = ({
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

  const handleApprovalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange({ ...values, approvalCode: raw });
  };

  return (
    <div className="apx-wallet-form apx-wallet-form--yape" aria-label="Pago con Yape">
      <div className="apx-wallet-form__header">
        <div className="apx-wallet-badge apx-wallet-badge--yape">
          <span className="apx-wallet-badge__logo">yape</span>
          <span className="apx-wallet-badge__text">Pago directo con QR o Código de Aprobación</span>
        </div>
      </div>

      <div className="apx-wallet-form__grid">
        {/* QR Section */}
        <div className="apx-wallet-qr-box">
          <div className="apx-wallet-qr-frame">
            <svg
              viewBox="0 0 120 120"
              className="apx-wallet-qr-svg"
              aria-label="Código QR Yape"
            >
              <rect width="120" height="120" fill="#ffffff" rx="8" />
              {/* Stylized QR patterns */}
              <rect x="12" y="12" width="32" height="32" rx="4" fill="#742284" />
              <rect x="18" y="18" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="23" y="23" width="10" height="10" rx="1" fill="#742284" />

              <rect x="76" y="12" width="32" height="32" rx="4" fill="#742284" />
              <rect x="82" y="18" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="87" y="23" width="10" height="10" rx="1" fill="#742284" />

              <rect x="12" y="76" width="32" height="32" rx="4" fill="#742284" />
              <rect x="18" y="82" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="23" y="87" width="10" height="10" rx="1" fill="#742284" />

              {/* Data dots */}
              <rect x="52" y="14" width="8" height="8" rx="1" fill="#742284" />
              <rect x="64" y="22" width="6" height="6" rx="1" fill="#742284" />
              <rect x="52" y="32" width="12" height="6" rx="1" fill="#742284" />
              <rect x="14" y="52" width="8" height="10" rx="1" fill="#742284" />
              <rect x="30" y="54" width="10" height="8" rx="1" fill="#742284" />
              <rect x="48" y="48" width="24" height="24" rx="3" fill="#742284" />
              <rect x="54" y="54" width="12" height="12" rx="2" fill="#00D3B8" />
              <rect x="80" y="52" width="8" height="12" rx="1" fill="#742284" />
              <rect x="94" y="60" width="12" height="8" rx="1" fill="#742284" />
              <rect x="52" y="80" width="12" height="8" rx="1" fill="#742284" />
              <rect x="70" y="84" width="8" height="12" rx="1" fill="#742284" />
              <rect x="86" y="80" width="18" height="10" rx="1" fill="#742284" />
              <rect x="80" y="96" width="14" height="12" rx="1" fill="#742284" />
              <rect x="52" y="96" width="10" height="12" rx="1" fill="#742284" />
            </svg>
          </div>
          <div className="apx-wallet-qr-amount">
            Monto a yapear:{' '}
            <strong>
              {currency === 'USD' ? '$' : 'S/'} {price.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Inputs */}
        <div className="apx-wallet-fields">
          <div className="apx-field">
            <label htmlFor="yape-phone" className="apx-field__label">
              Número celular registrado en Yape
            </label>
            <input
              id="yape-phone"
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
            <div className="apx-field__label-with-help">
              <label htmlFor="yape-code" className="apx-field__label">
                Código de aprobación (6 dígitos)
              </label>
              <span
                className="apx-cvv-help"
                title="Genera tu código de aprobación desde el menú lateral de tu app Yape"
              >
                ?
              </span>
            </div>
            <input
              id="yape-code"
              type="password"
              inputMode="numeric"
              placeholder="123456"
              className="apx-input apx-input--code"
              value={values.approvalCode}
              onChange={handleApprovalCodeChange}
              disabled={disabled}
              maxLength={6}
            />
          </div>

          <div className="apx-wallet-instructions">
            <p>1. Abre tu app <strong>Yape</strong> y entra al menú &gt; <em>Código de aprobación</em>.</p>
            <p>2. Ingresa el código de 6 dígitos para autorizar el cobro exacto.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CardPaymentFormValues } from './appointmentTypes';

export interface OnlineCardFormProps {
  values: CardPaymentFormValues;
  onChange: (values: CardPaymentFormValues) => void;
  disabled?: boolean;
}

export const OnlineCardForm: React.FC<OnlineCardFormProps> = ({
  values,
  onChange,
  disabled = false,
}) => {
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    onChange({ ...values, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    }
    onChange({ ...values, expiryDate: raw });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({ ...values, cvv: raw });
  };

  const handleHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, cardHolder: e.target.value.toUpperCase() });
  };

  const handleSaveCardToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, saveCard: e.target.checked });
  };

  return (
    <div className="apx-card-form" aria-label="Formulario de tarjeta de crédito o débito">
      <div className="apx-card-form__header">
        <div className="apx-card-form__title-wrap">
          <h4 className="apx-card-form__title">Datos de la tarjeta</h4>
        </div>
        <div className="apx-card-form__secure-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div className="apx-card-form__secure-text">
            <span className="apx-card-form__secure-label">Pago seguro</span>
            <span className="apx-card-form__secure-sub">Procesado por pasarela certificada</span>
          </div>
        </div>
      </div>

      <div className="apx-card-form__body">
        {/* Número de tarjeta */}
        <div className="apx-field">
          <label htmlFor="card-number" className="apx-field__label">
            Número de tarjeta
          </label>
          <div className="apx-input-wrapper apx-input-wrapper--with-brands">
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              className="apx-input"
              value={values.cardNumber}
              onChange={handleCardNumberChange}
              disabled={disabled}
              maxLength={19}
            />
            <div className="apx-card-brands" aria-hidden="true">
              <span className="apx-brand-pill apx-brand-pill--visa">VISA</span>
              <span className="apx-brand-pill apx-brand-pill--mc">MC</span>
              <span className="apx-brand-pill apx-brand-pill--amex">AMEX</span>
            </div>
          </div>
        </div>

        {/* Row Expiración y CVV */}
        <div className="apx-card-form__row">
          <div className="apx-field">
            <label htmlFor="card-expiry" className="apx-field__label">
              Fecha de vencimiento
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / AA"
              className="apx-input"
              value={values.expiryDate}
              onChange={handleExpiryChange}
              disabled={disabled}
              maxLength={7}
            />
          </div>

          <div className="apx-field">
            <div className="apx-field__label-with-help">
              <label htmlFor="card-cvv" className="apx-field__label">
                Código de seguridad (CVV)
              </label>
              <span
                className="apx-cvv-help"
                title="3 dígitos al reverso de tu tarjeta o 4 dígitos al frente si es American Express"
                aria-label="Información sobre CVV"
              >
                ?
              </span>
            </div>
            <input
              id="card-cvv"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              className="apx-input"
              value={values.cvv}
              onChange={handleCvvChange}
              disabled={disabled}
              maxLength={4}
            />
          </div>
        </div>

        {/* Nombre del titular */}
        <div className="apx-field">
          <label htmlFor="card-holder" className="apx-field__label">
            Nombre del titular
          </label>
          <input
            id="card-holder"
            type="text"
            autoComplete="cc-name"
            placeholder="Como aparece en la tarjeta"
            className="apx-input"
            value={values.cardHolder}
            onChange={handleHolderChange}
            disabled={disabled}
          />
        </div>

        {/* Guardar tarjeta checkbox */}
        <label className="apx-card-save-toggle">
          <input
            type="checkbox"
            className="apx-card-save-toggle__input"
            checked={values.saveCard}
            onChange={handleSaveCardToggle}
            disabled={disabled}
          />
          <div className="apx-card-save-toggle__content">
            <span className="apx-card-save-toggle__title">
              Guardar tarjeta para futuras reservas
            </span>
            <span className="apx-card-save-toggle__subtitle">
              Podrás utilizarla de forma rápida y segura sin volver a ingresar los datos.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

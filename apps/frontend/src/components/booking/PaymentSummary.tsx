import React from 'react';
import { IconCreditCard, IconShieldCheck, IconClock } from './AppointmentIcons';
import { PaymentSummaryModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface PaymentSummaryProps {
  payment: PaymentSummaryModel;
}

/**
 * Right-hand payment card: what is being paid, how long it lasts and the final
 * amount with maximum contrast (the total is the key decision driver here).
 */
export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ payment }) => (
  <section className="apx-payment" aria-labelledby="apx-payment-title">
    <header className="apx-payment__header">
      <span className="apx-payment__header-icon" aria-hidden="true">
        <IconCreditCard size={18} />
      </span>
      <span>
        <h3 className="apx-payment__title" id="apx-payment-title">
          Resumen de pago
        </h3>
        <span className="apx-payment__subtitle">Detalle de tu reserva</span>
      </span>
    </header>

    <dl className="apx-payment__rows">
      <div className="apx-payment__row">
        <dt>{payment.serviceName}</dt>
        <dd>{payment.priceLabel}</dd>
      </div>
      <div className="apx-payment__row apx-payment__row--muted">
        <dt>
          <IconClock size={14} className="apx-icon apx-icon--muted" />
          Duración
        </dt>
        <dd>{payment.durationLabel}</dd>
      </div>
    </dl>

    <div className="apx-payment__total">
      <span className="apx-payment__total-label">Total a pagar</span>
      <p className="apx-payment__total-value">
        {payment.totalPrefix} {payment.totalValue}
        <span className="apx-payment__total-currency">{payment.totalCurrency}</span>
      </p>
    </div>

    <p className="apx-payment__note">
      <span className="apx-payment__note-icon" aria-hidden="true">
        <IconShieldCheck size={16} />
      </span>
      <span>
        <strong>Pago seguro</strong>
        {payment.note}
      </span>
    </p>
  </section>
);

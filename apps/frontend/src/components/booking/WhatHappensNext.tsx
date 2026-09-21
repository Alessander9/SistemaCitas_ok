import React from 'react';
import { IconFileText } from '../ui/Icons';
import './AppointmentStep.css';

export interface WhatHappensNextProps {
  className?: string;
}

/**
 * Visual 3-step guide explaining what happens after the patient confirms.
 * 1. Confirmas tu reserva
 * 2. Procesamos la información
 * 3. Recibes la confirmación
 */
export const WhatHappensNext: React.FC<WhatHappensNextProps> = ({ className = '' }) => (
  <div className={`apx-whathappens ${className}`.trim()} aria-label="¿Qué sucede después?">
    <div className="apx-whathappens__header">
      <span className="apx-whathappens__header-icon" aria-hidden="true">
        <IconFileText size={18} />
      </span>
      <h3 className="apx-whathappens__title">¿Qué sucede después?</h3>
    </div>

    <ol className="apx-whathappens__steps">
      <li className="apx-whathappens__step">
        <span className="apx-whathappens__number" aria-hidden="true">
          1
        </span>
        <div className="apx-whathappens__step-content">
          <strong className="apx-whathappens__step-title">Confirmas tu reserva</strong>
          <p className="apx-whathappens__step-desc">Selecciona tu método de pago y continúa.</p>
        </div>
      </li>

      <li className="apx-whathappens__step">
        <span className="apx-whathappens__number" aria-hidden="true">
          2
        </span>
        <div className="apx-whathappens__step-content">
          <strong className="apx-whathappens__step-title">Procesamos la información</strong>
          <p className="apx-whathappens__step-desc">
            Verificamos tu pago o registramos tu reserva en clínica.
          </p>
        </div>
      </li>

      <li className="apx-whathappens__step">
        <span className="apx-whathappens__number" aria-hidden="true">
          3
        </span>
        <div className="apx-whathappens__step-content">
          <strong className="apx-whathappens__step-title">Recibes la confirmación</strong>
          <p className="apx-whathappens__step-desc">
            Te enviaremos los detalles de tu cita por WhatsApp y correo.
          </p>
        </div>
      </li>
    </ol>
  </div>
);

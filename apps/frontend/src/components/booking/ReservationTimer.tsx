import React, { useEffect, useState } from 'react';
import { IconClock } from './AppointmentIcons';
import './AppointmentStep.css';

export interface ReservationTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
  className?: string;
}

/**
 * Reservation countdown timer.
 * Displays "Tu horario está reservado temporalmente" + dynamic mm:ss countdown.
 */
export const ReservationTimer: React.FC<ReservationTimerProps> = ({
  initialSeconds = 600, // 10 minutes default
  onExpire,
  className = '',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onExpire?.();
      return undefined;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpiringSoon = secondsRemaining < 120 && secondsRemaining > 0;
  const isExpired = secondsRemaining === 0;

  return (
    <div
      className={`apx-timer-banner${isExpiringSoon ? ' is-warning' : ''}${
        isExpired ? ' is-expired' : ''
      } ${className}`.trim()}
      role="timer"
      aria-live="polite"
      aria-label={`Tiempo restante de reserva: ${formattedTime}`}
    >
      <span className="apx-timer-banner__icon" aria-hidden="true">
        <IconClock size={20} />
      </span>
      <div className="apx-timer-banner__text">
        <strong className="apx-timer-banner__title">
          {isExpired ? 'Tiempo de reserva expirado' : 'Tu horario está reservado temporalmente'}
        </strong>
        <p className="apx-timer-banner__desc">
          {isExpired ? (
            'Por favor, regresa a seleccionar tu horario para continuar.'
          ) : (
            <>
              Tienes <strong className="apx-timer-banner__countdown">{formattedTime} minutos</strong> para completar tu reserva.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

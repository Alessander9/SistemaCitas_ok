import React from 'react';
import { IconArrowRight } from '../ui/Icons';
import { IconArrowLeft, IconShieldCheck } from './AppointmentIcons';
import './AppointmentStep.css';

export interface AppointmentNavigationProps {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  /** Blocks the primary action while the wizard is persisting data. */
  isBusy?: boolean;
  busyLabel?: string;
  /** Contextual hint shown next to the primary action. */
  hint?: string;
  /**
   * Steps whose primary action lives inside the content (step 7 CTA) hide the
   * footer button and show a trust note instead, so the action never duplicates.
   */
  showNext?: boolean;
  note?: string;
}

/**
 * Sticky wizard footer: secondary "back" action on the left, primary CTA on the
 * right. The primary action stays disabled until the step requirement is met.
 */
export const AppointmentNavigation: React.FC<AppointmentNavigationProps> = ({
  onBack,
  onNext,
  backLabel = 'Volver',
  nextLabel = 'Continuar',
  backDisabled = false,
  nextDisabled = false,
  isBusy = false,
  busyLabel = 'Procesando cita...',
  hint,
  showNext = true,
  note,
}) => (
  <footer className="apx-nav">
    <button
      type="button"
      className="apx-nav__back"
      onClick={onBack}
      disabled={backDisabled}
    >
      <IconArrowLeft size={16} />
      {backLabel}
    </button>

    <div className="apx-nav__right">
      {showNext ? (
        <>
          {hint && <span className="apx-nav__hint">{hint}</span>}
          <button
            type="button"
            className="apx-nav__next"
            onClick={onNext}
            disabled={nextDisabled || isBusy}
          >
            {isBusy ? busyLabel : nextLabel}
            {!isBusy && <IconArrowRight size={17} />}
          </button>
        </>
      ) : (
        note && (
          <p className="apx-nav__note">
            <IconShieldCheck size={15} />
            {note}
          </p>
        )
      )}
    </div>
  </footer>
);

import React from 'react';
import { AppointmentStepDefinition } from './appointmentTypes';
import { IconCheck } from './AppointmentIcons';
import './AppointmentStep.css';

export interface AppointmentStepperProps {
  steps: AppointmentStepDefinition[];
  /** Index of the milestone currently in progress (0-based). */
  activeIndex: number;
}

/**
 * Horizontal milestone stepper. Already visited milestones render as done,
 * the current one as active and the rest as upcoming (muted).
 */
export const AppointmentStepper: React.FC<AppointmentStepperProps> = ({ steps, activeIndex }) => (
  <nav className="apx-stepper" aria-label="Etapas de la reserva">
    <ol className="apx-stepper__list">
      {steps.map((step, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming';
        return (
          <li
            key={step.id}
            className={`apx-stepper__item is-${state}`}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span className="apx-stepper__marker">
              {state === 'done' ? <IconCheck size={14} /> : index + 1}
            </span>
            <span className="apx-stepper__label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  </nav>
);

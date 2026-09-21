import React, { useId } from 'react';
import './AppointmentStep.css';

// =============================================================================
// CitasSistema — ConsentCard
// Clickable policy acceptance card. The whole surface is the interactive area;
// no isolated HTML checkbox. Supports default / hover / selected / error / focus.
// =============================================================================

export interface ConsentCardProps {
  /** Unique id for aria wiring. */
  id: string;
  /** Card heading, e.g. "Política de cancelación y reprogramación". */
  title: string;
  /** Short badge label shown next to the title, e.g. "Obligatorio". */
  badge?: string;
  /** SVG icon node rendered inside the icon bubble. */
  icon: React.ReactNode;
  /** Summary body text (not the full legal document — link handles that). */
  body: string;
  /** Label for the "read full policy" link, e.g. "Leer política completa →". */
  linkLabel?: string;
  /** Whether the policy has been accepted by the patient. */
  accepted: boolean;
  /** Highlight error state (shown after a failed submit attempt). */
  hasError?: boolean;
  /** Called when the patient toggles the card acceptance. */
  onToggle: () => void;
  /** Called when the patient clicks the "read full policy" link. */
  onReadMore?: () => void;
  /** Timestamp when the policy was accepted (shown in accepted state). */
  acceptedAt?: string;
}

/**
 * Full-surface clickable consent card.
 *
 * Accessibility contract:
 * – The underlying checkbox drives the accessible state.
 * – The visible indicator mimics a radio/checkbox but uses the native element.
 * – `aria-describedby` connects the body text to the checkbox for screen readers.
 * – The "read more" link stops propagation so it doesn't trigger the toggle.
 */
export const ConsentCard: React.FC<ConsentCardProps> = ({
  id,
  title,
  badge,
  icon,
  body,
  linkLabel,
  accepted,
  hasError = false,
  onToggle,
  onReadMore,
  acceptedAt,
}) => {
  const checkboxId = `consent-${id}`;
  const descId = useId();

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadMore?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className={[
        'apx-consent-card',
        accepted ? 'is-selected' : '',
        hasError && !accepted ? 'is-error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={accepted}
      aria-labelledby={`${checkboxId}-label`}
      aria-describedby={descId}
      tabIndex={0}
    >
      {/* Hidden native checkbox for form submission and accessibility tree */}
      <input
        type="checkbox"
        id={checkboxId}
        checked={accepted}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="apx-visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="apx-consent-card__body">
        {/* Left: icon bubble */}
        <span className="apx-consent-card__icon-wrap" aria-hidden="true">
          {icon}
        </span>

        {/* Center: content */}
        <div className="apx-consent-card__content">
          <div className="apx-consent-card__header-row">
            <span className="apx-consent-card__title" id={`${checkboxId}-label`}>
              {title}
            </span>
            {badge && (
              <span className="apx-consent-card__badge">{badge}</span>
            )}
          </div>

          <p className="apx-consent-card__text" id={descId}>
            {body}
          </p>

          {linkLabel && onReadMore && (
            <button
              type="button"
              className="apx-consent-card__link"
              onClick={handleLinkClick}
              aria-label={`${linkLabel} sobre: ${title}`}
            >
              {linkLabel}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Right: acceptance indicator */}
        <div className="apx-consent-card__indicator" aria-hidden="true">
          <span className={`apx-consent-card__checkbox-visual${accepted ? ' is-checked' : ''}`}>
            {accepted && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          {accepted ? (
            <div className="apx-consent-card__accepted-label">
              <span className="apx-consent-card__accepted-text">Acepto esta política</span>
              {acceptedAt && (
                <span className="apx-consent-card__accepted-meta">
                  Aceptada · {acceptedAt}
                </span>
              )}
            </div>
          ) : (
            <span className="apx-consent-card__pending-text">Acepto esta política</span>
          )}
        </div>
      </div>
    </div>
  );
};

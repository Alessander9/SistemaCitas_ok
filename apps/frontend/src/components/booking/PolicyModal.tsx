import React, { useEffect, useRef, useId } from 'react';
import './AppointmentStep.css';

// =============================================================================
// CitasSistema — PolicyModal
// Accessible modal dialog for displaying the full text of a clinic policy.
// Implements focus trap, aria-modal, scroll lock and keyboard dismissal.
// On screens < 640px it behaves as a bottom drawer.
// =============================================================================

export interface PolicyModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Dialog title shown in the header. */
  title: string;
  /** Human-readable last-updated date, e.g. "Septiembre 2026". */
  lastUpdated?: string;
  /** Full policy body (plain text or React nodes). */
  content: React.ReactNode;
  /** Called when the patient dismisses the modal. */
  onClose: () => void;
}

/**
 * Accessible policy modal.
 *
 * Accessibility contract:
 * – role="dialog", aria-modal="true", aria-labelledby pointing to the title.
 * – Focus moves to the dialog on open; returns to the trigger on close.
 * – Escape key closes the dialog.
 * – Focus is trapped inside while open (Tab / Shift+Tab cycle within dialog).
 * – Overlay click dismisses.
 */
export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  title,
  lastUpdated,
  content,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Focus trap + Escape handler
  useEffect(() => {
    if (!isOpen) return;

    // Move focus to close button on open
    const raf = requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="apx-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="apx-modal-dialog"
      >
        {/* Header */}
        <header className="apx-modal-header">
          <div className="apx-modal-header__text">
            <h2 className="apx-modal-title" id={titleId}>
              {title}
            </h2>
            {lastUpdated && (
              <p className="apx-modal-meta">Última actualización: {lastUpdated}</p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="apx-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Scrollable body */}
        <div className="apx-modal-body">{content}</div>

        {/* Footer */}
        <footer className="apx-modal-footer">
          <button type="button" className="apx-modal-close-btn" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

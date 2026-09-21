import React from 'react';
import { IconCalendar, IconPencil, IconSwap, IconUser } from './AppointmentIcons';
import { ReviewBlockModel } from './appointmentTypes';
import './AppointmentStep.css';

export type ReviewActionIcon = 'pencil' | 'swap' | 'calendar' | 'user';

/** Shared props of every step 7 review card. */
export interface ReviewCardProps {
  block: ReviewBlockModel;
  /** Returns to the wizard step that owns the block, keeping the booking. */
  onEdit?: (step: number) => void;
}

export interface ReviewBlockProps {
  block: ReviewBlockModel;
  /** Icon resolved by the card that owns the block. */
  icon: React.ReactNode;
  /** Returns to the wizard step that owns the block, keeping the booking. */
  onEdit?: (step: number) => void;
  actionIcon?: ReviewActionIcon;
}

const renderActionIcon = (icon: ReviewActionIcon) => {
  if (icon === 'swap') return <IconSwap size={14} />;
  if (icon === 'calendar') return <IconCalendar size={14} />;
  if (icon === 'user') return <IconUser size={14} />;
  return <IconPencil size={14} />;
};

/**
 * One reviewable line of the booking: icon, label, value (with its meta chips,
 * photo and description) and the action that goes back to the owning step.
 * No action is rendered when the block has no editable step.
 */
export const ReviewBlock: React.FC<ReviewBlockProps> = ({
  block,
  icon,
  onEdit,
  actionIcon = 'pencil',
}) => {
  const canEdit = Boolean(onEdit && block.editStep);
  const actionLabel = block.editLabel ?? 'Editar';

  return (
    <div className={`apx-review-block${block.isIncomplete ? ' is-incomplete' : ''}`}>
      <span className="apx-review-block__icon" aria-hidden="true">
        {icon}
      </span>

      <span className="apx-review-block__label">{block.label}</span>

      <div className="apx-review-block__content">
        {block.photoUrl && (
          <img
            className="apx-review-block__photo"
            src={block.photoUrl}
            alt=""
            loading="lazy"
          />
        )}

        <div className="apx-review-block__text">
          <p className="apx-review-block__title">{block.title}</p>
          {block.description && <p className="apx-review-block__desc">{block.description}</p>}

          {block.meta && block.meta.length > 0 && (
            <ul className="apx-review-block__meta">
              {block.meta.map((item) => (
                <li className="apx-review-block__chip" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {canEdit && (
        <button
          type="button"
          className="apx-review-block__action"
          onClick={() => onEdit?.(block.editStep as number)}
          aria-label={`${actionLabel}: ${block.label}`}
        >
          {renderActionIcon(actionIcon)}
          {actionLabel}
        </button>
      )}
    </div>
  );
};

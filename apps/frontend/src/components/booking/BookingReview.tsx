import React from 'react';
import { IconFileText } from '../ui/Icons';
import { IconClipboardList, IconInfo, IconLocation } from './AppointmentIcons';
import { DateTimeReviewCard } from './DateTimeReviewCard';
import { PatientReviewCard } from './PatientReviewCard';
import { ProfessionalReviewCard } from './ProfessionalReviewCard';
import { ReviewBlock } from './ReviewBlock';
import { ServiceReviewCard } from './ServiceReviewCard';
import { SpecialtyReviewCard } from './SpecialtyReviewCard';
import { ReviewBlockModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface BookingReviewProps {
  blocks: ReviewBlockModel[];
  /** Returns to the wizard step that owns a block, without losing the booking. */
  onEditStep?: (step: number) => void;
}

/** Resolves the card/icon that renders each block (order comes from the data). */
const renderBlock = (block: ReviewBlockModel, onEditStep?: (step: number) => void) => {
  switch (block.id) {
    case 'specialty':
      return <SpecialtyReviewCard block={block} onEdit={onEditStep} />;
    case 'service':
      return <ServiceReviewCard block={block} onEdit={onEditStep} />;
    case 'professional':
      return <ProfessionalReviewCard block={block} onEdit={onEditStep} />;
    case 'datetime':
      return <DateTimeReviewCard block={block} onEdit={onEditStep} />;
    case 'patient':
      return <PatientReviewCard block={block} onEdit={onEditStep} />;
    case 'location':
      return <ReviewBlock block={block} icon={<IconLocation size={20} />} onEdit={onEditStep} />;
    case 'reason':
      return <ReviewBlock block={block} icon={<IconFileText size={20} />} onEdit={onEditStep} />;
    default:
      return <ReviewBlock block={block} icon={<IconInfo size={20} />} onEdit={onEditStep} />;
  }
};

/** Card with every detail of the booking, each one editable on its own step. */
export const BookingReview: React.FC<BookingReviewProps> = ({ blocks, onEditStep }) => (
  <section className="apx-review" aria-labelledby="apx-review-title">
    <header className="apx-review__header">
      <span className="apx-review__header-icon" aria-hidden="true">
        <IconClipboardList size={19} />
      </span>
      <h3 className="apx-review__title" id="apx-review-title">
        Detalles de tu cita
      </h3>
    </header>

    <div className="apx-review__blocks">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={`apx-review__col${block.id === 'reason' ? ' apx-review__col--full' : ''}`}
        >
          {renderBlock(block, onEditStep)}
        </div>
      ))}
    </div>
  </section>
);

import React from 'react';
import { resolveSpecialtyIcon } from './AppointmentIcons';
import { ReviewBlock, ReviewCardProps } from './ReviewBlock';
import './AppointmentStep.css';

/** Review line of the chosen specialty (icon matches steps 1-2). */
export const SpecialtyReviewCard: React.FC<ReviewCardProps> = ({ block, onEdit }) => {
  const SpecialtyIcon = resolveSpecialtyIcon(block.specialtyIconKey ?? 'default');
  return <ReviewBlock block={block} icon={<SpecialtyIcon size={20} />} onEdit={onEdit} />;
};

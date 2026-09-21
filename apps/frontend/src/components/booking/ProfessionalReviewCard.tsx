import React from 'react';
import { IconUser } from './AppointmentIcons';
import { ReviewBlock, ReviewCardProps } from './ReviewBlock';
import './AppointmentStep.css';

/** Review line of the assigned professional (photo + license). */
export const ProfessionalReviewCard: React.FC<ReviewCardProps> = ({ block, onEdit }) => (
  <ReviewBlock
    block={block}
    icon={<IconUser size={20} />}
    onEdit={onEdit}
    actionIcon="user"
  />
);

import React from 'react';
import { IconCalendar } from './AppointmentIcons';
import { ReviewBlock, ReviewCardProps } from './ReviewBlock';
import './AppointmentStep.css';

/** Review line of the appointment date and time range. */
export const DateTimeReviewCard: React.FC<ReviewCardProps> = ({ block, onEdit }) => (
  <ReviewBlock
    block={block}
    icon={<IconCalendar size={20} />}
    onEdit={onEdit}
    actionIcon="calendar"
  />
);

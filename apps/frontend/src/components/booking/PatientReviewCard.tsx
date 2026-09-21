import React from 'react';
import { IconUser } from './AppointmentIcons';
import { ReviewBlock, ReviewCardProps } from './ReviewBlock';
import './AppointmentStep.css';

/** Review line of the patient data (document, phone, e-mail). */
export const PatientReviewCard: React.FC<ReviewCardProps> = ({ block, onEdit }) => (
  <ReviewBlock block={block} icon={<IconUser size={20} />} onEdit={onEdit} />
);

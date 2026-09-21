import React from 'react';
import { IconFileText } from '../ui/Icons';
import { ReviewBlock, ReviewCardProps } from './ReviewBlock';
import './AppointmentStep.css';

/** Review line of the chosen service (duration + price chips). */
export const ServiceReviewCard: React.FC<ReviewCardProps> = ({ block, onEdit }) => (
  <ReviewBlock block={block} icon={<IconFileText size={20} />} onEdit={onEdit} />
);

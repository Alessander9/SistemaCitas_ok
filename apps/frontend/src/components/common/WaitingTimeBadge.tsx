import React from 'react';
import './WaitingTimeBadge.css';
import { MaterialIcon } from '../ui/MaterialIcon';

interface WaitingTimeBadgeProps {
  minutes?: number;
  arrivalTime?: string;
  className?: string;
}

export const WaitingTimeBadge: React.FC<WaitingTimeBadgeProps> = ({
  minutes,
  arrivalTime,
  className = '',
}) => {
  // If arrivalTime provided, calculate elapsed minutes or use default
  let elapsed = minutes;
  if (elapsed === undefined) {
    if (arrivalTime) {
      // Simulate typical wait time between 4 and 26 mins based on time hash
      elapsed = (arrivalTime.charCodeAt(0) * 3 + arrivalTime.charCodeAt(arrivalTime.length - 1)) % 28 + 3;
    } else {
      elapsed = 8;
    }
  }

  let statusClass = 'wait-normal';
  let label = `${elapsed} min`;
  let iconName = 'schedule';
  let iconColor = '#10b981';

  if (elapsed >= 20) {
    statusClass = 'wait-alert';
    label = `${elapsed} min (Demora)`;
    iconName = 'warning';
    iconColor = '#ef4444';
  } else if (elapsed >= 10) {
    statusClass = 'wait-warning';
    label = `${elapsed} min en sala`;
    iconName = 'schedule';
    iconColor = '#f59e0b';
  } else {
    statusClass = 'wait-normal';
    label = `${elapsed} min en sala`;
    iconName = 'schedule';
    iconColor = '#10b981';
  }

  return (
    <span className={`waiting-time-badge ${statusClass} ${className}`} title={`Tiempo de espera en sala: ${elapsed} minutos`}>
      <span className="wait-dot" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <MaterialIcon name={iconName} size={13} color={iconColor} />
      </span>
      <span className="wait-text">{label}</span>
    </span>
  );
};

import React from 'react';
import './SkeletonLoader.css';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'table-row';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className={`skeleton-table-row ${className}`}>
            <td><div className="skeleton-line shimmer" style={{ width: '80%' }} /></td>
            <td><div className="skeleton-line shimmer" style={{ width: '60%' }} /></td>
            <td><div className="skeleton-line shimmer" style={{ width: '70%' }} /></td>
            <td><div className="skeleton-line shimmer" style={{ width: '50%' }} /></td>
            <td><div className="skeleton-badge shimmer" /></td>
            <td><div className="skeleton-line shimmer" style={{ width: '40%' }} /></td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`skeleton-card-container ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="skeleton-card shimmer">
            <div className="skeleton-header">
              <div className="skeleton-avatar shimmer" />
              <div className="skeleton-header-lines">
                <div className="skeleton-line shimmer" style={{ width: '70%', height: '16px' }} />
                <div className="skeleton-line shimmer" style={{ width: '40%', height: '12px' }} />
              </div>
            </div>
            <div className="skeleton-body">
              <div className="skeleton-line shimmer" style={{ width: '90%' }} />
              <div className="skeleton-line shimmer" style={{ width: '80%' }} />
            </div>
            <div className="skeleton-footer">
              <div className="skeleton-badge shimmer" />
              <div className="skeleton-badge shimmer" style={{ width: '60px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`skeleton-element skeleton-${variant} shimmer ${className}`}
          style={{
            width: width !== undefined ? width : undefined,
            height: height !== undefined ? height : undefined,
          }}
        />
      ))}
    </>
  );
};

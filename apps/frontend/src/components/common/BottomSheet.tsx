import React, { useEffect, useRef } from 'react';
import './BottomSheet.css';
import { MaterialIcon } from '../ui/MaterialIcon';
import { soundEffects } from '../../utils/soundEffects';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showHandle?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '90vh',
  showHandle = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Touch gesture to slide down & close
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 120) {
      soundEffects.playPop();
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    startY.current = 0;
    currentY.current = 0;
  };

  return (
    <div className="bottomsheet-overlay animate-fade-in" onClick={onClose}>
      <div
        ref={sheetRef}
        className="bottomsheet-container"
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        {showHandle && (
          <div
            className="bottomsheet-handle-bar"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bottomsheet-handle-pill" />
          </div>
        )}

        {/* Header */}
        {(title || subtitle) && (
          <div className="bottomsheet-header">
            <div>
              {title && <h3 className="bottomsheet-title">{title}</h3>}
              {subtitle && <p className="bottomsheet-subtitle">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onClose();
              }}
              className="bottomsheet-close-btn"
              aria-label="Cerrar modal"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcon name="close" size={18} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="bottomsheet-content">
          {children}
        </div>
      </div>
    </div>
  );
};

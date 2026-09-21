import React from 'react';

export interface PaymentLogoProps {
  className?: string;
  size?: number;
}

/** Cash / Efectivo SVG icon */
export const IconCash: React.FC<PaymentLogoProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

/** POS / Tarjeta en clínica SVG icon */
export const IconPosTerminal: React.FC<PaymentLogoProps> = ({ size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="7" y1="15" x2="11" y2="15" />
  </svg>
);

/** Yape stylized badge */
export const LogoYape: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: '6px',
      background: '#742284',
      color: '#ffffff',
      fontWeight: 800,
      fontSize: size * 0.42,
      fontFamily: 'system-ui, sans-serif',
      letterSpacing: '-0.02em',
      lineHeight: 1,
      userSelect: 'none',
    }}
    aria-label="Yape"
  >
    Y
  </span>
);

/** Plin stylized badge */
export const LogoPlin: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: '6px',
      background: '#00b4d8',
      color: '#ffffff',
      fontWeight: 800,
      fontSize: size * 0.42,
      fontFamily: 'system-ui, sans-serif',
      letterSpacing: '-0.02em',
      lineHeight: 1,
      userSelect: 'none',
    }}
    aria-label="Plin"
  >
    P
  </span>
);

/** Visa text mark */
export const LogoVisa: React.FC<{ height?: number }> = ({ height = 16 }) => (
  <span
    style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: 900,
      fontStyle: 'italic',
      fontSize: `${height}px`,
      color: '#1a1f71',
      letterSpacing: '0.04em',
      lineHeight: 1,
      userSelect: 'none',
    }}
    aria-label="Visa"
  >
    VISA
  </span>
);

/** Mastercard overlapping circles logo */
export const LogoMastercard: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size * 1.5}
    height={size}
    viewBox="0 0 36 24"
    fill="none"
    aria-label="Mastercard"
    role="img"
  >
    <circle cx="12" cy="12" r="10" fill="#eb001b" />
    <circle cx="24" cy="12" r="10" fill="#f79e1b" fillOpacity="0.88" />
  </svg>
);

/** American Express stylized mark */
export const LogoAmex: React.FC<{ height?: number }> = ({ height = 14 }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 5px',
      background: '#006fcf',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 800,
      fontSize: `${height * 0.75}px`,
      borderRadius: '3px',
      letterSpacing: '0.05em',
      lineHeight: 1,
      userSelect: 'none',
    }}
    aria-label="American Express"
  >
    AMEX
  </span>
);

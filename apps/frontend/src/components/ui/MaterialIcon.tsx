import React from 'react';

export interface MaterialIconProps {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

/**
 * Google Material Symbols Outlined standard icon component.
 * Replaces system emojis with crisp, professional medical-grade vector icons.
 */
export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size,
  className = '',
  style,
  color,
}) => {
  const iconStyle: React.CSSProperties = {
    fontFamily: "'Material Symbols Outlined', 'Material Icons', sans-serif",
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: size ? (typeof size === 'number' ? `${size}px` : size) : undefined,
    lineHeight: 1,
    letterSpacing: 'normal',
    textTransform: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    color: color,
    WebkitFontSmoothing: 'antialiased',
    ...style,
  };

  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={iconStyle}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};

export default MaterialIcon;

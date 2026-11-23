import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface SuspendedNoticeBannerProps {
  message: string;
  clinicName?: string;
  clinicSlug: string;
  userEmail: string;
}

export const SuspendedNoticeBanner: React.FC<SuspendedNoticeBannerProps> = ({
  message,
  clinicName,
  clinicSlug,
  userEmail,
}) => {
  const whatsappUrl = `https://wa.me/51987654321?text=${encodeURIComponent(
    `Hola, necesito regularizar el pago para reactivar el servicio de mi clínica (${clinicName || clinicSlug}, usuario: ${userEmail}).`,
  )}`;

  return (
    <div
      role="alert"
      style={{
        background: '#fef2f2',
        border: '1.5px solid #fca5a5',
        borderRadius: '12px',
        padding: '1rem 1.15rem',
        marginBottom: '1rem',
        color: '#7f1d1d',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
        <MaterialIcon name="block" size={20} />
        <strong style={{ fontSize: '0.92rem' }}>Servicio suspendido por falta de pago</strong>
      </div>
      <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', lineHeight: 1.5, color: '#991b1b' }}>
        {message}
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: '#16a34a',
          color: '#ffffff',
          padding: '0.55rem 1rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        <MaterialIcon name="chat" size={16} />
        <span>Enviar mensaje para regularizar pago</span>
      </a>
    </div>
  );
};

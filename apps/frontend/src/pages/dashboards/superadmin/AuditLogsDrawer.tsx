import React from 'react';
import { AuditEvent } from './types';
import { IconFileText } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface AuditLogsDrawerProps {
  isOpen: boolean;
  events: AuditEvent[];
  onClose: () => void;
}

export const AuditLogsDrawer: React.FC<AuditLogsDrawerProps> = ({
  isOpen,
  events,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header-custom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconFileText className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Registro Inmutable de Auditoría (Ley N° 29733)
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                Trazabilidad de accesos y tratamientos de datos clínicos sensibles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="modal-body-custom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ fontFamily: 'monospace', color: '#64748b', marginRight: '0.5rem' }}>{evt.time}</span>
                  <strong style={{ color: '#0f172a' }}>{evt.user}</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#7c3aed', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                    [{evt.action}]
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>IP: {evt.ip}</span>
                  <span className="status-pill status-confirmed" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                    {evt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <MaterialIcon name="lock" size={14} />
            <span>Registros criptográficamente firmados</span>
          </span>
          <button type="button" className="cash-btn ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

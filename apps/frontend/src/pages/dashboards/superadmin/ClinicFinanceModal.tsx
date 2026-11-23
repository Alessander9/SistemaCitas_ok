import React from 'react';
import { ClinicRecord } from './types';
import { IconCash } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface ClinicFinanceModalProps {
  clinic: ClinicRecord | null;
  onClose: () => void;
  onSwitchContext: (clinic: ClinicRecord) => void;
  onNavigate?: (view: string) => void;
  onShowToast: (msg: string) => void;
}

export const ClinicFinanceModal: React.FC<ClinicFinanceModalProps> = ({
  clinic,
  onClose,
  onSwitchContext,
  onNavigate,
  onShowToast,
}) => {
  if (!clinic) return null;

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header-custom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCash className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Finanzas & Liquidación: {clinic.name}
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                Sede: {clinic.city} · Facturación del período actual
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
          {/* Financial Big Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Facturación Bruta Mensual</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
                {clinic.monthlyRevenue}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>● {clinic.activeAppointments} citas atendidas</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Margen Red (20%)</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                S/ {(clinic.revenueAmount * 0.2).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Liquidación médicos: 80%</span>
            </div>
          </div>

          {/* Breakdown by Payment Method */}
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem' }}>
              Desglose de Recaudación por Canal de Cobro:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="pref-row" style={{ padding: '0.65rem 0.85rem' }}>
                <div className="pref-info">
                  <h4 style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="credit_card" size={16} />
                    <span>Tarjetas Débito / Crédito (Niubiz & Izipay)</span>
                  </h4>
                  <p>48% de las transacciones</p>
                </div>
                <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                  S/ {(clinic.revenueAmount * 0.48).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="pref-row" style={{ padding: '0.65rem 0.85rem' }}>
                <div className="pref-info">
                  <h4 style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="smartphone" size={16} />
                    <span>Billeteras Digitales (Yape & Plin)</span>
                  </h4>
                  <p>35% de las transacciones</p>
                </div>
                <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                  S/ {(clinic.revenueAmount * 0.35).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="pref-row" style={{ padding: '0.65rem 0.85rem' }}>
                <div className="pref-info">
                  <h4 style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MaterialIcon name="payments" size={16} />
                    <span>Efectivo en Caja Chica (Ventanilla)</span>
                  </h4>
                  <p>17% de las transacciones</p>
                </div>
                <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                  S/ {(clinic.revenueAmount * 0.17).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-custom" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="cash-btn ghost"
            onClick={() => {
              onSwitchContext(clinic);
              onClose();
              onNavigate?.('cash-register');
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <MaterialIcon name="account_balance_wallet" size={15} />
              <span>Ver Caja Chica de esta Sede →</span>
            </span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="cash-btn ghost" onClick={onClose}>
              Cerrar
            </button>
            <button
              type="button"
              className="cash-btn primary"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderColor: '#059669' }}
              onClick={() => {
                onShowToast(
                  `Generando balance contable y liquidación médica para "${clinic.name}" (Ref: LIQ-${new Date().getFullYear()}-09). Descarga iniciada.`,
                );
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <MaterialIcon name="description" size={15} />
                <span>Descargar Reporte (PDF)</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

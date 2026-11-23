import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { PatientReceipt } from './types';
import './PatientDocsPanels.css';

interface PatientPaymentsPanelProps {
  receipts: PatientReceipt[];
  pendingBalance?: number;
  onDownload: (receipt: PatientReceipt) => void;
  showHeading?: boolean;
}

function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

export const PatientPaymentsPanel: React.FC<PatientPaymentsPanelProps> = ({
  receipts,
  pendingBalance = 0,
  onDownload,
  showHeading = true,
}) => {
  const totalPaid = receipts.reduce((sum, rec) => sum + parseAmount(rec.amount), 0);

  return (
    <div className="pdoc-stack">
      {showHeading && (
        <div className="pdoc-section-top">
          <div>
            <h3 className="pdoc-title">Mis pagos y boletas</h3>
            <p className="pdoc-subtitle">Resumen de tus pagos realizados y comprobantes descargables</p>
          </div>
        </div>
      )}

      {/* Barra de tranquilidad financiera */}
      <div className={`pdoc-balance-bar ${pendingBalance > 0 ? 'pending' : 'clear'}`}>
        <div className="pdoc-balance-left">
          <span className="pdoc-balance-icon">
            <MaterialIcon
              name={pendingBalance > 0 ? 'schedule' : 'check_circle'}
              size={20}
            />
          </span>
          <div>
            <strong>
              {pendingBalance > 0
                ? `Tienes un saldo pendiente de S/ ${pendingBalance.toFixed(2)}`
                : 'Estás al día · S/ 0.00 pendiente'}
            </strong>
            <span>
              {receipts.length} comprobante{receipts.length === 1 ? '' : 's'} · Total pagado: S/{' '}
              {totalPaid.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Lista centrada en el servicio */}
      {receipts.length === 0 ? (
        <div className="pdoc-empty">
          <MaterialIcon name="receipt_long" size={28} />
          <p>Aún no tienes comprobantes de pago registrados.</p>
        </div>
      ) : (
        <div className="pdoc-list">
          {receipts.map((rec) => (
            <article key={rec.id} className="pdoc-pay-card">
              <div className="pdoc-pay-left">
                <span className="pdoc-pay-icon">
                  <MaterialIcon name="receipt_long" size={18} />
                </span>
                <div>
                  <h4 className="pdoc-pay-concept">{rec.concept}</h4>
                  <p className="pdoc-pay-meta">
                    {rec.date} · {rec.paymentMethod} · Boleta {rec.number}
                  </p>
                </div>
              </div>

              <div className="pdoc-pay-right">
                <strong className="pdoc-pay-amount">{rec.amount}</strong>
                <button
                  type="button"
                  className="pdoc-btn-outline"
                  onClick={() => onDownload(rec)}
                >
                  <MaterialIcon name="download" size={15} />
                  <span>Descargar boleta</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  AdminClinicFinance,
  fetchAdminNetworkFinance,
} from '../../../services/api/admin.api';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface SuperAdminFinanceViewProps {
  onShowToast: (msg: string) => void;
}

const fmtPen = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const SuperAdminFinanceView: React.FC<SuperAdminFinanceViewProps> = ({
  onShowToast,
}) => {
  const [rows, setRows] = useState<AdminClinicFinance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminNetworkFinance()
      .then((data) => setRows(data))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalCard = rows.reduce((s, r) => s + r.cardRevenue, 0);
  const totalWallet = rows.reduce((s, r) => s + r.digitalWalletRevenue, 0);
  const totalCash = rows.reduce((s, r) => s + r.cashRevenue, 0);

  const handleExportCsv = () => {
    const header = [
      'Sede',
      'Slug',
      'Ciudad',
      'Estado',
      'Citas Mes',
      'Tarjetas (PEN)',
      'Yape/Plin (PEN)',
      'Efectivo (PEN)',
      'Total Mes (PEN)',
    ];
    const csvLines = [
      header.join(','),
      ...rows.map((r) =>
        [
          `"${r.clinicName.replace(/"/g, '""')}"`,
          r.slug,
          `"${r.city.replace(/"/g, '""')}"`,
          r.isActive ? 'Activa' : 'Suspendida',
          r.monthAppointments,
          r.cardRevenue.toFixed(2),
          r.digitalWalletRevenue.toFixed(2),
          r.cashRevenue.toFixed(2),
          r.totalRevenue.toFixed(2),
        ].join(','),
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas-red-clinicas-${new Date().toISOString().slice(0, 7)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Reporte financiero consolidado descargado en formato CSV.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Consolidated KPI Cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Recaudación Total (Mes)</span>
          </div>
          <div className="kpi-value" style={{ color: '#059669' }}>{fmtPen(totalRevenue)}</div>
          <div className="kpi-footer">
            <span style={{ color: '#64748b' }}>Consolidado de {rows.length} sedes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Tarjetas / POS</span>
          </div>
          <div className="kpi-value">{fmtPen(totalCard)}</div>
          <div className="kpi-footer">
            <span style={{ color: '#64748b' }}>Pagos electrónicos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Yape / Plin / Transfer</span>
          </div>
          <div className="kpi-value">{fmtPen(totalWallet)}</div>
          <div className="kpi-footer">
            <span style={{ color: '#64748b' }}>Billeteras digitales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Efectivo en Caja</span>
          </div>
          <div className="kpi-value">{fmtPen(totalCash)}</div>
          <div className="kpi-footer">
            <span style={{ color: '#64748b' }}>Ventanilla de sedes</span>
          </div>
        </div>
      </section>

      {/* Per-Clinic Breakdown Table */}
      <section className="table-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 className="table-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Comparativa Financiera por Sede (Mes Actual)
            </h2>
            <p className="table-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Ingresos calculados directamente desde pagos completados y movimientos de caja en PostgreSQL.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportCsv}
            disabled={rows.length === 0}
          >
            <MaterialIcon name="download" size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="clinical-table-wrapper" style={{ marginTop: '0.75rem' }}>
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Sede</th>
                <th>Citas Mes</th>
                <th>Tarjetas</th>
                <th>Yape / Plin</th>
                <th>Efectivo</th>
                <th style={{ textAlign: 'right' }}>Total Mes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Calculando consolidado financiero...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Sin registros financieros disponibles.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.clinicId}>
                    <td>
                      <div className="patient-name-cell">{r.clinicName}</div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.city}</span>
                    </td>
                    <td>
                      <span className="time-badge">{r.monthAppointments}</span>
                    </td>
                    <td>{fmtPen(r.cardRevenue)}</td>
                    <td>{fmtPen(r.digitalWalletRevenue)}</td>
                    <td>{fmtPen(r.cashRevenue)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f766e' }}>
                      {fmtPen(r.totalRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

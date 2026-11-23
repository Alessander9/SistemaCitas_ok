import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import {
  PatientPastAppointment,
  PatientPrescription,
  PatientReceipt,
} from './types';
import { PatientPrescriptionsPanel } from './PatientPrescriptionsPanel';
import { PatientPaymentsPanel } from './PatientPaymentsPanel';

export type PatientHistoryTab = 'appointments' | 'prescriptions' | 'receipts';

interface PatientHistorySectionProps {
  activeTab: PatientHistoryTab;
  onTabChange: (tab: PatientHistoryTab) => void;
  pastAppointments: PatientPastAppointment[];
  prescriptions: PatientPrescription[];
  receipts: PatientReceipt[];
  onDownloadVisitSummary: (apt: PatientPastAppointment) => void;
  onDownloadPrescription: (rx: PatientPrescription) => void;
  onDownloadReceipt: (rec: PatientReceipt) => void;
}

export const PatientHistorySection: React.FC<PatientHistorySectionProps> = ({
  activeTab,
  onTabChange,
  pastAppointments,
  prescriptions,
  receipts,
  onDownloadVisitSummary,
  onDownloadPrescription,
  onDownloadReceipt,
}) => {
  return (
    <section className="pd-history-card" aria-label="Mi historial y documentos">
      <div className="pd-history-header">
        <h2>Mis documentos e historial</h2>

        <div className="pd-tabs" role="tablist" aria-label="Secciones de historial">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appointments'}
            className={`pd-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => onTabChange('appointments')}
          >
            <MaterialIcon name="calendar_today" size={15} />
            <span>Citas ({pastAppointments.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'prescriptions'}
            className={`pd-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => onTabChange('prescriptions')}
          >
            <MaterialIcon name="medication" size={15} />
            <span>Recetas ({prescriptions.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'receipts'}
            className={`pd-tab-btn ${activeTab === 'receipts' ? 'active' : ''}`}
            onClick={() => onTabChange('receipts')}
          >
            <MaterialIcon name="receipt_long" size={15} />
            <span>Pagos ({receipts.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Citas Anteriores */}
      {activeTab === 'appointments' && (
        <div className="pd-list" role="tabpanel">
          {pastAppointments.map((apt) => (
            <div key={apt.id} className="pd-list-item">
              <div className="pd-list-item-left">
                <div className="pd-date-chip">
                  <span className="pd-date-day">{apt.day}</span>
                  <span className="pd-date-month">{apt.month}</span>
                </div>
                <div className="pd-list-item-text">
                  <h3>{apt.title}</h3>
                  <p className="pd-item-meta">
                    {apt.doctorName} · {apt.fullDate}
                  </p>
                  <p className="pd-item-note">{apt.summary}</p>
                </div>
              </div>

              <button
                type="button"
                className="pd-btn-outline-sm"
                onClick={() => onDownloadVisitSummary(apt)}
              >
                <MaterialIcon name="download" size={15} />
                <span>Resumen PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Recetas */}
      {activeTab === 'prescriptions' && (
        <div role="tabpanel">
          <PatientPrescriptionsPanel
            prescriptions={prescriptions}
            onDownload={onDownloadPrescription}
            showHeading={false}
          />
        </div>
      )}

      {/* TAB 3: Pagos */}
      {activeTab === 'receipts' && (
        <div role="tabpanel">
          <PatientPaymentsPanel
            receipts={receipts}
            onDownload={onDownloadReceipt}
            showHeading={false}
          />
        </div>
      )}
    </section>
  );
};

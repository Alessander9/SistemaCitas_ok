import React, { useEffect, useRef } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { soundEffects } from '../../utils/soundEffects';
import './AppointmentReceiptModal.css';

export interface AppointmentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  specialtyName?: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: number;
  doctorName?: string;
  doctorLicense?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  patientDocType?: string;
  patientDocNumber?: string;
  patientPhone?: string;
  patientEmail?: string;
  paymentMethod?: 'CLINICA' | 'TARJETA';
  paymentSubMethod?: string;
  location?: string;
  locationAddress?: string;
}

/**
 * Clean SVG representation of a Medical QR Verification Matrix
 */
const MedicalQrCodeSvg: React.FC<{ code: string }> = ({ code }) => (
  <svg
    viewBox="0 0 100 100"
    className="apx-receipt-qr-code"
    role="img"
    aria-label={`Código QR para reserva ${code}`}
  >
    {/* Corner Position Detection Patterns */}
    {/* Top-Left */}
    <rect x="5" y="5" width="28" height="28" fill="#0d9488" rx="4" />
    <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
    <rect x="13" y="13" width="12" height="12" fill="#0d9488" rx="2" />

    {/* Top-Right */}
    <rect x="67" y="5" width="28" height="28" fill="#0d9488" rx="4" />
    <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
    <rect x="75" y="13" width="12" height="12" fill="#0d9488" rx="2" />

    {/* Bottom-Left */}
    <rect x="5" y="67" width="28" height="28" fill="#0d9488" rx="4" />
    <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
    <rect x="13" y="75" width="12" height="12" fill="#0d9488" rx="2" />

    {/* Timing Patterns */}
    <rect x="36" y="8" width="5" height="5" fill="#0f766e" />
    <rect x="44" y="8" width="5" height="5" fill="#0f766e" />
    <rect x="52" y="8" width="5" height="5" fill="#0f766e" />
    <rect x="60" y="8" width="5" height="5" fill="#0f766e" />

    <rect x="8" y="36" width="5" height="5" fill="#0f766e" />
    <rect x="8" y="44" width="5" height="5" fill="#0f766e" />
    <rect x="8" y="52" width="5" height="5" fill="#0f766e" />
    <rect x="8" y="60" width="5" height="5" fill="#0f766e" />

    {/* Data Matrix Dots Simulation */}
    <rect x="36" y="20" width="5" height="5" fill="#0d9488" />
    <rect x="44" y="24" width="6" height="6" fill="#0f766e" />
    <rect x="52" y="20" width="5" height="5" fill="#0d9488" />

    <rect x="20" y="40" width="6" height="5" fill="#0d9488" />
    <rect x="30" y="42" width="5" height="6" fill="#0f766e" />
    <rect x="42" y="38" width="6" height="6" fill="#0d9488" />
    <rect x="54" y="44" width="5" height="5" fill="#0f766e" />
    <rect x="64" y="38" width="6" height="6" fill="#0d9488" />
    <rect x="74" y="42" width="5" height="5" fill="#0f766e" />
    <rect x="84" y="38" width="6" height="6" fill="#0d9488" />

    <rect x="24" y="52" width="5" height="5" fill="#0f766e" />
    <rect x="36" y="50" width="6" height="6" fill="#0d9488" />
    <rect x="48" y="54" width="5" height="5" fill="#0f766e" />
    <rect x="58" y="52" width="6" height="5" fill="#0d9488" />
    <rect x="70" y="54" width="5" height="5" fill="#0f766e" />
    <rect x="80" y="50" width="6" height="6" fill="#0d9488" />

    <rect x="38" y="66" width="6" height="6" fill="#0d9488" />
    <rect x="48" y="64" width="5" height="5" fill="#0f766e" />
    <rect x="58" y="68" width="6" height="6" fill="#0d9488" />
    <rect x="70" y="66" width="5" height="5" fill="#0d9488" />
    <rect x="82" y="68" width="6" height="6" fill="#0f766e" />

    <rect x="38" y="78" width="5" height="5" fill="#0f766e" />
    <rect x="46" y="82" width="6" height="6" fill="#0d9488" />
    <rect x="56" y="78" width="5" height="5" fill="#0f766e" />
    <rect x="68" y="80" width="6" height="6" fill="#0d9488" />
    <rect x="78" y="84" width="5" height="5" fill="#0f766e" />
    <rect x="88" y="78" width="6" height="6" fill="#0d9488" />

    {/* Center Medical Emblem */}
    <rect x="42" y="42" width="16" height="16" fill="#ffffff" rx="2" />
    <path d="M50 45 v10 M45 50 h10" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const AppointmentReceiptModal: React.FC<AppointmentReceiptModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  specialtyName = 'Traumatología y Ortopedia',
  serviceName = 'Consulta Médica Traumatológica',
  servicePrice = 150.0,
  serviceDuration = 30,
  doctorName = 'Dr. Carlos Mendoza Ruiz',
  doctorLicense = 'CMP-48291 • RNE-24190',
  appointmentDate = '2026-11-21',
  appointmentTime = '10:30 hrs',
  patientName = 'Luis Fernández',
  patientDocType = 'DNI',
  patientDocNumber = '08502322',
  patientPhone = '+51 987 654 321',
  patientEmail = 'arsrq@gmail.com',
  paymentMethod = 'TARJETA',
  paymentSubMethod,
  location = 'Sede San Isidro',
  locationAddress = 'Av. Javier Prado Este 2465, San Isidro, Lima',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const printBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    soundEffects.playPop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    soundEffects.playSuccess();
    window.print();
  };

  const isPaidOnline = paymentMethod === 'TARJETA';
  const priceNumber = Number(servicePrice) || 150.0;
  const subtotalNumber = priceNumber / 1.18;
  const igvNumber = priceNumber - subtotalNumber;

  const todayStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const paymentLabel = isPaidOnline
    ? `Pago en Línea (${paymentSubMethod ? paymentSubMethod.toUpperCase() : 'TARJETA'})`
    : 'Pago en Recepción / Caja de Sede';

  return (
    <div
      className="apx-receipt-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apx-receipt-title"
      onClick={onClose}
    >
      <div
        className="apx-receipt-dialog"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Actions Bar (Hidden when printing/saving to PDF) */}
        <header className="apx-receipt-toolbar">
          <div className="apx-receipt-toolbar__title" id="apx-receipt-title">
            <MaterialIcon name="receipt_long" size={20} />
            <span>Comprobante de Reserva de Cita Médica</span>
          </div>

          <div className="apx-receipt-toolbar__actions">
            <button
              ref={printBtnRef}
              type="button"
              className="apx-receipt-btn-print"
              onClick={handlePrint}
            >
              <MaterialIcon name="download" size={16} />
              <span>Descargar PDF / Imprimir</span>
            </button>
            <button
              type="button"
              className="apx-receipt-btn-close"
              onClick={onClose}
              aria-label="Cerrar comprobante"
            >
              <MaterialIcon name="close" size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Document Container */}
        <div className="apx-receipt-scroll">
          <article className="apx-receipt-sheet">
            {/* Header: Clinic info + Voucher Number */}
            <div className="apx-receipt-header">
              <div className="apx-receipt-brand">
                <div className="apx-receipt-logo-icon" aria-hidden="true">
                  <MaterialIcon name="local_hospital" size={28} />
                </div>
                <div className="apx-receipt-brand-text">
                  <h2>VitalSalud S.A.C.</h2>
                  <p>
                    <strong>RUC:</strong> 20608945123 • Centro Médico Especializado
                    <br />
                    <strong>Sede:</strong> {locationAddress}
                    <br />
                    <strong>Central:</strong> (01) 640-9200 • contacto@vitalsalud.pe
                  </p>
                </div>
              </div>

              <div className="apx-receipt-voucher-box">
                <div className="apx-receipt-voucher-title">Constancia de Cita Médica</div>
                <div className="apx-receipt-voucher-code">{bookingCode}</div>
                <div className="apx-receipt-voucher-date">Emisión: {todayStr}</div>
              </div>
            </div>

            {/* Status Banner */}
            <div
              className={`apx-receipt-status-banner ${
                isPaidOnline
                  ? 'apx-receipt-status-banner--paid'
                  : 'apx-receipt-status-banner--pending'
              }`}
            >
              <div className="apx-receipt-status-left">
                <MaterialIcon
                  name={isPaidOnline ? 'check_circle' : 'schedule'}
                  size={18}
                />
                <span>
                  {isPaidOnline
                    ? 'ESTADO: CITA CONFIRMADA — PAGO EN LÍNEA ACREDITADO'
                    : 'ESTADO: CITA CONFIRMADA — PAGO PENDIENTE EN CAJA DE SEDE'}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem' }}>Válido para Atención</span>
            </div>

            {/* 2-Column Info Grid: Patient & Medical Details */}
            <div className="apx-receipt-info-grid">
              {/* Patient Details */}
              <section className="apx-receipt-card" aria-labelledby="receipt-patient-title">
                <h3 className="apx-receipt-card__title" id="receipt-patient-title">
                  <MaterialIcon name="person" size={16} />
                  <span>Datos del Paciente</span>
                </h3>
                <div className="apx-receipt-card__rows">
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Paciente:</span>
                    <span className="apx-receipt-row__val">{patientName}</span>
                  </div>
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Documento:</span>
                    <span className="apx-receipt-row__val">
                      {patientDocType} {patientDocNumber}
                    </span>
                  </div>
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Teléfono:</span>
                    <span className="apx-receipt-row__val">{patientPhone}</span>
                  </div>
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">E-mail:</span>
                    <span className="apx-receipt-row__val">{patientEmail}</span>
                  </div>
                </div>
              </section>

              {/* Medical Appointment Details */}
              <section className="apx-receipt-card" aria-labelledby="receipt-medical-title">
                <h3 className="apx-receipt-card__title" id="receipt-medical-title">
                  <MaterialIcon name="medical_information" size={16} />
                  <span>Detalles de la Consulta</span>
                </h3>
                <div className="apx-receipt-card__rows">
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Especialidad:</span>
                    <span className="apx-receipt-row__val">{specialtyName}</span>
                  </div>
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Profesional:</span>
                    <span className="apx-receipt-row__val">
                      {doctorName}
                      {doctorLicense && (
                        <small
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            color: '#64748b',
                          }}
                        >
                          {doctorLicense}
                        </small>
                      )}
                    </span>
                  </div>
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Fecha y Hora:</span>
                    <span
                      className="apx-receipt-row__val"
                      style={{ color: '#0d9488', fontWeight: 800 }}
                    >
                      {appointmentDate} — {appointmentTime}
                    </span>
                  </div>
                  <div className="apx-receipt-row">
                    <span className="apx-receipt-row__label">Ubicación:</span>
                    <span className="apx-receipt-row__val">
                      {location} (Consultorio 302)
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Economic Breakdown Table */}
            <div className="apx-receipt-table-wrapper">
              <table className="apx-receipt-table">
                <thead>
                  <tr>
                    <th>Descripción del Servicio Médico</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Cant.</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>Duración</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{serviceName}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        Atención médica ambulatoria presencial en sede
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>1</td>
                    <td style={{ textAlign: 'center' }}>{serviceDuration} min</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      S/ {priceNumber.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="apx-receipt-totals">
                <div className="apx-receipt-totals-line">
                  <span>Operación Gravada:</span>
                  <span>S/ {subtotalNumber.toFixed(2)}</span>
                </div>
                <div className="apx-receipt-totals-line">
                  <span>I.G.V. (18%):</span>
                  <span>S/ {igvNumber.toFixed(2)}</span>
                </div>
                <div className="apx-receipt-totals-line apx-receipt-totals-line--highlight">
                  <span>TOTAL:</span>
                  <span>S/ {priceNumber.toFixed(2)} PEN</span>
                </div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#64748b',
                    marginTop: '0.35rem',
                    textAlign: 'right',
                  }}
                >
                  <strong>Medio de Pago:</strong> {paymentLabel}
                </div>
              </div>
            </div>

            {/* Verification QR Code Section */}
            <div className="apx-receipt-footer-verify">
              <div className="apx-receipt-qr-wrap">
                <MedicalQrCodeSvg code={bookingCode} />
                <div className="apx-receipt-qr-desc">
                  <h4>Control de Admisión y Triaje</h4>
                  <p>
                    Presenta este código QR en el módulo de recepción al llegar a la clínica para
                    acelerar tu ingreso y pase directo al consultorio.
                  </p>
                </div>
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '0.74rem',
                  color: '#64748b',
                  flex: 'none',
                }}
              >
                AUT: <strong>VS-7492-OK</strong>
                <br />
                DIGITAL-ID: <strong>{bookingCode.replace('CIT-', '')}</strong>
              </div>
            </div>

            {/* Patient Instructions */}
            <div className="apx-receipt-instructions">
              <h5>Indicaciones Importantes para el Paciente:</h5>
              <ul>
                <li>
                  Presentarse <strong>15 minutos antes</strong> de la hora acordada para el control
                  preventivo de signos vitales en el área de Triaje.
                </li>
                <li>
                  Presentar su documento de identidad físico (DNI / Carné de Extranjería / Pasaporte) en
                  recepción.
                </li>
                <li>
                  En caso de requerir reprogramación o cancelación, notificar con al menos 24 horas de
                  anticipación sin costo de penalidad.
                </li>
              </ul>
            </div>

            {/* Legal Notice */}
            <footer className="apx-receipt-legal">
              Documento emitido electrónicamente por el Sistema de Gestión Clínica VitalSalud en
              cumplimiento con la Ley N° 29733 (Protección de Datos Personales) y normativa de salud
              vigente del Perú.
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
};

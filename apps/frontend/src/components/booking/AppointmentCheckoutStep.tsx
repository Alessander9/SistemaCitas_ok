import React, { useState, useEffect } from 'react';
import {
  CardPaymentFormValues,
  YapePaymentFormValues,
  PlinPaymentFormValues,
  TransferPaymentFormValues,
  OnlinePaymentMethodId,
} from './appointmentTypes';
import { OnlineCardForm } from './OnlineCardForm';
import { OnlineYapeForm } from './OnlineYapeForm';
import { OnlinePlinForm } from './OnlinePlinForm';
import { OnlineTransferForm } from './OnlineTransferForm';
import { CashPaymentConfirmation } from './CashPaymentConfirmation';

export interface AppointmentCheckoutStepProps {
  paymentMethod: 'CLINICA' | 'TARJETA';
  selectedSubMethod?: OnlinePaymentMethodId;
  onSelectSubMethod?: (method: OnlinePaymentMethodId) => void;
  cardValues?: CardPaymentFormValues;
  onCardChange?: (values: CardPaymentFormValues) => void;
  yapeValues?: YapePaymentFormValues;
  onYapeChange?: (values: YapePaymentFormValues) => void;
  plinValues?: PlinPaymentFormValues;
  onPlinChange?: (values: PlinPaymentFormValues) => void;
  transferValues?: TransferPaymentFormValues;
  onTransferChange?: (values: TransferPaymentFormValues) => void;
  price?: number;
  currency?: string;
  specialtyName?: string;
  serviceName?: string;
  durationLabel?: string;
  professionalName?: string;
  professionalLicense?: string;
  professionalPhotoUrl?: string | null;
  dateLabel?: string;
  timeRangeLabel?: string;
  location?: string;
  locationAddress?: string;
  patientName?: string;
  isProcessing?: boolean;
  onEditBooking?: () => void;
  onTimerExpired?: () => void;
  initialSecondsRemaining?: number;
}

const DEFAULT_CARD_VALUES: CardPaymentFormValues = {
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardHolder: '',
  saveCard: false,
};

const DEFAULT_YAPE_VALUES: YapePaymentFormValues = {
  phoneNumber: '',
  approvalCode: '',
};

const DEFAULT_PLIN_VALUES: PlinPaymentFormValues = {
  phoneNumber: '',
  otpCode: '',
};

const DEFAULT_TRANSFER_VALUES: TransferPaymentFormValues = {
  bankName: 'BCP',
  operationNumber: '',
};

export const AppointmentCheckoutStep: React.FC<AppointmentCheckoutStepProps> = ({
  paymentMethod,
  selectedSubMethod: controlledSubMethod,
  onSelectSubMethod,
  cardValues: controlledCardValues,
  onCardChange,
  yapeValues: controlledYapeValues,
  onYapeChange,
  plinValues: controlledPlinValues,
  onPlinChange,
  transferValues: controlledTransferValues,
  onTransferChange,
  price = 150,
  currency = 'PEN',
  specialtyName = 'Traumatología y Ortopedia',
  serviceName = 'Consulta Médica Traumatológica',
  durationLabel = '30 minutos',
  professionalName = 'Dr. Carlos Mendoza Ruiz',
  professionalLicense = 'CMP-51294',
  professionalPhotoUrl,
  dateLabel = 'Jueves, 24 de septiembre de 2026',
  timeRangeLabel = '05:30 PM – 06:00 PM',
  location = 'Sede San Isidro',
  locationAddress = 'Av. Emilio Cavenecia 225, San Isidro, Lima',
  patientName,
  isProcessing = false,
  onEditBooking,
  onTimerExpired,
  initialSecondsRemaining = 582, // 09:42 min
}) => {
  // Local state fallbacks if uncontrolled
  const [internalSubMethod, setInternalSubMethod] = useState<OnlinePaymentMethodId>('CARD');
  const [internalCard, setInternalCard] = useState<CardPaymentFormValues>(DEFAULT_CARD_VALUES);
  const [internalYape, setInternalYape] = useState<YapePaymentFormValues>(DEFAULT_YAPE_VALUES);
  const [internalPlin, setInternalPlin] = useState<PlinPaymentFormValues>(DEFAULT_PLIN_VALUES);
  const [internalTransfer, setInternalTransfer] = useState<TransferPaymentFormValues>(DEFAULT_TRANSFER_VALUES);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Timer countdown
  const [secondsRemaining, setSecondsRemaining] = useState(initialSecondsRemaining);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimerExpired?.();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimerExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, onTimerExpired]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSubMethod = controlledSubMethod ?? internalSubMethod;
  const handleSubMethodSelect = (method: OnlinePaymentMethodId) => {
    setInternalSubMethod(method);
    onSelectSubMethod?.(method);
  };

  const cardValues = controlledCardValues ?? internalCard;
  const handleCardChange = (vals: CardPaymentFormValues) => {
    setInternalCard(vals);
    onCardChange?.(vals);
  };

  const yapeValues = controlledYapeValues ?? internalYape;
  const handleYapeChange = (vals: YapePaymentFormValues) => {
    setInternalYape(vals);
    onYapeChange?.(vals);
  };

  const plinValues = controlledPlinValues ?? internalPlin;
  const handlePlinChange = (vals: PlinPaymentFormValues) => {
    setInternalPlin(vals);
    onPlinChange?.(vals);
  };

  const transferValues = controlledTransferValues ?? internalTransfer;
  const handleTransferChange = (vals: TransferPaymentFormValues) => {
    setInternalTransfer(vals);
    onTransferChange?.(vals);
  };

  const isOnline = paymentMethod === 'TARJETA';
  const currencySymbol = currency === 'USD' ? '$' : 'S/';
  const formattedPrice = `${currencySymbol} ${price.toFixed(2)}`;

  return (
    <section className="apx-step apx-checkout" aria-labelledby="checkout-step-title">
      {/* 2-Column Desktop Grid Layout */}
      <div className="apx-checkout__layout">
        {/* ===================================================================
            LEFT COLUMN (60-65%): Title, Timer, Sub-methods tabs, Form, Badges
        =================================================================== */}
        <div className="apx-checkout__main">
          {/* Header */}
          <header className="apx-checkout__header">
            <h2 id="checkout-step-title" className="apx-checkout__title">
              {isOnline ? '10. Completa tu pago' : '10. Confirma tu reserva'}
            </h2>
            <p className="apx-checkout__subtitle">
              {isOnline
                ? 'Realiza el pago de forma segura para confirmar tu reserva.'
                : 'Tu cita quedará reservada y podrás realizar el pago directamente en la clínica.'}
            </p>
          </header>

          {/* Reservation Retention Timer Banner */}
          <div
            className={`apx-checkout__timer ${secondsRemaining === 0 ? 'apx-checkout__timer--expired' : ''}`}
            role="timer"
            aria-live="polite"
          >
            <div className="apx-checkout__timer-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="apx-checkout__timer-text">
              <strong>
                {secondsRemaining > 0
                  ? 'Tu horario está reservado temporalmente'
                  : 'Tu reserva temporal ha vencido'}
              </strong>
              <span>
                {secondsRemaining > 0
                  ? `Tienes ${formatTimer(secondsRemaining)} minutos para ${isOnline ? 'completar tu pago' : 'confirmar tu reserva'}.`
                  : 'Por favor regresa al calendario para seleccionar un nuevo horario.'}
              </span>
            </div>
          </div>

          {/* Mobile Summary Toggle Button */}
          <button
            type="button"
            className="apx-checkout__mobile-summary-toggle"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            aria-expanded={mobileSummaryOpen}
          >
            <span className="apx-checkout__mobile-summary-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Ver resumen de la cita ({formattedPrice})
            </span>
            <span className="apx-checkout__mobile-summary-arrow">{mobileSummaryOpen ? '▲' : '▼'}</span>
          </button>

          {/* Online Payment Options & Form */}
          {isOnline ? (
            <div className="apx-checkout__online-wrapper">
              {/* Submethod Selection Tabs (Card, Yape, Plin, Transfer) */}
              <div
                className="apx-submethods-tabs"
                role="radiogroup"
                aria-label="Selecciona método de pago online"
              >
                {/* 1. Tarjeta */}
                <div
                  className={`apx-submethod-tab ${activeSubMethod === 'CARD' ? 'apx-submethod-tab--active' : ''}`}
                  onClick={() => !isProcessing && handleSubMethodSelect('CARD')}
                  role="radio"
                  aria-checked={activeSubMethod === 'CARD'}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSubMethodSelect('CARD');
                    }
                  }}
                >
                  <div className="apx-submethod-tab__icon apx-submethod-tab__icon--card">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div className="apx-submethod-tab__info">
                    <div className="apx-submethod-tab__name">Tarjeta de crédito o débito</div>
                    <div className="apx-submethod-tab__sub">Visa, Mastercard, Amex</div>
                  </div>
                  {activeSubMethod === 'CARD' && (
                    <span className="apx-submethod-tab__badge" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>

                {/* 2. Yape */}
                <div
                  className={`apx-submethod-tab ${activeSubMethod === 'YAPE' ? 'apx-submethod-tab--active' : ''}`}
                  onClick={() => !isProcessing && handleSubMethodSelect('YAPE')}
                  role="radio"
                  aria-checked={activeSubMethod === 'YAPE'}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSubMethodSelect('YAPE');
                    }
                  }}
                >
                  <div className="apx-submethod-tab__icon apx-submethod-tab__icon--yape">
                    <span className="apx-yape-glyph">yape</span>
                  </div>
                  <div className="apx-submethod-tab__info">
                    <div className="apx-submethod-tab__name">Yape</div>
                    <div className="apx-submethod-tab__sub">Pago desde tu app</div>
                  </div>
                  {activeSubMethod === 'YAPE' && (
                    <span className="apx-submethod-tab__badge" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>

                {/* 3. Plin */}
                <div
                  className={`apx-submethod-tab ${activeSubMethod === 'PLIN' ? 'apx-submethod-tab--active' : ''}`}
                  onClick={() => !isProcessing && handleSubMethodSelect('PLIN')}
                  role="radio"
                  aria-checked={activeSubMethod === 'PLIN'}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSubMethodSelect('PLIN');
                    }
                  }}
                >
                  <div className="apx-submethod-tab__icon apx-submethod-tab__icon--plin">
                    <span className="apx-plin-glyph">plin</span>
                  </div>
                  <div className="apx-submethod-tab__info">
                    <div className="apx-submethod-tab__name">Plin</div>
                    <div className="apx-submethod-tab__sub">Pago desde tu app</div>
                  </div>
                  {activeSubMethod === 'PLIN' && (
                    <span className="apx-submethod-tab__badge" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>

                {/* 4. Transferencia */}
                <div
                  className={`apx-submethod-tab ${activeSubMethod === 'TRANSFER' ? 'apx-submethod-tab--active' : ''}`}
                  onClick={() => !isProcessing && handleSubMethodSelect('TRANSFER')}
                  role="radio"
                  aria-checked={activeSubMethod === 'TRANSFER'}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSubMethodSelect('TRANSFER');
                    }
                  }}
                >
                  <div className="apx-submethod-tab__icon apx-submethod-tab__icon--transfer">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div className="apx-submethod-tab__info">
                    <div className="apx-submethod-tab__name">Transferencia bancaria</div>
                    <div className="apx-submethod-tab__sub">Pago por transferencia</div>
                  </div>
                  {activeSubMethod === 'TRANSFER' && (
                    <span className="apx-submethod-tab__badge" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Active Submethod Form Component */}
              <div className="apx-submethod-form-container">
                {activeSubMethod === 'CARD' && (
                  <OnlineCardForm
                    values={cardValues}
                    onChange={handleCardChange}
                    disabled={isProcessing}
                  />
                )}
                {activeSubMethod === 'YAPE' && (
                  <OnlineYapeForm
                    values={yapeValues}
                    onChange={handleYapeChange}
                    price={price}
                    currency={currency}
                    disabled={isProcessing}
                  />
                )}
                {activeSubMethod === 'PLIN' && (
                  <OnlinePlinForm
                    values={plinValues}
                    onChange={handlePlinChange}
                    price={price}
                    currency={currency}
                    disabled={isProcessing}
                  />
                )}
                {activeSubMethod === 'TRANSFER' && (
                  <OnlineTransferForm
                    values={transferValues}
                    onChange={handleTransferChange}
                    price={price}
                    currency={currency}
                    disabled={isProcessing}
                  />
                )}
              </div>
            </div>
          ) : (
            <CashPaymentConfirmation
              price={price}
              currency={currency}
              location={location}
              locationAddress={locationAddress}
            />
          )}

          {/* 3 Security / Trust Badges at Bottom */}
          <div className="apx-checkout__trust-badges" aria-label="Garantías de seguridad">
            <div className="apx-trust-badge">
              <div className="apx-trust-badge__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="apx-trust-badge__text">
                <strong>Pago 100% seguro</strong>
                <span>Protegido con encriptación SSL</span>
              </div>
            </div>

            <div className="apx-trust-badge">
              <div className="apx-trust-badge__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="apx-trust-badge__text">
                <strong>Tus datos están protegidos</strong>
                <span>No almacenamos datos de tu tarjeta</span>
              </div>
            </div>

            <div className="apx-trust-badge">
              <div className="apx-trust-badge__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <line x1="8" x2="16" y1="6" y2="6" />
                  <line x1="8" x2="16" y1="10" y2="10" />
                  <line x1="8" x2="12" y1="14" y2="14" />
                </svg>
              </div>
              <div className="apx-trust-badge__text">
                <strong>Comprobante electrónico</strong>
                <span>Recibirás tu comprobante por correo y WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN (35-40%): Sticky Reservation Summary Card
        =================================================================== */}
        <aside
          className={`apx-checkout__sidebar ${mobileSummaryOpen ? 'apx-checkout__sidebar--mobile-open' : ''}`}
          aria-label="Resumen de tu reserva"
        >
          <div className="apx-summary-card">
            {/* Summary Head */}
            <div className="apx-summary-card__header">
              <div className="apx-summary-card__title-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <h3 className="apx-summary-card__title">Resumen de tu reserva</h3>
              </div>
              {onEditBooking && (
                <button
                  type="button"
                  className="apx-summary-card__edit-btn"
                  onClick={onEditBooking}
                  title="Modificar los detalles de tu cita"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Editar
                </button>
              )}
            </div>

            {/* Itemized List */}
            <div className="apx-summary-card__list">
              {/* Especialidad */}
              <div className="apx-summary-card__item">
                <div className="apx-summary-card__icon apx-summary-card__icon--teal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m18 2 4 4" />
                    <path d="m17 7 3-3" />
                    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
                  </svg>
                </div>
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Especialidad</span>
                  <strong className="apx-summary-card__value">{specialtyName}</strong>
                </div>
              </div>

              {/* Servicio */}
              <div className="apx-summary-card__item">
                <div className="apx-summary-card__icon apx-summary-card__icon--emerald">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
                  </svg>
                </div>
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Servicio</span>
                  <strong className="apx-summary-card__value">{serviceName}</strong>
                </div>
              </div>

              {/* Profesional */}
              <div className="apx-summary-card__item apx-summary-card__item--prof">
                {professionalPhotoUrl ? (
                  <img
                    src={professionalPhotoUrl}
                    alt={professionalName}
                    className="apx-summary-card__prof-avatar"
                  />
                ) : (
                  <div className="apx-summary-card__prof-initials">
                    {professionalName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>
                )}
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Profesional</span>
                  <strong className="apx-summary-card__value">{professionalName}</strong>
                  {professionalLicense && (
                    <span className="apx-summary-card__sub">{professionalLicense}</span>
                  )}
                </div>
              </div>

              {/* Fecha */}
              <div className="apx-summary-card__item">
                <div className="apx-summary-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Fecha</span>
                  <strong className="apx-summary-card__value">{dateLabel}</strong>
                </div>
              </div>

              {/* Horario */}
              <div className="apx-summary-card__item">
                <div className="apx-summary-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Horario</span>
                  <strong className="apx-summary-card__value">{timeRangeLabel}</strong>
                </div>
              </div>

              {/* Duración */}
              <div className="apx-summary-card__item">
                <div className="apx-summary-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 22h14" />
                    <path d="M5 2h14" />
                    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                  </svg>
                </div>
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Duración</span>
                  <strong className="apx-summary-card__value">{durationLabel}</strong>
                </div>
              </div>

              {/* Sede */}
              <div className="apx-summary-card__item">
                <div className="apx-summary-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="apx-summary-card__meta">
                  <span className="apx-summary-card__label">Sede</span>
                  <strong className="apx-summary-card__value">{location}</strong>
                  {locationAddress && (
                    <span className="apx-summary-card__sub">{locationAddress}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Breakdown Footer */}
            <div className="apx-summary-card__pricing">
              <div className="apx-summary-card__price-row">
                <span className="apx-summary-card__price-label">Precio del servicio</span>
                <span className="apx-summary-card__price-num">{formattedPrice}</span>
              </div>

              {/* Highlight Mint Total Box */}
              <div className="apx-summary-card__total-box">
                <span className="apx-summary-card__total-title">Total a pagar</span>
                <strong className="apx-summary-card__total-amount">
                  {formattedPrice} {currency}
                </strong>
              </div>

              <div className="apx-summary-card__taxes-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                  <path d="M7 7h.01" />
                </svg>
                <span>Incluye todos los impuestos y cargos aplicables.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import {
  CreateReceptionBookingInput,
  PaymentMethod,
  ReceptionAppointment,
} from './types';

const SERVICE_CATALOG = [
  { name: 'Terapia Manual Ortopédica', price: 80 },
  { name: 'Rehabilitación Deportiva', price: 100 },
  { name: 'Consulta Traumatológica', price: 150 },
  { name: 'Descarga Muscular Completa', price: 70 },
  { name: 'Punción Seca y Electroterapia', price: 90 },
];

const DOCTORS = ['Dra. María González', 'Dr. Carlos Mendoza', 'Lic. Andrés Paredes'];
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '11:30 AM', '12:15 PM', '03:00 PM', '04:30 PM', '05:30 PM'];

/* ---------------------------------------------------------------------------
   1. Modal Unificado de Nueva Cita en Recepción
   --------------------------------------------------------------------------- */
interface ReceptionQuickBookingModalProps {
  onClose: () => void;
  onCreate: (input: CreateReceptionBookingInput) => void;
}

export const ReceptionQuickBookingModal: React.FC<ReceptionQuickBookingModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [dni, setDni] = useState('');
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(SERVICE_CATALOG[0].name);
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [time, setTime] = useState('12:15 PM');
  const [paidNow, setPaidNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Yape');
  const [urgent, setUrgent] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPrice = SERVICE_CATALOG.find((s) => s.name === service)?.price ?? 80;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !patientName.trim()) {
      setError('Ingresa el DNI y el nombre del paciente.');
      return;
    }

    onCreate({
      dni,
      patientName,
      phone,
      email,
      service,
      doctor,
      time,
      priceAmount: currentPrice,
      paidNow,
      paymentMethod: paidNow ? paymentMethod : undefined,
      urgent,
    });
    onClose();
  };

  return (
    <div className="rd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Nueva cita">
      <div className="rd-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="rd-modal-header">
          <div>
            <h3>Nueva cita en mostrador</h3>
            <p>Registra el turno en segundos. Los datos extra son opcionales.</p>
          </div>
          <button type="button" className="rd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rd-modal-body">
            {error && <div className="rd-form-error">{error}</div>}

            {/* Fila 1: DNI + Nombre */}
            <div className="rd-form-grid-2">
              <div className="rd-field">
                <label htmlFor="rd-dni">DNI / Documento *</label>
                <input
                  id="rd-dni"
                  type="text"
                  placeholder="Ej. 45892110"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value);
                    setError(null);
                  }}
                />
              </div>
              <div className="rd-field">
                <label htmlFor="rd-name">Nombre del paciente *</label>
                <input
                  id="rd-name"
                  type="text"
                  placeholder="Nombre y apellidos"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            {/* Fila 2: Servicio + Médico */}
            <div className="rd-form-grid-2">
              <div className="rd-field">
                <label htmlFor="rd-service">Servicio</label>
                <select
                  id="rd-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  {SERVICE_CATALOG.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} (S/ {s.price}.00)
                    </option>
                  ))}
                </select>
              </div>
              <div className="rd-field">
                <label htmlFor="rd-doctor">Especialista</label>
                <select
                  id="rd-doctor"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                >
                  {DOCTORS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 3: Horario */}
            <div className="rd-field">
              <label>Hora disponible hoy</label>
              <div className="rd-slot-row">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`rd-slot-btn ${time === slot ? 'selected' : ''}`}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 4: Pago y Urgencia */}
            <div className="rd-inline-options">
              <label className="rd-checkbox-label">
                <input
                  type="checkbox"
                  checked={paidNow}
                  onChange={(e) => setPaidNow(e.target.checked)}
                />
                <span>Cobrar ahora (S/ {currentPrice}.00)</span>
              </label>

              <label className="rd-checkbox-label">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                <span>Prioridad urgente</span>
              </label>
            </div>

            {paidNow && (
              <div className="rd-pay-methods-row">
                {(['Yape', 'Plin', 'POS Tarjeta', 'Efectivo'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`rd-slot-btn ${paymentMethod === m ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Desplegable opcional para paciente nuevo */}
            <button
              type="button"
              className="rd-extra-toggle"
              onClick={() => setShowExtraFields((v) => !v)}
            >
              <MaterialIcon name={showExtraFields ? 'expand_less' : 'expand_more'} size={16} />
              <span>{showExtraFields ? 'Ocultar datos adicionales' : 'Añadir teléfono / correo (opcional)'}</span>
            </button>

            {showExtraFields && (
              <div className="rd-form-grid-2">
                <div className="rd-field">
                  <label htmlFor="rd-phone">Teléfono / WhatsApp</label>
                  <input
                    id="rd-phone"
                    type="tel"
                    placeholder="987 654 321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="rd-field">
                  <label htmlFor="rd-email">Correo electrónico</label>
                  <input
                    id="rd-email"
                    type="email"
                    placeholder="paciente@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rd-modal-footer">
            <button type="button" className="rd-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="rd-btn-primary">
              <MaterialIcon name="check" size={16} />
              <span>Agendar cita</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   2. Modal de Cobro Rápido en 2 Clics
   --------------------------------------------------------------------------- */
interface ReceptionPaymentModalProps {
  appointment: ReceptionAppointment;
  onClose: () => void;
  onConfirmPayment: (id: string, method: PaymentMethod) => void;
}

export const ReceptionPaymentModal: React.FC<ReceptionPaymentModalProps> = ({
  appointment,
  onClose,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('Yape');

  return (
    <div className="rd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Registrar cobro">
      <div className="rd-modal-box rd-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="rd-modal-header">
          <div>
            <h3>Registrar cobro</h3>
            <p>
              {appointment.patientName} · DNI {appointment.dni}
            </p>
          </div>
          <button type="button" className="rd-modal-close" onClick={onClose} aria-label="Cerrar">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="rd-modal-body">
          <div className="rd-pay-amount-box">
            <span>Total a cobrar</span>
            <strong>{appointment.priceLabel}</strong>
            <small>{appointment.service}</small>
          </div>

          <div className="rd-field">
            <label>Método de pago</label>
            <div className="rd-pay-grid">
              {(['Yape', 'Plin', 'POS Tarjeta', 'Efectivo'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`rd-slot-btn ${method === m ? 'selected' : ''}`}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rd-modal-footer">
          <button type="button" className="rd-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="rd-btn-primary"
            onClick={() => {
              onConfirmPayment(appointment.id, method);
              onClose();
            }}
          >
            <MaterialIcon name="check" size={16} />
            <span>Confirmar cobro</span>
          </button>
        </div>
      </div>
    </div>
  );
};

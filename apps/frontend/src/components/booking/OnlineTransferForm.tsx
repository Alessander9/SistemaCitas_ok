import React, { useState } from 'react';
import { TransferPaymentFormValues } from './appointmentTypes';

export interface OnlineTransferFormProps {
  values: TransferPaymentFormValues;
  onChange: (values: TransferPaymentFormValues) => void;
  price: number;
  currency?: string;
  disabled?: boolean;
}

interface BankAccount {
  bank: string;
  accountNumber: string;
  cci: string;
  beneficiary: string;
}

const CLINIC_ACCOUNTS: BankAccount[] = [
  {
    bank: 'BCP',
    accountNumber: '194-98765432-0-12',
    cci: '002-194-009876543201-12',
    beneficiary: 'Centro Médico Especializado S.A.C.',
  },
  {
    bank: 'BBVA',
    accountNumber: '0011-0123-0100456789',
    cci: '011-123-000100456789-22',
    beneficiary: 'Centro Médico Especializado S.A.C.',
  },
  {
    bank: 'Interbank',
    accountNumber: '200-3001234567',
    cci: '003-200-003001234567-33',
    beneficiary: 'Centro Médico Especializado S.A.C.',
  },
];

export const OnlineTransferForm: React.FC<OnlineTransferFormProps> = ({
  values,
  onChange,
  price,
  currency = 'PEN',
  disabled = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleBankSelect = (bankName: string) => {
    onChange({ ...values, bankName });
  };

  const handleOpNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, operationNumber: e.target.value.trim() });
  };

  return (
    <div className="apx-transfer-form" aria-label="Pago por transferencia bancaria">
      <div className="apx-transfer-form__header">
        <h4 className="apx-transfer-form__title">Cuentas bancarias de la clínica</h4>
        <p className="apx-transfer-form__desc">
          Transfiere exactamente <strong>{currency === 'USD' ? '$' : 'S/'} {price.toFixed(2)}</strong> a cualquiera de nuestras cuentas oficiales.
        </p>
      </div>

      <div className="apx-transfer-accounts">
        {CLINIC_ACCOUNTS.map((acc) => {
          const isSelected = values.bankName === acc.bank;
          return (
            <div
              key={acc.bank}
              className={`apx-transfer-card ${isSelected ? 'apx-transfer-card--selected' : ''}`}
              onClick={() => !disabled && handleBankSelect(acc.bank)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBankSelect(acc.bank);
                }
              }}
            >
              <div className="apx-transfer-card__head">
                <span className="apx-transfer-card__bank">{acc.bank}</span>
                <span className="apx-transfer-card__badge">Acepta transferencias directas e interbancarias</span>
              </div>
              <div className="apx-transfer-card__rows">
                <div className="apx-transfer-card__row">
                  <span className="apx-transfer-card__label">Cta. Corriente:</span>
                  <code className="apx-transfer-card__val">{acc.accountNumber}</code>
                  <button
                    type="button"
                    className="apx-copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(acc.accountNumber, `${acc.bank}-cta`);
                    }}
                    title="Copiar número de cuenta"
                  >
                    {copiedKey === `${acc.bank}-cta` ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="apx-transfer-card__row">
                  <span className="apx-transfer-card__label">CCI:</span>
                  <code className="apx-transfer-card__val">{acc.cci}</code>
                  <button
                    type="button"
                    className="apx-copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(acc.cci, `${acc.bank}-cci`);
                    }}
                    title="Copiar código interbancario"
                  >
                    {copiedKey === `${acc.bank}-cci` ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="apx-transfer-verify">
        <div className="apx-field">
          <label htmlFor="transfer-op-number" className="apx-field__label">
            Número de operación bancaria
          </label>
          <input
            id="transfer-op-number"
            type="text"
            placeholder="Ej. 0849281"
            className="apx-input"
            value={values.operationNumber}
            onChange={handleOpNumberChange}
            disabled={disabled}
          />
          <span className="apx-field__hint">
            Ingresa el número que figura en tu comprobante de transferencia para validar de forma automática.
          </span>
        </div>
      </div>
    </div>
  );
};

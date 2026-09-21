import { describe, it, expect } from 'vitest';
import {
  CONSULTATION_REASON_MAX_LENGTH,
  PatientFormValues,
  describePatientValidation,
  isEmailValid,
  isPatientFieldValid,
  isPhoneValid,
  sanitizeDocumentInput,
  sanitizePhoneInput,
  validatePatientForm,
} from './patientCatalog';

const VALID: PatientFormValues = {
  documentType: 'DNI',
  documentNumber: '73829104',
  firstName: 'Juan Carlos',
  lastName: 'Pérez Gómez',
  phone: '+51 987 654 321',
  email: 'juan.perez@email.com',
  consultationReason: '',
};

describe('patientCatalog', () => {
  it('accepts a complete, valid patient form', () => {
    const result = validatePatientForm(VALID);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.firstInvalidField).toBeUndefined();
  });

  it('reports the required fields following the visual order of the form', () => {
    const result = validatePatientForm({
      ...VALID,
      documentNumber: '',
      phone: '',
      email: '',
    });

    expect(result.isValid).toBe(false);
    expect(describePatientValidation(result)).toEqual([
      'Número de documento',
      'Celular / WhatsApp',
      'Correo electrónico',
    ]);
    expect(result.firstInvalidField).toBe('documentNumber');
  });

  it('validates the document number according to its type', () => {
    // DNI: exactly 8 digits.
    expect(validatePatientForm({ ...VALID, documentNumber: '1234567' }).errors.documentNumber)
      .toBe('El DNI debe tener 8 dígitos.');
    expect(isPatientFieldValid({ ...VALID, documentNumber: '12345678' }, 'documentNumber')).toBe(
      true,
    );

    // Carné de extranjería: alphanumeric, 6-12 chars.
    expect(
      validatePatientForm({ ...VALID, documentType: 'CE', documentNumber: 'A12' }).errors
        .documentNumber,
    ).toBe('El carné de extranjería no es válido.');
    expect(
      isPatientFieldValid({ ...VALID, documentType: 'CE', documentNumber: '001234567' }, 'documentNumber'),
    ).toBe(true);
  });

  it('masks what the patient types per document type', () => {
    expect(sanitizeDocumentInput('DNI', '73a82b9104')).toBe('73829104');
    expect(sanitizeDocumentInput('DNI', '123456789')).toBe('12345678');
    expect(sanitizeDocumentInput('PASAPORTE', 'a1-23 456')).toBe('A123456');
    expect(sanitizePhoneInput('+51 (987) abc 654-321')).toBe('+51 (987)  654-321');
  });

  it('validates phone and e-mail formats', () => {
    expect(isPhoneValid('+51 987 654 321')).toBe(true);
    expect(isPhoneValid('123')).toBe(false);
    expect(isEmailValid('juan.perez@email.com')).toBe(true);
    expect(isEmailValid('juan.perez@email')).toBe(false);
    expect(validatePatientForm({ ...VALID, email: 'correo-invalido' }).errors.email).toBe(
      'Ingresa un correo electrónico válido.',
    );
  });

  it('caps the optional reason length', () => {
    const long = 'a'.repeat(CONSULTATION_REASON_MAX_LENGTH + 1);
    expect(validatePatientForm({ ...VALID, consultationReason: long }).errors.consultationReason)
      .toBeDefined();
    expect(
      validatePatientForm({
        ...VALID,
        consultationReason: 'a'.repeat(CONSULTATION_REASON_MAX_LENGTH),
      }).isValid,
    ).toBe(true);
  });
});

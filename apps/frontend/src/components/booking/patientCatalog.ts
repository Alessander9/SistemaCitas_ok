// =============================================================================
// CitasSistema — Patient Catalog (data + validation layer, UI-agnostic)
// -----------------------------------------------------------------------------
// Owns the document types actually supported by the backend, the per-type input
// rules and the whole form validation, so the components only render state.
// Nothing here renders and nothing talks to the API.
// =============================================================================

/** Form fields of the patient step. */
export type PatientFieldId =
  | 'documentType'
  | 'documentNumber'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email'
  | 'consultationReason';

/** Values handled by the patient form (mirrors the POST /appointments payload). */
export interface PatientFormValues {
  documentType: PatientDocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  consultationReason: string;
}

/** Document types the backend stores in `patients.national_id`. */
export type PatientDocumentType = 'DNI' | 'CE' | 'PASAPORTE';

export interface PatientDocumentTypeOption {
  value: PatientDocumentType;
  label: string;
  /** Input mask/rule applied while typing. */
  inputMode: 'numeric' | 'text';
  maxLength: number;
  placeholder: string;
  /** Human explanation shown under the field. */
  hint: string;
  /** Letters are upper-cased (extranjeros use alphanumeric codes). */
  uppercase: boolean;
}

export const PATIENT_DOCUMENT_TYPES: PatientDocumentTypeOption[] = [
  {
    value: 'DNI',
    label: 'DNI',
    inputMode: 'numeric',
    maxLength: 8,
    placeholder: 'ej. 73829104',
    hint: '8 dígitos, sin espacios ni guiones.',
    uppercase: false,
  },
  {
    value: 'CE',
    label: 'Carné de extranjería',
    inputMode: 'text',
    maxLength: 12,
    placeholder: 'ej. 001234567',
    hint: 'Hasta 12 caracteres del carné de extranjería.',
    uppercase: true,
  },
  {
    value: 'PASAPORTE',
    label: 'Pasaporte',
    inputMode: 'text',
    maxLength: 12,
    placeholder: 'ej. A1234567',
    hint: 'Hasta 12 caracteres del pasaporte.',
    uppercase: true,
  },
];

/** DOM ids of every patient field (single source: form + blur delegation). */
export const PATIENT_FIELD_IDS: Record<PatientFieldId, string> = {
  documentType: 'patientDocumentType',
  documentNumber: 'patientDocumentNumber',
  firstName: 'patientFirstName',
  lastName: 'patientLastName',
  phone: 'patientPhone',
  email: 'patientEmail',
  consultationReason: 'patientConsultationReason',
};

/** Visible label of every field, reused by messages and tests. */
export const PATIENT_FIELD_LABELS: Record<PatientFieldId, string> = {
  documentType: 'Tipo de documento',
  documentNumber: 'Número de documento',
  firstName: 'Nombres',
  lastName: 'Apellidos',
  phone: 'Celular / WhatsApp',
  email: 'Correo electrónico',
  consultationReason: 'Motivo de consulta',
};

/** Friendly list of the required fields still missing, in visual order. */
export function describePatientValidation(
  validation: PatientFormValidation,
): string[] {
  return REQUIRED_PATIENT_FIELDS.filter((field) => validation.errors[field]).map(
    (field) => PATIENT_FIELD_LABELS[field],
  );
}

/** Resolves which field lost focus, so errors only appear on visited fields. */
export function resolvePatientFieldFromInputId(inputId: string): PatientFieldId | undefined {
  return (Object.keys(PATIENT_FIELD_IDS) as PatientFieldId[]).find(
    (field) => PATIENT_FIELD_IDS[field] === inputId,
  );
}

/** Max length for the optional reason textarea. */
export const CONSULTATION_REASON_MAX_LENGTH = 300;

/** Required fields, in the visual order of the form. */
export const REQUIRED_PATIENT_FIELDS: PatientFieldId[] = [
  'documentType',
  'documentNumber',
  'firstName',
  'lastName',
  'phone',
  'email',
];

export function resolveDocumentTypeOption(
  type: PatientDocumentType,
): PatientDocumentTypeOption {
  return (
    PATIENT_DOCUMENT_TYPES.find((option) => option.value === type) ?? PATIENT_DOCUMENT_TYPES[0]
  );
}

/** Applies the mask of the selected document type while the patient types. */
export function sanitizeDocumentInput(type: PatientDocumentType, raw: string): string {
  const option = resolveDocumentTypeOption(type);
  const cleaned = option.uppercase
    ? raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    : raw.replace(/\D/g, '');
  return cleaned.slice(0, option.maxLength);
}

/** Keeps the phone readable while typing, without allowing letters. */
export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/[^\d+\s()-]/g, '').slice(0, 20);
}

export function isDocumentNumberValid(
  type: PatientDocumentType,
  value: string,
): boolean {
  const option = resolveDocumentTypeOption(type);
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (type === 'DNI') return /^\d{8}$/.test(trimmed);
  return trimmed.length >= 6 && trimmed.length <= option.maxLength && /^[A-Z0-9]+$/.test(trimmed);
}

export function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15;
}

export function isEmailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

/** Per-field error messages (always written for the patient, never technical). */
export const PATIENT_ERROR_MESSAGES: Record<PatientFieldId, string> = {
  documentType: 'Selecciona el tipo de documento.',
  documentNumber: 'Ingresa tu número de documento.',
  firstName: 'Ingresa tus nombres.',
  lastName: 'Ingresa tus apellidos.',
  phone: 'Ingresa tu número de celular.',
  email: 'Ingresa un correo electrónico válido.',
  consultationReason: 'El motivo de consulta es demasiado largo.',
};

export interface PatientFormValidation {
  isValid: boolean;
  errors: Partial<Record<PatientFieldId, string>>;
  /** First field with an error, following the visual order of the form. */
  firstInvalidField?: PatientFieldId;
}

function documentNumberError(type: PatientDocumentType, value: string): string | null {
  if (!value.trim()) return PATIENT_ERROR_MESSAGES.documentNumber;
  if (!isDocumentNumberValid(type, value)) {
    if (type === 'DNI') return 'El DNI debe tener 8 dígitos.';
    if (type === 'CE') return 'El carné de extranjería no es válido.';
    return 'El número de pasaporte no es válido.';
  }
  return null;
}

/** Validates the whole patient form and reports what blocks the flow. */
export function validatePatientForm(values: PatientFormValues): PatientFormValidation {
  const errors: Partial<Record<PatientFieldId, string>> = {};

  if (!values.documentType) {
    errors.documentType = PATIENT_ERROR_MESSAGES.documentType;
  }

  const docError = documentNumberError(values.documentType, values.documentNumber);
  if (docError) errors.documentNumber = docError;

  if (!values.firstName.trim()) errors.firstName = PATIENT_ERROR_MESSAGES.firstName;
  if (!values.lastName.trim()) errors.lastName = PATIENT_ERROR_MESSAGES.lastName;

  if (!values.phone.trim()) {
    errors.phone = PATIENT_ERROR_MESSAGES.phone;
  } else if (!isPhoneValid(values.phone)) {
    errors.phone = 'Ingresa un número de celular válido.';
  }

  if (!values.email.trim()) {
    errors.email = PATIENT_ERROR_MESSAGES.email;
  } else if (!isEmailValid(values.email)) {
    errors.email = PATIENT_ERROR_MESSAGES.email;
  }

  if (values.consultationReason.length > CONSULTATION_REASON_MAX_LENGTH) {
    errors.consultationReason = PATIENT_ERROR_MESSAGES.consultationReason;
  }

  const firstInvalidField = REQUIRED_PATIENT_FIELDS.find((field) => errors[field]);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstInvalidField,
  };
}

/**
 * True when a field can already show its "valid" mark: filled and passing its
 * own rule. Used for the ✓ feedback without waiting for a submit attempt.
 */
export function isPatientFieldValid(values: PatientFormValues, field: PatientFieldId): boolean {
  switch (field) {
    case 'documentType':
      return Boolean(values.documentType);
    case 'documentNumber':
      return isDocumentNumberValid(values.documentType, values.documentNumber);
    case 'firstName':
      return values.firstName.trim().length > 1;
    case 'lastName':
      return values.lastName.trim().length > 1;
    case 'phone':
      return isPhoneValid(values.phone);
    case 'email':
      return isEmailValid(values.email);
    case 'consultationReason':
      return true;
    default:
      return false;
  }
}

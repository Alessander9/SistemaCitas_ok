import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AppointmentPatientStep } from './AppointmentPatientStep';
import { fetchPatientByDocument } from '../../services/api';
import {
  buildSelectedSpecialtySummary,
  buildServiceCards,
  findProfessionalCard,
} from './index';
import { PatientFormValues } from './patientCatalog';
import { MOCK_PROFESSIONALS, MOCK_SERVICES, MOCK_SPECIALTIES } from '../../data/mockData';

vi.mock('../../services/api', () => ({
  fetchPatientByDocument: vi.fn(),
}));

const lookup = vi.mocked(fetchPatientByDocument);

const specialty = buildSelectedSpecialtySummary(MOCK_SPECIALTIES[0]);
const service = buildServiceCards([MOCK_SERVICES[0]])[0];
const professional = findProfessionalCard(MOCK_PROFESSIONALS, 'prof-2', specialty.name);

const EMPTY: PatientFormValues = {
  documentType: 'DNI',
  documentNumber: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  consultationReason: '',
};

const renderStep = (overrides: Partial<PatientFormValues> = {}) => {
  const values: PatientFormValues = { ...EMPTY, ...overrides };
  const props = {
    values,
    onChange: vi.fn(),
    onApplyPatient: vi.fn(),
    specialty,
    service,
    professional,
    date: '2026-09-24',
    time: '09:00',
  };
  render(<AppointmentPatientStep {...props} />);
  return props;
};

beforeEach(() => {
  lookup.mockReset();
  lookup.mockResolvedValue({ status: 'not-found' });
});

describe('AppointmentPatientStep (Step 6 — Completa tus datos)', () => {
  it('renders the heading, the three sections, the footnote and the privacy notice', () => {
    renderStep();

    expect(screen.getByRole('heading', { name: /6\. Completa tus datos/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Necesitamos algunos datos para registrar tu cita/i),
    ).toBeInTheDocument();

    ['Datos personales', 'Información de contacto', 'Motivo de consulta'].forEach((title) =>
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument(),
    );

    expect(screen.getByText('* Campos obligatorios')).toBeInTheDocument();
    expect(screen.getByText('Opcional')).toBeInTheDocument();
    expect(screen.getByText('Información protegida')).toBeInTheDocument();
    expect(
      screen.getByText(/Tus datos serán utilizados únicamente para gestionar tu atención/i),
    ).toBeInTheDocument();
  });

  it('keeps the real booking visible in the appointment summary', () => {
    renderStep();

    const summary = within(screen.getByLabelText('Resumen de tu cita'));

    expect(summary.getByText('Jueves, 24 de septiembre de 2026')).toBeInTheDocument();
    expect(summary.getByText('09:00 AM – 10:00 AM')).toBeInTheDocument();
    expect(summary.getByText('60 minutos')).toBeInTheDocument();
    expect(summary.getByText('Dr. Carlos Mendoza Ruiz')).toBeInTheDocument();
    expect(summary.getByText('Evaluación y Diagnóstico Físico Inicial')).toBeInTheDocument();
    expect(summary.getByText('Fisioterapia y Rehabilitación')).toBeInTheDocument();
    expect(summary.getByText('Sede San Isidro')).toBeInTheDocument();
    expect(summary.getByText('S/ 120.00')).toBeInTheDocument();
    expect(summary.getByText(/Estás a un paso de confirmar tu cita/i)).toBeInTheDocument();
  });

  it('collapses the summary with the mobile accordion toggle', () => {
    renderStep();

    const toggle = screen.getByRole('button', { name: /Ver resumen de la cita/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /Ocultar resumen/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('only shows a field error once the patient has visited it', () => {
    renderStep({ documentNumber: '1234' });

    const documentField = screen.getByLabelText(/Número de documento/i);
    expect(screen.queryByText(/El DNI debe tener 8 dígitos/i)).not.toBeInTheDocument();

    fireEvent.focusOut(documentField);

    expect(screen.getByText(/El DNI debe tener 8 dígitos/i)).toBeInTheDocument();
  });

  it('masks what the patient types according to the selected type', () => {
    const props = renderStep();

    fireEvent.change(screen.getByLabelText(/Número de documento/i), {
      target: { value: '73a82b9104' },
    });

    expect(props.onChange).toHaveBeenCalledWith('documentNumber', '73829104');
  });

  it('looks up an existing patient and reports it without inventing data', async () => {
    lookup.mockResolvedValue({
      status: 'found',
      patient: {
        documentType: 'DNI',
        documentNumber: '73829104',
        firstName: 'Juan Carlos',
        lastName: 'Pérez Gómez',
        phone: '+51 987 654 321',
        email: 'juan.perez@email.com',
      },
    });

    const props = renderStep({ documentNumber: '73829104' });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar mis datos' }));

    await waitFor(() => expect(screen.getByText('Encontramos tus datos')).toBeInTheDocument());
    expect(lookup).toHaveBeenCalledWith({ documentType: 'DNI', documentNumber: '73829104' });
    expect(props.onApplyPatient).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Juan Carlos', email: 'juan.perez@email.com' }),
    );
  });

  it('reports a document without a stored record', async () => {
    renderStep({ documentNumber: '73829104' });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar mis datos' }));

    await waitFor(() =>
      expect(
        screen.getByText('No encontramos datos guardados para este documento.'),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText('Encontramos tus datos')).not.toBeInTheDocument();
  });

  it('hides the lookup affordance while the endpoint is not available', async () => {
    lookup.mockResolvedValue({ status: 'unsupported' });

    renderStep({ documentNumber: '73829104' });

    fireEvent.click(screen.getByRole('button', { name: 'Buscar mis datos' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Buscar mis datos' })).not.toBeInTheDocument(),
    );
  });

  it('keeps the lookup disabled until the document number is valid', () => {
    renderStep({ documentNumber: '1234' });

    expect(screen.getByRole('button', { name: 'Buscar mis datos' })).toBeDisabled();
  });
});

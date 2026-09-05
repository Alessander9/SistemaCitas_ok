import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommunicationsPage } from './CommunicationsPage';

describe('CommunicationsPage', () => {
  it('should render without errors and show page title and templates', () => {
    render(<CommunicationsPage />);
    expect(screen.getByText('Comunicaciones & Correos')).toBeTruthy();
    expect(screen.getByText('appointment_confirmation')).toBeTruthy();
  });

  it('should switch to logs tab and display audit logs table', () => {
    render(<CommunicationsPage />);
    const logsTab = document.getElementById('tab-logs');
    expect(logsTab).toBeTruthy();
    fireEvent.click(logsTab!);

    const table = document.getElementById('logs-table');
    expect(table).toBeTruthy();
    expect(screen.getByText('elena.gomez@example.com')).toBeTruthy();
  });

  it('should allow typing test recipient and dispatching test email', () => {
    render(<CommunicationsPage />);
    const testTab = document.getElementById('tab-test');
    expect(testTab).toBeTruthy();
    fireEvent.click(testTab!);

    const recipientInput = document.getElementById('test-recipient') as HTMLInputElement;
    expect(recipientInput).toBeTruthy();
    fireEvent.change(recipientInput, { target: { value: 'nuevo.paciente@correo.com' } });
    expect(recipientInput.value).toBe('nuevo.paciente@correo.com');

    const dispatchBtn = document.getElementById('btn-dispatch-test');
    expect(dispatchBtn).toBeTruthy();
    fireEvent.click(dispatchBtn!);

    expect(screen.getByText(/Correo de prueba despachado a nuevo.paciente@correo.com/)).toBeTruthy();
  });

  it('should show reminder sweep controls in reminders tab', () => {
    render(<CommunicationsPage />);
    const remindersTab = document.getElementById('tab-reminders');
    expect(remindersTab).toBeTruthy();
    fireEvent.click(remindersTab!);

    const sweepBtn = document.getElementById('btn-trigger-sweep');
    expect(sweepBtn).toBeTruthy();
  });
});

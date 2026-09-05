import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelegramBotPage } from './TelegramBotPage';

describe('TelegramBotPage', () => {
  it('should render page title and Telegram bot status badge', () => {
    render(<TelegramBotPage />);
    expect(screen.getByText('Integración con Telegram')).toBeTruthy();
    expect(document.getElementById('tg-status-badge')).toBeTruthy();
  });

  it('should allow generating a new linking code', () => {
    render(<TelegramBotPage />);
    const genBtn = document.getElementById('btn-generate-code');
    expect(genBtn).toBeTruthy();
    fireEvent.click(genBtn!);

    const codeDisplay = document.getElementById('linking-code-box');
    expect(codeDisplay).toBeTruthy();
  });

  it('should respond to quick command /hoy in the interactive chat simulator', () => {
    render(<TelegramBotPage />);
    const hoyBtn = screen.getByText('/hoy');
    expect(hoyBtn).toBeTruthy();
    fireEvent.click(hoyBtn);

    expect(screen.getByText(/Citas de Hoy/)).toBeTruthy();
    expect(screen.getByText(/Lucía Ramos/)).toBeTruthy();
  });

  it('should display inline buttons on /pendientes and allow accepting appointment', () => {
    render(<TelegramBotPage />);
    const pendientesBtn = screen.getByText('/pendientes');
    expect(pendientesBtn).toBeTruthy();
    fireEvent.click(pendientesBtn);

    expect(screen.getByText(/Solicitud de Cita Pendiente/)).toBeTruthy();
    const acceptBtn = screen.getByText('✅ Aceptar');
    expect(acceptBtn).toBeTruthy();

    fireEvent.click(acceptBtn);
    expect(screen.getByText(/Cita confirmada exitosamente/)).toBeTruthy();
  });

  it('should trigger 9 PM daily summary simulation on button click', () => {
    render(<TelegramBotPage />);
    const summaryBtn = document.getElementById('btn-trigger-9pm');
    expect(summaryBtn).toBeTruthy();
    fireEvent.click(summaryBtn!);

    expect(screen.getByText(/Resumen de tu agenda para mañana/)).toBeTruthy();
  });
});

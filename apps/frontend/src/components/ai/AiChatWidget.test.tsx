import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AiChatWidget } from './AiChatWidget';

describe('AiChatWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the floating AI assistant button', () => {
    render(<AiChatWidget />);
    expect(screen.getByText('Asistente IA')).toBeTruthy();
  });

  it('should open chat window when clicking the floating button', () => {
    render(<AiChatWidget />);
    const fabBtn = document.getElementById('btn-open-ai-chat');
    expect(fabBtn).toBeTruthy();
    fireEvent.click(fabBtn!);

    expect(screen.getByText('Asistente Médico IA')).toBeTruthy();
    expect(screen.getByText(/¡Hola! Soy el asistente virtual/i)).toBeTruthy();
  });

  it('should enforce medical containment guardrail when user asks about symptoms/pain', () => {
    render(<AiChatWidget />);
    fireEvent.click(document.getElementById('btn-open-ai-chat')!);

    const input = document.getElementById('ai-chat-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Me duele mucho la espalda baja' } });
    fireEvent.submit(document.querySelector('.ai-input-form')!);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByText(/no puedo emitir diagnósticos clínicos ni recetar medicamentos/)).toBeTruthy();
    expect(screen.getByText(/Agendar Evaluación en Fisioterapia/)).toBeTruthy();
  });

  it('should provide pricing orientation when asking for service costs', () => {
    render(<AiChatWidget />);
    fireEvent.click(document.getElementById('btn-open-ai-chat')!);

    const input = document.getElementById('ai-chat-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '¿Cuál es el precio de una consulta?' } });
    fireEvent.submit(document.querySelector('.ai-input-form')!);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByText(/Terapia Manual Ortopédica/)).toBeTruthy();
    expect(screen.getByText(/S\/ 80.00/)).toBeTruthy();
  });

  it('should call onStartBooking callback when clicking an appointment action button', () => {
    const handleBooking = vi.fn();
    render(<AiChatWidget onStartBooking={handleBooking} />);
    fireEvent.click(document.getElementById('btn-open-ai-chat')!);

    const bookBtn = screen.getByText('Reservar una Cita');
    expect(bookBtn).toBeTruthy();
    fireEvent.click(bookBtn);

    expect(handleBooking).toHaveBeenCalledWith('spec-fisioterapia', undefined);
  });
});

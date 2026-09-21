import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from './LoginPage';

describe('LoginPage Component', () => {
  it('renders login title and brand elements', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Vital Salud/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Acceso al Personal VitalSalud/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
  });

  it('fills email and password when clicking a quick-fill demo role chip', () => {
    render(<LoginPage />);
    const adminChip = screen.getByRole('button', { name: /Admin Clínica/i });
    fireEvent.click(adminChip);

    const emailInput = screen.getByLabelText(/Correo Electrónico/i) as HTMLInputElement;
    expect(emailInput.value).toBe('admin@clinica.pe');
  });

  it('toggles password visibility when clicking eye button', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/^Contraseña$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText(/Ver contraseña/i);
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByLabelText(/Ocultar contraseña/i);
    fireEvent.click(hideBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('shows error message if form is submitted with empty fields', () => {
    render(<LoginPage />);
    const form = screen.getByRole('button', { name: /Ingresar al Sistema/i }).closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Por favor ingresa tu correo electrónico y contraseña/i)).toBeInTheDocument();
  });
});

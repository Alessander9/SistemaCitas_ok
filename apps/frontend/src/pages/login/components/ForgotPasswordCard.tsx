import React, { useState } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { TurnstileWidget } from '../../../components/ui/TurnstileWidget';
import { requestPasswordReset } from '../../../services/api';

interface ForgotPasswordCardProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordCard: React.FC<ForgotPasswordCardProps> = ({ onBackToLogin }) => {
  const [forgotEmail, setForgotEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotEmail.trim()) {
      setForgotError('Por favor ingresa tu correo electrónico registrado.');
      return;
    }

    if (!turnstileToken) {
      setForgotError('Por favor completa la verificación de seguridad Cloudflare Turnstile.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await requestPasswordReset(forgotEmail.trim(), turnstileToken);
      if (res.success) {
        setForgotSuccess(true);
        setForgotMessage(res.message);
      } else {
        setForgotError(res.message);
      }
    } catch {
      setForgotError('Error de conexión al solicitar restablecimiento de contraseña.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="auth-recovery-card">
      <button
        type="button"
        className="auth-back-link"
        onClick={() => {
          setForgotError(null);
          setForgotSuccess(false);
          onBackToLogin();
        }}
      >
        <MaterialIcon name="arrow_back" size={16} />
        <span>Volver al inicio de sesión</span>
      </button>

      <div className="form-header">
        <h2>Recuperar Contraseña</h2>
        <p>
          Ingresa tu correo para recibir un enlace de recuperación protegido con Cloudflare Turnstile.
        </p>
      </div>

      {forgotError && (
        <div className="alert-box alert-danger" role="alert">
          <MaterialIcon name="error_outline" size={18} />
          <span>{forgotError}</span>
        </div>
      )}

      {forgotSuccess ? (
        <div className="alert-box alert-success alert-box--stacked">
          <div className="alert-box__head">
            <MaterialIcon name="mark_email_read" size={22} />
            <strong>Instrucciones enviadas</strong>
          </div>
          <p className="alert-box__body">
            {forgotMessage || 'Si la dirección está registrada en el sistema, recibirás un enlace de recuperación vía Resend.'}
          </p>
          <p className="alert-box__meta">
            Revisa tu bandeja de entrada y la carpeta de spam. El enlace expira en 60 minutos.
          </p>
          <button
            type="button"
            className="submit-btn"
            onClick={() => {
              setForgotSuccess(false);
              setForgotError(null);
              onBackToLogin();
            }}
          >
            <MaterialIcon name="login" size={18} />
            <span>Regresar al Inicio de Sesión</span>
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="forgotEmail" className="input-label">
              Correo Electrónico Registrado
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <MaterialIcon name="mail_outline" size={18} />
              </span>
              <input
                id="forgotEmail"
                type="email"
                required
                autoComplete="email"
                className="auth-input"
                placeholder="tu.nombre@clinica.pe"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="turnstile-slot">
            <TurnstileWidget
              onVerify={(token) => {
                setTurnstileToken(token);
                setForgotError(null);
              }}
              onError={() => {
                setForgotError('Error en la verificación de seguridad Cloudflare Turnstile.');
              }}
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isForgotLoading || !turnstileToken || !forgotEmail.trim()}
          >
            {isForgotLoading ? (
              <>
                <span className="spinner" />
                <span>Enviando enlace...</span>
              </>
            ) : (
              <>
                <MaterialIcon name="send" size={18} />
                <span>Enviar Enlace de Recuperación</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

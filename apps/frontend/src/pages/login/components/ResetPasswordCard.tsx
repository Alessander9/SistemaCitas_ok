import React, { useState } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { confirmPasswordReset } from '../../../services/api';

interface ResetPasswordCardProps {
  token: string;
  onBackToLogin: () => void;
}

export const ResetPasswordCard: React.FC<ResetPasswordCardProps> = ({ token, onBackToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword || newPassword.length < 8) {
      setResetError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await confirmPasswordReset(token, newPassword);
      if (res.success) {
        setResetSuccess(true);
        setResetMessage(res.message);
      } else {
        setResetError(res.message);
      }
    } catch {
      setResetError('Error al actualizar la contraseña. El enlace puede haber caducado.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="auth-reset-card">
      <div className="form-header">
        <h2>Establecer Nueva Contraseña</h2>
        <p>
          Define una nueva clave de acceso de al menos 8 caracteres para tu cuenta clínica.
        </p>
      </div>

      {resetError && (
        <div className="alert-box alert-danger" role="alert">
          <MaterialIcon name="error_outline" size={18} />
          <span>{resetError}</span>
        </div>
      )}

      {resetSuccess ? (
        <div className="alert-box alert-success alert-box--stacked">
          <div className="alert-box__head">
            <MaterialIcon name="check_circle" size={22} />
            <strong>Contraseña actualizada</strong>
          </div>
          <p className="alert-box__body">
            {resetMessage || 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.'}
          </p>
          <button
            type="button"
            className="submit-btn"
            onClick={() => {
              setResetSuccess(false);
              setResetError(null);
              onBackToLogin();
            }}
          >
            <MaterialIcon name="login" size={18} />
            <span>Iniciar Sesión Ahora</span>
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="newPassword" className="input-label">
              Nueva Contraseña (mínimo 8 caracteres)
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <MaterialIcon name="lock" size={18} />
              </span>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="auth-input auth-input--password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <MaterialIcon name={showNewPassword ? 'visibility_off' : 'visibility'} size={18} />
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">
              Confirmar Nueva Contraseña
            </label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                <MaterialIcon name="lock_reset" size={18} />
              </span>
              <input
                id="confirmPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="auth-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isResetLoading || !newPassword || !confirmPassword}
          >
            {isResetLoading ? (
              <>
                <span className="spinner" />
                <span>Actualizando contraseña...</span>
              </>
            ) : (
              <>
                <MaterialIcon name="save" size={18} />
                <span>Guardar Nueva Contraseña</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

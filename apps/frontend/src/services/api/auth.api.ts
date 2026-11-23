const API_BASE = '/api';

/**
 * Solicita el restablecimiento de contraseña mediante Cloudflare Turnstile.
 */
export async function requestPasswordReset(
  email: string,
  turnstileToken: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, turnstileToken }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'No se pudo procesar la solicitud de recuperación.',
      };
    }

    return {
      success: true,
      message: data.message || 'Si el correo está registrado, recibirás un enlace de recuperación.',
    };
  } catch (error) {
    console.warn('Error al solicitar restablecimiento de contraseña:', error);
    return {
      success: false,
      message: 'Error de red al conectar con el servidor de autenticación.',
    };
  }
}

/**
 * Confirma el cambio de contraseña con el token de recuperación recibido por correo.
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'El enlace de recuperación es inválido o ha expirado.',
      };
    }

    return {
      success: true,
      message: data.message || 'Tu contraseña ha sido actualizada con éxito.',
    };
  } catch (error) {
    console.warn('Error al actualizar contraseña:', error);
    return {
      success: false,
      message: 'Error de red al actualizar la contraseña.',
    };
  }
}

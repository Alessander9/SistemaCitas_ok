import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  JwtPayload,
  UserProfileResponse,
} from '@citassistema/shared-types';

interface UserDbRow {
  id: string;
  clinic_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  deleted_at?: string | null;
  clinic_name?: string;
  clinic_slug?: string;
  clinic_is_active: boolean;
  clinic_deleted_at?: string | null;
}

interface TokenDbRow {
  id: string;
  user_id: string;
  clinic_id: string;
  is_revoked: boolean;
  expires_at: string;
}

interface NameDbRow {
  name: string;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessTokenExpiresIn = '15m';
  private readonly refreshTokenExpiresDays = 7;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecret =
      process.env.JWT_SECRET || 'citassistema-jwt-secret-key-2026';
    this.jwtRefreshSecret =
      process.env.JWT_REFRESH_SECRET || 'citassistema-refresh-secret-2026';
  }

  /**
   * Hashea una contraseña usando bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compara una contraseña en texto plano contra su hash bcrypt.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera un hash SHA-256 rápido para indexación de refresh tokens.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Inicia sesión con correo y contraseña, validando tenant, roles y permisos.
   */
  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const { email, password, clinicSlug } = dto;

    // Buscar usuario y su clínica
    let query = `
      SELECT 
        u.id,
        u.clinic_id,
        u.email,
        u.password_hash,
        u.first_name,
        u.last_name,
        u.is_active,
        u.deleted_at,
        c.name AS clinic_name,
        c.slug AS clinic_slug,
        c.is_active AS clinic_is_active,
        c.deleted_at AS clinic_deleted_at
      FROM users u
      JOIN clinics c ON c.id = u.clinic_id
      WHERE u.email = $1 AND u.deleted_at IS NULL
    `;
    const params: unknown[] = [email.toLowerCase().trim()];

    if (clinicSlug) {
      query += ` AND c.slug = $2`;
      params.push(clinicSlug.toLowerCase().trim());
    }

    const { rows: users } = await this.db.query<UserDbRow>(query, params);

    if (users.length === 0) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const user = users[0];

    // Validar estado de la clínica
    if (!user.clinic_is_active || user.clinic_deleted_at) {
      throw new ForbiddenException(
        'La clínica se encuentra temporalmente inactiva. Contacta a administración.',
      );
    }

    // Validar estado del usuario
    if (!user.is_active || user.deleted_at) {
      throw new UnauthorizedException(
        'Tu usuario está inactivo o ha sido dado de baja. Contacta a administración.',
      );
    }

    // Validar contraseña
    const isPasswordValid = await this.comparePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // Obtener roles y permisos asociados
    const { roles, permissions } = await this.getUserRolesAndPermissions(
      user.id,
      user.clinic_id,
    );

    // Generar tokens
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      clinicId: user.clinic_id,
      roles,
      permissions,
    });

    // Actualizar último inicio de sesión
    await this.db.query(
      `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [user.id],
    );

    // Registrar en auditoría
    await this.recordAuditLog({
      clinicId: user.clinic_id,
      userId: user.id,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 15 * 60, // 15 minutos en segundos
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        clinicId: user.clinic_id,
        clinicName: user.clinic_name,
        roles,
        permissions,
      },
    };
  }

  /**
   * Rota el refresh token y emite un nuevo par de tokens (Access + Refresh).
   */
  async refreshTokens(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = dto;

    let payload: { sub: string; clinicId: string; type: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException(
        'El token de actualización es inválido o ha expirado.',
      );
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        'Tipo de token no válido para actualización.',
      );
    }

    const tokenHash = this.hashToken(refreshToken);

    // Buscar el refresh token en la base de datos
    const { rows: tokenRows } = await this.db.query<TokenDbRow>(
      `SELECT id, user_id, clinic_id, is_revoked, expires_at 
       FROM refresh_tokens 
       WHERE token_hash = $1`,
      [tokenHash],
    );

    if (tokenRows.length === 0) {
      throw new UnauthorizedException('Token de actualización no reconocido.');
    }

    const tokenRecord = tokenRows[0];

    // Si ya fue revocado, posible ataque de reutilización de token -> revocar toda la sesión
    if (tokenRecord.is_revoked) {
      await this.db.query(
        `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1`,
        [tokenRecord.user_id],
      );
      throw new UnauthorizedException(
        'El token ya había sido utilizado o revocado. Por seguridad, inicia sesión nuevamente.',
      );
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new UnauthorizedException(
        'El token de actualización ha expirado. Inicia sesión nuevamente.',
      );
    }

    // Obtener datos frescos del usuario
    const { rows: userRows } = await this.db.query<UserDbRow>(
      `SELECT u.id, u.clinic_id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active, c.name AS clinic_name, c.is_active AS clinic_is_active 
       FROM users u
       JOIN clinics c ON c.id = u.clinic_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [tokenRecord.user_id],
    );

    if (userRows.length === 0 || !userRows[0].is_active || !userRows[0].clinic_is_active) {
      throw new UnauthorizedException('Usuario o clínica inactiva.');
    }

    const user = userRows[0];
    const { roles, permissions } = await this.getUserRolesAndPermissions(
      user.id,
      user.clinic_id,
    );

    // Generar nuevos tokens
    const newTokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      clinicId: user.clinic_id,
      roles,
      permissions,
    });

    // Marcar el token anterior como revocado y enlazar
    await this.db.query(
      `UPDATE refresh_tokens SET is_revoked = true WHERE id = $1`,
      [tokenRecord.id],
    );

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: 15 * 60,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        clinicId: user.clinic_id,
        clinicName: user.clinic_name,
        roles,
        permissions,
      },
    };
  }

  /**
   * Cierra sesión revocando los tokens activos.
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.db.query(
        `UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1`,
        [tokenHash],
      );
    } else {
      await this.db.query(
        `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1 AND is_revoked = false`,
        [userId],
      );
    }
  }

  /**
   * Obtiene el perfil completo del usuario autenticado.
   */
  async getProfile(
    userId: string,
    clinicId: string,
  ): Promise<UserProfileResponse> {
    const { rows } = await this.db.query<UserDbRow>(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.clinic_id, u.phone, u.avatar_url, u.is_active, c.name AS clinic_name, c.is_active AS clinic_is_active
       FROM users u
       JOIN clinics c ON c.id = u.clinic_id
       WHERE u.id = $1 AND u.clinic_id = $2 AND u.deleted_at IS NULL`,
      [userId, clinicId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const user = rows[0];
    const { roles, permissions } = await this.getUserRolesAndPermissions(
      user.id,
      user.clinic_id,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      clinicId: user.clinic_id,
      clinicName: user.clinic_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      roles,
      permissions,
    };
  }

  /**
   * Obtiene roles y permisos consolidados de un usuario en una clínica.
   */
  async getUserRolesAndPermissions(
    userId: string,
    clinicId: string,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    // 1. Obtener nombres de roles
    const { rows: roleRows } = await this.db.query<NameDbRow>(
      `SELECT r.name 
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1 AND r.clinic_id = $2 AND r.deleted_at IS NULL`,
      [userId, clinicId],
    );

    const roles = roleRows.map((r) => r.name);

    // 2. Obtener lista de permisos únicos
    const { rows: permRows } = await this.db.query<NameDbRow>(
      `SELECT DISTINCT p.name 
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       JOIN role_permissions rp ON rp.role_id = r.id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1 AND r.clinic_id = $2 AND r.deleted_at IS NULL`,
      [userId, clinicId],
    );

    const permissions = permRows.map((p) => p.name);

    return { roles, permissions };
  }

  /**
   * Genera el par Access Token + Refresh Token y persiste el refresh token.
   */
  private async generateTokens(params: {
    userId: string;
    email: string;
    clinicId: string;
    roles: string[];
    permissions: string[];
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, email, clinicId, roles, permissions } = params;

    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      clinicId,
      roles,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.jwtSecret,
      expiresIn: this.accessTokenExpiresIn,
    });

    const refreshPayload = {
      sub: userId,
      clinicId,
      type: 'refresh',
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.jwtRefreshSecret,
      expiresIn: `${this.refreshTokenExpiresDays}d`,
    });

    // Guardar refresh token hasheado en base de datos
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiresDays);

    await this.db.query(
      `INSERT INTO refresh_tokens (user_id, clinic_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, clinicId, tokenHash, expiresAt],
    );

    return { accessToken, refreshToken };
  }

  /**
   * Registra eventos de seguridad en la tabla de auditoría.
   */
  private async recordAuditLog(params: {
    clinicId: string;
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO audit_logs (clinic_id, user_id, action, resource_type, resource_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          params.clinicId,
          params.userId || null,
          params.action,
          params.resourceType,
          params.resourceId || null,
          params.ipAddress || null,
          params.userAgent || null,
        ],
      );
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }
}

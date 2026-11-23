import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service';
import { CreateAdminClinicDto } from './dto/create-clinic.dto';
import { CreateClinicUserDto } from './dto/create-clinic-user.dto';

export interface AdminClinicResponse {
  id: string;
  name: string;
  legalName?: string;
  ruc?: string;
  slug: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  renipressCode?: string;
  ipressCategory?: string;
  openingHours?: string;
  slotDuration?: number;
  doctors: number;
  adminsCount: number;
  consultingRooms: number;
  activeAppointments: number;
  monthAppointments: number;
  status: 'active' | 'onboarding' | 'suspended' | 'maintenance';
  isActive: boolean;
  monthlyRevenue: string;
  revenueAmount: number;
}

export interface AdminOverviewResponse {
  totalClinics: number;
  activeClinics: number;
  suspendedClinics: number;
  totalDoctors: number;
  totalUsers: number;
  todayAppointments: number;
  monthAppointments: number;
  monthRevenue: number;
  health: {
    database: 'ok' | 'degraded';
    latencyMs: number;
    emailProvider: 'brevo' | 'resend' | 'mock';
    emailsLast24h: {
      total: number;
      sent: number;
      failed: number;
    };
  };
}

export interface AdminUserRecord {
  id: string;
  clinicId: string;
  clinicName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminClinicFinanceRow {
  clinicId: string;
  clinicName: string;
  slug: string;
  city: string;
  isActive: boolean;
  monthAppointments: number;
  totalRevenue: number;
  cardRevenue: number;
  digitalWalletRevenue: number;
  cashRevenue: number;
  otherRevenue: number;
}

export interface AdminAuditEventResponse {
  id: string;
  source: 'audit' | 'email';
  createdAt: string;
  actor: string;
  action: string;
  resource: string;
  clinicName: string;
  ipAddress: string;
  status: 'ok' | 'error';
}

function formatPen(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  async getOverview(): Promise<AdminOverviewResponse> {
    const start = Date.now();
    await this.db.query('SELECT 1');
    const latencyMs = Math.max(1, Date.now() - start);

    const [clinicsStats, appointmentsStats, revenueStats, emailStats] = await Promise.all([
      this.db.query<{
        total_clinics: number;
        active_clinics: number;
        suspended_clinics: number;
        total_doctors: number;
        total_users: number;
      }>(`
        SELECT
          (SELECT COUNT(*)::int FROM clinics WHERE deleted_at IS NULL) AS total_clinics,
          (SELECT COUNT(*)::int FROM clinics WHERE deleted_at IS NULL AND is_active = true) AS active_clinics,
          (SELECT COUNT(*)::int FROM clinics WHERE deleted_at IS NULL AND is_active = false) AS suspended_clinics,
          (SELECT COUNT(*)::int FROM professionals WHERE deleted_at IS NULL) AS total_doctors,
          (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS total_users
      `),
      this.db.query<{
        today_appointments: number;
        month_appointments: number;
      }>(`
        SELECT
          COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE)::int AS today_appointments,
          COUNT(*) FILTER (WHERE date_trunc('month', appointment_date) = date_trunc('month', CURRENT_DATE))::int AS month_appointments
        FROM appointments
        WHERE deleted_at IS NULL AND status != 'cancelled'
      `),
      this.db.query<{ month_revenue: string }>(`
        SELECT COALESCE(
          (SELECT SUM(amount) FROM payments WHERE deleted_at IS NULL AND status::text = 'completed' AND date_trunc('month', created_at) = date_trunc('month', NOW())),
          0
        ) + COALESCE(
          (SELECT SUM(amount) FROM cash_movements WHERE payment_id IS NULL AND type::text = 'income' AND date_trunc('month', created_at) = date_trunc('month', NOW())),
          0
        ) AS month_revenue
      `),
      this.db.query<{ total: number; sent: number; failed: number }>(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
          COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
        FROM email_logs
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `),
    ]);

    const cRow = clinicsStats.rows[0];
    const aRow = appointmentsStats.rows[0];
    const rRow = revenueStats.rows[0];
    const eRow = emailStats.rows[0];

    const emailProvider: 'brevo' | 'resend' | 'mock' = process.env.BREVO_API_KEY
      ? 'brevo'
      : process.env.RESEND_API_KEY
      ? 'resend'
      : 'mock';

    return {
      totalClinics: cRow?.total_clinics ?? 0,
      activeClinics: cRow?.active_clinics ?? 0,
      suspendedClinics: cRow?.suspended_clinics ?? 0,
      totalDoctors: cRow?.total_doctors ?? 0,
      totalUsers: cRow?.total_users ?? 0,
      todayAppointments: aRow?.today_appointments ?? 0,
      monthAppointments: aRow?.month_appointments ?? 0,
      monthRevenue: Number(rRow?.month_revenue ?? 0),
      health: {
        database: 'ok',
        latencyMs,
        emailProvider,
        emailsLast24h: {
          total: eRow?.total ?? 0,
          sent: eRow?.sent ?? 0,
          failed: eRow?.failed ?? 0,
        },
      },
    };
  }

  async listClinics(): Promise<AdminClinicResponse[]> {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.phone,
        c.email,
        c.address,
        c.is_active,
        c.settings,
        COALESCE((SELECT COUNT(*)::int FROM professionals p WHERE p.clinic_id = c.id AND p.deleted_at IS NULL), 0) AS doctors_count,
        COALESCE((
          SELECT COUNT(DISTINCT u.id)::int
          FROM users u
          JOIN user_roles ur ON ur.user_id = u.id
          JOIN roles r ON r.id = ur.role_id
          WHERE u.clinic_id = c.id AND u.deleted_at IS NULL AND r.name = 'ADMIN_CLINIC'
        ), 0) AS admins_count,
        COALESCE((SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = c.id AND a.deleted_at IS NULL AND a.status != 'cancelled' AND a.appointment_date = CURRENT_DATE), 0) AS today_appointments,
        COALESCE((SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = c.id AND a.deleted_at IS NULL AND a.status != 'cancelled' AND date_trunc('month', a.appointment_date) = date_trunc('month', CURRENT_DATE)), 0) AS month_appointments,
        (
          COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.clinic_id = c.id AND p.deleted_at IS NULL AND p.status::text = 'completed' AND date_trunc('month', p.created_at) = date_trunc('month', NOW())), 0)
          +
          COALESCE((SELECT SUM(cm.amount) FROM cash_movements cm WHERE cm.clinic_id = c.id AND cm.payment_id IS NULL AND cm.type::text = 'income' AND date_trunc('month', cm.created_at) = date_trunc('month', NOW())), 0)
        ) AS month_revenue
      FROM clinics c
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `;

    const { rows } = await this.db.query<{
      id: string;
      name: string;
      slug: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      is_active: boolean;
      settings: Record<string, unknown> | null;
      doctors_count: number;
      admins_count: number;
      today_appointments: number;
      month_appointments: number;
      month_revenue: string;
    }>(query);

    return rows.map((r) => {
      const s = r.settings || {};
      const revenueAmount = Number(r.month_revenue || 0);
      const status: AdminClinicResponse['status'] = r.is_active ? 'active' : 'suspended';
      return {
        id: r.id,
        name: r.name,
        legalName: (s.legalName as string) || undefined,
        ruc: (s.ruc as string) || undefined,
        slug: r.slug,
        city: (s.city as string) || 'Lima, Perú',
        address: r.address || undefined,
        phone: r.phone || undefined,
        email: r.email || undefined,
        renipressCode: (s.renipressCode as string) || undefined,
        ipressCategory: (s.ipressCategory as string) || undefined,
        openingHours: (s.openingHours as string) || 'Lunes a Sábado · 07:00 a 20:00',
        slotDuration: Number(s.slotDuration) || 30,
        doctors: r.doctors_count,
        adminsCount: r.admins_count,
        consultingRooms: Number(s.consultingRooms) || 4,
        activeAppointments: r.today_appointments,
        monthAppointments: r.month_appointments,
        status,
        isActive: r.is_active,
        monthlyRevenue: formatPen(revenueAmount),
        revenueAmount,
      };
    });
  }

  async createClinic(dto: CreateAdminClinicDto, actorId?: string): Promise<AdminClinicResponse> {
    const formattedSlug = dto.slug.trim().toLowerCase().replace(/\s+/g, '-');

    const existing = await this.db.query<{ id: string }>(
      'SELECT id FROM clinics WHERE slug = $1 AND deleted_at IS NULL',
      [formattedSlug],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException(`Ya existe una clínica con el slug "${formattedSlug}"`);
    }

    const settings = {
      city: dto.city.trim(),
      legalName: dto.legalName?.trim(),
      ruc: dto.ruc?.trim(),
      renipressCode: dto.renipressCode?.trim(),
      ipressCategory: dto.ipressCategory?.trim(),
      consultingRooms: dto.consultingRooms || 4,
    };

    const insertQuery = `
      INSERT INTO clinics (name, slug, phone, email, address, settings, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id
    `;

    const { rows } = await this.db.query<{ id: string }>(insertQuery, [
      dto.name.trim(),
      formattedSlug,
      dto.phone || null,
      dto.email || null,
      dto.address || null,
      JSON.stringify(settings),
    ]);

    const createdId = rows[0].id;
    await this.recordAudit(createdId, actorId, 'CLINIC_CREATED', 'clinic', createdId, {
      name: dto.name.trim(),
      slug: formattedSlug,
    });

    const list = await this.listClinics();
    return list.find((c) => c.id === createdId)!;
  }

  async updateClinic(
    id: string,
    dto: Partial<CreateAdminClinicDto>,
    actorId?: string,
  ): Promise<AdminClinicResponse> {
    const existing = await this.db.query<{
      id: string;
      name: string;
      slug: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      is_active: boolean;
      settings: Record<string, unknown> | null;
    }>(
      'SELECT id, name, slug, phone, email, address, is_active, settings FROM clinics WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundException(`Clínica con ID "${id}" no encontrada`);
    }

    const current = existing.rows[0];
    const currentSettings = current.settings || {};
    const mergedSettings = {
      ...currentSettings,
      ...(dto.city !== undefined ? { city: dto.city.trim() } : {}),
      ...(dto.legalName !== undefined ? { legalName: dto.legalName.trim() } : {}),
      ...(dto.ruc !== undefined ? { ruc: dto.ruc.trim() } : {}),
      ...(dto.renipressCode !== undefined ? { renipressCode: dto.renipressCode.trim() } : {}),
      ...(dto.ipressCategory !== undefined ? { ipressCategory: dto.ipressCategory.trim() } : {}),
      ...(dto.consultingRooms !== undefined ? { consultingRooms: dto.consultingRooms } : {}),
    };

    const nextName = dto.name ? dto.name.trim() : current.name;
    const nextPhone = dto.phone !== undefined ? dto.phone : current.phone;
    const nextEmail = dto.email !== undefined ? dto.email : current.email;
    const nextAddress = dto.address !== undefined ? dto.address : current.address;

    await this.db.query(
      'UPDATE clinics SET name = $1, phone = $2, email = $3, address = $4, settings = $5, updated_at = NOW() WHERE id = $6',
      [nextName, nextPhone, nextEmail, nextAddress, JSON.stringify(mergedSettings), id],
    );

    await this.recordAudit(id, actorId, 'CLINIC_UPDATED', 'clinic', id, { name: nextName });

    const list = await this.listClinics();
    return list.find((c) => c.id === id)!;
  }

  async toggleClinicStatus(
    id: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<AdminClinicResponse> {
    const { rowCount } = await this.db.query(
      'UPDATE clinics SET is_active = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
      [isActive, id],
    );
    if (!rowCount) {
      throw new NotFoundException(`Clínica con ID "${id}" no encontrada`);
    }

    await this.recordAudit(
      id,
      actorId,
      isActive ? 'CLINIC_ACTIVATED' : 'CLINIC_SUSPENDED',
      'clinic',
      id,
      { isActive },
    );

    const list = await this.listClinics();
    return list.find((c) => c.id === id)!;
  }

  async getNetworkFinance(): Promise<AdminClinicFinanceRow[]> {
    const { rows } = await this.db.query<{
      clinic_id: string;
      clinic_name: string;
      slug: string;
      is_active: boolean;
      settings: Record<string, unknown> | null;
      month_appointments: number;
      card_revenue: string;
      wallet_revenue: string;
      cash_revenue: string;
      other_revenue: string;
    }>(`
      SELECT
        c.id AS clinic_id,
        c.name AS clinic_name,
        c.slug,
        c.is_active,
        c.settings,
        COALESCE((
          SELECT COUNT(*)::int FROM appointments a
          WHERE a.clinic_id = c.id AND a.deleted_at IS NULL AND a.status != 'cancelled'
            AND date_trunc('month', a.appointment_date) = date_trunc('month', CURRENT_DATE)
        ), 0) AS month_appointments,
        COALESCE((
          SELECT SUM(p.amount) FROM payments p
          WHERE p.clinic_id = c.id AND p.deleted_at IS NULL AND p.status::text = 'completed'
            AND p.method::text IN ('card', 'credit_card', 'debit_card', 'pos')
            AND date_trunc('month', p.created_at) = date_trunc('month', NOW())
        ), 0) AS card_revenue,
        COALESCE((
          SELECT SUM(p.amount) FROM payments p
          WHERE p.clinic_id = c.id AND p.deleted_at IS NULL AND p.status::text = 'completed'
            AND p.method::text IN ('yape', 'plin', 'transfer', 'digital_wallet')
            AND date_trunc('month', p.created_at) = date_trunc('month', NOW())
        ), 0) AS wallet_revenue,
        (
          COALESCE((
            SELECT SUM(p.amount) FROM payments p
            WHERE p.clinic_id = c.id AND p.deleted_at IS NULL AND p.status::text = 'completed'
              AND p.method::text = 'cash'
              AND date_trunc('month', p.created_at) = date_trunc('month', NOW())
          ), 0)
          +
          COALESCE((
            SELECT SUM(cm.amount) FROM cash_movements cm
            WHERE cm.clinic_id = c.id AND cm.payment_id IS NULL AND cm.type::text = 'income'
              AND date_trunc('month', cm.created_at) = date_trunc('month', NOW())
          ), 0)
        ) AS cash_revenue,
        COALESCE((
          SELECT SUM(p.amount) FROM payments p
          WHERE p.clinic_id = c.id AND p.deleted_at IS NULL AND p.status::text = 'completed'
            AND p.method::text NOT IN ('card', 'credit_card', 'debit_card', 'pos', 'yape', 'plin', 'transfer', 'digital_wallet', 'cash')
            AND date_trunc('month', p.created_at) = date_trunc('month', NOW())
        ), 0) AS other_revenue
      FROM clinics c
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `);

    return rows.map((r) => {
      const card = Number(r.card_revenue || 0);
      const wallet = Number(r.wallet_revenue || 0);
      const cash = Number(r.cash_revenue || 0);
      const other = Number(r.other_revenue || 0);
      return {
        clinicId: r.clinic_id,
        clinicName: r.clinic_name,
        slug: r.slug,
        city: ((r.settings || {}).city as string) || 'Lima, Perú',
        isActive: r.is_active,
        monthAppointments: r.month_appointments,
        totalRevenue: card + wallet + cash + other,
        cardRevenue: card,
        digitalWalletRevenue: wallet,
        cashRevenue: cash,
        otherRevenue: other,
      };
    });
  }

  async listAdminUsers(): Promise<AdminUserRecord[]> {
    const { rows } = await this.db.query<{
      id: string;
      clinic_id: string;
      clinic_name: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      role_name: string;
      is_active: boolean;
      last_login_at: string | null;
      created_at: string;
    }>(`
      SELECT
        u.id,
        u.clinic_id,
        COALESCE(c.name, 'Red Global') AS clinic_name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        COALESCE(r.name, 'ADMIN_CLINIC') AS role_name,
        u.is_active,
        u.last_login_at,
        u.created_at
      FROM users u
      LEFT JOIN clinics c ON c.id = u.clinic_id
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.deleted_at IS NULL
        AND COALESCE(r.name, '') IN ('SUPER_ADMIN', 'ADMIN_CLINIC', 'RECEPCION')
      ORDER BY u.created_at DESC
    `);

    return rows.map((r) => ({
      id: r.id,
      clinicId: r.clinic_id,
      clinicName: r.clinic_name,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone ?? undefined,
      role: r.role_name,
      isActive: r.is_active,
      lastLoginAt: r.last_login_at ?? undefined,
      createdAt: r.created_at,
    }));
  }

  async createClinicUser(dto: CreateClinicUserDto, actorId?: string): Promise<AdminUserRecord> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const roleName = dto.role ?? 'ADMIN_CLINIC';

    const clinicCheck = await this.db.query<{ id: string; name: string }>(
      'SELECT id, name FROM clinics WHERE id = $1 AND deleted_at IS NULL',
      [dto.clinicId],
    );
    if (clinicCheck.rows.length === 0) {
      throw new NotFoundException('La sede seleccionada no existe');
    }

    const emailCheck = await this.db.query<{ id: string }>(
      'SELECT id FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL',
      [normalizedEmail],
    );
    if (emailCheck.rows.length > 0) {
      throw new ConflictException(`Ya existe un usuario registrado con el correo ${normalizedEmail}`);
    }

    const roleRes = await this.db.query<{ id: string }>(
      'SELECT id FROM roles WHERE name = $1 LIMIT 1',
      [roleName],
    );
    if (roleRes.rows.length === 0) {
      throw new BadRequestException(`Rol "${roleName}" no disponible en el sistema`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { rows } = await this.db.query<{
      id: string;
      created_at: string;
    }>(
      `INSERT INTO users (clinic_id, email, password_hash, first_name, last_name, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, created_at`,
      [
        dto.clinicId,
        normalizedEmail,
        passwordHash,
        dto.firstName.trim(),
        dto.lastName.trim(),
        dto.phone?.trim() || null,
      ],
    );

    const userId = rows[0].id;
    await this.db.query(
      'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
      [userId, roleRes.rows[0].id, actorId ?? null],
    );

    await this.recordAudit(dto.clinicId, actorId, 'ADMIN_USER_CREATED', 'user', userId, {
      email: normalizedEmail,
      role: roleName,
    });

    return {
      id: userId,
      clinicId: dto.clinicId,
      clinicName: clinicCheck.rows[0].name,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: normalizedEmail,
      phone: dto.phone?.trim() || undefined,
      role: roleName,
      isActive: true,
      createdAt: rows[0].created_at,
    };
  }

  async toggleUserStatus(
    userId: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<{ id: string; isActive: boolean }> {
    const { rows } = await this.db.query<{ id: string; clinic_id: string }>(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL RETURNING id, clinic_id',
      [isActive, userId],
    );
    if (rows.length === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.recordAudit(
      rows[0].clinic_id,
      actorId,
      isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      'user',
      userId,
      { isActive },
    );

    return { id: userId, isActive };
  }

  async getAuditFeed(limit = 40): Promise<AdminAuditEventResponse[]> {
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const [auditRes, emailRes] = await Promise.all([
      this.db.query<{
        id: string;
        created_at: string;
        actor: string;
        action: string;
        resource_type: string | null;
        clinic_name: string;
        ip_address: string | null;
      }>(
        `SELECT
          al.id,
          al.created_at,
          COALESCE(u.email, 'sistema@vitalsalud.pe') AS actor,
          al.action,
          al.resource_type,
          COALESCE(c.name, 'Red Global') AS clinic_name,
          COALESCE(al.ip_address, 'interno') AS ip_address
        FROM audit_logs al
        LEFT JOIN users u ON u.id = al.user_id
        LEFT JOIN clinics c ON c.id = al.clinic_id
        ORDER BY al.created_at DESC
        LIMIT $1`,
        [safeLimit],
      ),
      this.db.query<{
        id: string;
        created_at: string;
        to_email: string;
        subject: string;
        status: string;
        clinic_name: string;
      }>(
        `SELECT
          el.id,
          el.created_at,
          el.to_email,
          el.subject,
          el.status,
          COALESCE(c.name, 'Red Global') AS clinic_name
        FROM email_logs el
        LEFT JOIN clinics c ON c.id = el.clinic_id
        ORDER BY el.created_at DESC
        LIMIT $1`,
        [Math.min(20, safeLimit)],
      ),
    ]);

    const events: AdminAuditEventResponse[] = [
      ...auditRes.rows.map((r) => ({
        id: `aud-${r.id}`,
        source: 'audit' as const,
        createdAt: r.created_at,
        actor: r.actor,
        action: r.action,
        resource: r.resource_type || 'system',
        clinicName: r.clinic_name,
        ipAddress: r.ip_address || 'interno',
        status: 'ok' as const,
      })),
      ...emailRes.rows.map((r) => ({
        id: `mail-${r.id}`,
        source: 'email' as const,
        createdAt: r.created_at,
        actor: r.to_email,
        action: r.status === 'sent' ? 'EMAIL_DISPATCHED' : 'EMAIL_FAILED',
        resource: r.subject,
        clinicName: r.clinic_name,
        ipAddress: 'smtp-api',
        status: r.status === 'failed' ? ('error' as const) : ('ok' as const),
      })),
    ];

    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return events.slice(0, safeLimit);
  }

  private async recordAudit(
    clinicId: string | null,
    userId: string | undefined,
    action: string,
    resourceType: string,
    resourceId: string,
    newValues: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO audit_logs (clinic_id, user_id, action, resource_type, resource_id, new_values, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, 'superadmin-console')`,
        [clinicId, userId ?? null, action, resourceType, resourceId, JSON.stringify(newValues)],
      );
    } catch {
      // Non-blocking audit logging
    }
  }
}

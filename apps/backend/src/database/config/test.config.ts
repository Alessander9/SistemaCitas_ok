import { Pool } from 'pg';

export const testConfig = {
  database: {
    url: process.env.DATABASE_TEST_URL || 'postgresql://postgres:postgres@localhost:5433/citassistema_test',
  },
  get pool() {
    return new Pool({ connectionString: this.database.url });
  },
};

export async function resetTestDatabase() {
  const pool = testConfig.pool;

  try {
    // Drop all tables in reverse dependency order
    const tables = [
      'audit_logs', 'notification_logs', 'email_logs', 'email_templates',
      'telegram_accounts', 'inventory_movements', 'inventory_products',
      'consents', 'documents', 'prescriptions', 'treatment_sessions',
      'treatments', 'medical_records', 'cash_movements', 'cash_registers',
      'payment_transactions', 'payments', 'appointment_status_history',
      'appointments', 'patients', 'schedule_blocks', 'professional_schedules',
      'professional_services', 'professionals', 'services', 'specialties',
      'role_permissions', 'user_roles', 'permissions', 'roles', 'users',
      'clinics', '_migrations',
    ];

    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE ${table} CASCADE`);
    }
  } finally {
    await pool.end();
  }
}

import { validateEnv, envSchema } from './env.schema';

describe('Environment Variable Validation (Zod Schema)', () => {
  it('should accept valid development configuration with defaults', () => {
    const config = validateEnv({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/citassistema',
    });

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.JWT_SECRET).toBe('citassistema-jwt-secret-key-2026');
  });

  it('should reject production configuration when using default JWT_SECRET', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://prod_user:secret@db.prod.internal:5432/citassistema',
        JWT_SECRET: 'citassistema-jwt-secret-key-2026',
        JWT_REFRESH_SECRET: 'citassistema-refresh-secret-2026',
      }),
    ).toThrow(/ConfigValidationError/);
  });

  it('should accept production configuration when strong custom secrets are provided', () => {
    const config = validateEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      DATABASE_URL: 'postgresql://prod_user:strong_password@db.prod.internal:5432/citassistema',
      JWT_SECRET: 'super-secure-production-jwt-secret-key-9988',
      JWT_REFRESH_SECRET: 'super-secure-production-refresh-secret-key-9988',
      FRONTEND_URL: 'https://citas.sanitas.pe',
    });

    expect(config.NODE_ENV).toBe('production');
    expect(config.PORT).toBe(8080);
    expect(config.JWT_SECRET).toBe('super-secure-production-jwt-secret-key-9988');
  });

  it('should coerce PORT and DB_POOL_MAX numbers', () => {
    const parsed = envSchema.parse({
      PORT: '4000',
      DB_POOL_MAX: '50',
    });

    expect(parsed.PORT).toBe(4000);
    expect(parsed.DB_POOL_MAX).toBe(50);
  });
});

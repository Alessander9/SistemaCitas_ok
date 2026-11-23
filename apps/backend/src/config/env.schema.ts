import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL es requerida')
      .default('postgresql://postgres:postgres@localhost:5433/citassistema'),
    JWT_SECRET: z
      .string()
      .min(16, 'JWT_SECRET debe tener al menos 16 caracteres')
      .default('citassistema-jwt-secret-key-2026'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres')
      .default('citassistema-refresh-secret-2026'),
    FRONTEND_URL: z.string().default('http://localhost:5300'),
    GROQ_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().optional(),
    DNI_API_TOKEN: z.string().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    DB_POOL_MAX: z.coerce.number().default(20),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        const isDefaultSecret =
          data.JWT_SECRET === 'citassistema-jwt-secret-key-2026' ||
          data.JWT_REFRESH_SECRET === 'citassistema-refresh-secret-2026';
        return !isDefaultSecret;
      }
      return true;
    },
    {
      message:
        'En producción (NODE_ENV=production) JWT_SECRET y JWT_REFRESH_SECRET no pueden usar los valores por defecto',
      path: ['JWT_SECRET'],
    },
  );

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env): EnvConfig {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');
    throw new Error(
      `\n❌ [ConfigValidationError] Fallo crítico al validar variables de entorno:\n${errorDetails}\n`,
    );
  }
  return result.data;
}

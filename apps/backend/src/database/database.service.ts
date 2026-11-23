import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      'postgresql://postgres@localhost:5432/citassistema';

    const poolMax = parseInt(
      this.configService.get<string>('DB_POOL_MAX') || process.env.DB_POOL_MAX || '20',
      10,
    );

    this.pool = new Pool({
      connectionString,
      max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    try {
      await this.pool.query('SELECT 1');
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.warn(`⚠️ Database connection warning (PostgreSQL unreachable): ${(error as Error).message}`);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async getClient() {
    return this.pool.connect();
  }

  async transaction<T>(callback: (client: Awaited<ReturnType<typeof this.getClient>>) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

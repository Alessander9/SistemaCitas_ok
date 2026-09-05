import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  async check() {
    const dbStatus = await this.checkDatabase();
    return {
      status: dbStatus.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }

  async checkDatabase() {
    try {
      const result = await this.databaseService.query('SELECT 1 AS ok');
      return {
        status: 'healthy',
        responseTime: Date.now(),
        connected: result.rows.length > 0,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseService } from '../../database/database.service';

describe('HealthController', () => {
  let controller: HealthController;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when database is connected', async () => {
      mockDatabaseService.query.mockResolvedValue({ rows: [{ ok: 1 }] });

      const result = await controller.check();

      expect(result.status).toBe('healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.database.status).toBe('healthy');
    });

    it('should return unhealthy status when database fails', async () => {
      mockDatabaseService.query.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.check();

      expect(result.status).toBe('unhealthy');
      expect(result.database.status).toBe('unhealthy');
    });
  });

  describe('checkDatabase', () => {
    it('should return healthy when query succeeds', async () => {
      mockDatabaseService.query.mockResolvedValue({ rows: [{ ok: 1 }] });

      const result = await controller.checkDatabase();

      expect(result.status).toBe('healthy');
      expect(result.connected).toBe(true);
    });

    it('should return unhealthy when query fails', async () => {
      mockDatabaseService.query.mockRejectedValue(new Error('timeout'));

      const result = await controller.checkDatabase();

      expect(result.status).toBe('unhealthy');
      expect(result.connected).toBe(false);
      expect(result.error).toBe('timeout');
    });
  });
});

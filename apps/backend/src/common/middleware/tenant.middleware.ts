import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include tenant metadata
declare global {
  namespace Express {
    interface Request {
      clinicId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const headerClinicId = req.headers['x-clinic-id'] as string;
    if (headerClinicId) {
      req.clinicId = headerClinicId;
    }
    next();
  }
}

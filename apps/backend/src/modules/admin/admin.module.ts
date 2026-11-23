import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PublicClinicController } from './public-clinic.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController, PublicClinicController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

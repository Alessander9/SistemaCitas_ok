import { IsBoolean } from 'class-validator';

export class UpdateClinicStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

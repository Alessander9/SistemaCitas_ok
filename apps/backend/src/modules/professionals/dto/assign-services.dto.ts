import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignServicesDto {
  @IsArray({ message: 'serviceIds debe ser un arreglo de IDs.' })
  @IsNotEmpty({ message: 'El listado de servicios no puede estar vacío.' })
  @IsUUID('4', { each: true, message: 'Cada serviceId debe ser un UUID válido.' })
  serviceIds!: string[];
}

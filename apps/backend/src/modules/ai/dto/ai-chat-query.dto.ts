import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AiChatQueryDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsArray()
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

import { AnatomyView } from './anatomy-catalog';

export type Laterality = 'D' | 'I' | 'bilateral' | 'central';
export type PainView = AnatomyView;
export type TriggerPointStatus = 'activo' | 'latente';
export type PainDepth = 'superficial' | 'profundo';

export type PainType =
  | 'punzante'
  | 'quemante'
  | 'sordo'
  | 'opresivo'
  | 'irradiado'
  | 'hormigueo'
  | 'calambre';

export type AggravatingFactor =
  | 'flexion'
  | 'extension'
  | 'rotacion'
  | 'carga'
  | 'reposo'
  | 'nocturno'
  | 'bipedestacion'
  | 'sedestacion';

export interface PainPoint {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  medicalRecordId?: string;
  treatmentSessionId?: string;
  structureCode: string;
  structureLabel?: string;
  regionCode: string;
  regionLabel?: string;
  laterality: Laterality;
  view: PainView;
  coordX: number; // 0 to 100 percentage
  coordY: number; // 0 to 100 percentage
  eva: number; // 0 to 10
  painTypes?: string[];
  triggerPoint?: TriggerPointStatus;
  depth?: PainDepth;
  aggravatingFactors?: string[];
  referredArea?: Record<string, unknown> | null;
  notes?: string;
  recordedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePainPointDto {
  id?: string;
  structureCode: string;
  regionCode: string;
  laterality: Laterality;
  view: PainView;
  coordX: number;
  coordY: number;
  eva: number;
  painTypes?: string[];
  triggerPoint?: TriggerPointStatus;
  depth?: PainDepth;
  aggravatingFactors?: string[];
  referredArea?: Record<string, unknown> | null;
  notes?: string;
}

export interface SavePainMapPayload {
  patientId: string;
  medicalRecordId?: string;
  treatmentSessionId?: string;
  points: CreatePainPointDto[];
}

export interface PainEvolutionPoint {
  id: string;
  recordedAt: string;
  eva: number;
  laterality: Laterality;
  triggerPoint?: TriggerPointStatus;
  source: 'medical_record' | 'treatment_session';
  referenceId: string;
  sessionNumber?: number;
  notes?: string;
}

export interface PainEvolutionSeries {
  structureCode: string;
  structureLabel: string;
  regionCode: string;
  regionLabel: string;
  laterality: Laterality;
  history: PainEvolutionPoint[];
  initialEva: number;
  currentEva: number;
  delta: number; // currentEva - initialEva (negative means improvement)
}

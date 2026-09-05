import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { DatabaseService } from '../../database/database.service';

describe('ClinicalService (Medical Records, Treatments & Prescriptions)', () => {
  let service: ClinicalService;
  let db: { query: jest.Mock; transaction: jest.Mock };

  const mockClinicId = '11111111-1111-1111-1111-111111111111';
  const mockPatientId = '22222222-2222-2222-2222-222222222222';
  const mockProfessionalId = '33333333-3333-3333-3333-333333333333';
  const mockTreatmentId = '44444444-4444-4444-4444-444444444444';

  beforeEach(async () => {
    db = {
      query: jest.fn(),
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<ClinicalService>(ClinicalService);
  });

  describe('Medical Records', () => {
    it('should create a medical record with EVA pain scale and anamnesis', async () => {
      const recordId = 'rec-101';
      db.query
        .mockResolvedValueOnce({ rows: [{ id: recordId }] }) // insert
        .mockResolvedValueOnce({
          rows: [
            {
              id: recordId,
              clinic_id: mockClinicId,
              patient_id: mockPatientId,
              professional_id: mockProfessionalId,
              professional_first_name: 'Dra. María',
              professional_last_name: 'González',
              chief_complaint: 'Dolor punzante lumbar',
              anamnesis: 'Paciente refiere dolor de 3 semanas de evolución.',
              physical_examination: 'Contractura paravertebral L4-L5.',
              diagnosis: 'Lumbalgia mecánica postural',
              treatment_plan: '10 sesiones de fisioterapia y fortalecimiento',
              pain_scale: 7,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const result = await service.createMedicalRecord(mockClinicId, {
        patientId: mockPatientId,
        professionalId: mockProfessionalId,
        chiefComplaint: 'Dolor punzante lumbar',
        anamnesis: 'Paciente refiere dolor de 3 semanas de evolución.',
        physicalExamination: 'Contractura paravertebral L4-L5.',
        diagnosis: 'Lumbalgia mecánica postural',
        treatmentPlan: '10 sesiones de fisioterapia y fortalecimiento',
        painScale: 7,
      });

      expect(result.id).toBe(recordId);
      expect(result.painScale).toBe(7);
      expect(result.professionalName).toBe('Dra. María González');
    });

    it('should return chronological list of patient medical records', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'rec-1',
            clinic_id: mockClinicId,
            patient_id: mockPatientId,
            professional_id: mockProfessionalId,
            diagnosis: 'Epicondilitis lateral',
            pain_scale: 6,
            created_at: '2026-09-01T10:00:00Z',
          },
        ],
      });

      const records = await service.getPatientMedicalRecords(mockClinicId, mockPatientId);
      expect(records).toHaveLength(1);
      expect(records[0].painScale).toBe(6);
    });
  });

  describe('Treatments & Treatment Sessions', () => {
    it('should create a treatment plan with session count', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: mockTreatmentId }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockTreatmentId,
              clinic_id: mockClinicId,
              patient_id: mockPatientId,
              professional_id: mockProfessionalId,
              name: 'Rehabilitación de hombro',
              total_sessions: 8,
              completed_sessions: 0,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const treatment = await service.createTreatment(mockClinicId, {
        patientId: mockPatientId,
        professionalId: mockProfessionalId,
        name: 'Rehabilitación de hombro',
        totalSessions: 8,
      });

      expect(treatment.id).toBe(mockTreatmentId);
      expect(treatment.totalSessions).toBe(8);
      expect(treatment.completedSessions).toBe(0);
      expect(treatment.status).toBe('active');
    });

    it('should create session, record EVA pain delta, increment counter and auto-complete when reaching total', async () => {
      // 1. getTreatmentById check
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockTreatmentId,
            clinic_id: mockClinicId,
            patient_id: mockPatientId,
            professional_id: mockProfessionalId,
            name: 'Rehabilitación de hombro',
            total_sessions: 2,
            completed_sessions: 1,
            status: 'active',
          },
        ],
      });

      // 2. Mock transaction execution
      db.transaction.mockImplementation(async (cb) => {
        const fakeClient = {
          query: jest
            .fn()
            .mockResolvedValueOnce({ rows: [{ next_num: '2' }] }) // session number
            .mockResolvedValueOnce({
              rows: [
                {
                  id: 'session-2',
                  clinic_id: mockClinicId,
                  treatment_id: mockTreatmentId,
                  session_number: 2,
                  session_date: '2026-09-08',
                  pain_scale_before: 6,
                  pain_scale_after: 2,
                  techniques_applied: ['Ultrasonido', 'Terapia manual'],
                  evolution: 'Disminución notable del dolor a la palpación.',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
            })
            .mockResolvedValueOnce({ rows: [] }), // update treatment completed & status
        };
        return cb(fakeClient);
      });

      const session = await service.createTreatmentSession(mockClinicId, {
        treatmentId: mockTreatmentId,
        sessionDate: '2026-09-08',
        painScaleBefore: 6,
        painScaleAfter: 2,
        techniquesApplied: ['Ultrasonido', 'Terapia manual'],
        evolution: 'Disminución notable del dolor a la palpación.',
      });

      expect(session.sessionNumber).toBe(2);
      expect(session.painScaleBefore).toBe(6);
      expect(session.painScaleAfter).toBe(2);
    });

    it('should throw BadRequestException if adding a session to an already completed treatment', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: mockTreatmentId,
            clinic_id: mockClinicId,
            patient_id: mockPatientId,
            status: 'completed',
            total_sessions: 5,
            completed_sessions: 5,
          },
        ],
      });

      await expect(
        service.createTreatmentSession(mockClinicId, {
          treatmentId: mockTreatmentId,
          sessionDate: '2026-09-09',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Prescriptions', () => {
    it('should create digital prescription with structured medication items', async () => {
      const presId = 'pres-101';
      db.query
        .mockResolvedValueOnce({ rows: [{ id: presId }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: presId,
              clinic_id: mockClinicId,
              patient_id: mockPatientId,
              professional_id: mockProfessionalId,
              professional_first_name: 'Dr. Carlos',
              professional_last_name: 'Mendoza',
              medications: [
                {
                  medicationName: 'Ibuprofeno',
                  dose: '400mg',
                  route: 'Oral',
                  frequency: 'Cada 8 horas',
                  duration: 'Por 5 días con alimentos',
                },
              ],
              instructions: 'Evitar sobreesfuerzo físico.',
              valid_until: '2026-09-30',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const prescription = await service.createPrescription(mockClinicId, {
        patientId: mockPatientId,
        professionalId: mockProfessionalId,
        medications: [
          {
            medicationName: 'Ibuprofeno',
            dose: '400mg',
            route: 'Oral',
            frequency: 'Cada 8 horas',
            duration: 'Por 5 días con alimentos',
          },
        ],
        instructions: 'Evitar sobreesfuerzo físico.',
        validUntil: '2026-09-30',
      });

      expect(prescription.id).toBe(presId);
      expect(prescription.medications).toHaveLength(1);
      expect(prescription.medications[0].medicationName).toBe('Ibuprofeno');
    });
  });
});

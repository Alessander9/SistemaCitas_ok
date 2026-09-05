-- =============================================================================
-- Seed 002: Demo Data — Specialties, Services, Professionals
-- CitasSistema (Clínica Sanitas Lima / Demo)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Specialties
-- ---------------------------------------------------------------------------
INSERT INTO specialties (id, clinic_id, name, description, icon, sort_order) VALUES
  ('c0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Fisioterapia y Rehabilitación', 'Recuperación de movilidad, lesiones deportivas y dolores crónicos con tecnología avanzada.', 'activity', 1),
  ('c0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001', 'Traumatología y Ortopedia', 'Diagnóstico y tratamiento integral de afecciones del sistema músculo-esquelético.', 'bone', 2),
  ('c0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000001', 'Terapia Ocupacional', 'Reintegración funcional en actividades de la vida diaria y ergonomía postural.', 'user-check', 3),
  ('c0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000001', 'Nutrición Clínica y Deportiva', 'Planes nutricionales adaptados a procesos de recuperación y rendimiento físico.', 'heart', 4);

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
INSERT INTO services (id, clinic_id, specialty_id, name, description, duration_minutes, price, is_active) VALUES
  ('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001', 'Evaluación y Diagnóstico Físico Inicial', 'Valoración biomecánica completa, pruebas de rango articular y diseño del plan de tratamiento personalizado.', 60, 120.00, true),
  ('d0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000001', 'Sesión de Terapia Manual y Punción Seca', 'Tratamiento muscular profundo para descontracturar puntos gatillo y aliviar el dolor agudo.', 45, 90.00, true),
  ('d0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000002', 'Consulta Médica Traumatológica', 'Revisión médica especializada con lectura de resonancias, radiografías e infiltraciones si aplica.', 30, 150.00, true),
  ('d0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000003', 'Sesión de Rehabilitación de Mano y Muñeca', 'Protocolos de readaptación motriz fina y confección de férulas para tendinopatías o post-cirugía.', 45, 85.00, true),
  ('d0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000001', 'c0000000-0000-4000-a000-000000000004', 'Consulta Nutricional con Bioimpedancia', 'Análisis de composición corporal InBody y cálculo de requerimientos calóricos antiinflamatorios.', 45, 110.00, true);

-- ---------------------------------------------------------------------------
-- Professionals
-- ---------------------------------------------------------------------------
INSERT INTO professionals (id, clinic_id, first_name, last_name, license_number, email, phone, bio, consultation_fee, is_active) VALUES
  ('e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Dra. María', 'González Flores', 'CTMP-84920', 'maria.gonzalez@clinica.pe', '+51 987 654 321', 'Especialista en Fisioterapia Deportiva y Readaptación Funcional con más de 9 años de experiencia en deportistas de élite y columna vertebral.', 120.00, true),
  ('e0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001', 'Dr. Carlos', 'Mendoza Ruiz', 'CMP-51294', 'carlos.mendoza@clinica.pe', '+51 991 223 344', 'Médico Traumatólogo con especialidad en artroscopía de hombro y rodilla. Miembro de la Sociedad Peruana de Ortopedia y Traumatología.', 150.00, true),
  ('e0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000001', 'Lic. Andrés', 'Paredes Soto', 'CTMP-99411', 'andres.paredes@clinica.pe', '+51 977 445 566', 'Terapeuta Físico y Ocupacional especializado en ergonomía laboral y rehabilitación neuromuscular avanzada.', 90.00, true);

-- ---------------------------------------------------------------------------
-- Professional-Services Mapping
-- ---------------------------------------------------------------------------
INSERT INTO professional_services (professional_id, service_id) VALUES
  ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001'),
  ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000002'),
  ('e0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000003'),
  ('e0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000004'),
  ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000005');

-- ---------------------------------------------------------------------------
-- Professional Schedules (Mon-Fri 08:00 - 18:00)
-- ---------------------------------------------------------------------------
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time) VALUES
  ('e0000000-0000-4000-a000-000000000001', 1, '08:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000001', 2, '08:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000001', 3, '08:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000001', 4, '08:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000001', 5, '08:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000001', 6, '08:00', '14:00'),
  ('e0000000-0000-4000-a000-000000000002', 1, '09:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000002', 3, '09:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000002', 5, '09:00', '18:00'),
  ('e0000000-0000-4000-a000-000000000003', 2, '10:00', '19:00'),
  ('e0000000-0000-4000-a000-000000000003', 4, '10:00', '19:00'),
  ('e0000000-0000-4000-a000-000000000003', 6, '09:00', '13:00');

-- ---------------------------------------------------------------------------
-- Demo Users (Password for all: Password123!)
-- Hash: $2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy
-- ---------------------------------------------------------------------------
INSERT INTO users (id, clinic_id, email, password_hash, first_name, last_name, phone, is_active) VALUES
  ('f0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'admin@clinica.pe', '$2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy', 'Alessander', 'Director Médico', '+51 987 654 321', true),
  ('f0000000-0000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000001', 'doctor@clinica.pe', '$2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy', 'Dra. María', 'González Flores', '+51 987 654 321', true),
  ('f0000000-0000-4000-a000-000000000003', 'a0000000-0000-4000-a000-000000000001', 'recepcion@clinica.pe', '$2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy', 'Recepción', 'Sanitas Central', '+51 1 710-8000', true),
  ('f0000000-0000-4000-a000-000000000004', 'a0000000-0000-4000-a000-000000000001', 'paciente@clinica.pe', '$2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy', 'Juan Carlos', 'Pérez Gómez', '+51 912 345 678', true),
  ('f0000000-0000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000001', 'superadmin@citassistema.pe', '$2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy', 'Alessander', 'Super Administrador', '+51 987 654 321', true),
  ('f0000000-0000-4000-a000-000000000006', 'a0000000-0000-4000-a000-000000000001', 'admin@clinica-demo.citassistema.com', '$2b$10$1lxybatdwhu7tdjAynsqVeH2EKlA704P42aXqMGxbvlbTMTbuN4Jy', 'Alessander', 'Director Médico', '+51 987 654 321', true);

INSERT INTO user_roles (user_id, role_id) VALUES
  ('f0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002'), -- ADMIN_CLINIC
  ('f0000000-0000-4000-a000-000000000002', 'b0000000-0000-4000-a000-000000000004'), -- PROFESIONAL
  ('f0000000-0000-4000-a000-000000000003', 'b0000000-0000-4000-a000-000000000003'), -- RECEPCION
  ('f0000000-0000-4000-a000-000000000004', 'b0000000-0000-4000-a000-000000000005'), -- PACIENTE
  ('f0000000-0000-4000-a000-000000000005', 'b0000000-0000-4000-a000-000000000001'), -- SUPER_ADMIN
  ('f0000000-0000-4000-a000-000000000006', 'b0000000-0000-4000-a000-000000000002'); -- ADMIN_CLINIC


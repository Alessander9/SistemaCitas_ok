-- =============================================================================
-- Migration 001: Extensions and Enum Types
-- CitasSistema — Base DDL
-- =============================================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded',
  'partial'
);

CREATE TYPE payment_method AS ENUM (
  'cash',
  'credit_card',
  'debit_card',
  'transfer',
  'insurance',
  'other'
);

CREATE TYPE document_type AS ENUM (
  'medical_record',
  'prescription',
  'lab_result',
  'imaging',
  'consent',
  'invoice',
  'other'
);

CREATE TYPE movement_type AS ENUM (
  'sale',
  'purchase',
  'adjustment',
  'return',
  'waste'
);

CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'telegram',
  'push'
);

CREATE TYPE consent_status AS ENUM (
  'pending',
  'granted',
  'revoked'
);

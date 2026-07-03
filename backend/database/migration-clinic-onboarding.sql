-- Migration: clinic onboarding fields (clinic_settings, wards, hospitals.registration_no/pincode)
-- Adds what hospital.controller.js's createHospital/getHospital/updateHospital need
-- but complete-schema.sql never defined. Safe to re-run (IF NOT EXISTS everywhere).
-- Apply against the Supabase Postgres database, then restart the backend.

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS registration_no VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);

CREATE TABLE IF NOT EXISTS clinic_settings (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL UNIQUE REFERENCES hospitals(id) ON DELETE CASCADE,
  clinic_name VARCHAR(255),
  logo_url VARCHAR(255),
  primary_color VARCHAR(20) DEFAULT '#3b82f6',
  secondary_color VARCHAR(20) DEFAULT '#1d4ed8',
  header_text TEXT,
  footer_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clinic_settings_hospital ON clinic_settings(hospital_id);

CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  ward_type VARCHAR(50) DEFAULT 'general',
  total_beds INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wards_hospital ON wards(hospital_id);

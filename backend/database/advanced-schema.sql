-- Advanced Features Schema (PostgreSQL)
-- ============================================

-- ============================================
-- ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  metric_name VARCHAR(100),
  metric_value DECIMAL(15,2),
  metric_date DATE DEFAULT CURRENT_DATE,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(hospital_id, metric_date);

-- ============================================
-- REVENUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS revenue (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  revenue_date DATE DEFAULT CURRENT_DATE,
  consultation_revenue DECIMAL(12,2),
  pharmacy_revenue DECIMAL(12,2),
  lab_revenue DECIMAL(12,2),
  bed_revenue DECIMAL(12,2),
  ambulance_revenue DECIMAL(12,2),
  other_revenue DECIMAL(12,2),
  total_revenue DECIMAL(12,2),
  expenses DECIMAL(12,2),
  net_profit DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue(revenue_date);

-- ============================================
-- PATIENT PROFILE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_profile (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  occupation VARCHAR(100),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')) DEFAULT 'single',
  education_level VARCHAR(50),
  smoking_status VARCHAR(20) CHECK (smoking_status IN ('never', 'former', 'current')) DEFAULT 'never',
  alcohol_consumption VARCHAR(20) CHECK (alcohol_consumption IN ('none', 'occasional', 'regular')) DEFAULT 'none',
  exercise_frequency VARCHAR(50),
  diet_type VARCHAR(50),
  family_history TEXT,
  social_history TEXT,
  occupation_hazards TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEDICINE ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicine_alerts (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  medicine_id INT,
  alert_type VARCHAR(50) CHECK (alert_type IN ('low_stock', 'expiry_soon', 'expired', 'interaction_warning')) DEFAULT 'low_stock',
  alert_message TEXT,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicine_alerts_status ON medicine_alerts(hospital_id, is_resolved);

-- ============================================
-- PERFORMANCE RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS performance_ratings (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  rating_date DATE DEFAULT CURRENT_DATE,
  patient_satisfaction DECIMAL(3,2),
  treatment_effectiveness DECIMAL(3,2),
  communication_skills DECIMAL(3,2),
  punctuality DECIMAL(3,2),
  overall_rating DECIMAL(3,2),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_ratings(doctor_id, rating_date);

-- ============================================
-- DASHBOARD METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  metric_date DATE DEFAULT CURRENT_DATE,
  total_patients INT DEFAULT 0,
  total_appointments INT DEFAULT 0,
  completed_appointments INT DEFAULT 0,
  pending_appointments INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_expenses DECIMAL(12,2) DEFAULT 0,
  bed_occupancy_rate DECIMAL(5,2) DEFAULT 0,
  average_patient_rating DECIMAL(3,2) DEFAULT 0,
  emergency_cases INT DEFAULT 0,
  discharged_patients INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dashboard_date ON dashboard_metrics(metric_date);

-- ============================================
-- DOCTOR PERFORMANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_performance (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  performance_date DATE DEFAULT CURRENT_DATE,
  total_consultations INT DEFAULT 0,
  average_consultation_time INT DEFAULT 0,
  patient_satisfaction_score DECIMAL(3,2) DEFAULT 0,
  treatment_success_rate DECIMAL(5,2) DEFAULT 0,
  follow_up_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_performance_date ON doctor_performance(doctor_id, performance_date);

-- ============================================
-- PATIENT ADMISSION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_admission (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bed_id INT REFERENCES beds(id) ON DELETE SET NULL,
  department_id INT REFERENCES departments(id) ON DELETE SET NULL,
  admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discharge_date TIMESTAMP,
  admission_type VARCHAR(50) CHECK (admission_type IN ('emergency', 'planned', 'transfer')) DEFAULT 'planned',
  reason_for_admission TEXT,
  admitted_by INT REFERENCES users(id) ON DELETE SET NULL,
  discharged_by INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('admitted', 'discharged', 'transferred')) DEFAULT 'admitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admission_date ON patient_admission(admission_date);

-- ============================================
-- PRESCRIPTION REFILL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescription_refill (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  prescription_id INT NOT NULL REFERENCES digital_prescriptions(id) ON DELETE CASCADE,
  refill_date DATE DEFAULT CURRENT_DATE,
  refill_count INT DEFAULT 1,
  refilled_by INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'dispensed', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refill_date ON prescription_refill(refill_date);

-- ============================================
-- PATIENT DISCHARGE SUMMARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_discharge_summary (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  admission_id INT REFERENCES patient_admission(id) ON DELETE SET NULL,
  discharge_date DATE DEFAULT CURRENT_DATE,
  diagnosis TEXT,
  treatment_provided TEXT,
  medications_prescribed TEXT,
  follow_up_instructions TEXT,
  follow_up_date DATE,
  discharge_status VARCHAR(20) CHECK (discharge_status IN ('recovered', 'improved', 'unchanged', 'deceased')) DEFAULT 'recovered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discharge_date ON patient_discharge_summary(discharge_date);

-- ============================================
-- CONSULTATION NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_notes (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  chief_complaint TEXT,
  history_of_present_illness TEXT,
  past_medical_history TEXT,
  physical_examination TEXT,
  assessment TEXT,
  plan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultation_date ON consultation_notes(created_at);

-- ============================================
-- MEDICINE INTERACTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicine_interaction (
  id SERIAL PRIMARY KEY,
  medicine_id_1 INT,
  medicine_id_2 INT,
  interaction_type VARCHAR(50) CHECK (interaction_type IN ('contraindicated', 'major', 'moderate', 'minor')) DEFAULT 'moderate',
  interaction_description TEXT,
  severity_level INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PATIENT ALLERGY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_allergy (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergen_name VARCHAR(255),
  allergen_type VARCHAR(50) CHECK (allergen_type IN ('medication', 'food', 'environmental', 'other')) DEFAULT 'medication',
  reaction_severity VARCHAR(20) CHECK (reaction_severity IN ('mild', 'moderate', 'severe')) DEFAULT 'moderate',
  reaction_description TEXT,
  date_identified DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_allergy ON patient_allergy(patient_id);

-- ============================================
-- STAFF ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_attendance (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  staff_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  attendance_date DATE DEFAULT CURRENT_DATE,
  check_in_time TIME,
  check_out_time TIME,
  status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'half_day', 'leave')) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON staff_attendance(attendance_date);

-- ============================================
-- INVENTORY TRANSACTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transaction (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  inventory_id INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('purchase', 'usage', 'adjustment', 'return')) DEFAULT 'usage',
  quantity INT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_number VARCHAR(100),
  notes TEXT,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transaction_date ON inventory_transaction(transaction_date);

-- ============================================
-- PATIENT INSURANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_insurance (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  insurance_provider VARCHAR(100),
  policy_number VARCHAR(100),
  group_number VARCHAR(100),
  member_id VARCHAR(100),
  coverage_type VARCHAR(100),
  coverage_amount DECIMAL(12,2),
  deductible DECIMAL(10,2),
  copay DECIMAL(10,2),
  effective_date DATE,
  expiry_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insurance_status ON patient_insurance(status);

-- ============================================
-- APPOINTMENT REMINDER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointment_reminder (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) CHECK (reminder_type IN ('sms', 'email', 'whatsapp')) DEFAULT 'sms',
  reminder_time TIMESTAMP,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminder_time ON appointment_reminder(reminder_time);

-- ============================================
-- PATIENT COMMUNICATION LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_communication_log (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) CHECK (communication_type IN ('sms', 'email', 'whatsapp', 'call', 'in_person')) DEFAULT 'sms',
  subject VARCHAR(255),
  message TEXT,
  sent_by INT REFERENCES users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_communication_date ON patient_communication_log(sent_at);

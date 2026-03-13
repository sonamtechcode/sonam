-- Hospital Management System - Complete Database Schema (PostgreSQL)
-- ============================================
-- 1. HOSPITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  website VARCHAR(255),
  established_year INT,
  total_beds INT,
  emergency_contact VARCHAR(20),
  license_number VARCHAR(100),
  accreditation VARCHAR(255),
  logo_url VARCHAR(255),
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50) CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient', 'staff')) NOT NULL,
  department VARCHAR(100),
  employee_id VARCHAR(50),
  profile_picture_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_hospital ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 3. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  patient_id_number VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  blood_group VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(100),
  insurance_expiry_date DATE,
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  bmi DECIMAL(5,2),
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_hospital ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id_number);

-- ============================================
-- 4. DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE,
  specialization VARCHAR(100),
  qualification VARCHAR(255),
  experience_years INT,
  consultation_fee DECIMAL(10,2),
  bio TEXT,
  availability_status VARCHAR(20) CHECK (availability_status IN ('available', 'busy', 'on_leave', 'offline')) DEFAULT 'offline',
  rating DECIMAL(3,2),
  total_consultations INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);

-- ============================================
-- 5. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')) DEFAULT 'scheduled',
  appointment_type VARCHAR(50) CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'routine_checkup')) DEFAULT 'consultation',
  reason_for_visit TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, appointment_date);

-- ============================================
-- 6. PATIENT VITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_vitals (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
  temperature DECIMAL(5,2),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  respiratory_rate INT,
  oxygen_saturation DECIMAL(5,2),
  blood_glucose DECIMAL(7,2),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_vitals_date ON patient_vitals(patient_id, recorded_at);

-- ============================================
-- 7. DOCTOR SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TIME,
  end_time TIME,
  max_patients_per_day INT DEFAULT 20,
  break_start_time TIME,
  break_end_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_schedule ON doctor_schedules(doctor_id, day_of_week);

-- ============================================
-- 8. DOCTOR LEAVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_leaves (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  leave_start_date DATE NOT NULL,
  leave_end_date DATE NOT NULL,
  leave_type VARCHAR(50) CHECK (leave_type IN ('sick', 'casual', 'emergency', 'vacation', 'training')) DEFAULT 'casual',
  reason TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_leaves_date ON doctor_leaves(doctor_id, leave_start_date);

-- ============================================
-- 9. PATIENT MEDICAL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_medical_history (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_name VARCHAR(255),
  diagnosis_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'resolved', 'chronic')) DEFAULT 'active',
  treatment_details TEXT,
  medications TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_history ON patient_medical_history(patient_id, diagnosis_date);

-- ============================================
-- 10. LAB REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS lab_reports (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_name VARCHAR(255),
  test_code VARCHAR(50),
  ordered_by INT REFERENCES users(id) ON DELETE SET NULL,
  ordered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sample_collected_date TIMESTAMP,
  report_date TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  results TEXT,
  normal_range TEXT,
  notes TEXT,
  file_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lab_reports_date ON lab_reports(patient_id, report_date);

-- ============================================
-- 11. DIGITAL PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS digital_prescriptions (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
  prescription_date DATE DEFAULT CURRENT_DATE,
  medicine_name VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration_days INT,
  instructions TEXT,
  refills_allowed INT DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prescription_date ON digital_prescriptions(patient_id, prescription_date);

-- ============================================
-- 12. PATIENT FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_feedback (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INT CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  staff_behavior_rating INT CHECK (staff_behavior_rating >= 1 AND staff_behavior_rating <= 5),
  wait_time_rating INT CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
  overall_experience_rating INT CHECK (overall_experience_rating >= 1 AND overall_experience_rating <= 5),
  comments TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_rating ON patient_feedback(hospital_id, rating);

-- ============================================
-- 13. AMBULANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ambulances (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  ambulance_number VARCHAR(50) UNIQUE,
  vehicle_registration VARCHAR(50),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  driver_license VARCHAR(50),
  vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('basic', 'advanced', 'icu')) DEFAULT 'basic',
  capacity INT DEFAULT 2,
  current_location VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('available', 'on_duty', 'maintenance', 'offline')) DEFAULT 'available',
  last_service_date DATE,
  next_service_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ambulance_status ON ambulances(hospital_id, status);

-- ============================================
-- 14. AMBULANCE TRIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ambulance_trips (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  ambulance_id INT NOT NULL REFERENCES ambulances(id) ON DELETE CASCADE,
  patient_id INT REFERENCES patients(id) ON DELETE SET NULL,
  pickup_location VARCHAR(255),
  dropoff_location VARCHAR(255),
  pickup_time TIMESTAMP,
  dropoff_time TIMESTAMP,
  distance_km DECIMAL(8,2),
  trip_cost DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ambulance_trips_date ON ambulance_trips(ambulance_id, pickup_time);

-- ============================================
-- 15. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at);

-- ============================================
-- 16. PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 17. ROLE PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (role, permission_id, hospital_id)
);

-- ============================================
-- 18. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50) CHECK (type IN ('appointment', 'prescription', 'lab_report', 'alert', 'general')) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ============================================
-- 19. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  floor_number INT,
  total_beds INT,
  available_beds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_department_hospital ON departments(hospital_id);

-- ============================================
-- 20. BEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS beds (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  bed_number VARCHAR(50),
  bed_type VARCHAR(50) CHECK (bed_type IN ('general', 'icu', 'icu_ventilator', 'isolation')) DEFAULT 'general',
  status VARCHAR(20) CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')) DEFAULT 'available',
  current_patient_id INT REFERENCES patients(id) ON DELETE SET NULL,
  admission_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bed_status ON beds(hospital_id, status);

-- ============================================
-- 21. BILLING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS billing (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE,
  bill_date DATE DEFAULT CURRENT_DATE,
  service_type VARCHAR(100),
  amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'partial', 'paid', 'cancelled')) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_date ON billing(bill_date);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(payment_status);

-- ============================================
-- 22. PHARMACY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pharmacy (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  medicine_code VARCHAR(50),
  generic_name VARCHAR(255),
  manufacturer VARCHAR(100),
  quantity_in_stock INT,
  reorder_level INT,
  unit_price DECIMAL(10,2),
  expiry_date DATE,
  batch_number VARCHAR(50),
  storage_location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_stock ON pharmacy(hospital_id, quantity_in_stock);

-- ============================================
-- 23. LABORATORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS laboratory (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_code VARCHAR(50),
  sample_type VARCHAR(100),
  normal_range_min DECIMAL(10,2),
  normal_range_max DECIMAL(10,2),
  unit VARCHAR(50),
  turnaround_time_hours INT,
  cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lab_tests ON laboratory(hospital_id);

-- ============================================
-- 24. STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  staff_id VARCHAR(50) UNIQUE,
  designation VARCHAR(100),
  department VARCHAR(100),
  shift VARCHAR(20) CHECK (shift IN ('morning', 'afternoon', 'night')) DEFAULT 'morning',
  salary DECIMAL(10,2),
  joining_date DATE,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_hospital ON staff(hospital_id);

-- ============================================
-- 25. INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  item_code VARCHAR(50),
  category VARCHAR(100),
  quantity INT,
  unit VARCHAR(50),
  reorder_level INT,
  supplier_name VARCHAR(100),
  last_purchase_date DATE,
  cost_per_unit DECIMAL(10,2),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(hospital_id, quantity);

-- ============================================
-- 26. EMERGENCY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT REFERENCES patients(id) ON DELETE SET NULL,
  emergency_type VARCHAR(100),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT,
  arrival_time TIMESTAMP,
  assigned_doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('registered', 'in_treatment', 'admitted', 'discharged', 'deceased')) DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency(hospital_id, status);

-- ============================================
-- 27. PAYMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  billing_id INT REFERENCES billing(id) ON DELETE SET NULL,
  amount DECIMAL(10,2),
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'insurance')) DEFAULT 'cash',
  transaction_id VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_date ON payment(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);

-- ============================================
-- 28. REPORT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS report (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
  report_type VARCHAR(100),
  report_date DATE DEFAULT CURRENT_DATE,
  findings TEXT,
  recommendations TEXT,
  file_url VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('draft', 'completed', 'reviewed')) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_report_date ON report(report_date);

-- ============================================
-- 29. VITALS TABLE (Alternative)
-- ============================================
CREATE TABLE IF NOT EXISTS vitals (
  id SERIAL PRIMARY KEY,
  hospital_id INT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
  temperature DECIMAL(5,2),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  respiratory_rate INT,
  oxygen_saturation DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vitals_date ON vitals(patient_id, recorded_at);

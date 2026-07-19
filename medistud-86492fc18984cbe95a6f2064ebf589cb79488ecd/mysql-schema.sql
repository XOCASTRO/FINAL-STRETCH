-- PTI CLINIC MANAGEMENT SYSTEM - MySQL Database Schema
-- Use this script to set up your MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinic_db;

-- Staff Users Table (Authentication and authorization)
CREATE TABLE IF NOT EXISTS staff_users (
  staff_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Staff user ID',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email for login',
  full_name VARCHAR(255) NOT NULL COMMENT 'Staff full name',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  role VARCHAR(50) NOT NULL COMMENT 'Role: ADMIN, DOCTOR, NURSE, STAFF, VIEWER',
  can_create_records BOOLEAN DEFAULT FALSE COMMENT 'Permission to create medical records',
  can_create_staff BOOLEAN DEFAULT FALSE COMMENT 'Permission to create staff users',
  can_edit_records BOOLEAN DEFAULT FALSE COMMENT 'Permission to edit medical records',
  can_delete_records BOOLEAN DEFAULT FALSE COMMENT 'Permission to delete medical records',
  department VARCHAR(100) COMMENT 'Department assignment',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Staff account status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation date',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated date',
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Medical Files Table (Primary table for all medical records)
CREATE TABLE IF NOT EXISTS student_files (
  matric_number VARCHAR(50) PRIMARY KEY COMMENT 'Student matric number - unique identifier',
  student_name VARCHAR(255) NOT NULL COMMENT 'Full name of student',
  level VARCHAR(50) NOT NULL COMMENT 'Academic level (100, 200, 300, 400, etc)',
  date_of_birth DATE NOT NULL COMMENT 'Date of birth',
  phone VARCHAR(20) COMMENT 'Contact phone number',
  email VARCHAR(255) COMMENT 'Email address',
  address TEXT COMMENT 'Physical address',
  parent_contact VARCHAR(20) COMMENT 'Parent/Guardian contact',
  emergency_contact VARCHAR(20) COMMENT 'Emergency contact number',
  created_by_staff_id INT COMMENT 'Staff member who created this record',
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update date',
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_created_by (created_by_staff_id),
  FOREIGN KEY (created_by_staff_id) REFERENCES staff_users(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Allergy record ID',
  matric_number VARCHAR(50) NOT NULL COMMENT 'Student matric number',
  allergen VARCHAR(255) NOT NULL COMMENT 'Allergen name',
  severity VARCHAR(50) COMMENT 'Severity level: Mild, Moderate, Severe',
  notes TEXT COMMENT 'Additional notes about the allergy',
  date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date allergy was recorded',
  FOREIGN KEY (matric_number) REFERENCES student_files(matric_number) ON DELETE CASCADE,
  INDEX idx_matric (matric_number),
  INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Treatment History Table
CREATE TABLE IF NOT EXISTS treatment_history (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Treatment record ID',
  matric_number VARCHAR(50) NOT NULL COMMENT 'Student matric number',
  visit_date DATE NOT NULL COMMENT 'Date of treatment',
  diagnosis VARCHAR(255) NOT NULL COMMENT 'Medical diagnosis',
  treatment TEXT NOT NULL COMMENT 'Treatment provided',
  doctor_name VARCHAR(255) COMMENT 'Doctor who provided treatment',
  notes TEXT COMMENT 'Additional treatment notes',
  follow_up_required BOOLEAN DEFAULT FALSE COMMENT 'Whether follow-up is needed',
  follow_up_date DATE COMMENT 'Date for follow-up appointment',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  FOREIGN KEY (matric_number) REFERENCES student_files(matric_number) ON DELETE CASCADE,
  INDEX idx_matric (matric_number),
  INDEX idx_visit_date (visit_date),
  INDEX idx_diagnosis (diagnosis)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prescription History Table
CREATE TABLE IF NOT EXISTS prescription_history (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Prescription record ID',
  matric_number VARCHAR(50) NOT NULL COMMENT 'Student matric number',
  prescription_date DATE NOT NULL COMMENT 'Date prescription was issued',
  medication VARCHAR(255) NOT NULL COMMENT 'Drug name',
  dosage VARCHAR(100) NOT NULL COMMENT 'Dosage amount',
  frequency VARCHAR(100) NOT NULL COMMENT 'Frequency of use',
  duration VARCHAR(100) COMMENT 'Duration of treatment',
  doctor_name VARCHAR(255) COMMENT 'Doctor who issued prescription',
  notes TEXT COMMENT 'Special instructions',
  status VARCHAR(50) DEFAULT 'active' COMMENT 'Status: active, completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  FOREIGN KEY (matric_number) REFERENCES student_files(matric_number) ON DELETE CASCADE,
  INDEX idx_matric (matric_number),
  INDEX idx_medication (medication),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Doctor Notes Table
CREATE TABLE IF NOT EXISTS doctor_notes (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Doctor note ID',
  matric_number VARCHAR(50) NOT NULL COMMENT 'Student matric number',
  note_date DATE NOT NULL COMMENT 'Date of note',
  doctor_name VARCHAR(255) NOT NULL COMMENT 'Doctor name',
  note_content TEXT NOT NULL COMMENT 'Full note content',
  visit_type VARCHAR(100) COMMENT 'Type of visit',
  follow_up_required BOOLEAN DEFAULT FALSE COMMENT 'Whether follow-up needed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  FOREIGN KEY (matric_number) REFERENCES student_files(matric_number) ON DELETE CASCADE,
  INDEX idx_matric (matric_number),
  INDEX idx_date (note_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clinic Visits Table
CREATE TABLE IF NOT EXISTS clinic_visits (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Visit record ID',
  matric_number VARCHAR(50) NOT NULL COMMENT 'Student matric number',
  visit_date DATE NOT NULL COMMENT 'Date of visit',
  visit_type VARCHAR(100) NOT NULL COMMENT 'Type of visit',
  reason_for_visit TEXT COMMENT 'Reason for clinic visit',
  vital_signs JSON COMMENT 'Vital signs data (BP, temp, etc)',
  diagnosis VARCHAR(255) COMMENT 'Diagnosis from visit',
  treatment_given TEXT COMMENT 'Treatment provided',
  doctor_name VARCHAR(255) COMMENT 'Doctor name',
  status VARCHAR(50) DEFAULT 'completed' COMMENT 'Visit status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  FOREIGN KEY (matric_number) REFERENCES student_files(matric_number) ON DELETE CASCADE,
  INDEX idx_matric (matric_number),
  INDEX idx_visit_date (visit_date),
  INDEX idx_visit_type (visit_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Financial Transactions Table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Transaction record ID',
  matric_number VARCHAR(50) COMMENT 'Student matric number (optional)',
  transaction_date DATE NOT NULL COMMENT 'Date of transaction',
  transaction_type VARCHAR(100) NOT NULL COMMENT 'Type of transaction',
  description VARCHAR(255) COMMENT 'Transaction description',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Transaction amount',
  payment_method VARCHAR(100) COMMENT 'Payment method',
  status VARCHAR(50) DEFAULT 'completed' COMMENT 'Transaction status',
  notes TEXT COMMENT 'Additional notes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  FOREIGN KEY (matric_number) REFERENCES student_files(matric_number) ON DELETE SET NULL,
  INDEX idx_matric (matric_number),
  INDEX idx_date (transaction_date),
  INDEX idx_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clinic Activities Table
CREATE TABLE IF NOT EXISTS clinic_activities (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Activity record ID',
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Activity date/time',
  activity_type VARCHAR(100) NOT NULL COMMENT 'Type of activity',
  description TEXT COMMENT 'Activity description',
  staff_name VARCHAR(255) COMMENT 'Staff member involved',
  related_matric_number VARCHAR(50) COMMENT 'Related student (if applicable)',
  status VARCHAR(50) COMMENT 'Activity status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation date',
  FOREIGN KEY (related_matric_number) REFERENCES student_files(matric_number) ON DELETE SET NULL,
  INDEX idx_date (activity_date),
  INDEX idx_type (activity_type),
  INDEX idx_matric (related_matric_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX idx_student_level ON student_files(level);
CREATE INDEX idx_prescription_date ON prescription_history(prescription_date);
CREATE INDEX idx_treatment_date ON treatment_history(visit_date);
CREATE INDEX idx_visit_date_clinic ON clinic_visits(visit_date);
CREATE INDEX idx_transaction_type ON financial_transactions(transaction_type);
CREATE INDEX idx_activity_type ON clinic_activities(activity_type);

-- Success message
SELECT 'MySQL Database Schema Created Successfully!' as status;

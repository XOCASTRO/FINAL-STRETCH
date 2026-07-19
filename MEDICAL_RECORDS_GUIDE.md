# PTI CLINIC MANAGEMENT SYSTEM - MEDICAL RECORDS GUIDE

## COMPLETE MEDICAL RECORDS MANAGEMENT SYSTEM

### Overview

This guide explains the complete medical records management system including:
- Student medical file storage and retrieval
- Treatment history tracking
- Prescription records
- Allergy management
- Doctor notes
- Report generation for management

---

## DATABASE SCHEMA

### 1. STUDENT_FILES TABLE
Primary table for storing student medical records.

```
Table: student_files
Primary Key: matric_number (TEXT)

Columns:
- matric_number: TEXT (PRIMARY KEY) - Student ID/Matric number
- student_name: TEXT - Full name
- level: TEXT - Academic level (100, 200, 300, etc.)
- date_of_birth: DATE - Date of birth
- phone: TEXT - Phone number
- email: TEXT - Email address
- address: TEXT - Physical address
- parent_contact: TEXT - Parent contact info
- emergency_contact: TEXT - Emergency contact
- date_created: TIMESTAMP - Record creation date
- date_updated: TIMESTAMP - Last update date
```

### 2. ALLERGIES TABLE
Tracks all allergies for each student.

```
Table: allergies

Columns:
- id: SERIAL (PRIMARY KEY)
- matric_number: TEXT (FOREIGN KEY) - Links to student_files
- allergen: TEXT - Name of allergen
- severity: TEXT - Mild, Moderate, Severe
- notes: TEXT - Additional details
- date_recorded: TIMESTAMP - When recorded
```

### 3. TREATMENT_HISTORY TABLE
Complete history of treatments received.

```
Table: treatment_history

Columns:
- id: SERIAL (PRIMARY KEY)
- matric_number: TEXT - Student reference
- visit_date: DATE - Date of treatment
- diagnosis: TEXT - Medical diagnosis
- treatment: TEXT - Treatment provided
- doctor_name: TEXT - Doctor's name
- notes: TEXT - Treatment notes
- follow_up_required: BOOLEAN - Follow-up needed?
- follow_up_date: DATE - Scheduled follow-up
- created_at: TIMESTAMP - Record date
```

### 4. PRESCRIPTION_HISTORY TABLE
All prescriptions issued to students.

```
Table: prescription_history

Columns:
- id: SERIAL (PRIMARY KEY)
- matric_number: TEXT - Student reference
- prescription_date: DATE - Date prescribed
- medication: TEXT - Drug name
- dosage: TEXT - Dosage amount
- frequency: TEXT - How often to take
- duration: TEXT - How long to take
- doctor_name: TEXT - Prescribing doctor
- notes: TEXT - Special instructions
- status: TEXT - active, completed, archived
- created_at: TIMESTAMP - Record date
```

### 5. DOCTOR_NOTES TABLE
Physician observations and notes.

```
Table: doctor_notes

Columns:
- id: SERIAL (PRIMARY KEY)
- matric_number: TEXT - Student reference
- note_date: DATE - Date of note
- doctor_name: TEXT - Doctor name
- note_content: TEXT - Detailed notes
- visit_type: TEXT - Type of visit
- follow_up_required: BOOLEAN - Follow-up needed?
- created_at: TIMESTAMP - Record date
```

### 6. CLINIC_VISITS TABLE
Record of all visits to clinic.

```
Table: clinic_visits

Columns:
- id: SERIAL (PRIMARY KEY)
- matric_number: TEXT - Student reference
- visit_date: DATE - Date of visit
- visit_type: TEXT - Consultation, Check-up, etc.
- reason_for_visit: TEXT - Reason for visit
- vital_signs: JSONB - Blood pressure, temperature, etc.
- diagnosis: TEXT - Diagnosis made
- treatment_given: TEXT - Treatment provided
- doctor_name: TEXT - Doctor seen
- status: TEXT - completed, pending, cancelled
- created_at: TIMESTAMP - Record date
```

### 7. FINANCIAL_TRANSACTIONS TABLE
Tracks clinic financial records.

```
Table: financial_transactions

Columns:
- id: SERIAL (PRIMARY KEY)
- matric_number: TEXT - Student (optional for general expenses)
- transaction_date: DATE - Transaction date
- transaction_type: TEXT - consultation fee, medicine, lab test, etc.
- description: TEXT - Details
- amount: DECIMAL(10,2) - Amount in currency
- payment_method: TEXT - Cash, card, bank transfer
- status: TEXT - completed, pending, refunded
- notes: TEXT - Additional info
- created_at: TIMESTAMP - Record date
```

### 8. CLINIC_ACTIVITIES TABLE
Log of all clinic operations and activities.

```
Table: clinic_activities

Columns:
- id: SERIAL (PRIMARY KEY)
- activity_date: TIMESTAMP - When activity occurred
- activity_type: TEXT - appointment, treatment, inventory, staff, etc.
- description: TEXT - Activity details
- staff_name: TEXT - Staff member involved
- related_matric_number: TEXT - Related student (if any)
- status: TEXT - Status of activity
- created_at: TIMESTAMP - Record date
```

---

## API ENDPOINTS FOR MEDICAL RECORDS

### Medical Record Endpoints

#### 1. GET STUDENT FILE BY MATRIC NUMBER
```
GET /api/medical-records/{matric_number}

Response: Complete student medical record with all details
{
  "matric_number": "MTH/21/001",
  "student_name": "John Doe",
  "level": "200",
  "date_of_birth": "2002-05-15",
  "phone": "08012345678",
  "email": "john@university.edu",
  "allergies": [...],
  "treatment_history": [...],
  "prescriptions": [...],
  "doctor_notes": [...],
  "clinic_visits": [...]
}
```

#### 2. CREATE STUDENT FILE
```
POST /api/medical-records

Body:
{
  "matric_number": "MTH/21/001",
  "student_name": "John Doe",
  "level": "200",
  "date_of_birth": "2002-05-15",
  "phone": "08012345678",
  "email": "john@university.edu",
  "address": "123 Main Street",
  "parent_contact": "08098765432",
  "emergency_contact": "08011111111"
}

Response: 201 Created - New student file
```

#### 3. UPDATE STUDENT FILE
```
PUT /api/medical-records/{matric_number}

Body: Same as POST (fields to update)

Response: 200 OK - Updated record
```

#### 4. DELETE STUDENT FILE
```
DELETE /api/medical-records/{matric_number}

Response: 204 No Content
```

#### 5. GET ALL ALLERGIES FOR STUDENT
```
GET /api/medical-records/{matric_number}/allergies

Response:
{
  "allergies": [
    {
      "id": 1,
      "allergen": "Penicillin",
      "severity": "Severe",
      "notes": "Causes anaphylaxis",
      "date_recorded": "2024-01-15"
    }
  ]
}
```

#### 6. ADD ALLERGY
```
POST /api/medical-records/{matric_number}/allergies

Body:
{
  "allergen": "Penicillin",
  "severity": "Severe",
  "notes": "Causes anaphylaxis"
}

Response: 201 Created
```

#### 7. GET TREATMENT HISTORY
```
GET /api/medical-records/{matric_number}/treatments

Response:
{
  "treatments": [
    {
      "id": 1,
      "visit_date": "2024-01-10",
      "diagnosis": "Flu",
      "treatment": "Rest and fluids",
      "doctor_name": "Dr. Smith",
      "notes": "Patient improving",
      "follow_up_required": false
    }
  ]
}
```

#### 8. ADD TREATMENT RECORD
```
POST /api/medical-records/{matric_number}/treatments

Body:
{
  "visit_date": "2024-01-10",
  "diagnosis": "Flu",
  "treatment": "Rest and fluids",
  "doctor_name": "Dr. Smith",
  "notes": "Patient improving",
  "follow_up_required": false,
  "follow_up_date": null
}

Response: 201 Created
```

#### 9. GET PRESCRIPTION HISTORY
```
GET /api/medical-records/{matric_number}/prescriptions

Response:
{
  "prescriptions": [
    {
      "id": 1,
      "prescription_date": "2024-01-10",
      "medication": "Aspirin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "doctor_name": "Dr. Smith",
      "status": "active"
    }
  ]
}
```

#### 10. ADD PRESCRIPTION
```
POST /api/medical-records/{matric_number}/prescriptions

Body:
{
  "prescription_date": "2024-01-10",
  "medication": "Aspirin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "duration": "7 days",
  "doctor_name": "Dr. Smith",
  "notes": "Take with food",
  "status": "active"
}

Response: 201 Created
```

#### 11. GET DOCTOR NOTES
```
GET /api/medical-records/{matric_number}/doctor-notes

Response:
{
  "notes": [
    {
      "id": 1,
      "note_date": "2024-01-10",
      "doctor_name": "Dr. Smith",
      "note_content": "Patient presents with fever...",
      "visit_type": "Consultation",
      "follow_up_required": true
    }
  ]
}
```

#### 12. ADD DOCTOR NOTE
```
POST /api/medical-records/{matric_number}/doctor-notes

Body:
{
  "note_date": "2024-01-10",
  "doctor_name": "Dr. Smith",
  "note_content": "Patient presents with fever...",
  "visit_type": "Consultation",
  "follow_up_required": true
}

Response: 201 Created
```

---

## REPORT GENERATION ENDPOINTS

### 1. PATIENT VISITS REPORT
```
GET /api/reports/patient-visits

Query Parameters:
- start_date: Date (YYYY-MM-DD)
- end_date: Date (YYYY-MM-DD)
- visit_type: Optional (consultation, check-up, etc.)

Response:
{
  "total_visits": 150,
  "period": "2024-01-01 to 2024-01-31",
  "visits_by_type": {
    "consultation": 80,
    "check-up": 50,
    "follow-up": 20
  },
  "visits_by_doctor": {
    "Dr. Smith": 75,
    "Dr. Johnson": 60,
    "Dr. Williams": 15
  },
  "average_wait_time": "15 minutes",
  "details": [...]
}
```

### 2. TREATMENTS REPORT
```
GET /api/reports/treatments

Query Parameters:
- start_date: Date
- end_date: Date

Response:
{
  "total_treatments": 120,
  "period": "2024-01-01 to 2024-01-31",
  "top_diagnoses": [
    {
      "diagnosis": "Flu",
      "count": 45,
      "percentage": 37.5
    }
  ],
  "treatments_by_doctor": [...],
  "follow_up_required": 35,
  "details": [...]
}
```

### 3. PRESCRIPTIONS REPORT
```
GET /api/reports/prescriptions

Query Parameters:
- start_date: Date
- end_date: Date

Response:
{
  "total_prescriptions": 180,
  "period": "2024-01-01 to 2024-01-31",
  "most_prescribed_medications": [
    {
      "medication": "Aspirin",
      "count": 45,
      "percentage": 25
    }
  ],
  "active_prescriptions": 120,
  "completed_prescriptions": 60,
  "details": [...]
}
```

### 4. APPOINTMENTS REPORT
```
GET /api/reports/appointments

Query Parameters:
- start_date: Date
- end_date: Date
- status: Optional (accepted, rejected, completed, pending)

Response:
{
  "total_appointments": 200,
  "period": "2024-01-01 to 2024-01-31",
  "appointments_by_status": {
    "accepted": 150,
    "rejected": 20,
    "pending": 30
  },
  "acceptance_rate": "75%",
  "popular_appointment_times": [...],
  "details": [...]
}
```

### 5. FINANCIAL TRANSACTIONS REPORT
```
GET /api/reports/financial-transactions

Query Parameters:
- start_date: Date
- end_date: Date
- transaction_type: Optional

Response:
{
  "total_revenue": 250000,
  "period": "2024-01-01 to 2024-01-31",
  "revenue_by_type": {
    "consultation_fee": 100000,
    "medicine": 120000,
    "lab_test": 30000
  },
  "payment_methods": {
    "cash": 150000,
    "card": 80000,
    "bank_transfer": 20000
  },
  "average_transaction": 1250,
  "transactions_count": 200,
  "details": [...]
}
```

### 6. CLINIC ACTIVITIES REPORT
```
GET /api/reports/clinic-activities

Query Parameters:
- start_date: Date
- end_date: Date
- activity_type: Optional

Response:
{
  "total_activities": 500,
  "period": "2024-01-01 to 2024-01-31",
  "activities_by_type": {
    "appointment": 200,
    "treatment": 150,
    "inventory": 80,
    "staff": 70
  },
  "staff_activity_summary": [
    {
      "staff_name": "Dr. Smith",
      "activities": 120,
      "percentage": 24
    }
  ],
  "details": [...]
}
```

### 7. COMPREHENSIVE MANAGEMENT REPORT
```
GET /api/reports/management-summary

Query Parameters:
- start_date: Date
- end_date: Date

Response:
{
  "period": "2024-01-01 to 2024-01-31",
  "key_metrics": {
    "total_patients": 300,
    "total_visits": 500,
    "total_revenue": 250000,
    "total_treatments": 400,
    "total_prescriptions": 350,
    "staff_count": 10
  },
  "performance_indicators": {
    "appointment_acceptance_rate": "75%",
    "treatment_success_rate": "92%",
    "prescription_completion_rate": "85%"
  },
  "financial_summary": {
    "revenue": 250000,
    "expense": 80000,
    "net_profit": 170000
  },
  "top_doctors": [...],
  "top_medications": [...],
  "common_diagnoses": [...],
  "graphs_data": [...]
}
```

---

## UI PAGES FOR MEDICAL RECORDS

### 1. MEDICAL RECORDS SEARCH PAGE
Navigate to: `/medical-records`

Features:
- Search by matric number
- Display complete student file
- View all medical history
- Quick access to allergies
- Treatment history timeline
- Prescription list
- Doctor notes

### 2. STUDENT FILE MANAGEMENT PAGE
Navigate to: `/medical-records/manage`

Features:
- Create new student file
- Upload/import from CSV
- Edit student information
- Add/remove allergies
- Add treatments
- Add prescriptions
- Add doctor notes
- Record clinic visits

### 3. MEDICAL HISTORY PAGE
Navigate to: `/medical-records/history/{matric_number}`

Features:
- Complete medical timeline
- Past treatments
- Prescriptions issued
- All doctor notes
- Allergies summary
- Follow-up schedule
- Export to PDF

### 4. REPORTS DASHBOARD
Navigate to: `/reports`

Features:
- Select report type
- Choose date range
- Generate reports
- View analytics
- Export to PDF/Excel
- Charts and graphs
- Comparison analysis

### 5. MANAGEMENT SUMMARY
Navigate to: `/reports/management`

Features:
- Overall clinic performance
- Financial summary
- Key metrics
- Performance indicators
- Staff statistics
- Patient flow
- System overview

---

## HOW TO USE

### 1. RETRIEVE STUDENT MEDICAL RECORD
```
1. Go to /medical-records
2. Enter matric number: MTH/21/001
3. Click "Search"
4. View all medical information:
   - Student details
   - Allergies
   - Treatment history
   - Prescriptions
   - Doctor notes
   - Clinic visits
```

### 2. ADD NEW TREATMENT
```
1. Search student by matric number
2. Click "Add Treatment"
3. Fill form:
   - Visit date
   - Diagnosis
   - Treatment given
   - Doctor name
   - Notes
   - Follow-up if needed
4. Click "Save"
```

### 3. ADD ALLERGY ALERT
```
1. Search student
2. Go to "Allergies" section
3. Click "Add Allergy"
4. Enter:
   - Allergen name
   - Severity level
   - Notes
5. Save (will show warning when student visits)
```

### 4. PRESCRIBE MEDICATION
```
1. Search student
2. Click "Add Prescription"
3. Fill form:
   - Medication name
   - Dosage
   - Frequency
   - Duration
   - Doctor name
   - Special notes
4. Save
```

### 5. GENERATE REPORT
```
1. Go to /reports
2. Select report type:
   - Patient Visits
   - Treatments
   - Prescriptions
   - Appointments
   - Financial
   - Activities
   - Management Summary
3. Choose date range
4. Click "Generate"
5. View/Export report
```

---

## KEY FEATURES

### Instant Retrieval by Matric Number
- Enter matric number
- Get complete medical profile instantly
- All related records linked together

### Comprehensive Medical History
- All treatments tracked
- Every prescription recorded
- Complete allergy list
- Doctor notes preserved
- Follow-up schedule tracked

### Financial Management
- Every transaction recorded
- Revenue tracking
- Payment method tracking
- Financial reports for management

### Activity Logging
- All clinic activities logged
- Staff monitoring
- Performance tracking
- Audit trail for compliance

### Report Generation
- Automated report generation
- Multiple report types
- Date range filtering
- Export capabilities
- Visual analytics

---

## DATABASE QUERIES

### Search Student by Matric Number
```sql
SELECT * FROM student_files WHERE matric_number = 'MTH/21/001';
```

### Get All Medical History for Student
```sql
SELECT 
  sf.matric_number,
  sf.student_name,
  a.allergen,
  th.diagnosis,
  ph.medication,
  dn.note_content,
  cv.visit_date
FROM student_files sf
LEFT JOIN allergies a ON sf.matric_number = a.matric_number
LEFT JOIN treatment_history th ON sf.matric_number = th.matric_number
LEFT JOIN prescription_history ph ON sf.matric_number = ph.matric_number
LEFT JOIN doctor_notes dn ON sf.matric_number = dn.matric_number
LEFT JOIN clinic_visits cv ON sf.matric_number = cv.matric_number
WHERE sf.matric_number = 'MTH/21/001';
```

### Get Revenue Report
```sql
SELECT 
  transaction_type,
  SUM(amount) as total,
  COUNT(*) as count
FROM financial_transactions
WHERE transaction_date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY transaction_type;
```

### Get Most Common Diagnoses
```sql
SELECT 
  diagnosis,
  COUNT(*) as count
FROM treatment_history
WHERE visit_date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY diagnosis
ORDER BY count DESC;
```

---

## SECURITY & PRIVACY

- All medical records are confidential
- Access is role-based (doctors, staff, admin only)
- All changes are logged for audit trail
- Patient data is encrypted at rest
- API endpoints require authentication

---

## SUCCESS CRITERIA

You have successfully implemented the system when you can:

1. Store and retrieve student medical files using matric number
2. Add/update/delete allergies for students
3. Record treatment history
4. Manage prescriptions
5. Add doctor notes
6. Track clinic visits
7. Log financial transactions
8. Generate all types of reports
9. Export reports to PDF/Excel
10. Monitor clinic performance through dashboard

---

Version: 1.0.0
Status: Complete with Database Integration
Last Updated: 2026

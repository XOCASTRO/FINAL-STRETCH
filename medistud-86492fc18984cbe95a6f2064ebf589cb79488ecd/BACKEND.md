# Backend API Documentation

## Overview

The clinic management system now includes a complete REST API backend built with Next.js API Routes. All endpoints use in-memory data storage for development.

## API Structure

```
/app/api/
├── patients/
│   ├── route.ts          (GET all, POST new)
│   └── [id]/route.ts     (GET by ID, PUT update, DELETE)
├── appointments/
│   ├── route.ts          (GET all, POST new)
│   └── [id]/route.ts     (GET by ID, PUT update, DELETE)
├── inventory/
│   ├── route.ts          (GET all, POST new)
│   └── [id]/route.ts     (GET by ID, PUT update, DELETE)
├── prescriptions/
│   ├── route.ts          (GET all, POST new)
│   └── [id]/route.ts     (GET by ID, PUT update, DELETE)
├── attendance/
│   ├── route.ts          (GET all, POST new)
│   └── [id]/route.ts     (GET by ID, PUT update, DELETE)
└── staff/
    ├── route.ts          (GET all, POST new)
    └── [id]/route.ts     (GET by ID, PUT update, DELETE)
```

## Endpoints

### Patients

**GET /api/patients**
- Returns all patients
- Response: Array of patient objects

**POST /api/patients**
- Create a new patient
- Body: Patient object
- Response: Created patient with ID

**GET /api/patients/[id]**
- Get patient by ID
- Response: Patient object

**PUT /api/patients/[id]**
- Update patient
- Body: Partial patient object
- Response: Updated patient

**DELETE /api/patients/[id]**
- Delete patient
- Response: Deleted patient object

---

### Appointments

**GET /api/appointments**
- Returns all appointments
- Response: Array of appointment objects

**POST /api/appointments**
- Create new appointment
- Body: Appointment object
- Response: Created appointment with ID

**GET /api/appointments/[id]**
- Get appointment by ID
- Response: Appointment object

**PUT /api/appointments/[id]**
- Update appointment
- Body: Partial appointment object
- Response: Updated appointment

**DELETE /api/appointments/[id]**
- Delete appointment
- Response: Deleted appointment object

---

### Inventory

**GET /api/inventory**
- Returns all inventory items
- Response: Array of inventory objects

**POST /api/inventory**
- Create new inventory item
- Body: Inventory object
- Response: Created item with ID

**GET /api/inventory/[id]**
- Get inventory item by ID
- Response: Inventory object

**PUT /api/inventory/[id]**
- Update inventory item
- Body: Partial inventory object
- Response: Updated item

**DELETE /api/inventory/[id]**
- Delete inventory item
- Response: Deleted item object

---

### Prescriptions

**GET /api/prescriptions**
- Returns all prescriptions
- Response: Array of prescription objects

**POST /api/prescriptions**
- Create new prescription
- Body: Prescription object
- Response: Created prescription with ID

**GET /api/prescriptions/[id]**
- Get prescription by ID
- Response: Prescription object

**PUT /api/prescriptions/[id]**
- Update prescription
- Body: Partial prescription object
- Response: Updated prescription

**DELETE /api/prescriptions/[id]**
- Delete prescription
- Response: Deleted prescription object

---

### Attendance

**GET /api/attendance**
- Returns all attendance records
- Response: Array of attendance objects

**POST /api/attendance**
- Create new attendance record
- Body: Attendance object
- Response: Created record with ID

**GET /api/attendance/[id]**
- Get attendance record by ID
- Response: Attendance object

**PUT /api/attendance/[id]**
- Update attendance record
- Body: Partial attendance object
- Response: Updated record

**DELETE /api/attendance/[id]**
- Delete attendance record
- Response: Deleted record object

---

### Staff

**GET /api/staff**
- Returns all staff members
- Response: Array of staff objects

**POST /api/staff**
- Create new staff member
- Body: Staff object
- Response: Created staff with ID

**GET /api/staff/[id]**
- Get staff by ID
- Response: Staff object

**PUT /api/staff/[id]**
- Update staff information
- Body: Partial staff object
- Response: Updated staff

**DELETE /api/staff/[id]**
- Delete staff member
- Response: Deleted staff object

---

## Data Models

### Patient
```json
{
  "id": "1",
  "patient_number": "P001",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "date_of_birth": "1990-01-15",
  "blood_group": "O+",
  "address": "123 Main St",
  "medical_history": "None",
  "created_at": "2026-07-18T00:00:00.000Z"
}
```

### Appointment
```json
{
  "id": "1",
  "patient_name": "Jane Smith",
  "patient_email": "jane@example.com",
  "patient_phone": "0798765432",
  "appointment_date": "2026-07-25",
  "appointment_time": "10:00",
  "reason": "General Checkup",
  "status": "PENDING",
  "blood_group": "O+",
  "created_at": "2026-07-18T00:00:00.000Z"
}
```

### Inventory Item
```json
{
  "id": "1",
  "name": "Paracetamol 500mg",
  "category": "MEDICINE",
  "quantity": 150,
  "unit": "tablets",
  "min_stock": 50,
  "created_at": "2026-07-18T00:00:00.000Z"
}
```

### Prescription
```json
{
  "id": "1",
  "patient_id": "1",
  "medication": "Paracetamol 500mg",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "duration": "7 days",
  "notes": "Take with water after meals",
  "status": "ACTIVE",
  "created_at": "2026-07-18T00:00:00.000Z"
}
```

### Attendance Record
```json
{
  "id": "1",
  "staff_id": "1",
  "staff_name": "John Doe",
  "check_in": "2026-07-18T08:00:00.000Z",
  "check_out": "2026-07-18T16:00:00.000Z",
  "date": "2026-07-18",
  "created_at": "2026-07-18T00:00:00.000Z"
}
```

### Staff Member
```json
{
  "id": "1",
  "first_name": "Dr.",
  "last_name": "Johnson",
  "role": "Doctor",
  "email": "johnson@pticlinic.com",
  "phone": "0712345678",
  "created_at": "2026-07-18T00:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request"
}
```

### 404 Not Found
```json
{
  "error": "[Resource] not found"
}
```

### 201 Created
Returns the created resource object

---

## Testing Endpoints

### Using cURL

**Get all patients:**
```bash
curl http://localhost:3000/api/patients
```

**Create new patient:**
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "0798765432",
    "blood_group": "A+",
    "address": "456 Oak Ave",
    "medical_history": "Asthma"
  }'
```

**Update patient:**
```bash
curl -X PUT http://localhost:3000/api/patients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0799999999"
  }'
```

**Delete patient:**
```bash
curl -X DELETE http://localhost:3000/api/patients/1
```

---

## Implementation Details

- **Framework**: Next.js 16
- **API Type**: REST with JSON
- **Data Storage**: In-memory (development only)
- **Authentication**: Basic demo credentials
- **CORS**: Enabled for localhost

---

## Future Enhancements

For production deployment, implement:

1. **Database Integration**
   - PostgreSQL with Prisma ORM
   - Or MongoDB with Mongoose
   - Persistent data storage

2. **Authentication**
   - JWT tokens
   - OAuth2 integration
   - Role-based access control

3. **Validation**
   - Input sanitization
   - Request validation middleware
   - Error handling

4. **Security**
   - HTTPS only
   - Rate limiting
   - CORS configuration
   - SQL injection prevention

5. **Documentation**
   - OpenAPI/Swagger
   - API versioning
   - Deprecation policies

---

## Files Location

All backend files are in `/app/api/` directory:
```
/vercel/share/v0-project/app/api/
```

The frontend continues to work exactly the same - all data operations now go through these API endpoints instead of localStorage.

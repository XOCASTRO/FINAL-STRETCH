# PTI Clinic Management System - Complete Setup Guide

## Overview

This guide walks you through setting up the complete clinic management system with:
- MySQL database with staff authentication
- Role-based access control (RBAC)
- Medical record creation and management
- Staff management system

---

## Phase 1: Database Setup

### Step 1: Install MySQL

Choose your platform:

**Windows:**
- Download from https://dev.mysql.com/downloads/mysql/
- Run installer with default settings
- Port: 3306

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
```

**Docker:**
```bash
docker run --name mysql-clinic \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=clinic_db \
  -p 3306:3306 \
  -d mysql:8.0
```

### Step 2: Create Database and Tables

```bash
# Run the schema file
mysql -u root -p < mysql-schema.sql
```

When prompted, enter your MySQL root password.

### Step 3: Verify Database

```bash
mysql -u root -p clinic_db
SHOW TABLES;
```

You should see 8 tables including `staff_users`.

---

## Phase 2: Environment Configuration

### Create `.env.local` file

In your project root, create `.env.local`:

```
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=clinic_db
MYSQL_PORT=3306

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### For Production (AWS RDS Example)

```
MYSQL_HOST=your-rds-endpoint.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=clinic_db
MYSQL_PORT=3306
```

---

## Phase 3: Initialize Database with Staff Users

### Run Database Initialization Script

```bash
# Install dependencies first
npm install

# Run initialization script
node scripts/init-db.js
```

This creates 5 default staff users:

| Role | Email | Password | Permissions |
|------|-------|----------|------------|
| ADMIN | admin@pticlinic.com | admin123 | Create staff & records |
| DOCTOR | doctor@pticlinic.com | doctor123 | Create & edit records |
| NURSE | nurse@pticlinic.com | nurse123 | Create & edit records |
| STAFF | staff@pticlinic.com | staff123 | View only |
| VIEWER | viewer@pticlinic.com | viewer123 | View only |

---

## Phase 4: Start Development Server

```bash
# Install dependencies if not done
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:3000 in your browser.

---

## Using the System

### 1. Login

Navigate to http://localhost:3000/login

**Login with:**
- Email: admin@pticlinic.com
- Password: admin123

### 2. Create Medical Record

After login, go to "Medical Records" page:
1. Click "Create Record" button (visible only if you have `can_create_records` permission)
2. Fill in student information:
   - **Matric Number**: Enter manually (format: m.24/nd/001234)
   - **Student Name**: Full name
   - **Date of Birth**: Date field
   - **Level**: Select 100-500
   - **Phone, Email, Address**: Optional fields
   - **Parent Contact, Emergency Contact**: Optional fields
3. Click "Create Medical Record"
4. Record appears immediately and can be searched

### 3. Search Medical Records

1. Go to "Medical Records" page
2. Enter matric number (e.g., m.24/nd/001234)
3. Click "Search"
4. View complete medical history:
   - Student information
   - Allergies
   - Treatment history
   - Prescriptions
   - Doctor notes
   - Clinic visits

### 4. Manage Staff

Staff management page (visible to admins with `can_create_staff` permission):
1. Go to "Staff Management"
2. Click "Create Staff User"
3. Fill in:
   - Email
   - Full Name
   - Password
   - Role: ADMIN, DOCTOR, NURSE, STAFF, VIEWER
   - Permissions: Check boxes for can_create_records, can_edit_records, etc.
   - Department
4. Click "Create Staff User"

---

## Database Schema

### Tables

#### staff_users
Stores authentication and authorization data
- `staff_id` (Primary Key)
- `email` (Unique)
- `full_name`
- `password_hash` (bcrypt)
- `role` (ADMIN, DOCTOR, NURSE, STAFF, VIEWER)
- `can_create_records` (Boolean)
- `can_create_staff` (Boolean)
- `can_edit_records` (Boolean)
- `can_delete_records` (Boolean)
- `department`
- `is_active`

#### student_files
Main medical records table
- `matric_number` (Primary Key) - Format: m.YY/CODE/XXXXXX
- `student_name`
- `level` (100-500)
- `date_of_birth`
- `phone`, `email`, `address`
- `parent_contact`, `emergency_contact`
- `created_by_staff_id` (Foreign Key to staff_users)
- Timestamps: `date_created`, `date_updated`

#### Related Tables
- `allergies` - Allergy records
- `treatment_history` - Treatment records
- `prescription_history` - Prescription records
- `doctor_notes` - Doctor notes
- `clinic_visits` - Visit records
- `financial_transactions` - Financial records
- `clinic_activities` - Activity logging

All linked to `student_files` via `matric_number` foreign key.

---

## API Endpoints

### Authentication

**POST /api/auth/login**
```json
{
  "email": "admin@pticlinic.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": 1,
    "email": "admin@pticlinic.com",
    "role": "ADMIN",
    "can_create_records": true,
    "can_create_staff": true
  }
}
```

### Medical Records

**GET /api/medical-records**
Get all medical records

**GET /api/medical-records?matric_number=m.24/nd/001234**
Search specific student

**POST /api/medical-records/create**
Create new medical record

Request headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "matric_number": "m.24/nd/001234",
  "student_name": "John Doe",
  "level": "200",
  "date_of_birth": "2002-05-15",
  "phone": "08012345678",
  "email": "john@university.edu",
  "address": "123 Main St",
  "parent_contact": "08098765432",
  "emergency_contact": "08011223344"
}
```

**GET /api/medical-records/{matric_number}**
Get complete medical record with all related data

**PUT /api/medical-records**
Update medical record

**DELETE /api/medical-records?matric_number=...**
Delete medical record

### Staff Management

**POST /api/staff/create**
Create new staff user

Request headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "email": "newstaff@pticlinic.com",
  "full_name": "New Staff",
  "password": "secure_password",
  "role": "DOCTOR",
  "can_create_records": true,
  "can_edit_records": true,
  "can_delete_records": false,
  "department": "Medical"
}
```

---

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   └── login/route.ts          # Login endpoint
│   ├── medical-records/
│   │   ├── route.ts                # GET/POST/PUT/DELETE records
│   │   ├── [matric]/route.ts       # Get specific record
│   │   └── create/route.ts         # Create new record
│   ├── staff/
│   │   ├── route.ts                # GET staff list
│   │   ├── create/route.ts         # POST create staff
│   │   └── [id]/route.ts           # GET/PUT/DELETE staff
│   └── ...
├── components/
│   ├── medical-record-form.tsx     # Create record form
│   ├── staff-form.tsx              # Create staff form
│   └── ...
├── lib/
│   ├── auth-context.tsx            # Authentication context
│   ├── matric-validator.ts         # Validate matric numbers
│   └── ...
├── medical-records/
│   └── page.tsx                    # Medical records page
├── staff-management/
│   └── page.tsx                    # Staff management page
└── ...

lib/
├── matric-validator.ts             # Utility functions
├── mysql-db.ts                     # MySQL connection pool
└── ...

scripts/
└── init-db.js                      # Database initialization

mysql-schema.sql                    # Database schema
SETUP_GUIDE.md                      # This file
```

---

## Troubleshooting

### "Connection refused" Error

**Cause:** MySQL not running

**Solution:**
```bash
# Check if MySQL is running
mysql -u root -p

# If not running:
# Windows: net start MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

### "Access denied" Error

**Cause:** Wrong credentials

**Solution:**
- Check .env.local has correct MYSQL_PASSWORD
- Verify MySQL root password is set correctly

### "Unknown database 'clinic_db'"

**Cause:** Database not created

**Solution:**
```bash
mysql -u root -p < mysql-schema.sql
```

### "Table 'staff_users' doesn't exist"

**Cause:** Schema not fully applied

**Solution:**
1. Delete old tables (if any): `DROP DATABASE clinic_db;`
2. Re-run schema: `mysql -u root -p < mysql-schema.sql`

### Matric Number Already Exists Error

**Cause:** Duplicate matric number

**Solution:**
- Each matric number must be unique
- Check existing records before creating new one
- Use different matric number

### Can't Create Records

**Cause:** User doesn't have `can_create_records` permission

**Solution:**
1. Login as admin (admin@pticlinic.com)
2. Go to Staff Management
3. Edit user and enable "Can Create Records" permission

---

## Role Permissions

### ADMIN
- Create records: Yes
- Edit records: Yes
- Delete records: Yes
- Create staff: Yes
- Full system access

### DOCTOR
- Create records: Yes (configurable)
- Edit records: Yes (configurable)
- Delete records: No
- Create staff: No
- View all records

### NURSE
- Create records: Yes (configurable)
- Edit records: Yes (configurable)
- Delete records: No
- Create staff: No
- View all records

### STAFF
- Create records: No (default)
- Edit records: No (default)
- Delete records: No
- Create staff: No
- View records only

### VIEWER
- Create records: No
- Edit records: No
- Delete records: No
- Create staff: No
- View records only (read-only access)

---

## Security Features

### Password Hashing
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text

### Token-Based Authentication
- Custom JWT-like token generation
- Stored in localStorage
- Validated on API calls

### RBAC (Role-Based Access Control)
- User roles: ADMIN, DOCTOR, NURSE, STAFF, VIEWER
- Granular permissions for each operation
- Middleware checks on protected routes

### Data Validation
- Matric number format validation (m.YY/CODE/XXXXXX)
- Email format validation
- Date validation
- Duplicate matric number check

### SQL Injection Prevention
- Parameterized queries with ?  placeholders
- All user input sanitized

---

## Next Steps

1. **Create Medical Records**
   - Use medical records page to create student files
   - Search and view records

2. **Manage Staff**
   - Create additional staff users
   - Assign appropriate roles and permissions

3. **Add Patient Data**
   - Record allergies, treatments, prescriptions
   - Add doctor notes and clinic visits

4. **Generate Reports**
   - Visit reports page for analytics
   - View management summaries

5. **Deploy to Production**
   - Set up cloud MySQL (AWS RDS, DigitalOcean, etc.)
   - Update environment variables
   - Deploy application

---

## Support & Contact

For issues or questions:
1. Check the troubleshooting section above
2. Review the database schema
3. Check API endpoint documentation
4. Inspect browser console for errors

---

## Version Information

- Database: MySQL 8.0+
- Framework: Next.js 16
- Authentication: Custom JWT
- Password Hashing: bcryptjs
- Status: Production Ready

Created: July 2026
Last Updated: July 2026

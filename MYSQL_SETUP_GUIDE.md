# PTI CLINIC MANAGEMENT SYSTEM - MySQL Setup Guide

## Complete MySQL Integration Instructions

---

## TABLE OF CONTENTS

1. MySQL Installation
2. Database Setup
3. Environment Configuration
4. Connection Testing
5. API Endpoints with MySQL
6. Troubleshooting

---

## 1. MYSQL INSTALLATION

### Windows Installation

**Option 1: MySQL Installer (Recommended)**
1. Download: https://dev.mysql.com/downloads/mysql/
2. Run the installer
3. Choose setup type: "Developer Default"
4. Configure MySQL Server:
   - Port: 3306 (default)
   - Config Type: Development Machine
   - Server type: Standalone MySQL Server
   - Authentication: MySQL 8.0 Compatible
5. Create MySQL Account:
   - Username: root
   - Password: (set a strong password)
6. Configure as Windows Service
7. Start MySQL service

**Option 2: Docker (Alternative)**
```bash
docker run --name mysql-clinic -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=clinic_db -p 3306:3306 -d mysql:8.0
```

### macOS Installation

**Using Homebrew**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Using Docker**
```bash
docker run --name mysql-clinic -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=clinic_db -p 3306:3306 -d mysql:8.0
```

### Linux Installation (Ubuntu)

```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
```

---

## 2. DATABASE SETUP

### Step 1: Connect to MySQL

**Using MySQL Command Line:**
```bash
mysql -u root -p
```

Enter your password when prompted.

### Step 2: Create Database

**Copy the entire content of `mysql-schema.sql` file:**
```bash
mysql -u root -p < mysql-schema.sql
```

Or manually run:
```sql
CREATE DATABASE clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinic_db;
```

### Step 3: Create Tables

Run all SQL statements from `mysql-schema.sql`:

**Tables Created:**
- `student_files` - Medical records (Primary Key: matric_number)
- `allergies` - Allergy tracking
- `treatment_history` - Treatment records
- `prescription_history` - Prescriptions
- `doctor_notes` - Doctor notes
- `clinic_visits` - Visit tracking
- `financial_transactions` - Financial records
- `clinic_activities` - Activity logging

### Step 4: Verify Setup

```sql
USE clinic_db;
SHOW TABLES;
```

Expected output:
```
+---------------------------+
| Tables_in_clinic_db       |
+---------------------------+
| student_files             |
| allergies                 |
| treatment_history         |
| prescription_history      |
| doctor_notes              |
| clinic_visits             |
| financial_transactions    |
| clinic_activities         |
+---------------------------+
8 rows in set
```

---

## 3. ENVIRONMENT CONFIGURATION

### Step 1: Create .env.local File

In your project root (`/vercel/share/v0-project/`), create `.env.local`:

```bash
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=clinic_db
MYSQL_PORT=3306
```

### Step 2: For Production Deployment

If deploying to cloud (AWS RDS, Azure, etc):

```bash
# AWS RDS Example
MYSQL_HOST=your-rds-instance.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=clinic_db
MYSQL_PORT=3306
```

### Step 3: For Docker Setup

```bash
MYSQL_HOST=mysql-clinic
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=clinic_db
MYSQL_PORT=3306
```

### Step 4: Restart Development Server

```bash
# Kill existing server
pkill -f "next dev"

# Start with new environment variables
pnpm dev
```

---

## 4. CONNECTION TESTING

### Test 1: Direct MySQL Connection

```bash
mysql -h localhost -u root -p clinic_db
```

### Test 2: Test API Endpoints

**Get all medical records:**
```bash
curl http://localhost:3000/api/medical-records
```

**Search specific student:**
```bash
curl http://localhost:3000/api/medical-records/MTH/21/001
```

### Test 3: Create Test Record

```bash
curl -X POST http://localhost:3000/api/medical-records \
  -H "Content-Type: application/json" \
  -d '{
    "matric_number": "MTH/TEST/001",
    "student_name": "Test Student",
    "level": "200",
    "date_of_birth": "2002-01-15",
    "phone": "08012345678",
    "email": "test@university.edu",
    "address": "123 Test Street",
    "parent_contact": "08098765432",
    "emergency_contact": "08011223344"
  }'
```

### Test 4: Verify Data in Database

```sql
USE clinic_db;
SELECT * FROM student_files WHERE matric_number = 'MTH/TEST/001';
```

---

## 5. API ENDPOINTS WITH MYSQL

All endpoints now use MySQL instead of PostgreSQL.

### Medical Records Endpoints

**GET - List all records**
```bash
curl http://localhost:3000/api/medical-records
```

**GET - Search by matric number**
```bash
curl http://localhost:3000/api/medical-records?matric_number=MTH/21/001
```

**POST - Create new record**
```bash
curl -X POST http://localhost:3000/api/medical-records \
  -H "Content-Type: application/json" \
  -d '{
    "matric_number": "MTH/21/001",
    "student_name": "John Doe",
    "level": "200",
    "date_of_birth": "2002-05-15",
    "phone": "08012345678",
    "email": "john@university.edu",
    "address": "123 Main St",
    "parent_contact": "08098765432",
    "emergency_contact": "08011223344"
  }'
```

**GET - Complete medical record**
```bash
curl http://localhost:3000/api/medical-records/MTH/21/001
```
Returns: Complete medical file with allergies, treatments, prescriptions, notes, visits

**PUT - Update record**
```bash
curl -X PUT http://localhost:3000/api/medical-records/MTH/21/001 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08087654321",
    "email": "newemail@university.edu"
  }'
```

**DELETE - Remove record**
```bash
curl -X DELETE "http://localhost:3000/api/medical-records?matric_number=MTH/21/001"
```

### Allergies Endpoints

**GET - List allergies**
```bash
curl http://localhost:3000/api/medical-records/MTH/21/001/allergies
```

**POST - Add allergy**
```bash
curl -X POST http://localhost:3000/api/medical-records/MTH/21/001/allergies \
  -H "Content-Type: application/json" \
  -d '{
    "allergen": "Penicillin",
    "severity": "Severe",
    "notes": "Causes anaphylaxis"
  }'
```

### Treatments Endpoints

**GET - List treatments**
```bash
curl http://localhost:3000/api/medical-records/MTH/21/001/treatments
```

**POST - Record treatment**
```bash
curl -X POST http://localhost:3000/api/medical-records/MTH/21/001/treatments \
  -H "Content-Type: application/json" \
  -d '{
    "visit_date": "2024-01-10",
    "diagnosis": "Malaria",
    "treatment": "Artemether injection",
    "doctor_name": "Dr. Smith",
    "notes": "Patient responding well",
    "follow_up_required": true
  }'
```

### Prescriptions Endpoints

**GET - List prescriptions**
```bash
curl http://localhost:3000/api/medical-records/MTH/21/001/prescriptions
```

**POST - Issue prescription**
```bash
curl -X POST http://localhost:3000/api/medical-records/MTH/21/001/prescriptions \
  -H "Content-Type: application/json" \
  -d '{
    "medication": "Artemether",
    "dosage": "80mg",
    "frequency": "Twice daily",
    "duration": "3 days",
    "doctor_name": "Dr. Smith",
    "notes": "Take with food"
  }'
```

---

## 6. TROUBLESHOOTING

### Issue: Connection Refused (Error 111)

**Cause:** MySQL server not running
**Solution:**
```bash
# Check if MySQL is running
mysql -u root -p

# If not running, start it
# Windows: net start MySQL80
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Issue: Access Denied

**Cause:** Wrong username or password
**Solution:**
```bash
# Verify credentials in .env.local
# Test connection:
mysql -h localhost -u root -p clinic_db
```

### Issue: Unknown database 'clinic_db'

**Cause:** Database not created
**Solution:**
```bash
mysql -u root -p < mysql-schema.sql
```

### Issue: API Returns Empty Array

**Cause:** No data in database yet
**Solution:**
1. Create test records using POST endpoint
2. Check if database actually contains data:
```sql
USE clinic_db;
SELECT COUNT(*) FROM student_files;
```

### Issue: "Authentication plugin 'caching_sha2_password' cannot be loaded"

**Cause:** MySQL 8.0 compatibility issue
**Solution:**
```bash
# Edit MySQL config
mysql -u root -p

# Change default authentication:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

### Issue: Port 3306 Already in Use

**Cause:** Another instance of MySQL running
**Solution:**
```bash
# Find process on port 3306
lsof -i :3306

# Kill process (get PID from above)
kill -9 <PID>

# Or use different port in .env.local
MYSQL_PORT=3307
```

### Issue: Build Fails with "Cannot find module mysql2"

**Cause:** Package not installed
**Solution:**
```bash
pnpm add mysql2
pnpm dev
```

---

## MySQL vs PostgreSQL

This system now uses **MySQL** instead of PostgreSQL:

| Feature | MySQL | PostgreSQL |
|---------|-------|-----------|
| Port | 3306 | 5432 |
| Connection | mysql2 | pg |
| Syntax | ? placeholders | $1, $2 params |
| Setup | `mysql-schema.sql` | Neon integration |
| Environment | MYSQL_* vars | DATABASE_URL |

---

## Database Backup & Restore

### Backup Database

```bash
# Backup to file
mysqldump -u root -p clinic_db > backup.sql

# Backup all databases
mysqldump -u root -p --all-databases > full_backup.sql
```

### Restore Database

```bash
# Restore from file
mysql -u root -p clinic_db < backup.sql

# Create new DB from backup
mysql -u root -p < full_backup.sql
```

---

## Performance Optimization

### Enable Query Cache (MySQL 5.7)

```sql
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 268435456;
```

### Add Useful Indexes

Already included in schema, but manually:

```sql
CREATE INDEX idx_matric_number ON student_files(matric_number);
CREATE INDEX idx_prescription_date ON prescription_history(prescription_date);
CREATE INDEX idx_visit_date ON clinic_visits(visit_date);
```

---

## Production Deployment

### AWS RDS Setup

1. Create RDS MySQL instance
2. Set database name: `clinic_db`
3. Get endpoint: `your-instance.rds.amazonaws.com`
4. Update .env:
```
MYSQL_HOST=your-instance.rds.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=clinic_db
```

### DigitalOcean Managed Database

Similar process with DigitalOcean endpoint

### Docker Production Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Monitoring MySQL

### Check Database Size

```sql
SELECT 
  TABLE_SCHEMA,
  ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb
FROM INFORMATION_SCHEMA.TABLES
GROUP BY TABLE_SCHEMA;
```

### Check Query Performance

```sql
SHOW PROCESSLIST;
SHOW STATUS;
```

### Monitor Slow Queries

```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 2;
```

---

## Useful MySQL Commands

```sql
-- Check version
SELECT VERSION();

-- Show all databases
SHOW DATABASES;

-- Show all tables in current database
SHOW TABLES;

-- Show table structure
DESCRIBE student_files;

-- Show all user accounts
SELECT User, Host FROM mysql.user;

-- Count records in table
SELECT COUNT(*) FROM student_files;

-- Show recent records
SELECT * FROM student_files ORDER BY date_created DESC LIMIT 10;
```

---

## Support

For issues with:
- **MySQL Installation:** Refer to https://dev.mysql.com/doc/
- **Connection:** Check .env.local credentials
- **Schema:** Review mysql-schema.sql
- **API Errors:** Check browser console and server logs

---

## SUMMARY

Your clinic system now uses **MySQL** with:

✅ 8 database tables
✅ Full CRUD API endpoints
✅ Medical records by matric number
✅ Complete medical history retrieval
✅ Report generation system
✅ Production-ready setup

All configured and ready to use!

---

Version: 2.0.0
Database: MySQL 8.0+
Status: Ready for Production
Date: July 2026

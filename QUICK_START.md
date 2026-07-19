# Quick Start Guide - PTI Clinic Management System v1.1

## 30-Second Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local file with MySQL credentials
echo "MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=clinic_db" > .env.local

# 3. Create MySQL database (run once)
mysql -u root -p < mysql-schema.sql

# 4. Start development server
pnpm dev

# 5. Open http://localhost:3000
```

## Login Credentials

**Email:** admin@pticlinic.com  
**Password:** admin123

## Key Features

### Search Medical Records
1. Go to "Medical Records"
2. Enter matric number (e.g., MTH/21/001)
3. Click "Search"
4. View complete patient history

### Manage Patient Records
1. From search results, click "Edit Record"
2. Or visit: `/medical-records/manage/[matric]`
3. Use tabs to manage:
   - **Allergies** - Add allergies with severity
   - **Treatments** - Add diagnoses and treatments
   - **Prescriptions** - Add medications and dosages

### Generate Reports
1. Go to "Reports"
2. Select date range
3. Choose report type:
   - Management Summary
   - Financial Report
   - Patient Visits
   - Treatments Analysis

## Environment Variables

```env
# Required
MYSQL_HOST=localhost           # Database host
MYSQL_PORT=3306               # Database port
MYSQL_USER=clinic_user        # Database user
MYSQL_PASSWORD=your_password  # Database password
MYSQL_DATABASE=clinic_db      # Database name

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

### Medical Records
- `GET /api/medical-records` - Get all records
- `GET /api/medical-records?matric_number=XXX` - Search by matric
- `GET /api/medical-records/[matric]` - Get complete record
- `POST /api/medical-records` - Create record
- `PUT /api/medical-records/[matric]` - Update record
- `DELETE /api/medical-records?matric_number=XXX` - Delete record

### Medical Record Details
- `POST /api/medical-records/[matric]/allergies` - Add allergy
- `POST /api/medical-records/[matric]/treatments` - Add treatment
- `POST /api/medical-records/[matric]/prescriptions` - Add prescription

### Reports
- `GET /api/reports/management-summary` - Overall metrics
- `GET /api/reports/financial` - Financial data
- `GET /api/reports/patient-visits` - Visit statistics
- `GET /api/reports/treatments` - Treatment analysis

**Query Parameters:**
```
?start_date=2024-01-01&end_date=2024-12-31
```

## File Structure

```
app/
├── api/
│   ├── medical-records/       # Medical record APIs
│   ├── reports/               # Report generation
│   ├── appointments/          # Appointment management
│   └── auth/                  # Authentication
├── medical-records/           # Medical records page
├── medical-records/manage/    # Record editor (NEW)
└── reports/                   # Reports page

lib/
├── mysql-db.ts               # MySQL connection
├── auth-context.tsx          # Authentication
└── data-context.tsx          # Data management
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Build project
pnpm build

# Start development server
pnpm dev

# Start production server
pnpm start

# Check for errors
pnpm build --no-cache

# Database connection test
mysql -u root -p clinic_db
SHOW TABLES;
```

## Troubleshooting

### "Connection refused"
```bash
# Check MySQL is running
mysql -u root -p

# Or start MySQL:
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql
# Windows: net start MySQL80
```

### "Unknown database"
```bash
mysql -u root -p < mysql-schema.sql
```

### "Access denied"
- Check MYSQL_PASSWORD in .env.local
- Verify MySQL credentials are correct
- Make sure MYSQL_USER has proper permissions

### Port 3000 already in use
```bash
PORT=3001 pnpm dev
```

## What's New in v1.1

### ✓ Complete MySQL Migration
- All APIs converted from PostgreSQL to MySQL
- Consistent database backend
- Better performance and compatibility

### ✓ Medical Records Management
- New dedicated management page
- Full CRUD for allergies, treatments, prescriptions
- Real-time updates
- Inline student info editing

### ✓ Enhanced Reports
- MySQL-optimized queries
- Faster data aggregation
- More accurate calculations

## Next Steps

1. **Setup Database**
   - Install MySQL locally
   - Run mysql-schema.sql
   - Configure .env.local

2. **Start Application**
   - Run `pnpm install`
   - Run `pnpm dev`
   - Open http://localhost:3000

3. **Create Medical Records**
   - Login with demo credentials
   - Go to "Medical Records"
   - Click "Create Record"

4. **Manage Records**
   - Search for a patient
   - Click "Edit Record"
   - Add allergies/treatments/prescriptions

5. **Generate Reports**
   - Go to "Reports"
   - Select date range
   - View analytics

## Additional Resources

- **Full Setup Guide:** See `SETUP_GUIDE.md`
- **Enhancement Details:** See `ENHANCEMENTS_v1.1.md`
- **Implementation Summary:** See `IMPLEMENTATION_SUMMARY.md`

## Support

For detailed troubleshooting, see SETUP_GUIDE.md "Troubleshooting" section.

---

**Version:** 1.1.0  
**Last Updated:** July 2026  
**Status:** Production Ready

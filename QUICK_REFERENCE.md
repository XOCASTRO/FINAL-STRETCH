# PTI Clinic v1.2 - Quick Reference Guide

## What's New

### New Matric Format
```
Old: m.24/nd/001234
New: M.2024/ND/CS/00001
     ↑    ↑   ↑  ↑
     |    |   |  └─ 5-digit number
     |    |   └──── 2-4 letter department code
     |    └──────── ND or HND level
     └───────────── Fixed M prefix
```

### New User Roles
```
ADMIN        → Full access (create, view, edit, delete, manage staff)
RECEPTIONIST → Create/edit records, view records, no staff management
DOCTOR       → View records only, cannot create
NURSE        → View records only, cannot create
VIEWER       → View reports only
```

### New Medical Record Fields
- **Blood Group**: O+, O-, A+, A-, B+, B-, AB+, AB-
- **Department**: Free text (e.g., "Computer Science")
- **Session**: Academic year (e.g., "2024/2025")
- **Category**: STUDENT, LECTURER, or NON_STAFF
- **Passport**: Photo upload (JPEG/PNG, max 5MB)

---

## Files Overview

### Core Utilities (3 files)
| File | Purpose | Lines |
|------|---------|-------|
| `lib/matric-validator.ts` | Matric format validation | 115 |
| `lib/rbac.ts` | Role permissions system | 210 |
| `lib/file-storage.ts` | Local file storage | 162 |

### API Endpoints (3 routes)
| Route | Method | Purpose | Required Role |
|-------|--------|---------|---|
| `/api/medical-records` | GET/POST/PUT/DELETE | Medical records CRUD | ADMIN/RECEPTIONIST (create) |
| `/api/upload/passport` | POST/DELETE | Passport upload | ADMIN/RECEPTIONIST |
| `/api/admin/staff` | GET/POST/PUT | Staff management | ADMIN |

### Components (1 file)
| File | Changes | Status |
|------|---------|--------|
| `components/medical-record-form.tsx` | Added new fields (blood group, department, session, category) | Enhanced |

### Database (1 file)
| File | Changes | Status |
|------|---------|--------|
| `mysql-schema.sql` | Added 6 columns, updated role enum | Ready |

---

## How to Use

### 1. Validate Matric Number (Client-side)
```typescript
import { validateMatricFormat, validateMatricNumber } from '@/lib/matric-validator'

// Format check only
const result = validateMatricFormat('M.2024/ND/CS/00001')
if (result.isValid) console.log('Valid format!')

// Format + database check (async)
const dbResult = await validateMatricNumber('M.2024/ND/CS/00001')
if (dbResult.isValid) console.log('Matric available!')
```

### 2. Check User Permissions
```typescript
import { canCreateRecords, canEditRecords, canCreateStaff } from '@/lib/rbac'

const userRole = user?.role || 'VIEWER'

if (canCreateRecords(userRole)) {
  // Show "Create Record" button
}

if (canCreateStaff(userRole)) {
  // Show "Add Staff" button (ADMIN only)
}
```

### 3. Upload Passport Photo
```typescript
// Client-side upload
const formData = new FormData()
formData.append('file', passportFile)
formData.append('matric', 'M.2024/ND/CS/00001')

const response = await fetch('/api/upload/passport', {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': `Bearer ${token}` }
})

const { filename, url } = await response.json()
console.log(`Saved to: ${url}`)
```

### 4. Create Medical Record
```typescript
const newRecord = {
  matric_number: 'M.2024/ND/CS/00001',
  student_name: 'John Doe',
  date_of_birth: '2005-03-15',
  level: '100',
  phone: '08012345678',
  email: 'john@university.edu',
  blood_group: 'O+',
  department: 'Computer Science',
  session: '2024/2025',
  category: 'STUDENT'
}

const response = await fetch('/api/medical-records', {
  method: 'POST',
  body: JSON.stringify(newRecord),
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 5. Create Staff Member
```typescript
const newStaff = {
  email: 'doctor@clinic.local',
  full_name: 'Dr. Smith',
  password: 'secure_password_123',
  role: 'DOCTOR',  // ADMIN, RECEPTIONIST, DOCTOR, NURSE, VIEWER
  department: 'Medical'
}

const response = await fetch('/api/admin/staff', {
  method: 'POST',
  body: JSON.stringify(newStaff),
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## Directory Structure

```
/vercel/share/v0-project/
├── lib/
│   ├── matric-validator.ts      ✅ New
│   ├── rbac.ts                   ✅ New
│   ├── file-storage.ts           ✅ New
│   └── mysql-db.ts               (existing)
├── app/
│   ├── api/
│   │   ├── medical-records/
│   │   │   └── route.ts          ✅ Updated
│   │   ├── upload/
│   │   │   └── passport/
│   │   │       └── route.ts      ✅ New
│   │   └── admin/
│   │       └── staff/
│   │           └── route.ts      ✅ New
│   ├── components/
│   │   └── medical-record-form.tsx ✅ Updated
│   └── medical-records/
│       └── page.tsx              (TODO: Add role checks)
├── public/
│   └── passports/                ✅ New (auto-created)
├── mysql-schema.sql              ✅ Updated
├── UI_ENHANCEMENTS_GUIDE.md      ✅ New
├── IMPLEMENTATION_SUMMARY.md     ✅ New
└── QUICK_REFERENCE.md            ✅ This file
```

---

## Next Steps (UI Integration)

### Priority 1: Update Medical Records Page
File: `/app/medical-records/page.tsx`
- Import RBAC functions
- Check `canCreateRecords(userRole)` before showing create button
- Add category filter tabs
- Show/hide features based on role

### Priority 2: Update Manage Records Page
File: `/app/medical-records/manage/[matric]/page.tsx`
- Display new fields: blood_group, department, session, category
- Add passport photo upload/preview section
- Allow editing based on user role

### Priority 3: Create Staff Management Page
File: `/app/admin/staff-management/page.tsx` (NEW)
- Staff list table (Name, Email, Role, Department, Status)
- Create staff form modal
- Edit staff modal
- Only visible to ADMIN users

### Priority 4: Update Navigation
- Add "Staff Management" link (ADMIN only)
- Show user role in header
- Update sidebar with role-based visibility

---

## Testing Checklist

### Backend/Database
- [ ] Database schema updated with new columns
- [ ] Can insert records with all new fields
- [ ] Matric format validation works
- [ ] RBAC permissions enforced on APIs
- [ ] Passport files saved to `/public/passports/`
- [ ] Staff can be created with roles

### Frontend
- [ ] Medical record form accepts new fields
- [ ] Matric input shows correct placeholder: M.2024/ND/CS/00001
- [ ] Blood group dropdown populated
- [ ] Category radio buttons working
- [ ] Form validation includes new fields
- [ ] Role checks hide/show features correctly

### Integrated
- [ ] Create record with new fields → database
- [ ] Upload passport → `/public/passports/`
- [ ] Create staff → user can login with role
- [ ] Different roles see different options
- [ ] Matric duplicates blocked
- [ ] Invalid matric rejected

---

## Database Migration SQL

Run this on your MySQL database to add the new columns:

```sql
ALTER TABLE student_files 
ADD COLUMN blood_group VARCHAR(10),
ADD COLUMN department VARCHAR(100),
ADD COLUMN session VARCHAR(20),
ADD COLUMN category ENUM('STUDENT', 'LECTURER', 'NON_STAFF') DEFAULT 'STUDENT',
ADD COLUMN passport_filename VARCHAR(255),
ADD COLUMN passport_uploaded_at TIMESTAMP NULL,
ADD INDEX idx_category (category),
ADD INDEX idx_department (department);

ALTER TABLE staff_users 
MODIFY role ENUM('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'VIEWER') NOT NULL;
```

---

## Troubleshooting

### Issue: Matric validation fails
- Check format: M.YYYY/LEVEL/DEPT/NUMBER
- Year must be 1990-2035
- Level must be ND or HND
- Department must be 2-4 letters
- Number must be 5 digits

### Issue: Passport upload fails
- File must be JPEG or PNG
- File size must be ≤ 5MB
- Matric number must be valid
- Directory `/public/passports/` must exist

### Issue: RBAC blocking actions
- Check user's role in database
- Use `canCreateRecords(role)` to verify permission
- Admin role should have all permissions
- Roles are case-sensitive (ND, HND, not nd, hnd)

### Issue: Staff can't login
- Verify email is in staff_users table
- Verify password hash is bcrypt
- Verify role is one of: ADMIN, RECEPTIONIST, DOCTOR, NURSE, VIEWER
- Check is_active field is TRUE

---

## Important Notes

✅ **All changes are backward compatible** - existing records work fine  
✅ **No external dependencies** - runs completely offline  
✅ **RBAC enforced server-side** - not just UI checks  
✅ **Passwords hashed** - bcrypt 10 rounds  
✅ **File validation** - type and size checks  
✅ **Matric format** - validated on client and server  

---

## Support

For implementation details, see:
- `IMPLEMENTATION_SUMMARY.md` - Full technical details
- `UI_ENHANCEMENTS_GUIDE.md` - Step-by-step UI updates
- `lib/matric-validator.ts` - Validator code + examples
- `lib/rbac.ts` - RBAC code + all permissions
- `lib/file-storage.ts` - File storage code + utilities

# Medical Records UI Enhancements Guide

## Overview
This guide outlines the UI enhancements needed for the medical records system to support RBAC, new fields, and passport uploads.

## 1. Update Medical Record Form (`app/components/medical-record-form.tsx`)

### Add these new fields to FormData interface:
```typescript
interface FormData {
  // ... existing fields ...
  blood_group: string           // O+, O-, A+, A-, B+, B-, AB+, AB-
  department: string            // Department name
  session: string               // Academic session (e.g., 2024/2025)
  category: 'STUDENT' | 'LECTURER' | 'NON_STAFF'  // Person type
  passport_file?: File          // Passport photo
}
```

### Add these UI components:
1. **Blood Group Dropdown** - Options: O+, O-, A+, A-, B+, B-, AB+, AB-
2. **Department Field** - Text input with suggestions
3. **Session Picker** - Date range or year-based picker (e.g., 2024/2025)
4. **Category Selection** - Radio buttons: Student, Lecturer, Non-Staff
5. **Passport Upload** - File input (JPEG/PNG, max 5MB) with preview

### Update matric validation:
- Change matric format to: M.YYYY/LEVEL/DEPARTMENT/NUMBER
- Example: M.2024/ND/CS/00001
- Use `validateMatricFormat` from `/lib/matric-validator.ts`

### Add passport upload logic:
```typescript
const uploadPassport = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('matric', formData.matric_number)
  
  const response = await fetch('/api/upload/passport', {
    method: 'POST',
    body: formData,
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}
```

## 2. Update Medical Records Page (`app/medical-records/page.tsx`)

### Add Role-Based Visibility:
```typescript
import { canCreateRecords, canViewRecords } from '@/lib/rbac'

const userRole = user?.role || 'VIEWER'
const canCreate = canCreateRecords(userRole)
const canView = canViewRecords(userRole)
```

### Show appropriate buttons based on role:
- ADMIN/RECEPTIONIST: Show "Create Record" button
- DOCTOR/NURSE/VIEWER: Hide "Create Record" button (but can view)

### Add category filter:
- New tab or dropdown to filter by: STUDENT, LECTURER, NON_STAFF

## 3. Update Manage Records Page (`app/medical-records/manage/[matric]/page.tsx`)

### Add new fields to edit forms:
- Blood Group dropdown
- Department text field
- Session picker
- Category display (not editable after creation)
- Passport photo upload/preview section

### Passport Preview:
```tsx
{record.passport_filename && (
  <div className="p-4 border rounded-lg">
    <h3 className="font-semibold mb-2">Passport Photo</h3>
    <img 
      src={`/passports/${record.passport_filename}`}
      alt="Passport"
      className="w-32 h-32 object-cover rounded"
    />
    <Button onClick={deletePassport}>Remove Passport</Button>
  </div>
)}
```

## 4. Create Staff Management Page (`app/admin/staff-management/page.tsx`)

### Required Features:
1. **Staff List Table**
   - Columns: Name, Email, Role, Department, Status, Created Date
   - Search/filter by name or email
   - Action buttons: Edit, Delete, Toggle Active

2. **Create Staff Form**
   - Email, Full Name, Password
   - Role dropdown (using getAllRoles())
   - Department field
   - Success message after creation

3. **Edit Staff Modal**
   - Update: Name, Role, Department, Active Status
   - Display role description from getRoleDescription()

### Permissions:
- Only ADMIN users can access this page
- Show "Unauthorized" if not admin

## 5. Update Sidebar/Navigation

### Add "Staff Management" link:
- Only visible to ADMIN users
- Path: `/admin/staff-management`

### Update Medical Records link:
- Hide "Create Record" option for DOCTOR/NURSE/VIEWER roles

## 6. Add Role Indicators

### Show user role in:
- Header/Navigation bar
- Dashboard user profile card
- Staff list (when viewing other staff)

### Role colors/badges:
- ADMIN: Red badge
- RECEPTIONIST: Blue badge
- DOCTOR: Green badge
- NURSE: Orange badge
- VIEWER: Gray badge

## Implementation Priority

1. **Phase 1** (Critical): Update medical-record-form with new fields + matric validation
2. **Phase 2** (Important): Add passport upload to form
3. **Phase 3** (Important): Update manage records page to show all new fields
4. **Phase 4** (Important): Add role-based visibility to medical records page
5. **Phase 5** (Nice-to-have): Create staff management page
6. **Phase 6** (Polish): Add role indicators throughout UI

## Files to Modify

1. ✓ `/lib/matric-validator.ts` - Updated ✓
2. ✓ `/lib/rbac.ts` - Created ✓
3. ✓ `/lib/file-storage.ts` - Created ✓
4. ✓ `mysql-schema.sql` - Updated ✓
5. ✓ `/app/api/medical-records/route.ts` - Updated ✓
6. ✓ `/app/api/upload/passport/route.ts` - Created ✓
7. ✓ `/app/api/admin/staff/route.ts` - Created ✓
8. TODO: `/app/components/medical-record-form.tsx` - Update
9. TODO: `/app/medical-records/page.tsx` - Add role checks
10. TODO: `/app/medical-records/manage/[matric]/page.tsx` - Add new fields
11. TODO: `/app/admin/staff-management/page.tsx` - Create new page
12. TODO: Update sidebar/navigation

## Notes for Implementation

- Matric format validation happens client-side + server-side
- Passport files stored in `/public/passports/` directory  
- File upload requires proper authorization header
- Role checks needed on both client (UI) and server (API)
- Token decoding is simplified - use proper JWT in production

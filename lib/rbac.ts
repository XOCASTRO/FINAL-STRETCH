/**
 * Role-Based Access Control (RBAC) System
 * 
 * Roles:
 * - ADMIN: Full access to everything
 * - RECEPTIONIST: Can create/search medical records
 * - DOCTOR: Can view medical records, add treatments/notes (read-heavy)
 * - NURSE: Can view medical records, add notes (read-heavy)
 * - VIEWER: Can only view reports (limited access)
 */

export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'NURSE' | 'VIEWER'

export interface Permission {
  create_records: boolean
  view_records: boolean
  edit_records: boolean
  delete_records: boolean
  create_staff: boolean
  view_staff: boolean
  edit_staff: boolean
  delete_staff: boolean
  view_reports: boolean
  manage_appointments: boolean
  manage_inventory: boolean
  manage_finances: boolean
  view_finances: boolean
}

const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  ADMIN: {
    create_records: true,
    view_records: true,
    edit_records: true,
    delete_records: true,
    create_staff: true,
    view_staff: true,
    edit_staff: true,
    delete_staff: true,
    view_reports: true,
    manage_appointments: true,
    manage_inventory: true,
    manage_finances: true,
    view_finances: true,
  },
  RECEPTIONIST: {
    create_records: true,
    view_records: true,
    edit_records: true,
    delete_records: false,
    create_staff: false,
    view_staff: false,
    edit_staff: false,
    delete_staff: false,
    view_reports: false,
    manage_appointments: true,
    manage_inventory: false,
    manage_finances: false,
    view_finances: false,
  },
  DOCTOR: {
    create_records: false,
    view_records: true,
    edit_records: false,
    delete_records: false,
    create_staff: false,
    view_staff: false,
    edit_staff: false,
    delete_staff: false,
    view_reports: false,
    manage_appointments: false,
    manage_inventory: false,
    manage_finances: false,
    view_finances: false,
  },
  NURSE: {
    create_records: false,
    view_records: true,
    edit_records: false,
    delete_records: false,
    create_staff: false,
    view_staff: false,
    edit_staff: false,
    delete_staff: false,
    view_reports: false,
    manage_appointments: false,
    manage_inventory: false,
    manage_finances: false,
    view_finances: false,
  },
  VIEWER: {
    create_records: false,
    view_records: false,
    edit_records: false,
    delete_records: false,
    create_staff: false,
    view_staff: false,
    edit_staff: false,
    delete_staff: false,
    view_reports: true,
    manage_appointments: false,
    manage_inventory: false,
    manage_finances: false,
    view_finances: false,
  },
}

/**
 * Get permissions for a role
 */
export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER
}

/**
 * Check if role has specific permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof Permission
): boolean {
  return getPermissions(role)[permission]
}

/**
 * Check if role can perform action
 */
export function canCreateRecords(role: UserRole): boolean {
  return hasPermission(role, 'create_records')
}

export function canViewRecords(role: UserRole): boolean {
  return hasPermission(role, 'view_records')
}

export function canEditRecords(role: UserRole): boolean {
  return hasPermission(role, 'edit_records')
}

export function canDeleteRecords(role: UserRole): boolean {
  return hasPermission(role, 'delete_records')
}

export function canCreateStaff(role: UserRole): boolean {
  return hasPermission(role, 'create_staff')
}

export function canViewStaff(role: UserRole): boolean {
  return hasPermission(role, 'view_staff')
}

export function canEditStaff(role: UserRole): boolean {
  return hasPermission(role, 'edit_staff')
}

export function canDeleteStaff(role: UserRole): boolean {
  return hasPermission(role, 'delete_staff')
}

export function canViewReports(role: UserRole): boolean {
  return hasPermission(role, 'view_reports')
}

export function canManageAppointments(role: UserRole): boolean {
  return hasPermission(role, 'manage_appointments')
}

export function canManageInventory(role: UserRole): boolean {
  return hasPermission(role, 'manage_inventory')
}

export function canManageFinances(role: UserRole): boolean {
  return hasPermission(role, 'manage_finances')
}

export function canViewFinances(role: UserRole): boolean {
  return hasPermission(role, 'view_finances')
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: 'Administrator - Full access to all features',
    RECEPTIONIST: 'Receptionist - Can create and manage medical records',
    DOCTOR: 'Doctor - Can view medical records and add notes',
    NURSE: 'Nurse - Can view medical records and add notes',
    VIEWER: 'Viewer - Can only view reports',
  }
  return descriptions[role] || 'Unknown Role'
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'VIEWER']
}

/**
 * Check if user is authorized to access resource
 */
export function isAuthorized(
  userRole: UserRole,
  requiredPermission: keyof Permission
): boolean {
  return hasPermission(userRole, requiredPermission)
}

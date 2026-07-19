import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/mysql-db'
import { canCreateStaff, canViewStaff, UserRole, getAllRoles } from '@/lib/rbac'

/**
 * GET: List all staff members (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode token to get user role (simplified - in production use proper JWT)
    let userRole: UserRole = 'VIEWER'
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role || 'VIEWER'
    } catch {
      userRole = 'VIEWER'
    }

    // Check permission
    if (!canViewStaff(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to view staff' },
        { status: 403 }
      )
    }

    // Get all staff
    const results: any = await query(
      `SELECT staff_id, email, full_name, role, department, is_active, created_at 
       FROM staff_users ORDER BY created_at DESC`
    )

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff list' },
      { status: 500 }
    )
  }
}

/**
 * POST: Create new staff member (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode token to get user role
    let userRole: UserRole = 'VIEWER'
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role || 'VIEWER'
    } catch {
      userRole = 'VIEWER'
    }

    // Check permission
    if (!canCreateStaff(userRole)) {
      return NextResponse.json(
        { error: 'Only admins can create staff members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, full_name, password, role, department } = body

    // Validate inputs
    if (!email || !full_name || !password || !role) {
      return NextResponse.json(
        { error: 'Email, name, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!getAllRoles().includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${getAllRoles().join(', ')}` },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing: any = await query(
      'SELECT email FROM staff_users WHERE email = ?',
      [email.toLowerCase()]
    )
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Set permissions based on role
    let can_create_records = false
    let can_create_staff = false
    let can_edit_records = false
    let can_delete_records = false

    switch (role) {
      case 'ADMIN':
        can_create_records = true
        can_create_staff = true
        can_edit_records = true
        can_delete_records = true
        break
      case 'RECEPTIONIST':
        can_create_records = true
        can_edit_records = true
        break
      case 'DOCTOR':
      case 'NURSE':
        // Read-only access, no creation
        break
      case 'VIEWER':
        // View-only access
        break
    }

    // Insert staff member
    const result: any = await query(
      `INSERT INTO staff_users 
       (email, full_name, password_hash, role, department, can_create_records, can_create_staff, can_edit_records, can_delete_records) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email.toLowerCase(),
        full_name,
        passwordHash,
        role,
        department || null,
        can_create_records,
        can_create_staff,
        can_edit_records,
        can_delete_records,
      ]
    )

    return NextResponse.json(
      {
        success: true,
        staff_id: (result as any).insertId,
        email,
        full_name,
        role,
        message: 'Staff member created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}

/**
 * PUT: Update staff member
 */
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode token to get user role
    let userRole: UserRole = 'VIEWER'
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role || 'VIEWER'
    } catch {
      userRole = 'VIEWER'
    }

    // Only admin can update staff
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update staff' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { staff_id, full_name, role, department, is_active } = body

    if (!staff_id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }

    // Build update query
    const updates: string[] = []
    const values: any[] = []

    if (full_name !== undefined) {
      updates.push('full_name = ?')
      values.push(full_name)
    }
    if (role !== undefined) {
      updates.push('role = ?')
      values.push(role)
    }
    if (department !== undefined) {
      updates.push('department = ?')
      values.push(department)
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      values.push(is_active)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    values.push(staff_id)

    await query(
      `UPDATE staff_users SET ${updates.join(', ')} WHERE staff_id = ?`,
      values
    )

    return NextResponse.json(
      { success: true, message: 'Staff member updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

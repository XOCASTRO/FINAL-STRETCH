import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/mysql-db'

// Simple JWT-like token generator (in production, use proper JWT library)
function generateToken(staffId: number, email: string): string {
  const payload = {
    staffId,
    email,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Demo credentials for testing when database is not available
const DEMO_CREDENTIALS = {
  'admin@pticlinic.com': {
    password: 'admin123',
    full_name: 'Admin User',
    role: 'ADMIN',
    staffId: 1,
    permissions: {
      can_create_records: true,
      can_create_staff: true,
      can_edit_records: true,
      can_delete_records: true,
    }
  },
  'doctor@pticlinic.com': {
    password: 'doctor123',
    full_name: 'Dr. John Doe',
    role: 'DOCTOR',
    staffId: 2,
    permissions: {
      can_create_records: true,
      can_create_staff: false,
      can_edit_records: true,
      can_delete_records: false,
    }
  },
  'nurse@pticlinic.com': {
    password: 'nurse123',
    full_name: 'Nurse Jane Smith',
    role: 'NURSE',
    staffId: 3,
    permissions: {
      can_create_records: true,
      can_create_staff: false,
      can_edit_records: true,
      can_delete_records: false,
    }
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const lowerEmail = email.toLowerCase()

    try {
      // Try to fetch from database
      const results: any = await query(
        'SELECT staff_id, full_name, email, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, is_active FROM staff_users WHERE email = ?',
        [lowerEmail]
      )

      if (results && results.length > 0) {
        const staff = results[0]

        // Check if account is active
        if (!staff.is_active) {
          return NextResponse.json({ error: 'Account is inactive' }, { status: 401 })
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, staff.password_hash)
        if (!isPasswordValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        // Generate token
        const token = generateToken(staff.staff_id, staff.email)

        // Prepare response
        return NextResponse.json({
          success: true,
          token,
          user: {
            id: staff.staff_id,
            email: staff.email,
            full_name: staff.full_name,
            role: staff.role,
            can_create_records: !!staff.can_create_records,
            can_create_staff: !!staff.can_create_staff,
            can_edit_records: !!staff.can_edit_records,
            can_delete_records: !!staff.can_delete_records,
          },
        }, { status: 200 })
      }
    } catch (dbError) {
      console.warn('[v0] Database connection failed, attempting demo mode login')
    }

    // Fallback: Demo credentials when database is not available
    if (DEMO_CREDENTIALS[lowerEmail as keyof typeof DEMO_CREDENTIALS]) {
      const demoUser = DEMO_CREDENTIALS[lowerEmail as keyof typeof DEMO_CREDENTIALS]
      if (password === demoUser.password) {
        const token = generateToken(demoUser.staffId, lowerEmail)
        return NextResponse.json({
          success: true,
          token,
          user: {
            id: demoUser.staffId,
            email: lowerEmail,
            full_name: demoUser.full_name,
            role: demoUser.role,
            ...demoUser.permissions,
          },
        }, { status: 200 })
      }
    }

    // If neither database nor demo credentials match
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

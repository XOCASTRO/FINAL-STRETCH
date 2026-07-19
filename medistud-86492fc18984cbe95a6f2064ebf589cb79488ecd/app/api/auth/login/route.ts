import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Simple JWT-like token generator (in production, use proper JWT library)
function generateToken(staffId: number, email: string): string {
  const payload = {
    staffId,
    email,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      // Find staff user by email
      const [rows] = await connection.execute(
        'SELECT staff_id, full_name, email, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, is_active FROM staff_users WHERE email = ?',
        [email.toLowerCase()]
      )

      connection.release()

      if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const staff: any = rows[0]

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
      const response = {
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
      }

      return NextResponse.json(response, { status: 200 })
    } catch (error) {
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

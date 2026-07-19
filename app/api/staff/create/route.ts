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

// Decode token to get staff info
function decodeToken(token: string): { staffId: number; email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    return payload
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = decodeToken(token)

    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { email, full_name, password, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, department } = body

    // Validate required fields
    if (!email || !full_name || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, password, role' },
        { status: 400 }
      )
    }

    // Check if current user has permission to create staff
    const connection = await pool.getConnection()

    try {
      // Get current user permissions
      const [staffRows] = await connection.execute(
        'SELECT can_create_staff FROM staff_users WHERE staff_id = ?',
        [decodedToken.staffId]
      )

      if (staffRows.length === 0 || !staffRows[0].can_create_staff) {
        connection.release()
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to create staff' },
          { status: 403 }
        )
      }

      // Check if email already exists
      const [existingRows] = await connection.execute('SELECT email FROM staff_users WHERE email = ?', [
        email.toLowerCase(),
      ])

      if (existingRows.length > 0) {
        connection.release()
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Insert new staff user
      const [result] = await connection.execute(
        `INSERT INTO staff_users 
         (email, full_name, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, department)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email.toLowerCase(),
          full_name.trim(),
          hashedPassword,
          role,
          can_create_records ? 1 : 0,
          can_create_staff ? 1 : 0,
          can_edit_records ? 1 : 0,
          can_delete_records ? 1 : 0,
          department || null,
        ]
      )

      connection.release()

      return NextResponse.json(
        {
          success: true,
          message: 'Staff user created successfully',
          staff_id: result.insertId,
          email,
          full_name,
        },
        { status: 201 }
      )
    } catch (error) {
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Error creating staff user:', error)
    return NextResponse.json({ error: 'Failed to create staff user' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { validateMatricNumber } from '@/lib/matric-validator'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// GET request to validate matric number
export async function GET(request: NextRequest) {
  try {
    const matric = request.nextUrl.searchParams.get('matric_number')

    if (!matric) {
      return NextResponse.json({ error: 'Matric number is required' }, { status: 400 })
    }

    const validation = await validateMatricNumber(matric)
    return NextResponse.json(validation)
  } catch (error) {
    console.error('Error validating matric:', error)
    return NextResponse.json({ valid: false, error: 'Validation error' }, { status: 500 })
  }
}

// POST request to create new medical record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get authenticated user from session/token
    // For now, using a simple header approach (in production, use proper JWT/session)
    const staffIdHeader = request.headers.get('x-staff-id')
    const permissionHeader = request.headers.get('x-can-create-records')

    if (!staffIdHeader) {
      return NextResponse.json({ error: 'Unauthorized: Not authenticated' }, { status: 401 })
    }

    if (permissionHeader !== 'true') {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create medical records' },
        { status: 403 }
      )
    }

    const {
      matric_number,
      student_name,
      level,
      date_of_birth,
      phone,
      email,
      address,
      parent_contact,
      emergency_contact,
    } = body

    // Validate required fields
    if (!matric_number || !student_name || !level || !date_of_birth) {
      return NextResponse.json(
        { error: 'Missing required fields: matric_number, student_name, level, date_of_birth' },
        { status: 400 }
      )
    }

    // Validate matric number format and uniqueness
    const validation = await validateMatricNumber(matric_number)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Validate date
    const dobDate = new Date(date_of_birth)
    if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
    const [result] = await connection.execute(
      `INSERT INTO student_files 
       (matric_number, student_name, level, date_of_birth, phone, email, address, parent_contact, emergency_contact, created_by_staff_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matric_number.trim().toLowerCase(),
        student_name.trim(),
        level,
        date_of_birth,
        phone || null,
        email || null,
        address || null,
        parent_contact || null,
        emergency_contact || null,
        parseInt(staffIdHeader),
      ]
    )

      connection.release()

      return NextResponse.json(
        {
          success: true,
          message: 'Medical record created successfully',
          matric_number: matric_number.trim(),
          student_name,
        },
        { status: 201 }
      )
    } catch (dbError: any) {
      connection.release()

      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Matric number already exists' }, { status: 409 })
      }

      throw dbError
    }
  } catch (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json({ error: 'Failed to create medical record' }, { status: 500 })
  }
}

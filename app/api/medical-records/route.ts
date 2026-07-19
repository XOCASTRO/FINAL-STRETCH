import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql-db'
import { validateMatricFormat } from '@/lib/matric-validator'
import { canCreateRecords, canViewRecords } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search parameters
    const matric = request.nextUrl.searchParams.get('matric_number')
    const category = request.nextUrl.searchParams.get('category')

    if (matric) {
      const results: any = await query(
        'SELECT * FROM student_files WHERE matric_number = ?',
        [matric]
      )
      return NextResponse.json(results)
    }

    if (category) {
      const results: any = await query(
        'SELECT * FROM student_files WHERE category = ? ORDER BY date_created DESC',
        [category]
      )
      return NextResponse.json(results)
    }

    const results: any = await query(
      'SELECT * FROM student_files ORDER BY date_created DESC'
    )
    return NextResponse.json(results)
  } catch (error) {
    console.error('[v0] Error fetching medical records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode token to check permissions
    let userRole = 'VIEWER'
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role || 'VIEWER'
    } catch {
      userRole = 'VIEWER'
    }

    if (!canCreateRecords(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to create records' },
        { status: 403 }
      )
    }

    const body = await request.json()
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
      blood_group,
      department,
      session,
      category,
    } = body

    // Validate matric format
    const matricValidation = validateMatricFormat(matric_number)
    if (!matricValidation.isValid) {
      return NextResponse.json(
        { error: matricValidation.error || 'Invalid matric number' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!student_name || !level || !date_of_birth) {
      return NextResponse.json(
        { error: 'Name, level, and date of birth are required' },
        { status: 400 }
      )
    }

    // Validate category
    if (category && !['STUDENT', 'LECTURER', 'NON_STAFF'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be STUDENT, LECTURER, or NON_STAFF' },
        { status: 400 }
      )
    }

    const result: any = await query(
      `INSERT INTO student_files 
       (matric_number, student_name, level, date_of_birth, phone, email, address, 
        parent_contact, emergency_contact, blood_group, department, session, category, created_by_staff_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matric_number,
        student_name,
        level,
        date_of_birth,
        phone || null,
        email || null,
        address || null,
        parent_contact || null,
        emergency_contact || null,
        blood_group || null,
        department || null,
        session || null,
        category || 'STUDENT',
        1, // created_by_staff_id - should be from token in production
      ]
    )

    return NextResponse.json(
      { success: true, matric_number, message: 'Record created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[v0] Error creating medical record:', error)
    if (error.message && error.message.includes('Duplicate')) {
      return NextResponse.json(
        { error: 'Matric number already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode token to check permissions
    let userRole = 'VIEWER'
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role || 'VIEWER'
    } catch {
      userRole = 'VIEWER'
    }

    // Only ADMIN and RECEPTIONIST can edit
    if (userRole !== 'ADMIN' && userRole !== 'RECEPTIONIST') {
      return NextResponse.json(
        { error: 'You do not have permission to edit records' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { matric_number, ...updates } = body

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ')
    const values = Object.values(updates)

    await query(
      `UPDATE student_files SET ${fields}, date_updated = NOW() WHERE matric_number = ?`,
      [...values, matric_number]
    )

    const results: any = await query(
      'SELECT * FROM student_files WHERE matric_number = ?',
      [matric_number]
    )

    return NextResponse.json(results[0])
  } catch (error) {
    console.error('[v0] Error updating medical record:', error)
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode token to check permissions
    let userRole = 'VIEWER'
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role || 'VIEWER'
    } catch {
      userRole = 'VIEWER'
    }

    // Only ADMIN can delete
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete records' },
        { status: 403 }
      )
    }

    const matric = request.nextUrl.searchParams.get('matric_number')
    if (!matric) {
      return NextResponse.json(
        { error: 'Matric number is required' },
        { status: 400 }
      )
    }

    await query('DELETE FROM student_files WHERE matric_number = ?', [matric])

    return NextResponse.json({ message: 'Record deleted' }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error deleting medical record:', error)
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}

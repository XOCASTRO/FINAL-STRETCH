import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decodedToken = decodeToken(token)

    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const connection = await pool.getConnection()

    try {
      // Check if current user has permission to view staff (must be able to create staff)
      const [staffRows] = await connection.execute(
        'SELECT can_create_staff FROM staff_users WHERE staff_id = ?',
        [decodedToken.staffId]
      )

      if (staffRows.length === 0 || !staffRows[0].can_create_staff) {
        connection.release()
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Get all staff users
      const [rows] = await connection.execute(
        `SELECT 
          staff_id, 
          email, 
          full_name, 
          role, 
          can_create_records, 
          can_create_staff,
          can_edit_records,
          can_delete_records, 
          department, 
          is_active, 
          created_at 
         FROM staff_users 
         ORDER BY created_at DESC`
      )

      connection.release()
      return NextResponse.json(rows)
    } catch (error) {
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff list' }, { status: 500 })
  }
}

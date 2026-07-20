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

/**
 * Validate matric number format
 * Expected format: m.YY/CODE/XXXXXX
 * Example: m.24/nd/001234 (case-insensitive)
 */
export function validateMatricFormat(matric: string): { valid: boolean; error?: string } {
  if (!matric || typeof matric !== 'string') {
    return { valid: false, error: 'Matric number is required' }
  }

  const trimmed = matric.trim().toLowerCase()

  // Check if matches pattern: m.YY/CODE/XXXXXX (case-insensitive)
  const matricPattern = /^m\.\d{2}\/[a-z]{2,4}\/\d{6}$/
  if (!matricPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid format. Expected: m.24/nd/001234 (e.g., m.{YY}/{CODE}/{6-digit number})',
    }
  }

  return { valid: true }
}

/**
 * Check if matric number already exists in database
 */
export async function checkMatricExists(matric: string): Promise<boolean> {
  try {
    const connection = await pool.getConnection()
    const normalizedMatric = matric.trim().toLowerCase()
    const [rows] = await connection.execute('SELECT matric_number FROM student_files WHERE LOWER(matric_number) = ?', [normalizedMatric])
    connection.release()
    return rows.length > 0
  } catch (error) {
    console.error('Error checking matric uniqueness:', error)
    throw error
  }
}

/**
 * Validate matric number - format and uniqueness
 */
export async function validateMatricNumber(matric: string): Promise<{ valid: boolean; error?: string }> {
  // Check format first
  const formatValidation = validateMatricFormat(matric)
  if (!formatValidation.valid) {
    return formatValidation
  }

  // Check uniqueness
  try {
    const exists = await checkMatricExists(matric)
    if (exists) {
      return { valid: false, error: 'This matric number already exists in the system' }
    }
  } catch (error) {
    return { valid: false, error: 'Error validating matric number. Please try again.' }
  }

  return { valid: true }
}

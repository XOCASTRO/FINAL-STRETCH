import { query } from './mysql-db'

/**
 * Matric Number Validator
 * Format: M.YYYY/LEVEL/DEPARTMENT/NUMBER
 * Example: M.2024/ND/CS/00001
 * 
 * Parts:
 * - M: Prefix (fixed)
 * - YYYY: Year (1990-current+10)
 * - LEVEL: ND or HND
 * - DEPARTMENT: 2-4 uppercase letters (e.g., CS, MATH, ENG)
 * - NUMBER: 5-digit student number
 */

export interface MatricValidationResult {
  isValid: boolean
  error?: string
  parts?: {
    prefix: string
    year: string
    level: string
    department: string
    number: string
  }
}

/**
 * Validate matric number format
 * Format: M.YYYY/LEVEL/DEPARTMENT/NUMBER
 */
export function validateMatricFormat(matric: string): MatricValidationResult {
  // Remove whitespace
  const cleaned = matric.trim().toUpperCase()

  // Check format: M.YYYY/LEVEL/DEPARTMENT/NUMBER
  const matricRegex = /^M\.(\d{4})\/(ND|HND)\/([A-Z]{2,4})\/(\d{5})$/

  const match = cleaned.match(matricRegex)

  if (!match) {
    return {
      isValid: false,
      error:
        'Invalid format. Expected: M.YYYY/LEVEL/DEPARTMENT/NUMBER (e.g., M.2024/ND/CS/00001)',
    }
  }

  // Extract parts
  const [, year, level, department, number] = match

  // Validate year (should be reasonable academic year)
  const yearNum = parseInt(year, 10)
  const currentYear = new Date().getFullYear()
  if (yearNum < 1990 || yearNum > currentYear + 10) {
    return {
      isValid: false,
      error: `Invalid year: ${year}. Must be between 1990 and ${currentYear + 10}`,
    }
  }

  // Validate level
  if (!['ND', 'HND'].includes(level)) {
    return {
      isValid: false,
      error: `Invalid level: ${level}. Must be ND or HND`,
    }
  }

  // Validate department code (2-4 uppercase letters)
  if (!/^[A-Z]{2,4}$/.test(department)) {
    return {
      isValid: false,
      error: `Invalid department: ${department}. Must be 2-4 uppercase letters`,
    }
  }

  // Number should be 5 digits
  if (!/^\d{5}$/.test(number)) {
    return {
      isValid: false,
      error: `Invalid number: ${number}. Must be exactly 5 digits`,
    }
  }

  return {
    isValid: true,
    parts: {
      prefix: 'M',
      year,
      level,
      department,
      number,
    },
  }
}

/**
 * Check if matric number already exists in database
 */
export async function checkMatricExists(matric: string): Promise<boolean> {
  try {
    const results: any = await query(
      'SELECT matric_number FROM student_files WHERE matric_number = ?',
      [matric.trim().toUpperCase()]
    )
    return results && results.length > 0
  } catch (error) {
    console.error('[v0] Error checking matric uniqueness:', error)
    throw error
  }
}

/**
 * Validate matric number - format and uniqueness
 */
export async function validateMatricNumber(matric: string): Promise<MatricValidationResult> {
  // Check format first
  const formatValidation = validateMatricFormat(matric)
  if (!formatValidation.isValid) {
    return formatValidation
  }

  // Check uniqueness
  try {
    const exists = await checkMatricExists(matric)
    if (exists) {
      return { isValid: false, error: 'This matric number already exists in the system' }
    }
  } catch (error) {
    return { isValid: false, error: 'Error validating matric number. Please try again.' }
  }

  return { isValid: true, parts: formatValidation.parts }
}

/**
 * Format matric number to standard format
 */
export function formatMatricNumber(matric: string): string {
  const result = validateMatricFormat(matric)
  if (!result.isValid || !result.parts) {
    return matric
  }
  const { year, level, department, number } = result.parts
  return `M.${year}/${level}/${department}/${number}`
}

/**
 * Extract department from matric number
 */
export function extractDepartmentFromMatric(matric: string): string | null {
  const result = validateMatricFormat(matric)
  return result.parts?.department || null
}

/**
 * Extract level (ND or HND) from matric number
 */
export function extractLevelFromMatric(matric: string): string | null {
  const result = validateMatricFormat(matric)
  return result.parts?.level || null
}

/**
 * Extract year from matric number
 */
export function extractYearFromMatric(matric: string): string | null {
  const result = validateMatricFormat(matric)
  return result.parts?.year || null
}

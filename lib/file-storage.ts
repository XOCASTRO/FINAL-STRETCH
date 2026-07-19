import fs from 'fs'
import path from 'path'
import { promises as fsPromises } from 'fs'

/**
 * Local File Storage Utility
 * Handles saving and managing passport photos locally
 */

const PASSPORT_DIR = path.join(process.cwd(), 'public', 'passports')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

/**
 * Ensure passport directory exists
 */
export async function ensurePassportDir(): Promise<void> {
  try {
    await fsPromises.mkdir(PASSPORT_DIR, { recursive: true })
  } catch (error) {
    console.error('[v0] Error creating passport directory:', error)
    throw error
  }
}

/**
 * Generate passport filename from matric number and timestamp
 * Format: M.2024.ND.CS.00001_1721234567.jpg
 */
export function generatePassportFilename(matric: string): string {
  const timestamp = Date.now()
  const cleanMatric = matric.replace(/\//g, '.').toUpperCase()
  return `${cleanMatric}_${timestamp}.jpg`
}

/**
 * Save passport file from buffer
 */
export async function savePassportFile(
  buffer: Buffer,
  filename: string
): Promise<{ success: boolean; filename?: string; error?: string }> {
  try {
    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      }
    }

    // Ensure directory exists
    await ensurePassportDir()

    // Save file
    const filepath = path.join(PASSPORT_DIR, filename)
    await fsPromises.writeFile(filepath, buffer)

    return {
      success: true,
      filename,
    }
  } catch (error) {
    console.error('[v0] Error saving passport file:', error)
    return {
      success: false,
      error: 'Failed to save passport file',
    }
  }
}

/**
 * Delete passport file
 */
export async function deletePassportFile(
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const filepath = path.join(PASSPORT_DIR, filename)

    // Check if file exists
    try {
      await fsPromises.access(filepath)
    } catch {
      return {
        success: false,
        error: 'File not found',
      }
    }

    // Delete file
    await fsPromises.unlink(filepath)

    return {
      success: true,
    }
  } catch (error) {
    console.error('[v0] Error deleting passport file:', error)
    return {
      success: false,
      error: 'Failed to delete passport file',
    }
  }
}

/**
 * Get passport file URL for display
 */
export function getPassportFileUrl(filename: string): string {
  if (!filename) return ''
  return `/passports/${filename}`
}

/**
 * Check if passport file exists
 */
export async function passportFileExists(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(PASSPORT_DIR, filename)
    await fsPromises.access(filepath)
    return true
  } catch {
    return false
  }
}

/**
 * Get passport file full path (server-side only)
 */
export function getPassportFilePath(filename: string): string {
  return path.join(PASSPORT_DIR, filename)
}

/**
 * Validate file type and size
 */
export function validatePassportFile(
  file: File | null
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG and PNG are allowed',
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  return { valid: true }
}

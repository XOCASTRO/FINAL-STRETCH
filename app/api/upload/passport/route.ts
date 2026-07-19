import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql-db'
import {
  savePassportFile,
  generatePassportFilename,
  validatePassportFile,
  ensurePassportDir,
} from '@/lib/file-storage'
import { validateMatricFormat } from '@/lib/matric-validator'
import { canCreateRecords, canEditRecords } from '@/lib/rbac'

export async function POST(request: NextRequest) {
  try {
    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const matric = formData.get('matric') as string

    // Validate inputs
    if (!file || !matric) {
      return NextResponse.json(
        { error: 'File and matric number are required' },
        { status: 400 }
      )
    }

    // Validate matric format
    const matricValidation = validateMatricFormat(matric)
    if (!matricValidation.isValid) {
      return NextResponse.json(
        { error: matricValidation.error || 'Invalid matric number' },
        { status: 400 }
      )
    }

    // Validate file
    const fileValidation = validatePassportFile(file)
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error || 'Invalid file' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Ensure directory exists
    await ensurePassportDir()

    // Generate filename
    const filename = generatePassportFilename(matric)

    // Save file
    const saveResult = await savePassportFile(buffer, filename)
    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error || 'Failed to save file' },
        { status: 500 }
      )
    }

    // Update database with passport filename
    try {
      await query(
        `UPDATE student_files 
         SET passport_filename = ?, passport_uploaded_at = NOW() 
         WHERE matric_number = ?`,
        [filename, matric]
      )
    } catch (dbError) {
      console.error('[v0] Error updating database with passport filename:', dbError)
      // Don't fail the upload if database update fails
    }

    return NextResponse.json(
      {
        success: true,
        filename,
        url: `/passports/${filename}`,
        message: 'Passport uploaded successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error uploading passport:', error)
    return NextResponse.json(
      { error: 'Failed to upload passport' },
      { status: 500 }
    )
  }
}

/**
 * DELETE endpoint for removing passport
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename, matric } = await request.json()

    if (!filename || !matric) {
      return NextResponse.json(
        { error: 'Filename and matric number are required' },
        { status: 400 }
      )
    }

    // Import and use delete function
    const { deletePassportFile } = await import('@/lib/file-storage')
    const deleteResult = await deletePassportFile(filename)

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error || 'Failed to delete file' },
        { status: 500 }
      )
    }

    // Clear filename from database
    try {
      await query(
        `UPDATE student_files 
         SET passport_filename = NULL, passport_uploaded_at = NULL 
         WHERE matric_number = ?`,
        [matric]
      )
    } catch (dbError) {
      console.error('[v0] Error clearing passport filename from database:', dbError)
    }

    return NextResponse.json(
      { success: true, message: 'Passport deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error deleting passport:', error)
    return NextResponse.json(
      { error: 'Failed to delete passport' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const matric_number = params.matric;
    const connection = await pool.getConnection();

    // Get student file
    const [studentRows] = await connection.execute(
      'SELECT * FROM student_files WHERE matric_number = ?',
      [matric_number]
    );

    if (studentRows.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = studentRows[0];

    // Get allergies
    const [allergies] = await connection.execute(
      'SELECT * FROM allergies WHERE matric_number = ? ORDER BY date_recorded DESC',
      [matric_number]
    );

    // Get treatment history
    const [treatments] = await connection.execute(
      'SELECT * FROM treatment_history WHERE matric_number = ? ORDER BY visit_date DESC',
      [matric_number]
    );

    // Get prescriptions
    const [prescriptions] = await connection.execute(
      'SELECT * FROM prescription_history WHERE matric_number = ? ORDER BY prescription_date DESC',
      [matric_number]
    );

    // Get doctor notes
    const [notes] = await connection.execute(
      'SELECT * FROM doctor_notes WHERE matric_number = ? ORDER BY note_date DESC',
      [matric_number]
    );

    // Get clinic visits
    const [visits] = await connection.execute(
      'SELECT * FROM clinic_visits WHERE matric_number = ? ORDER BY visit_date DESC',
      [matric_number]
    );

    connection.release();

    return NextResponse.json({
      student_file: student,
      allergies,
      treatment_history: treatments,
      prescriptions,
      doctor_notes: notes,
      clinic_visits: visits,
    });
  } catch (error) {
    console.error('Error fetching complete medical record:', error);
    return NextResponse.json({ error: 'Failed to fetch record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const matric_number = params.matric;
    const { ...updates } = body;

    const connection = await pool.getConnection();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await connection.execute(
      `UPDATE student_files SET ${fields}, date_updated = NOW() WHERE matric_number = ?`,
      [...values, matric_number]
    );
    
    const [rows] = await connection.execute('SELECT * FROM student_files WHERE matric_number = ?', [matric_number]);
    connection.release();

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const matric_number = params.matric;
    const connection = await pool.getConnection();

    // Delete all related records
    await connection.execute('DELETE FROM allergies WHERE matric_number = ?', [matric_number]);
    await connection.execute('DELETE FROM treatment_history WHERE matric_number = ?', [matric_number]);
    await connection.execute('DELETE FROM prescription_history WHERE matric_number = ?', [matric_number]);
    await connection.execute('DELETE FROM doctor_notes WHERE matric_number = ?', [matric_number]);
    await connection.execute('DELETE FROM clinic_visits WHERE matric_number = ?', [matric_number]);
    await connection.execute('DELETE FROM student_files WHERE matric_number = ?', [matric_number]);

    connection.release();
    return NextResponse.json({ message: 'Record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}

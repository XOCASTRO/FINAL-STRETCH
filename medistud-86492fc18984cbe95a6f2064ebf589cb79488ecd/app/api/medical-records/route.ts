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

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    const matric = request.nextUrl.searchParams.get('matric_number');

    if (matric) {
      const [rows] = await connection.execute(
        'SELECT * FROM student_files WHERE matric_number = ?',
        [matric]
      );
      connection.release();
      return NextResponse.json(rows);
    }

    const [rows] = await connection.execute('SELECT * FROM student_files');
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO student_files 
       (matric_number, student_name, level, date_of_birth, phone, email, address, parent_contact, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matric_number, student_name, level, date_of_birth, phone, email, address, parent_contact, emergency_contact]
    );
    connection.release();

    return NextResponse.json({ id: result.insertId, matric_number }, { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { matric_number, ...updates } = body;

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

export async function DELETE(request: NextRequest) {
  try {
    const matric = request.nextUrl.searchParams.get('matric_number');
    const connection = await pool.getConnection();

    await connection.execute('DELETE FROM student_files WHERE matric_number = ?', [matric]);
    connection.release();

    return NextResponse.json({ message: 'Record deleted' }, { status: 204 });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}

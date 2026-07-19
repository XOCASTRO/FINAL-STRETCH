import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM prescription_history WHERE matric_number = $1 ORDER BY prescription_date DESC',
      [params.matric]
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const { prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status } = body;

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO prescription_history (matric_number, prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [params.matric, prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status || 'active']
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}

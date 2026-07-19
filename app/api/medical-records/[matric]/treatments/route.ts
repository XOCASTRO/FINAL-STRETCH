import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM treatment_history WHERE matric_number = $1 ORDER BY visit_date DESC',
      [params.matric]
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const { visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date } = body;

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO treatment_history (matric_number, visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [params.matric, visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating treatment record:', error);
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 });
  }
}

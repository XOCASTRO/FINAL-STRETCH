import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM allergies WHERE matric_number = $1 ORDER BY date_recorded DESC',
      [params.matric]
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching allergies:', error);
    return NextResponse.json({ error: 'Failed to fetch allergies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const { allergen, severity, notes } = body;

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO allergies (matric_number, allergen, severity, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [params.matric, allergen, severity, notes]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return NextResponse.json({ error: 'Failed to create allergy' }, { status: 500 });
  }
}

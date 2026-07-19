import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const result: any = await query(
      'SELECT * FROM allergies WHERE matric_number = ? ORDER BY date_recorded DESC',
      [params.matric]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching allergies:', error);
    return NextResponse.json({ error: 'Failed to fetch allergies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const { allergen, severity, notes } = body;

    const result: any = await query(
      `INSERT INTO allergies (matric_number, allergen, severity, notes)
       VALUES (?, ?, ?, ?)`,
      [params.matric, allergen, severity, notes]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      matric_number: params.matric,
      allergen,
      severity,
      notes,
      date_recorded: new Date().toISOString().split('T')[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating allergy:', error);
    return NextResponse.json({ error: 'Failed to create allergy' }, { status: 500 });
  }
}

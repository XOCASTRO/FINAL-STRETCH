import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const result: any = await query(
      'SELECT * FROM treatment_history WHERE matric_number = ? ORDER BY visit_date DESC',
      [params.matric]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const { visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date } = body;

    const result: any = await query(
      `INSERT INTO treatment_history (matric_number, visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [params.matric, visit_date, diagnosis, treatment, doctor_name, notes, follow_up_required, follow_up_date]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      matric_number: params.matric,
      visit_date,
      diagnosis,
      treatment,
      doctor_name,
      notes,
      follow_up_required,
      follow_up_date,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating treatment record:', error);
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 });
  }
}

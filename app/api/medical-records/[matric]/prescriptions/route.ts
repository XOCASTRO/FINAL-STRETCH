import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const result: any = await query(
      'SELECT * FROM prescription_history WHERE matric_number = ? ORDER BY prescription_date DESC',
      [params.matric]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { matric: string } }) {
  try {
    const body = await request.json();
    const { prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status } = body;

    const result: any = await query(
      `INSERT INTO prescription_history (matric_number, prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [params.matric, prescription_date, medication, dosage, frequency, duration, doctor_name, notes, status || 'active']
    );

    return NextResponse.json({
      id: (result as any).insertId,
      matric_number: params.matric,
      prescription_date,
      medication,
      dosage,
      frequency,
      duration,
      doctor_name,
      notes,
      status: status || 'active',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    // Total treatments
    const totalResult: any = await query(
      `SELECT COUNT(*) as total FROM treatment_history WHERE visit_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Top diagnoses
    const diagnosisResult: any = await query(
      `SELECT diagnosis, COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN ? AND ? GROUP BY diagnosis ORDER BY count DESC LIMIT 10`,
      [startDate, endDate]
    );

    // Treatments by doctor
    const doctorResult: any = await query(
      `SELECT doctor_name, COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN ? AND ? GROUP BY doctor_name ORDER BY count DESC`,
      [startDate, endDate]
    );

    // Follow-up required
    const followUpResult: any = await query(
      `SELECT COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN ? AND ? AND follow_up_required = true`,
      [startDate, endDate]
    );

    // All treatments
    const treatmentsResult: any = await query(
      `SELECT * FROM treatment_history WHERE visit_date BETWEEN ? AND ? ORDER BY visit_date DESC`,
      [startDate, endDate]
    );

    const total = totalResult[0]?.total || 0;
    const diagnosisData = diagnosisResult.map((row: any) => ({
      diagnosis: row.diagnosis,
      count: row.count,
      percentage: ((row.count / total) * 100).toFixed(1),
    }));

    return NextResponse.json({
      total_treatments: total,
      period: `${startDate} to ${endDate}`,
      top_diagnoses: diagnosisData,
      treatments_by_doctor: doctorResult,
      follow_up_required: followUpResult[0]?.count || 0,
      details: treatmentsResult,
    });
  } catch (error) {
    console.error('Error generating treatments report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

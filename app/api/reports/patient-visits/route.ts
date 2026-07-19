import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const visitType = request.nextUrl.searchParams.get('visit_type');

    // Total visits
    let sql = `SELECT COUNT(*) as total FROM clinic_visits WHERE visit_date BETWEEN ? AND ?`;
    let params: any[] = [startDate, endDate];

    if (visitType) {
      sql += ` AND visit_type = ?`;
      params.push(visitType);
    }

    const totalResult: any = await query(sql, params);
    const total = totalResult[0]?.total || 0;

    // Visits by type
    const typeResult: any = await query(
      `SELECT visit_type, COUNT(*) as count FROM clinic_visits 
       WHERE visit_date BETWEEN ? AND ? GROUP BY visit_type`,
      [startDate, endDate]
    );

    // Visits by doctor
    const doctorResult: any = await query(
      `SELECT doctor_name, COUNT(*) as count FROM clinic_visits 
       WHERE visit_date BETWEEN ? AND ? GROUP BY doctor_name ORDER BY count DESC`,
      [startDate, endDate]
    );

    // All visits
    const visitsResult: any = await query(
      `SELECT * FROM clinic_visits WHERE visit_date BETWEEN ? AND ? ORDER BY visit_date DESC`,
      [startDate, endDate]
    );

    return NextResponse.json({
      total_visits: total,
      period: `${startDate} to ${endDate}`,
      visits_by_type: typeResult.reduce((acc: any, row: any) => {
        acc[row.visit_type] = row.count;
        return acc;
      }, {}),
      visits_by_doctor: doctorResult,
      details: visitsResult,
    });
  } catch (error) {
    console.error('Error generating patient visits report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

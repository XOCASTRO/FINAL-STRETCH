import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const visitType = request.nextUrl.searchParams.get('visit_type');

    const client = await pool.connect();

    // Total visits
    let query = `SELECT COUNT(*) as total FROM clinic_visits WHERE visit_date BETWEEN $1 AND $2`;
    let params: any[] = [startDate, endDate];

    if (visitType) {
      query += ` AND visit_type = $3`;
      params.push(visitType);
    }

    const totalResult = await client.query(query, params);
    const total = totalResult.rows[0].total;

    // Visits by type
    const typeResult = await client.query(
      `SELECT visit_type, COUNT(*) as count FROM clinic_visits 
       WHERE visit_date BETWEEN $1 AND $2 GROUP BY visit_type`,
      [startDate, endDate]
    );

    // Visits by doctor
    const doctorResult = await client.query(
      `SELECT doctor_name, COUNT(*) as count FROM clinic_visits 
       WHERE visit_date BETWEEN $1 AND $2 GROUP BY doctor_name ORDER BY count DESC`,
      [startDate, endDate]
    );

    // All visits
    const visitsResult = await client.query(
      `SELECT * FROM clinic_visits WHERE visit_date BETWEEN $1 AND $2 ORDER BY visit_date DESC`,
      [startDate, endDate]
    );

    client.release();

    return NextResponse.json({
      total_visits: total,
      period: `${startDate} to ${endDate}`,
      visits_by_type: typeResult.rows.reduce((acc: any, row) => {
        acc[row.visit_type] = row.count;
        return acc;
      }, {}),
      visits_by_doctor: doctorResult.rows,
      details: visitsResult.rows,
    });
  } catch (error) {
    console.error('Error generating patient visits report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

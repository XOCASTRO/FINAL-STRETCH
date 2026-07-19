import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    const client = await pool.connect();

    // Total treatments
    const totalResult = await client.query(
      `SELECT COUNT(*) as total FROM treatment_history WHERE visit_date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    // Top diagnoses
    const diagnosisResult = await client.query(
      `SELECT diagnosis, COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN $1 AND $2 GROUP BY diagnosis ORDER BY count DESC LIMIT 10`,
      [startDate, endDate]
    );

    // Treatments by doctor
    const doctorResult = await client.query(
      `SELECT doctor_name, COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN $1 AND $2 GROUP BY doctor_name ORDER BY count DESC`,
      [startDate, endDate]
    );

    // Follow-up required
    const followUpResult = await client.query(
      `SELECT COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN $1 AND $2 AND follow_up_required = true`,
      [startDate, endDate]
    );

    // All treatments
    const treatmentsResult = await client.query(
      `SELECT * FROM treatment_history WHERE visit_date BETWEEN $1 AND $2 ORDER BY visit_date DESC`,
      [startDate, endDate]
    );

    client.release();

    const total = totalResult.rows[0].total;
    const diagnosisData = diagnosisResult.rows.map(row => ({
      diagnosis: row.diagnosis,
      count: row.count,
      percentage: ((row.count / total) * 100).toFixed(1),
    }));

    return NextResponse.json({
      total_treatments: total,
      period: `${startDate} to ${endDate}`,
      top_diagnoses: diagnosisData,
      treatments_by_doctor: doctorResult.rows,
      follow_up_required: followUpResult.rows[0].count,
      details: treatmentsResult.rows,
    });
  } catch (error) {
    console.error('Error generating treatments report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

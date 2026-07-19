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

    // Total students/patients
    const patientsResult = await client.query('SELECT COUNT(*) as total FROM student_files');
    const patients = patientsResult.rows[0].total;

    // Total visits
    const visitsResult = await client.query(
      'SELECT COUNT(*) as total FROM clinic_visits WHERE visit_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );
    const visits = visitsResult.rows[0].total;

    // Total treatments
    const treatmentsResult = await client.query(
      'SELECT COUNT(*) as total FROM treatment_history WHERE visit_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );
    const treatments = treatmentsResult.rows[0].total;

    // Total prescriptions
    const prescriptionsResult = await client.query(
      'SELECT COUNT(*) as total FROM prescription_history WHERE prescription_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );
    const prescriptions = prescriptionsResult.rows[0].total;

    // Total revenue
    const revenueResult = await client.query(
      'SELECT SUM(amount) as total FROM financial_transactions WHERE transaction_date BETWEEN $1 AND $2',
      [startDate, endDate]
    );
    const revenue = revenueResult.rows[0].total || 0;

    // Top medications
    const medicationsResult = await client.query(
      `SELECT medication, COUNT(*) as count FROM prescription_history 
       WHERE prescription_date BETWEEN $1 AND $2 
       GROUP BY medication ORDER BY count DESC LIMIT 5`,
      [startDate, endDate]
    );

    // Top diagnoses
    const diagnosisResult = await client.query(
      `SELECT diagnosis, COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN $1 AND $2 
       GROUP BY diagnosis ORDER BY count DESC LIMIT 5`,
      [startDate, endDate]
    );

    // Activities
    const activitiesResult = await client.query(
      `SELECT activity_type, COUNT(*) as count FROM clinic_activities 
       WHERE activity_date BETWEEN $1 AND $2 
       GROUP BY activity_type`,
      [startDate, endDate]
    );

    // Top doctors
    const doctorsResult = await client.query(
      `SELECT doctor_name, COUNT(*) as treatments FROM treatment_history 
       WHERE visit_date BETWEEN $1 AND $2 
       GROUP BY doctor_name ORDER BY treatments DESC LIMIT 5`,
      [startDate, endDate]
    );

    client.release();

    return NextResponse.json({
      period: `${startDate} to ${endDate}`,
      key_metrics: {
        total_patients: patients,
        total_visits: visits,
        total_revenue: parseFloat(revenue),
        total_treatments: treatments,
        total_prescriptions: prescriptions,
      },
      performance_indicators: {
        average_visits_per_patient: (visits / Math.max(patients, 1)).toFixed(2),
        average_treatments_per_visit: (treatments / Math.max(visits, 1)).toFixed(2),
      },
      top_doctors: doctorsResult.rows,
      top_medications: medicationsResult.rows,
      top_diagnoses: diagnosisResult.rows,
      activities_summary: activitiesResult.rows,
    });
  } catch (error) {
    console.error('Error generating management summary:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

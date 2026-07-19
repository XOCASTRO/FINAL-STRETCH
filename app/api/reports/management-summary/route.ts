import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql-db';

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get('start_date') || '2024-01-01';
    const endDate = request.nextUrl.searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    // Total students/patients
    const patientsResult: any = await query('SELECT COUNT(*) as total FROM student_files');
    const patients = patientsResult[0]?.total || 0;

    // Total visits
    const visitsResult: any = await query(
      'SELECT COUNT(*) as total FROM clinic_visits WHERE visit_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    const visits = visitsResult[0]?.total || 0;

    // Total treatments
    const treatmentsResult: any = await query(
      'SELECT COUNT(*) as total FROM treatment_history WHERE visit_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    const treatments = treatmentsResult[0]?.total || 0;

    // Total prescriptions
    const prescriptionsResult: any = await query(
      'SELECT COUNT(*) as total FROM prescription_history WHERE prescription_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    const prescriptions = prescriptionsResult[0]?.total || 0;

    // Total revenue
    const revenueResult: any = await query(
      'SELECT SUM(amount) as total FROM financial_transactions WHERE transaction_date BETWEEN ? AND ?',
      [startDate, endDate]
    );
    const revenue = revenueResult[0]?.total || 0;

    // Top medications
    const medicationsResult: any = await query(
      `SELECT medication, COUNT(*) as count FROM prescription_history 
       WHERE prescription_date BETWEEN ? AND ? 
       GROUP BY medication ORDER BY count DESC LIMIT 5`,
      [startDate, endDate]
    );

    // Top diagnoses
    const diagnosisResult: any = await query(
      `SELECT diagnosis, COUNT(*) as count FROM treatment_history 
       WHERE visit_date BETWEEN ? AND ? 
       GROUP BY diagnosis ORDER BY count DESC LIMIT 5`,
      [startDate, endDate]
    );

    // Activities
    const activitiesResult: any = await query(
      `SELECT activity_type, COUNT(*) as count FROM clinic_activities 
       WHERE activity_date BETWEEN ? AND ? 
       GROUP BY activity_type`,
      [startDate, endDate]
    );

    // Top doctors
    const doctorsResult: any = await query(
      `SELECT doctor_name, COUNT(*) as treatments FROM treatment_history 
       WHERE visit_date BETWEEN ? AND ? 
       GROUP BY doctor_name ORDER BY treatments DESC LIMIT 5`,
      [startDate, endDate]
    );

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
      top_doctors: doctorsResult,
      top_medications: medicationsResult,
      top_diagnoses: diagnosisResult,
      activities_summary: activitiesResult,
    });
  } catch (error) {
    console.error('Error generating management summary:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

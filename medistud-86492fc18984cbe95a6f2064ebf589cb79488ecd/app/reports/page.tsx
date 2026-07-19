'use client';

import { useState } from 'react';
import { Sidebar } from '../components/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, Pill, Activity } from 'lucide-react';
import Link from 'next/link';

interface ReportSummary {
  key_metrics: {
    total_patients: number;
    total_visits: number;
    total_revenue: number;
    total_treatments: number;
    total_prescriptions: number;
  };
  performance_indicators: {
    average_visits_per_patient: string;
    average_treatments_per_visit: string;
  };
  top_doctors: any[];
  top_medications: any[];
  top_diagnoses: any[];
  activities_summary: any[];
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('management');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const url = `/api/reports/${reportType}?start_date=${startDate}&end_date=${endDate}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-0 min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">Clinic Reports & Analytics</h1>
          </div>

          {/* Report Selection */}
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="management-summary">Management Summary</option>
                  <option value="patient-visits">Patient Visits</option>
                  <option value="treatments">Treatments</option>
                  <option value="financial">Financial Transactions</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {/* Report Display */}
          {report && (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-2xl font-bold mb-2">Report Period</h2>
                <p className="text-muted-foreground">{report.period}</p>
              </div>

              {reportType === 'management-summary' && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Total Patients</h3>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{report.key_metrics?.total_patients || 0}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        <h3 className="font-semibold text-green-900">Total Visits</h3>
                      </div>
                      <p className="text-3xl font-bold text-green-600">{report.key_metrics?.total_visits || 0}</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">Total Revenue</h3>
                      </div>
                      <p className="text-3xl font-bold text-purple-600">₦{(report.key_metrics?.total_revenue || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="w-6 h-6 text-orange-600" />
                        <h3 className="font-semibold text-orange-900">Total Treatments</h3>
                      </div>
                      <p className="text-3xl font-bold text-orange-600">{report.key_metrics?.total_treatments || 0}</p>
                    </div>

                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Pill className="w-6 h-6 text-pink-600" />
                        <h3 className="font-semibold text-pink-900">Total Prescriptions</h3>
                      </div>
                      <p className="text-3xl font-bold text-pink-600">{report.key_metrics?.total_prescriptions || 0}</p>
                    </div>

                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <BarChart3 className="w-6 h-6 text-cyan-600" />
                        <h3 className="font-semibold text-cyan-900">Avg Visits/Patient</h3>
                      </div>
                      <p className="text-3xl font-bold text-cyan-600">{report.performance_indicators?.average_visits_per_patient || '0'}</p>
                    </div>
                  </div>

                  {/* Top Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Doctors</h3>
                      <div className="space-y-2">
                        {report.top_doctors?.map((doctor: any) => (
                          <div key={doctor.doctor_name} className="flex justify-between items-center p-2 bg-background rounded">
                            <span>{doctor.doctor_name}</span>
                            <span className="font-semibold">{doctor.treatments} treatments</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border border-border p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Medications</h3>
                      <div className="space-y-2">
                        {report.top_medications?.map((med: any) => (
                          <div key={med.medication} className="flex justify-between items-center p-2 bg-background rounded">
                            <span>{med.medication}</span>
                            <span className="font-semibold">{med.count} times</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg border border-border p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Diagnoses</h3>
                      <div className="space-y-2">
                        {report.top_diagnoses?.map((diagnosis: any) => (
                          <div key={diagnosis.diagnosis} className="flex justify-between items-center p-2 bg-background rounded">
                            <span>{diagnosis.diagnosis}</span>
                            <span className="font-semibold">{diagnosis.count} cases</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border border-border p-6">
                      <h3 className="text-lg font-semibold mb-4">Activities Summary</h3>
                      <div className="space-y-2">
                        {report.activities_summary?.map((activity: any) => (
                          <div key={activity.activity_type} className="flex justify-between items-center p-2 bg-background rounded">
                            <span>{activity.activity_type}</span>
                            <span className="font-semibold">{activity.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {reportType === 'patient-visits' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">Patient Visits Summary</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                      <p className="text-2xl font-bold">{report.total_visits}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-muted-foreground">Visits by Type</p>
                      <div className="mt-2 space-y-1 text-sm">
                        {Object.entries(report.visits_by_type || {}).map(([type, count]: any) => (
                          <p key={type}>{type}: <strong>{count}</strong></p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'treatments' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">Treatments Summary</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-muted-foreground">Total Treatments</p>
                      <p className="text-3xl font-bold">{report.total_treatments}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-muted-foreground">Follow-ups Required</p>
                      <p className="text-3xl font-bold">{report.follow_up_required}</p>
                    </div>
                    {report.top_diagnoses && (
                      <div className="p-4">
                        <h3 className="font-semibold mb-3">Top Diagnoses</h3>
                        <div className="space-y-2">
                          {report.top_diagnoses.map((diagnosis: any) => (
                            <div key={diagnosis.diagnosis} className="flex justify-between items-center">
                              <span>{diagnosis.diagnosis}</span>
                              <span className="font-semibold">{diagnosis.count} ({diagnosis.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {reportType === 'financial' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">Financial Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-bold">₦{(report.total_revenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-muted-foreground">Transaction Count</p>
                      <p className="text-3xl font-bold">{report.transactions_count}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded border border-purple-200">
                      <p className="text-sm text-muted-foreground">Average Transaction</p>
                      <p className="text-3xl font-bold">₦{parseFloat(report.average_transaction).toLocaleString()}</p>
                    </div>
                  </div>
                  {report.revenue_by_type && (
                    <div className="p-4">
                      <h3 className="font-semibold mb-3">Revenue by Type</h3>
                      <div className="space-y-2">
                        {report.revenue_by_type.map((item: any) => (
                          <div key={item.type} className="flex justify-between items-center">
                            <span>{item.type}</span>
                            <span className="font-semibold">₦{item.total.toLocaleString()} ({item.count} transactions)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../components/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, AlertCircle, Clock, FileText, Pill, Activity } from 'lucide-react';
import Link from 'next/link';
import MedicalRecordForm from '../components/medical-record-form';
import { useAuth } from '../lib/auth-context';

interface MedicalRecord {
  student_file: {
    matric_number: string;
    student_name: string;
    level: string;
    date_of_birth: string;
    phone: string;
    email: string;
    address: string;
  };
  allergies: any[];
  treatment_history: any[];
  prescriptions: any[];
  doctor_notes: any[];
  clinic_visits: any[];
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [matricNumber, setMatricNumber] = useState('');
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const canCreateRecords = user?.can_create_records || false;

  const searchRecord = async () => {
    if (!matricNumber.trim()) {
      setError('Please enter a matric number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/medical-records/${matricNumber}`);
      if (response.status === 404) {
        setError('No medical record found for this matric number');
        setRecord(null);
      } else if (response.ok) {
        const data = await response.json();
        setRecord(data);
      } else {
        setError('Failed to fetch medical record');
      }
    } catch (err) {
      setError('Error fetching medical record');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = (matric: string, name: string) => {
    setShowCreateForm(false);
    setMatricNumber(matric);
    // Trigger search after form closes
    setTimeout(() => {
      searchRecord();
    }, 500);
  };

  return (
    <div className="flex gap-0 min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold">Medical Records</h1>
            </div>
            {canCreateRecords && (
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {showCreateForm ? 'Close Form' : 'Create Record'}
              </Button>
            )}
          </div>

          {/* Create Form Section */}
          {showCreateForm && (
            <div className="mb-8">
              <MedicalRecordForm
                onSuccess={handleFormSuccess}
                canCreateRecords={canCreateRecords}
                staffId={user?.id}
                token={typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined}
              />
            </div>
          )}

          {/* Search Section */}
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Student Medical Record</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter Matric Number (e.g., MTH/21/001)"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchRecord()}
              />
              <Button onClick={searchRecord} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>

          {/* Record Display */}
          {record && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{record.student_file.student_name}</h2>
                    <p className="text-muted-foreground">Matric: {record.student_file.matric_number}</p>
                  </div>
                  <Link href={`/medical-records/manage/${record.student_file.matric_number}`}>
                    <Button variant="outline">Edit Record</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-semibold">{record.student_file.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">{record.student_file.date_of_birth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-semibold">{record.student_file.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{record.student_file.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Allergies</p>
                      <p className="text-2xl font-bold">{record.allergies.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Visits</p>
                      <p className="text-2xl font-bold">{record.clinic_visits.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                      <p className="text-2xl font-bold">{record.prescriptions.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Treatments</p>
                      <p className="text-2xl font-bold">{record.treatment_history.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="flex border-b border-border">
                  {['Allergies', 'Treatments', 'Prescriptions', 'Notes', 'Visits'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`flex-1 px-4 py-3 font-medium transition-colors ${
                        activeTab === tab.toLowerCase()
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'allergies' && (
                    <div>
                      {record.allergies.length > 0 ? (
                        <div className="space-y-3">
                          {record.allergies.map((allergy: any) => (
                            <div key={allergy.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
                              <div>
                                <p className="font-semibold text-orange-900">{allergy.allergen}</p>
                                <p className="text-sm text-orange-700">{allergy.notes}</p>
                              </div>
                              <span className="px-3 py-1 bg-orange-200 text-orange-900 text-sm rounded font-medium">
                                {allergy.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No allergies recorded</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'treatments' && (
                    <div>
                      {record.treatment_history.length > 0 ? (
                        <div className="space-y-4">
                          {record.treatment_history.map((treatment: any) => (
                            <div key={treatment.id} className="border border-border rounded p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{treatment.diagnosis}</p>
                                  <p className="text-sm text-muted-foreground">{treatment.visit_date}</p>
                                </div>
                                {treatment.follow_up_required && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Follow-up</span>
                                )}
                              </div>
                              <p className="text-sm mb-1"><strong>Treatment:</strong> {treatment.treatment}</p>
                              <p className="text-sm text-muted-foreground"><strong>Doctor:</strong> {treatment.doctor_name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No treatments recorded</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'prescriptions' && (
                    <div>
                      {record.prescriptions.length > 0 ? (
                        <div className="space-y-4">
                          {record.prescriptions.map((prescription: any) => (
                            <div key={prescription.id} className="border border-border rounded p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{prescription.medication}</p>
                                  <p className="text-sm text-muted-foreground">{prescription.prescription_date}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded font-medium ${
                                  prescription.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {prescription.status}
                                </span>
                              </div>
                              <p className="text-sm"><strong>Dosage:</strong> {prescription.dosage}</p>
                              <p className="text-sm"><strong>Frequency:</strong> {prescription.frequency}</p>
                              <p className="text-sm"><strong>Duration:</strong> {prescription.duration}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No prescriptions recorded</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div>
                      {record.doctor_notes.length > 0 ? (
                        <div className="space-y-4">
                          {record.doctor_notes.map((note: any) => (
                            <div key={note.id} className="border border-border rounded p-4 bg-blue-50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-blue-900">{note.doctor_name}</p>
                                  <p className="text-sm text-blue-700">{note.note_date}</p>
                                </div>
                                {note.follow_up_required && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Follow-up</span>
                                )}
                              </div>
                              <p className="text-sm text-blue-900">{note.note_content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No doctor notes recorded</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'visits' && (
                    <div>
                      {record.clinic_visits.length > 0 ? (
                        <div className="space-y-4">
                          {record.clinic_visits.map((visit: any) => (
                            <div key={visit.id} className="border border-border rounded p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{visit.visit_type}</p>
                                  <p className="text-sm text-muted-foreground">{visit.visit_date}</p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  {visit.status}
                                </span>
                              </div>
                              <p className="text-sm"><strong>Reason:</strong> {visit.reason_for_visit}</p>
                              <p className="text-sm"><strong>Doctor:</strong> {visit.doctor_name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No clinic visits recorded</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

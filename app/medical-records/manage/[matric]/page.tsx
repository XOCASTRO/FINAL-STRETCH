'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../components/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';

interface StudentRecord {
  student_file: any;
  allergies: any[];
  treatment_history: any[];
  prescriptions: any[];
  doctor_notes: any[];
  clinic_visits: any[];
}

interface NewAllergy {
  allergen: string;
  severity: string;
  notes: string;
}

interface NewTreatment {
  visit_date: string;
  diagnosis: string;
  treatment: string;
  doctor_name: string;
  notes: string;
  follow_up_required: boolean;
  follow_up_date: string;
}

interface NewPrescription {
  prescription_date: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctor_name: string;
  notes: string;
}

export default function ManageMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const matric = params.matric as string;

  const [record, setRecord] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'allergies' | 'treatments' | 'prescriptions'>('allergies');
  const [editingStudent, setEditingStudent] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newAllergy, setNewAllergy] = useState<NewAllergy>({
    allergen: '',
    severity: 'mild',
    notes: '',
  });

  const [newTreatment, setNewTreatment] = useState<NewTreatment>({
    visit_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    doctor_name: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: '',
  });

  const [newPrescription, setNewPrescription] = useState<NewPrescription>({
    prescription_date: new Date().toISOString().split('T')[0],
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    doctor_name: '',
    notes: '',
  });

  const [studentEdits, setStudentEdits] = useState({
    student_name: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
  });

  // Load record
  useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/medical-records/${matric}`);
        if (response.ok) {
          const data = await response.json();
          setRecord(data);
          setStudentEdits({
            student_name: data.student_file.student_name,
            phone: data.student_file.phone,
            email: data.student_file.email,
            address: data.student_file.address,
            emergency_contact: data.student_file.emergency_contact,
          });
        } else {
          setError('Failed to load record');
        }
      } catch (err) {
        setError('Error loading record');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (matric) {
      loadRecord();
    }
  }, [matric]);

  // Update student info
  const handleUpdateStudent = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/medical-records/${matric}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentEdits),
      });

      if (response.ok) {
        setEditingStudent(false);
        // Reload record
        const reloadResponse = await fetch(`/api/medical-records/${matric}`);
        if (reloadResponse.ok) {
          setRecord(await reloadResponse.json());
        }
      } else {
        alert('Failed to update student info');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Error updating student info');
    } finally {
      setSaving(false);
    }
  };

  // Add allergy
  const handleAddAllergy = async () => {
    if (!newAllergy.allergen.trim()) {
      alert('Please enter allergen name');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/medical-records/${matric}/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllergy),
      });

      if (response.ok) {
        setNewAllergy({ allergen: '', severity: 'mild', notes: '' });
        // Reload record
        const reloadResponse = await fetch(`/api/medical-records/${matric}`);
        if (reloadResponse.ok) {
          setRecord(await reloadResponse.json());
        }
      }
    } catch (err) {
      console.error('Error adding allergy:', err);
      alert('Error adding allergy');
    } finally {
      setSaving(false);
    }
  };

  // Add treatment
  const handleAddTreatment = async () => {
    if (!newTreatment.diagnosis.trim() || !newTreatment.doctor_name.trim()) {
      alert('Please fill in diagnosis and doctor name');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/medical-records/${matric}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTreatment),
      });

      if (response.ok) {
        setNewTreatment({
          visit_date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          treatment: '',
          doctor_name: '',
          notes: '',
          follow_up_required: false,
          follow_up_date: '',
        });
        // Reload record
        const reloadResponse = await fetch(`/api/medical-records/${matric}`);
        if (reloadResponse.ok) {
          setRecord(await reloadResponse.json());
        }
      }
    } catch (err) {
      console.error('Error adding treatment:', err);
      alert('Error adding treatment');
    } finally {
      setSaving(false);
    }
  };

  // Add prescription
  const handleAddPrescription = async () => {
    if (!newPrescription.medication.trim() || !newPrescription.doctor_name.trim()) {
      alert('Please fill in medication and doctor name');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/medical-records/${matric}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrescription),
      });

      if (response.ok) {
        setNewPrescription({
          prescription_date: new Date().toISOString().split('T')[0],
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          doctor_name: '',
          notes: '',
        });
        // Reload record
        const reloadResponse = await fetch(`/api/medical-records/${matric}`);
        if (reloadResponse.ok) {
          setRecord(await reloadResponse.json());
        }
      }
    } catch (err) {
      console.error('Error adding prescription:', err);
      alert('Error adding prescription');
    } finally {
      setSaving(false);
    }
  };

  // Delete allergy
  const handleDeleteAllergy = async (id: number) => {
    if (!confirm('Are you sure you want to delete this allergy?')) return;

    try {
      // Since we don't have a delete endpoint for individual allergies, we'll need to add it
      // For now, show a message
      alert('Individual deletion not yet supported. Please contact admin.');
    } catch (err) {
      console.error('Error deleting allergy:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-0 min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex gap-0 min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="text-center text-red-500">Record not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex gap-0 min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/medical-records">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold">Manage Medical Record</h1>
              <p className="text-muted-foreground">{matric}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Student Info Section */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Student Information</h2>
              <Button
                variant={editingStudent ? 'destructive' : 'outline'}
                onClick={() => {
                  if (editingStudent) {
                    setStudentEdits({
                      student_name: record.student_file.student_name,
                      phone: record.student_file.phone,
                      email: record.student_file.email,
                      address: record.student_file.address,
                      emergency_contact: record.student_file.emergency_contact,
                    });
                    setEditingStudent(false);
                  } else {
                    setEditingStudent(true);
                  }
                }}
              >
                {editingStudent ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {editingStudent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={studentEdits.student_name}
                    onChange={(e) =>
                      setStudentEdits({ ...studentEdits, student_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={studentEdits.phone}
                    onChange={(e) =>
                      setStudentEdits({ ...studentEdits, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={studentEdits.email}
                    onChange={(e) =>
                      setStudentEdits({ ...studentEdits, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    rows={3}
                    value={studentEdits.address}
                    onChange={(e) =>
                      setStudentEdits({ ...studentEdits, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    value={studentEdits.emergency_contact}
                    onChange={(e) =>
                      setStudentEdits({
                        ...studentEdits,
                        emergency_contact: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={handleUpdateStudent}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-semibold">{record.student_file.student_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-semibold">{record.student_file.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{record.student_file.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Matric Number</p>
                  <p className="font-semibold">{record.student_file.matric_number}</p>
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
            )}
          </div>

          {/* Tabs */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="flex border-b border-border">
              {(['allergies', 'treatments', 'prescriptions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Allergies Tab */}
              {activeTab === 'allergies' && (
                <div className="space-y-6">
                  {/* Add New Allergy */}
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold mb-4">Add New Allergy</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Allergen</label>
                        <input
                          type="text"
                          placeholder="e.g., Penicillin"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                          value={newAllergy.allergen}
                          onChange={(e) =>
                            setNewAllergy({ ...newAllergy, allergen: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Severity</label>
                          <select
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newAllergy.severity}
                            onChange={(e) =>
                              setNewAllergy({ ...newAllergy, severity: e.target.value })
                            }
                          >
                            <option>mild</option>
                            <option>moderate</option>
                            <option>severe</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                          <input
                            type="text"
                            placeholder="Additional notes"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newAllergy.notes}
                            onChange={(e) =>
                              setNewAllergy({ ...newAllergy, notes: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddAllergy}
                        disabled={saving}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {saving ? 'Adding...' : 'Add Allergy'}
                      </Button>
                    </div>
                  </div>

                  {/* Existing Allergies */}
                  <div>
                    <h3 className="font-semibold mb-3">Recorded Allergies</h3>
                    {record.allergies.length > 0 ? (
                      <div className="space-y-2">
                        {record.allergies.map((allergy) => (
                          <div
                            key={allergy.id}
                            className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded"
                          >
                            <div>
                              <p className="font-semibold text-orange-900">
                                {allergy.allergen}
                              </p>
                              {allergy.notes && (
                                <p className="text-sm text-orange-700">{allergy.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-orange-200 text-orange-900 text-sm rounded font-medium">
                                {allergy.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No allergies recorded</p>
                    )}
                  </div>
                </div>
              )}

              {/* Treatments Tab */}
              {activeTab === 'treatments' && (
                <div className="space-y-6">
                  {/* Add New Treatment */}
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold mb-4">Add New Treatment</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Visit Date
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newTreatment.visit_date}
                            onChange={(e) =>
                              setNewTreatment({
                                ...newTreatment,
                                visit_date: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Diagnosis</label>
                          <input
                            type="text"
                            placeholder="e.g., Migraine"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newTreatment.diagnosis}
                            onChange={(e) =>
                              setNewTreatment({
                                ...newTreatment,
                                diagnosis: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Treatment</label>
                        <textarea
                          placeholder="Description of treatment"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                          rows={2}
                          value={newTreatment.treatment}
                          onChange={(e) =>
                            setNewTreatment({
                              ...newTreatment,
                              treatment: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Doctor Name
                          </label>
                          <input
                            type="text"
                            placeholder="Doctor name"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newTreatment.doctor_name}
                            onChange={(e) =>
                              setNewTreatment({
                                ...newTreatment,
                                doctor_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Notes</label>
                          <input
                            type="text"
                            placeholder="Additional notes"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newTreatment.notes}
                            onChange={(e) =>
                              setNewTreatment({
                                ...newTreatment,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="follow-up"
                          checked={newTreatment.follow_up_required}
                          onChange={(e) =>
                            setNewTreatment({
                              ...newTreatment,
                              follow_up_required: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="follow-up" className="text-sm font-medium">
                          Follow-up Required
                        </label>
                        {newTreatment.follow_up_required && (
                          <input
                            type="date"
                            className="ml-2 px-3 py-1 border border-border rounded-lg bg-background text-sm"
                            value={newTreatment.follow_up_date}
                            onChange={(e) =>
                              setNewTreatment({
                                ...newTreatment,
                                follow_up_date: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                      <Button
                        onClick={handleAddTreatment}
                        disabled={saving}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {saving ? 'Adding...' : 'Add Treatment'}
                      </Button>
                    </div>
                  </div>

                  {/* Existing Treatments */}
                  <div>
                    <h3 className="font-semibold mb-3">Treatment History</h3>
                    {record.treatment_history.length > 0 ? (
                      <div className="space-y-3">
                        {record.treatment_history.map((treatment) => (
                          <div
                            key={treatment.id}
                            className="border border-border rounded p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">{treatment.diagnosis}</p>
                                <p className="text-sm text-muted-foreground">
                                  {treatment.visit_date}
                                </p>
                              </div>
                              {treatment.follow_up_required && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                  Follow-up
                                </span>
                              )}
                            </div>
                            <p className="text-sm mb-1">
                              <strong>Treatment:</strong> {treatment.treatment}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Doctor:</strong> {treatment.doctor_name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No treatments recorded</p>
                    )}
                  </div>
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-6">
                  {/* Add New Prescription */}
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold mb-4">Add New Prescription</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Prescription Date
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newPrescription.prescription_date}
                            onChange={(e) =>
                              setNewPrescription({
                                ...newPrescription,
                                prescription_date: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Medication
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Paracetamol"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newPrescription.medication}
                            onChange={(e) =>
                              setNewPrescription({
                                ...newPrescription,
                                medication: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g., 500mg"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newPrescription.dosage}
                            onChange={(e) =>
                              setNewPrescription({
                                ...newPrescription,
                                dosage: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 3x daily"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newPrescription.frequency}
                            onChange={(e) =>
                              setNewPrescription({
                                ...newPrescription,
                                frequency: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g., 7 days"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                            value={newPrescription.duration}
                            onChange={(e) =>
                              setNewPrescription({
                                ...newPrescription,
                                duration: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Doctor Name</label>
                        <input
                          type="text"
                          placeholder="Doctor name"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                          value={newPrescription.doctor_name}
                          onChange={(e) =>
                            setNewPrescription({
                              ...newPrescription,
                              doctor_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                          placeholder="Additional notes (e.g., take with food)"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                          rows={2}
                          value={newPrescription.notes}
                          onChange={(e) =>
                            setNewPrescription({
                              ...newPrescription,
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        onClick={handleAddPrescription}
                        disabled={saving}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {saving ? 'Adding...' : 'Add Prescription'}
                      </Button>
                    </div>
                  </div>

                  {/* Existing Prescriptions */}
                  <div>
                    <h3 className="font-semibold mb-3">Prescription History</h3>
                    {record.prescriptions.length > 0 ? (
                      <div className="space-y-3">
                        {record.prescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className="border border-border rounded p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">{prescription.medication}</p>
                                <p className="text-sm text-muted-foreground">
                                  {prescription.prescription_date}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded font-medium ${
                                  prescription.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {prescription.status}
                              </span>
                            </div>
                            <p className="text-sm">
                              <strong>Dosage:</strong> {prescription.dosage}
                            </p>
                            <p className="text-sm">
                              <strong>Frequency:</strong> {prescription.frequency}
                            </p>
                            <p className="text-sm">
                              <strong>Duration:</strong> {prescription.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No prescriptions recorded</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

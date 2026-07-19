'use client'

import { useState } from 'react'
import { Calendar, Clock, User, MessageSquare, CheckCircle, AlertCircle, Check, X } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function AppointmentsContent() {
  const { appointments, updateAppointment, acceptAppointment, rejectAppointment } = useData()
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [responseText, setResponseText] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'>('ALL')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [bloodGroup, setBloodGroup] = useState('')

  const filteredAppointments = appointments.filter(
    (apt) => filterStatus === 'ALL' || apt.status === filterStatus
  )

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateAppointment(id, { status: newStatus as any })
  }

  const handleAddFeedback = (id: string) => {
    if (feedbackText || responseText) {
      updateAppointment(id, {
        feedback: feedbackText,
        response: responseText,
      })
      setFeedbackText('')
      setResponseText('')
      setEditingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Appointments Management</h1>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold">{appointments.length}</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={20} className="text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">{apt.patient_name}</h3>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          <span className="text-gray-500">Email:</span>
                          <a href={`mailto:${apt.patient_email}`} className="text-blue-600 hover:underline">
                            {apt.patient_email}
                          </a>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-gray-500">Phone:</span>
                          {apt.patient_phone}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-lg border font-semibold ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-800">{apt.appointment_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-semibold text-gray-800">{apt.appointment_time || 'Not set'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="font-semibold text-gray-800 line-clamp-1">{apt.reason}</p>
                    </div>
                  </div>

                  {/* Appointment Actions */}
                  <div className="mb-4 pb-4 border-b">
                    {apt.status === 'PENDING' && (
                      <>
                        {acceptingId === apt.id ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Blood Group <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                              >
                                <option value="">Select Blood Group</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (bloodGroup) {
                                    acceptAppointment(apt.id, bloodGroup)
                                    setAcceptingId(null)
                                    setBloodGroup('')
                                  }
                                }}
                                disabled={!bloodGroup}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                              >
                                Confirm Accept
                              </button>
                              <button
                                onClick={() => {
                                  setAcceptingId(null)
                                  setBloodGroup('')
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setAcceptingId(apt.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                            >
                              <Check size={18} />
                              Accept Appointment
                            </button>
                            <button
                              onClick={() => rejectAppointment(apt.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                            >
                              <X size={18} />
                              Reject
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {apt.status === 'ACCEPTED' && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <Check size={20} className="text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Appointment Accepted</p>
                          <p className="text-sm text-green-700">Blood Group: {apt.blood_group}</p>
                          <p className="text-sm text-green-700">Patient has been created in the system</p>
                        </div>
                      </div>
                    )}
                    {apt.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                        <X size={20} className="text-red-600" />
                        <div>
                          <p className="font-semibold text-red-800">Appointment Rejected</p>
                          <p className="text-sm text-red-700">Student has been notified</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Feedback & Response</h4>
                      </div>
                      {!editingId?.includes(apt.id) && (apt.feedback || apt.response) && (
                        <CheckCircle size={18} className="text-green-600" />
                      )}
                    </div>

                    {editingId === apt.id ? (
                      <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Feedback from Patient
                          </label>
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Enter feedback from patient..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Response from Clinic
                          </label>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Enter clinic response..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddFeedback(apt.id)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                          >
                            Save Feedback
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setFeedbackText('')
                              setResponseText('')
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {apt.feedback || apt.response ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                            {apt.feedback && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Feedback:</p>
                                <p className="text-sm text-gray-600">{apt.feedback}</p>
                              </div>
                            )}
                            {apt.response && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700">Clinic Response:</p>
                                <p className="text-sm text-gray-600">{apt.response}</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setEditingId(apt.id)
                                setFeedbackText(apt.feedback || '')
                                setResponseText(apt.response || '')
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                            >
                              Edit Feedback
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingId(apt.id)}
                            className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            Add Feedback & Response
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Sidebar>
  )
}

export default function AppointmentsPage() {
  return (
    <ProtectedRoute>
      <AppointmentsContent />
    </ProtectedRoute>
  )
}

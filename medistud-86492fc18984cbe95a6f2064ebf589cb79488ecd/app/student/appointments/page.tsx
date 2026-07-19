'use client'

import { useState } from 'react'
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useData } from '../../lib/data-context'

export default function StudentAppointmentStatus() {
  const { getAppointmentsByEmail } = useData()
  const [email, setEmail] = useState('')
  const [searched, setSearched] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])

  const handleSearch = () => {
    if (!email.trim()) {
      alert('Please enter your email address')
      return
    }
    const results = getAppointmentsByEmail(email)
    setAppointments(results)
    setSearched(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="text-green-600" size={24} />
      case 'REJECTED':
        return <XCircle className="text-red-600" size={24} />
      case 'PENDING':
        return <Clock className="text-yellow-600" size={24} />
      case 'COMPLETED':
        return <CheckCircle className="text-blue-600" size={24} />
      default:
        return <AlertCircle className="text-gray-600" size={24} />
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Your appointment has been accepted and confirmed. A patient record has been created with your blood group information.'
      case 'REJECTED':
        return 'Unfortunately, your appointment has been rejected. Please try booking another appointment.'
      case 'PENDING':
        return 'Your appointment is pending review. The clinic will respond within 24 hours.'
      case 'COMPLETED':
        return 'Your appointment has been completed.'
      default:
        return 'Status unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Appointment Status</h1>
          <p className="text-gray-600">Check the status of your clinic appointment</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Check Status
            </button>
          </div>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-2">No appointments found</p>
                <p className="text-gray-500 text-sm">
                  No appointments were found for this email address. Please check your email or try booking a new appointment.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Appointments ({appointments.length})</h2>
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                      apt.status === 'ACCEPTED'
                        ? 'border-l-green-600'
                        : apt.status === 'REJECTED'
                          ? 'border-l-red-600'
                          : apt.status === 'PENDING'
                            ? 'border-l-yellow-600'
                            : 'border-l-blue-600'
                    }`}
                  >
                    {/* Status Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(apt.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-600">Appointment Status</p>
                          <p className={`text-xl font-bold ${
                            apt.status === 'ACCEPTED'
                              ? 'text-green-600'
                              : apt.status === 'REJECTED'
                                ? 'text-red-600'
                                : apt.status === 'PENDING'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                          }`}>
                            {apt.status}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-lg border font-semibold text-sm ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>

                    {/* Status Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 text-sm">{getStatusMessage(apt.status)}</p>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date</p>
                        <p className="text-lg font-semibold text-gray-800">{apt.appointment_date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Time</p>
                        <p className="text-lg font-semibold text-gray-800">{apt.appointment_time || 'TBD'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-600">Reason</p>
                        <p className="text-gray-800">{apt.reason}</p>
                      </div>
                    </div>

                    {/* Your Information */}
                    <div className="space-y-2 pb-4 border-b">
                      <p className="text-sm font-medium text-gray-600">Your Information</p>
                      <div className="text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Name:</span> {apt.patient_name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {apt.patient_email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span> {apt.patient_phone}
                        </p>
                      </div>
                    </div>

                    {/* Blood Group (if accepted) */}
                    {apt.status === 'ACCEPTED' && apt.blood_group && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-800 mb-1">Your Blood Group</p>
                        <p className="text-2xl font-bold text-green-600">{apt.blood_group}</p>
                        <p className="text-xs text-green-700 mt-2">
                          Your blood group has been recorded in the clinic system
                        </p>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                      <p>Appointment Created: {new Date(apt.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>Need to book an appointment?</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            Return to Home Page
          </a>
        </div>
      </div>
    </div>
  )
}

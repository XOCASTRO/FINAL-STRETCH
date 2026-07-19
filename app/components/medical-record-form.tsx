'use client'

import { useState } from 'react'
import axios from 'axios'

interface FormData {
  matric_number: string
  student_name: string
  date_of_birth: string
  level: string
  phone: string
  email: string
  address: string
  parent_contact: string
  emergency_contact: string
  blood_group?: string
  department?: string
  session?: string
  category?: 'STUDENT' | 'LECTURER' | 'NON_STAFF'
}

interface MedicalRecordFormProps {
  onSuccess?: (matric: string, name: string) => void
  canCreateRecords: boolean
  staffId?: number
  token?: string
}

export default function MedicalRecordForm({ onSuccess, canCreateRecords, staffId, token }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<FormData>({
    matric_number: '',
    student_name: '',
    date_of_birth: '',
    level: '100',
    phone: '',
    email: '',
    address: '',
    parent_contact: '',
    emergency_contact: '',
    blood_group: '',
    department: '',
    session: '',
    category: 'STUDENT',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [matricValidation, setMatricValidation] = useState<{ valid: boolean; error?: string } | null>(null)
  const [checkingMatric, setCheckingMatric] = useState(false)

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate matric number on blur
  const handleMatricBlur = async () => {
    if (!formData.matric_number.trim()) {
      setMatricValidation(null)
      return
    }

    setCheckingMatric(true)
    try {
      const response = await axios.get('/api/medical-records/create', {
        params: { matric_number: formData.matric_number },
      })
      setMatricValidation(response.data)
    } catch (error) {
      setMatricValidation({ valid: false, error: 'Error validating matric number' })
    } finally {
      setCheckingMatric(false)
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.matric_number.trim()) {
      newErrors.matric_number = 'Matric number is required'
    } else if (!matricValidation?.valid) {
      newErrors.matric_number = matricValidation?.error || 'Invalid matric number'
    }

    if (!formData.student_name.trim()) {
      newErrors.student_name = 'Student name is required'
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    } else {
      const dob = new Date(formData.date_of_birth)
      if (dob > new Date()) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future'
      }
    }

    if (!formData.level) {
      newErrors.level = 'Level is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        '/api/medical-records/create',
        formData,
        {
          headers: {
            'x-staff-id': staffId || '1',
            'x-can-create-records': 'true',
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      )

      setSuccess(true)
      setSuccessMessage(
        `Medical record created successfully! Matric: ${response.data.matric_number}`
      )

      // Reset form
      setFormData({
        matric_number: '',
        student_name: '',
        date_of_birth: '',
        level: '100',
        phone: '',
        email: '',
        address: '',
        parent_contact: '',
        emergency_contact: '',
        blood_group: '',
        department: '',
        session: '',
        category: 'STUDENT',
      })
      setMatricValidation(null)

      // Call callback
      if (onSuccess) {
        onSuccess(response.data.matric_number, response.data.student_name)
      }

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create medical record'
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (!canCreateRecords) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800">You do not have permission to create medical records.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900">Create Medical Record</h2>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Matric Number */}
      <div>
        <label htmlFor="matric_number" className="block text-sm font-medium text-gray-700 mb-1">
          Matric Number * <span className="text-xs text-gray-500">(Format: M.YYYY/LEVEL/DEPT/NUMBER)</span>
        </label>
        <input
          id="matric_number"
          type="text"
          name="matric_number"
          value={formData.matric_number}
          onChange={handleChange}
          onBlur={handleMatricBlur}
          placeholder="M.2024/ND/CS/00001"
          className={`w-full px-3 py-2 border rounded-md ${
            errors.matric_number ? 'border-red-500' : matricValidation?.valid ? 'border-green-500' : 'border-gray-300'
          }`}
        />
        {checkingMatric && <p className="text-sm text-gray-500 mt-1">Checking...</p>}
        {matricValidation?.valid && <p className="text-sm text-green-600 mt-1">✓ Matric number is available</p>}
        {matricValidation?.error && <p className="text-sm text-red-600 mt-1">{matricValidation.error}</p>}
        {errors.matric_number && <p className="text-sm text-red-600 mt-1">{errors.matric_number}</p>}
      </div>

      {/* Student Name */}
      <div>
        <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 mb-1">
          Student Name *
        </label>
        <input
          id="student_name"
          type="text"
          name="student_name"
          value={formData.student_name}
          onChange={handleChange}
          placeholder="Full name"
          className={`w-full px-3 py-2 border rounded-md ${errors.student_name ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.student_name && <p className="text-sm text-red-600 mt-1">{errors.student_name}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth *
        </label>
        <input
          id="date_of_birth"
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.date_of_birth && <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>}
      </div>

      {/* Level */}
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
          Level *
        </label>
        <select
          id="level"
          name="level"
          value={formData.level}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${errors.level ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
          <option value="300">300 Level</option>
          <option value="400">400 Level</option>
          <option value="500">500 Level</option>
        </select>
        {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="08012345678"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="student@university.edu"
          className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Physical address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {/* Parent Contact */}
      <div>
        <label htmlFor="parent_contact" className="block text-sm font-medium text-gray-700 mb-1">
          Parent/Guardian Contact
        </label>
        <input
          id="parent_contact"
          type="tel"
          name="parent_contact"
          value={formData.parent_contact}
          onChange={handleChange}
          placeholder="08098765432"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Emergency Contact */}
      <div>
        <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
          Emergency Contact
        </label>
        <input
          id="emergency_contact"
          type="tel"
          name="emergency_contact"
          value={formData.emergency_contact}
          onChange={handleChange}
          placeholder="08011223344"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Medical Information</h3>

        {/* Blood Group */}
        <div>
          <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
            Blood Group
          </label>
          <select
            id="blood_group"
            name="blood_group"
            value={formData.blood_group || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select blood group</option>
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

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            id="department"
            type="text"
            name="department"
            value={formData.department || ''}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Session */}
        <div>
          <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">
            Academic Session
          </label>
          <input
            id="session"
            type="text"
            name="session"
            value={formData.session || ''}
            onChange={handleChange}
            placeholder="e.g., 2024/2025"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="space-y-2">
            {(['STUDENT', 'LECTURER', 'NON_STAFF'] as const).map((cat) => (
              <label key={cat} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={formData.category === cat}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm text-gray-700">{cat.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition"
      >
        {loading ? 'Creating...' : 'Create Medical Record'}
      </button>
    </form>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '../components/sidebar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Edit2, Trash2, Shield } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../lib/auth-context'
import axios from 'axios'

interface StaffUser {
  staff_id: number
  email: string
  full_name: string
  role: string
  can_create_records: boolean
  can_create_staff: boolean
  can_edit_records: boolean
  can_delete_records: boolean
  department: string
  is_active: boolean
  created_at: string
}

export default function StaffManagementPage() {
  const { user, token } = useAuth()
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'VIEWER',
    can_create_records: false,
    can_create_staff: false,
    can_edit_records: false,
    can_delete_records: false,
    department: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const canCreateStaff = user?.can_create_staff || false

  useEffect(() => {
    if (!canCreateStaff) return
    
    const fetchStaff = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/staff', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        })
        setStaff(response.data || [])
      } catch (err) {
        setError('Failed to load staff list')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [canCreateStaff, token])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const response = await axios.post('/api/staff/create', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })

      // Add new staff to list
      setStaff((prev) => [
        ...prev,
        {
          staff_id: response.data.staff_id,
          email: response.data.email,
          full_name: response.data.full_name,
          role: formData.role,
          can_create_records: formData.can_create_records,
          can_create_staff: formData.can_create_staff,
          can_edit_records: formData.can_edit_records,
          can_delete_records: formData.can_delete_records,
          department: formData.department,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ])

      // Reset form
      setFormData({
        email: '',
        full_name: '',
        password: '',
        role: 'VIEWER',
        can_create_records: false,
        can_create_staff: false,
        can_edit_records: false,
        can_delete_records: false,
        department: '',
      })
      setShowForm(false)
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create staff user')
    } finally {
      setFormLoading(false)
    }
  }

  if (!canCreateStaff) {
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
              <h1 className="text-4xl font-bold">Staff Management</h1>
            </div>
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800">
                You do not have permission to access staff management. Only administrators can manage staff users.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex gap-0 min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold">Staff Management</h1>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              {showForm ? 'Close Form' : 'Create Staff'}
            </Button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="mb-8 bg-white p-6 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Create New Staff User</h2>

              {formError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-border rounded-md"
                      placeholder="staff@pticlinic.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-border rounded-md"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-border rounded-md"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-border rounded-md"
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="STAFF">Staff</option>
                      <option value="NURSE">Nurse</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    placeholder="e.g., Medical, Nursing"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_create_records"
                        checked={formData.can_create_records}
                        onChange={handleFormChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Can Create Medical Records</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_edit_records"
                        checked={formData.can_edit_records}
                        onChange={handleFormChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Can Edit Medical Records</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_delete_records"
                        checked={formData.can_delete_records}
                        onChange={handleFormChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Can Delete Medical Records</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="can_create_staff"
                        checked={formData.can_create_staff}
                        onChange={handleFormChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Can Create Staff Users</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
                  >
                    {formLoading ? 'Creating...' : 'Create Staff User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Staff List */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Staff Users ({staff.length})</h2>
            </div>

            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading staff list...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : staff.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No staff users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Permissions</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((staffUser) => (
                      <tr key={staffUser.staff_id} className="border-b border-border hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium">{staffUser.full_name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{staffUser.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              staffUser.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : staffUser.role === 'DOCTOR'
                                ? 'bg-blue-100 text-blue-800'
                                : staffUser.role === 'NURSE'
                                ? 'bg-green-100 text-green-800'
                                : staffUser.role === 'STAFF'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {staffUser.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{staffUser.department || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            {staffUser.can_create_records && (
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Create</span>
                            )}
                            {staffUser.can_edit_records && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Edit</span>
                            )}
                            {staffUser.can_create_staff && (
                              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">Staff</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              staffUser.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {staffUser.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

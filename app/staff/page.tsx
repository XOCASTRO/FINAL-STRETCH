'use client'

import { Plus } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'

const mockStaff = [
  {
    id: 1,
    first_name: 'Dr.',
    last_name: 'Sarah Johnson',
    department: 'General Practice',
    phone: '0501111111',
    license_number: 'LIC001',
  },
  {
    id: 2,
    first_name: 'Dr.',
    last_name: 'Ahmed Khan',
    department: 'Pediatrics',
    phone: '0502222222',
    license_number: 'LIC002',
  },
  {
    id: 3,
    first_name: 'Nurse',
    last_name: 'Aisha Mahmoud',
    department: 'Emergency',
    phone: '0503333333',
    license_number: 'LIC003',
  },
  {
    id: 4,
    first_name: 'Dr.',
    last_name: 'Michael Smith',
    department: 'Surgery',
    phone: '0504444444',
    license_number: 'LIC004',
  },
  {
    id: 5,
    first_name: 'Pharmacist',
    last_name: 'Leila Hassan',
    department: 'Pharmacy',
    phone: '0505555555',
    license_number: 'LIC005',
  },
]

function StaffContent() {
  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Staff Members</h1>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} />
            Add Staff
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {mockStaff.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No staff members found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">License</th>
                </tr>
              </thead>
              <tbody>
                {mockStaff.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-6 py-3 text-sm">{member.department}</td>
                    <td className="px-6 py-3 text-sm">{member.phone}</td>
                    <td className="px-6 py-3 text-sm">{member.license_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Sidebar>
  )
}



export default function StaffPage() {
  return (
    <ProtectedRoute>
      <StaffContent />
    </ProtectedRoute>
  )
}

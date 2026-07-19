'use client'

import { Users, Package, Clock, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function DashboardContent() {
  const { patients, staff, inventory, appointments } = useData()
  
  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING')
  const lowStockItems = inventory.filter((i) => i.quantity <= i.min_stock)

  // Summary data from actual data
  const summary = {
    total_patients: patients.length,
    total_staff: staff.length,
    total_inventory: inventory.length,
    pending_appointments: pendingAppointments.length,
  }

  const stats = [
    {
      label: 'Total Patients',
      value: summary.total_patients,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Pending Appointments',
      value: summary.pending_appointments,
      icon: Calendar,
      color: 'red',
    },
    {
      label: 'Total Staff',
      value: summary.total_staff,
      icon: Users,
      color: 'green',
    },
    {
      label: 'Inventory Items',
      value: summary.total_inventory,
      icon: Package,
      color: 'purple',
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back to PTI Clinic Management System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">Low Stock Items</h2>
          </div>
          <p className="text-gray-600">No items currently below reorder level</p>
        </div>
      </div>
    </Sidebar>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

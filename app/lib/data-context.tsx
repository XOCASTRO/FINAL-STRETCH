'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Patient,
  StaffMember,
  InventoryItem,
  AttendanceRecord,
  Prescription,
  Appointment,
  patientService,
  staffService,
  inventoryService,
  attendanceService,
  prescriptionService,
  appointmentService,
} from './data-service'

interface DataContextType {
  // Patient
  patients: Patient[]
  addPatient: (patient: Omit<Patient, 'id' | 'created_at'>) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  getPatient: (id: string) => Patient | undefined

  // Staff
  staff: StaffMember[]
  addStaff: (staff: Omit<StaffMember, 'id' | 'created_at'>) => void
  updateStaff: (id: string, updates: Partial<StaffMember>) => void
  deleteStaff: (id: string) => void

  // Inventory
  inventory: InventoryItem[]
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at'>) => void
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void

  // Attendance
  attendance: AttendanceRecord[]
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void

  // Prescription
  prescriptions: Prescription[]
  addPrescription: (prescription: Omit<Prescription, 'id' | 'created_at'>) => void
  updatePrescription: (id: string, updates: Partial<Prescription>) => void
  deletePrescription: (id: string) => void
  getPrescriptionsByPatientId: (patientId: string) => Prescription[]

  // Appointment
  appointments: Appointment[]
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'status'>) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  acceptAppointment: (id: string, bloodGroup: string) => void
  rejectAppointment: (id: string) => void
  addAppointmentFeedback: (id: string, feedback: string, response: string) => void
  getAppointmentsByEmail: (email: string) => Appointment[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  // Load data on mount
  useEffect(() => {
    setPatients(patientService.getAll())
    setStaff(staffService.getAll())
    setInventory(inventoryService.getAll())
    setAttendance(attendanceService.getAll())
    setPrescriptions(prescriptionService.getAll())
    setAppointments(appointmentService.getAll())
  }, [])

  const value: DataContextType = {
    // Patient
    patients,
    addPatient: (patient) => {
      const newPatient = patientService.add(patient)
      setPatients([...patients, newPatient])
    },
    updatePatient: (id, updates) => {
      const updated = patientService.update(id, updates)
      if (updated) {
        setPatients(patients.map((p) => (p.id === id ? updated : p)))
      }
    },
    deletePatient: (id) => {
      patientService.delete(id)
      setPatients(patients.filter((p) => p.id !== id))
    },
    getPatient: (id) => patients.find((p) => p.id === id),

    // Staff
    staff,
    addStaff: (staffMember) => {
      const newStaff = staffService.add(staffMember)
      setStaff([...staff, newStaff])
    },
    updateStaff: (id, updates) => {
      const updated = staffService.update(id, updates)
      if (updated) {
        setStaff(staff.map((s) => (s.id === id ? updated : s)))
      }
    },
    deleteStaff: (id) => {
      staffService.delete(id)
      setStaff(staff.filter((s) => s.id !== id))
    },

    // Inventory
    inventory,
    addInventoryItem: (item) => {
      const newItem = inventoryService.add(item)
      setInventory([...inventory, newItem])
    },
    updateInventoryItem: (id, updates) => {
      const updated = inventoryService.update(id, updates)
      if (updated) {
        setInventory(inventory.map((i) => (i.id === id ? updated : i)))
      }
    },
    deleteInventoryItem: (id) => {
      inventoryService.delete(id)
      setInventory(inventory.filter((i) => i.id !== id))
    },

    // Attendance
    attendance,
    addAttendance: (record) => {
      const newRecord = attendanceService.add(record)
      setAttendance([...attendance, newRecord])
    },
    updateAttendance: (id, updates) => {
      const updated = attendanceService.update(id, updates)
      if (updated) {
        setAttendance(attendance.map((a) => (a.id === id ? updated : a)))
      }
    },

    // Prescription
    prescriptions,
    addPrescription: (prescription) => {
      const newPrescription = prescriptionService.add(prescription)
      setPrescriptions([...prescriptions, newPrescription])
    },
    updatePrescription: (id, updates) => {
      const updated = prescriptionService.update(id, updates)
      if (updated) {
        setPrescriptions(prescriptions.map((p) => (p.id === id ? updated : p)))
      }
    },
    deletePrescription: (id) => {
      prescriptionService.delete(id)
      setPrescriptions(prescriptions.filter((p) => p.id !== id))
    },
    getPrescriptionsByPatientId: (patientId) =>
      prescriptions.filter((p) => p.patient_id === patientId),

    // Appointment
    appointments,
    addAppointment: (appointment) => {
      const newAppointment = appointmentService.add(appointment)
      setAppointments([...appointments, newAppointment])
    },
    updateAppointment: (id, updates) => {
      const updated = appointmentService.update(id, updates)
      if (updated) {
        setAppointments(appointments.map((a) => (a.id === id ? updated : a)))
      }
    },
    acceptAppointment: (id, bloodGroup) => {
      const result = appointmentService.acceptAppointment(id, bloodGroup)
      if (result) {
        const { appointment } = result
        setAppointments(appointments.map((a) => (a.id === id ? appointment : a)))
        setPatients([...patients, result.patient])
      }
    },
    rejectAppointment: (id) => {
      const updated = appointmentService.rejectAppointment(id)
      if (updated) {
        setAppointments(appointments.map((a) => (a.id === id ? updated : a)))
      }
    },
    addAppointmentFeedback: (id, feedback, response) => {
      const updated = appointmentService.addFeedback(id, feedback, response)
      if (updated) {
        setAppointments(appointments.map((a) => (a.id === id ? updated : a)))
      }
    },
    getAppointmentsByEmail: (email) => appointmentService.getByEmail(email),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

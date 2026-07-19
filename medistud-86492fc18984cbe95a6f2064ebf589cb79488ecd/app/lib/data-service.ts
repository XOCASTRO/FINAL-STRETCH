// Data service for managing all clinic data with localStorage
export interface Patient {
  id: string
  patient_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  blood_group: string
  address: string
  medical_history: string
  created_at: string
}

export interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  department: string
  license_number: string
  created_at: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY'
  quantity: number
  unit: string
  min_stock: number
  created_at: string
}

export interface AttendanceRecord {
  id: string
  staff_id: string
  staff_name: string
  check_in: string
  check_out?: string
  date: string
}

export interface Prescription {
  id: string
  patient_id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  created_at: string
}

export interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  reason: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  blood_group?: string
  feedback?: string
  response?: string
  created_at: string
}

const STORAGE_KEYS = {
  PATIENTS: 'clinic_patients',
  STAFF: 'clinic_staff',
  INVENTORY: 'clinic_inventory',
  ATTENDANCE: 'clinic_attendance',
  PRESCRIPTIONS: 'clinic_prescriptions',
  APPOINTMENTS: 'clinic_appointments',
}

// Initialize with sample data
function initializeSampleData() {
  const patients = localStorage.getItem(STORAGE_KEYS.PATIENTS)
  if (!patients) {
    localStorage.setItem(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify([
        {
          id: '1',
          patient_number: 'P001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '555-0101',
          date_of_birth: '1990-01-15',
          blood_group: 'O+',
          address: '123 Main St',
          medical_history: 'Hypertension, Diabetes',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          patient_number: 'P002',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '555-0102',
          date_of_birth: '1985-06-20',
          blood_group: 'A+',
          address: '456 Oak Ave',
          medical_history: 'Asthma',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          patient_number: 'P003',
          first_name: 'Robert',
          last_name: 'Johnson',
          email: 'robert@example.com',
          phone: '555-0103',
          date_of_birth: '1992-03-10',
          blood_group: 'B+',
          address: '789 Pine Rd',
          medical_history: 'Regular checkups',
          created_at: new Date().toISOString(),
        },
      ])
    )
  }

  const staff = localStorage.getItem(STORAGE_KEYS.STAFF)
  if (!staff) {
    localStorage.setItem(
      STORAGE_KEYS.STAFF,
      JSON.stringify([
        {
          id: '1',
          first_name: 'Dr.',
          last_name: 'Smith',
          email: 'dr.smith@clinic.com',
          phone: '555-1001',
          department: 'General Medicine',
          license_number: 'LIC001',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          first_name: 'Dr.',
          last_name: 'Johnson',
          email: 'dr.johnson@clinic.com',
          phone: '555-1002',
          department: 'Cardiology',
          license_number: 'LIC002',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          first_name: 'Nurse',
          last_name: 'Williams',
          email: 'nurse.williams@clinic.com',
          phone: '555-1003',
          department: 'Nursing',
          license_number: 'LIC003',
          created_at: new Date().toISOString(),
        },
      ])
    )
  }

  const inventory = localStorage.getItem(STORAGE_KEYS.INVENTORY)
  if (!inventory) {
    localStorage.setItem(
      STORAGE_KEYS.INVENTORY,
      JSON.stringify([
        {
          id: '1',
          name: 'Paracetamol 500mg',
          category: 'MEDICINE',
          quantity: 250,
          unit: 'tablets',
          min_stock: 100,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Amoxicillin 250mg',
          category: 'MEDICINE',
          quantity: 45,
          unit: 'capsules',
          min_stock: 100,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Blood Pressure Monitor',
          category: 'EQUIPMENT',
          quantity: 5,
          unit: 'units',
          min_stock: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Disposable Gloves (Box)',
          category: 'SUPPLY',
          quantity: 12,
          unit: 'boxes',
          min_stock: 5,
          created_at: new Date().toISOString(),
        },
      ])
    )
  }
}

// Patient operations
export const patientService = {
  getAll: (): Patient[] => {
    initializeSampleData()
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS)
    return data ? JSON.parse(data) : []
  },

  getById: (id: string): Patient | undefined => {
    const patients = patientService.getAll()
    return patients.find((p) => p.id === id)
  },

  add: (patient: Omit<Patient, 'id' | 'created_at'>): Patient => {
    const patients = patientService.getAll()
    const newPatient: Patient = {
      ...patient,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    patients.push(newPatient)
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
    return newPatient
  },

  update: (id: string, updates: Partial<Patient>): Patient | undefined => {
    const patients = patientService.getAll()
    const index = patients.findIndex((p) => p.id === id)
    if (index !== -1) {
      patients[index] = { ...patients[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
      return patients[index]
    }
  },

  delete: (id: string): void => {
    const patients = patientService.getAll()
    const filtered = patients.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(filtered))
  },
}

// Staff operations
export const staffService = {
  getAll: (): StaffMember[] => {
    initializeSampleData()
    const data = localStorage.getItem(STORAGE_KEYS.STAFF)
    return data ? JSON.parse(data) : []
  },

  add: (staff: Omit<StaffMember, 'id' | 'created_at'>): StaffMember => {
    const allStaff = staffService.getAll()
    const newStaff: StaffMember = {
      ...staff,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    allStaff.push(newStaff)
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(allStaff))
    return newStaff
  },

  update: (id: string, updates: Partial<StaffMember>): StaffMember | undefined => {
    const allStaff = staffService.getAll()
    const index = allStaff.findIndex((s) => s.id === id)
    if (index !== -1) {
      allStaff[index] = { ...allStaff[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(allStaff))
      return allStaff[index]
    }
  },

  delete: (id: string): void => {
    const allStaff = staffService.getAll()
    const filtered = allStaff.filter((s) => s.id !== id)
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filtered))
  },
}

// Inventory operations
export const inventoryService = {
  getAll: (): InventoryItem[] => {
    initializeSampleData()
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY)
    return data ? JSON.parse(data) : []
  },

  add: (item: Omit<InventoryItem, 'id' | 'created_at'>): InventoryItem => {
    const items = inventoryService.getAll()
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    items.push(newItem)
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items))
    return newItem
  },

  update: (id: string, updates: Partial<InventoryItem>): InventoryItem | undefined => {
    const items = inventoryService.getAll()
    const index = items.findIndex((i) => i.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items))
      return items[index]
    }
  },

  delete: (id: string): void => {
    const items = inventoryService.getAll()
    const filtered = items.filter((i) => i.id !== id)
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(filtered))
  },
}

// Attendance operations
export const attendanceService = {
  getAll: (): AttendanceRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
    return data ? JSON.parse(data) : []
  },

  add: (record: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
    const records = attendanceService.getAll()
    const newRecord: AttendanceRecord = {
      ...record,
      id: Date.now().toString(),
    }
    records.push(newRecord)
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records))
    return newRecord
  },

  update: (id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined => {
    const records = attendanceService.getAll()
    const index = records.findIndex((r) => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records))
      return records[index]
    }
  },
}

// Prescription operations
export const prescriptionService = {
  getAll: (): Prescription[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)
    return data ? JSON.parse(data) : []
  },

  getByPatientId: (patientId: string): Prescription[] => {
    const prescriptions = prescriptionService.getAll()
    return prescriptions.filter((p) => p.patient_id === patientId)
  },

  add: (prescription: Omit<Prescription, 'id' | 'created_at'>): Prescription => {
    const prescriptions = prescriptionService.getAll()
    const newPrescription: Prescription = {
      ...prescription,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    prescriptions.push(newPrescription)
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions))
    return newPrescription
  },

  update: (id: string, updates: Partial<Prescription>): Prescription | undefined => {
    const prescriptions = prescriptionService.getAll()
    const index = prescriptions.findIndex((p) => p.id === id)
    if (index !== -1) {
      prescriptions[index] = { ...prescriptions[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions))
      return prescriptions[index]
    }
  },

  delete: (id: string): void => {
    const prescriptions = prescriptionService.getAll()
    const filtered = prescriptions.filter((p) => p.id !== id)
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(filtered))
  },
}

// Appointment operations
export const appointmentService = {
  getAll: (): Appointment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)
    return data ? JSON.parse(data) : []
  },

  add: (appointment: Omit<Appointment, 'id' | 'created_at' | 'status'>): Appointment => {
    const appointments = appointmentService.getAll()
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    }
    appointments.push(newAppointment)
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
    return newAppointment
  },

  update: (id: string, updates: Partial<Appointment>): Appointment | undefined => {
    const appointments = appointmentService.getAll()
    const index = appointments.findIndex((a) => a.id === id)
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
      return appointments[index]
    }
  },

  getByEmail: (email: string): Appointment[] => {
    const appointments = appointmentService.getAll()
    return appointments.filter((a) => a.patient_email === email)
  },

  acceptAppointment: (id: string, bloodGroup: string): { appointment: Appointment; patient: Patient } | undefined => {
    const appointments = appointmentService.getAll()
    const index = appointments.findIndex((a) => a.id === id)
    if (index !== -1) {
      appointments[index] = { ...appointments[index], status: 'ACCEPTED', blood_group: bloodGroup }
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
      
      // Create patient from appointment
      const appointment = appointments[index]
      const patients = patientService.getAll()
      
      // Check if patient already exists with this email
      const existingPatient = patients.find((p) => p.email === appointment.patient_email)
      if (existingPatient) {
        return { appointment, patient: existingPatient }
      }
      
      // Create new patient from appointment details
      const newPatient: Omit<Patient, 'id' | 'created_at'> = {
        patient_number: `P${String(patients.length + 1).padStart(3, '0')}`,
        first_name: appointment.patient_name.split(' ')[0],
        last_name: appointment.patient_name.split(' ').slice(1).join(' ') || appointment.patient_name,
        email: appointment.patient_email,
        phone: appointment.patient_phone,
        date_of_birth: '',
        blood_group: bloodGroup,
        address: '',
        medical_history: `Appointment for: ${appointment.reason}`,
      }
      
      const patient = patientService.add(newPatient)
      return { appointment, patient }
    }
  },

  rejectAppointment: (id: string): Appointment | undefined => {
    return appointmentService.update(id, { status: 'REJECTED' })
  },

  addFeedback: (id: string, feedback: string, response: string): Appointment | undefined => {
    return appointmentService.update(id, { feedback, response })
  },
}

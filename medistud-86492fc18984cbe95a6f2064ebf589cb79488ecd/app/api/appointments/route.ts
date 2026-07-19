import { NextRequest, NextResponse } from 'next/server'

let appointments: any[] = [
  {
    id: '1',
    patient_name: 'Jane Smith',
    patient_email: 'jane@example.com',
    patient_phone: '0798765432',
    appointment_date: '2026-07-25',
    appointment_time: '10:00',
    reason: 'General Checkup',
    status: 'PENDING',
    blood_group: null,
    created_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(appointments)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newAppointment = {
      ...data,
      id: Date.now().toString(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    }
    appointments.push(newAppointment)
    return NextResponse.json(newAppointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const appointment = appointments.find((a) => a.id === params.id)
  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }
  return NextResponse.json(appointment)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const index = appointments.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    appointments[index] = { ...appointments[index], ...data }
    return NextResponse.json(appointments[index])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = appointments.findIndex((a) => a.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }
  const deleted = appointments.splice(index, 1)
  return NextResponse.json(deleted[0])
}

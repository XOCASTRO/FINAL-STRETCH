import { NextRequest, NextResponse } from 'next/server'

let patients: any[] = [
  {
    id: '1',
    patient_number: 'P001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '0712345678',
    date_of_birth: '1990-01-15',
    blood_group: 'O+',
    address: '123 Main St',
    medical_history: 'None',
    created_at: new Date().toISOString(),
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const patient = patients.find((p) => p.id === params.id)
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }
  return NextResponse.json(patient)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const index = patients.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    patients[index] = { ...patients[index], ...data }
    return NextResponse.json(patients[index])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = patients.findIndex((p) => p.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }
  const deleted = patients.splice(index, 1)
  return NextResponse.json(deleted[0])
}

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

export async function GET() {
  return NextResponse.json(patients)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newPatient = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    patients.push(newPatient)
    return NextResponse.json(newPatient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

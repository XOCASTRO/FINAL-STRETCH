import { NextRequest, NextResponse } from 'next/server'

let prescriptions: any[] = [
  {
    id: '1',
    patient_id: '1',
    medication: 'Paracetamol 500mg',
    dosage: '500mg',
    frequency: 'Twice daily',
    duration: '7 days',
    notes: 'Take with water after meals',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(prescriptions)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newPrescription = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    prescriptions.push(newPrescription)
    return NextResponse.json(newPrescription, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

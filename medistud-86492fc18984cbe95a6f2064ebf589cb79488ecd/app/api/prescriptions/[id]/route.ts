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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prescription = prescriptions.find((p) => p.id === params.id)
  if (!prescription) {
    return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
  }
  return NextResponse.json(prescription)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const index = prescriptions.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }
    prescriptions[index] = { ...prescriptions[index], ...data }
    return NextResponse.json(prescriptions[index])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = prescriptions.findIndex((p) => p.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
  }
  const deleted = prescriptions.splice(index, 1)
  return NextResponse.json(deleted[0])
}

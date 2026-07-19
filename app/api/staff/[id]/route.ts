import { NextRequest, NextResponse } from 'next/server'

let staff: any[] = [
  {
    id: '1',
    first_name: 'Dr.',
    last_name: 'Johnson',
    role: 'Doctor',
    email: 'johnson@pticlinic.com',
    phone: '0712345678',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    first_name: 'Nurse',
    last_name: 'Smith',
    role: 'Nurse',
    email: 'smith@pticlinic.com',
    phone: '0798765432',
    created_at: new Date().toISOString(),
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const member = staff.find((s) => s.id === params.id)
  if (!member) {
    return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
  }
  return NextResponse.json(member)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const index = staff.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }
    staff[index] = { ...staff[index], ...data }
    return NextResponse.json(staff[index])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = staff.findIndex((s) => s.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
  }
  const deleted = staff.splice(index, 1)
  return NextResponse.json(deleted[0])
}

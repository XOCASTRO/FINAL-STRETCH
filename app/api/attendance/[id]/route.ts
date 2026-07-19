import { NextRequest, NextResponse } from 'next/server'

let attendance: any[] = [
  {
    id: '1',
    staff_id: '1',
    staff_name: 'John Doe',
    check_in: new Date(Date.now() - 3600000).toISOString(),
    check_out: new Date(Date.now() - 1800000).toISOString(),
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const record = attendance.find((a) => a.id === params.id)
  if (!record) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }
  return NextResponse.json(record)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const index = attendance.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }
    attendance[index] = { ...attendance[index], ...data }
    return NextResponse.json(attendance[index])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = attendance.findIndex((a) => a.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }
  const deleted = attendance.splice(index, 1)
  return NextResponse.json(deleted[0])
}

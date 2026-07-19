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

export async function GET() {
  return NextResponse.json(attendance)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newRecord = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    attendance.push(newRecord)
    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

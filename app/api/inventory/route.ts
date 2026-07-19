import { NextRequest, NextResponse } from 'next/server'

let inventory: any[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'MEDICINE',
    quantity: 150,
    unit: 'tablets',
    min_stock: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Digital Thermometer',
    category: 'EQUIPMENT',
    quantity: 8,
    unit: 'units',
    min_stock: 5,
    created_at: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json(inventory)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newItem = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    inventory.push(newItem)
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

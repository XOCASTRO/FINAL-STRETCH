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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = inventory.find((i) => i.id === params.id)
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
  return NextResponse.json(item)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const index = inventory.findIndex((i) => i.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    inventory[index] = { ...inventory[index], ...data }
    return NextResponse.json(inventory[index])
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = inventory.findIndex((i) => i.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
  const deleted = inventory.splice(index, 1)
  return NextResponse.json(deleted[0])
}

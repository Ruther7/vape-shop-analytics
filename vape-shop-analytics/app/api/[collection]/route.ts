import { NextResponse } from 'next/server'
import { addRecord, getCollection, isCollectionName, isPlainObject } from '@/backend/db/jsonDatabase'

type RouteContext = {
  params: {
    collection: string
  }
}

function unknownCollectionResponse(collection: string) {
  return NextResponse.json(
    {
      error: `Unknown collection: ${collection}`,
      supported: ['products', 'customers', 'sales', 'employees', 'inventory']
    },
    { status: 404 }
  )
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { collection } = params

  if (!isCollectionName(collection)) {
    return unknownCollectionResponse(collection)
  }

  const data = await getCollection(collection)
  return NextResponse.json({
    collection,
    count: data.length,
    data
  })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { collection } = params

  if (!isCollectionName(collection)) {
    return unknownCollectionResponse(collection)
  }

  const payload = await request.json().catch(() => null)

  if (!isPlainObject(payload)) {
    return NextResponse.json({ error: 'Invalid JSON payload. Expected an object.' }, { status: 400 })
  }

  try {
    const record = await addRecord(collection, payload)
    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Failed to create record.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}


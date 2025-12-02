import { NextResponse } from 'next/server'
import { findRecord, isCollectionName, isPlainObject, removeRecord, updateRecord } from '@/backend/db/jsonDatabase'

type RouteContext = {
  params: {
    collection: string
    id: string
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

function parseId(id: string) {
  const value = Number(id)
  return Number.isFinite(value) ? value : NaN
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { collection, id } = params

  if (!isCollectionName(collection)) {
    return unknownCollectionResponse(collection)
  }

  const recordId = parseId(id)
  if (Number.isNaN(recordId)) {
    return NextResponse.json({ error: 'Record id must be a number.' }, { status: 400 })
  }

  const record = await findRecord(collection, recordId)

  if (!record) {
    return NextResponse.json({ error: `No record found in ${collection} with id ${id}` }, { status: 404 })
  }

  return NextResponse.json(record)
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { collection, id } = params

  if (!isCollectionName(collection)) {
    return unknownCollectionResponse(collection)
  }

  const recordId = parseId(id)
  if (Number.isNaN(recordId)) {
    return NextResponse.json({ error: 'Record id must be a number.' }, { status: 400 })
  }

  const updates = await request.json().catch(() => null)
  if (!isPlainObject(updates)) {
    return NextResponse.json({ error: 'Invalid JSON payload. Expected an object.' }, { status: 400 })
  }

  const updated = await updateRecord(collection, recordId, updates)

  if (!updated) {
    return NextResponse.json({ error: `No record found in ${collection} with id ${id}` }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { collection, id } = params

  if (!isCollectionName(collection)) {
    return unknownCollectionResponse(collection)
  }

  const recordId = parseId(id)
  if (Number.isNaN(recordId)) {
    return NextResponse.json({ error: 'Record id must be a number.' }, { status: 400 })
  }

  const removed = await removeRecord(collection, recordId)

  if (!removed) {
    return NextResponse.json({ error: `No record found in ${collection} with id ${id}` }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}


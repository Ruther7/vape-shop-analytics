import { NextResponse } from 'next/server'
import { readDatabase } from '@/backend/db/jsonDatabase'

export async function GET() {
  try {
    const database = await readDatabase()
    return NextResponse.json(database)
  } catch (error) {
    console.error('Error reading database:', error)
    return NextResponse.json({ error: 'Failed to load database' }, { status: 500 })
  }
}


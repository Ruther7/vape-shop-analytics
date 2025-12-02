import { promises as fs } from 'fs'
import { join } from 'path'
import { COLLECTIONS, type CollectionName } from './collections'
import type { CollectionRecord, Database } from './types'

const DB_PATH = join(process.cwd(), 'backend', 'data', 'database.json')
const MAX_RECORDS_PER_COLLECTION = 20

export function isCollectionName(value: string): value is CollectionName {
  return COLLECTIONS.includes(value as CollectionName)
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function readDatabase(): Promise<Database> {
  const file = await fs.readFile(DB_PATH, 'utf8')
  const parsed = JSON.parse(file)

  COLLECTIONS.forEach((collection) => {
    if (!Array.isArray(parsed[collection])) {
      parsed[collection] = []
    }
  })

  return parsed as Database
}

export async function writeDatabase(database: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(database, null, 2), 'utf8')
}

function sortById(records: CollectionRecord[]): CollectionRecord[] {
  return [...records].sort((a, b) => {
    const aId = Number(a.id) || 0
    const bId = Number(b.id) || 0
    return aId - bId
  })
}

export async function getCollection(name: CollectionName): Promise<CollectionRecord[]> {
  const db = await readDatabase()
  return sortById(db[name])
}

export async function findRecord(name: CollectionName, id: number): Promise<CollectionRecord | null> {
  const collection = await getCollection(name)
  return collection.find((item) => Number(item.id) === id) ?? null
}

export async function addRecord(name: CollectionName, payload: Record<string, unknown>): Promise<CollectionRecord> {
  const database = await readDatabase()
  const collection = database[name]

  if (collection.length >= MAX_RECORDS_PER_COLLECTION) {
    throw new Error(`Cannot add more than ${MAX_RECORDS_PER_COLLECTION} records to ${name}. Delete a record first.`)
  }

  const usedIds = new Set(
    collection
      .map((item) => Number(item.id))
      .filter((value) => Number.isFinite(value) && value > 0) as number[]
  )

  let nextId = 1
  while (usedIds.has(nextId)) {
    nextId += 1
  }

  const record = {
    ...payload,
    id: nextId
  }

  collection.push(record)
  await writeDatabase(database)
  return record
}

export async function updateRecord(
  name: CollectionName,
  id: number,
  updates: Record<string, unknown>
): Promise<CollectionRecord | null> {
  const database = await readDatabase()
  const collection = database[name]
  const index = collection.findIndex((item) => Number(item.id) === id)

  if (index === -1) {
    return null
  }

  const updated = {
    ...collection[index],
    ...updates,
    id
  }

  collection[index] = updated
  await writeDatabase(database)
  return updated
}

export async function removeRecord(name: CollectionName, id: number): Promise<boolean> {
  const database = await readDatabase()
  const collection = database[name]
  const index = collection.findIndex((item) => Number(item.id) === id)

  if (index === -1) {
    return false
  }

  collection.splice(index, 1)
  await writeDatabase(database)
  return true
}


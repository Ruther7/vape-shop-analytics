import type { CollectionName } from '../../backend/db/collections'
import type { CollectionRecord, Database } from '../../backend/db/types'

async function handleJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    const message =
      typeof errorPayload.error === 'string'
        ? errorPayload.error
        : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function fetchDatabase(): Promise<Database> {
  const res = await fetch('/api/data')
  return handleJson<Database>(res)
}

export async function fetchCollection(name: CollectionName): Promise<CollectionRecord[]> {
  const res = await fetch(`/api/${name}`)
  const payload = await handleJson<{ data: CollectionRecord[] }>(res)
  return payload.data
}

export async function createRecord(name: CollectionName, payload: Record<string, unknown>) {
  const res = await fetch(`/api/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  return handleJson<CollectionRecord>(res)
}

export async function updateRecordClient(
  name: CollectionName,
  id: number,
  payload: Record<string, unknown>
) {
  const res = await fetch(`/api/${name}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  return handleJson<CollectionRecord>(res)
}

export async function deleteRecord(name: CollectionName, id: number) {
  const res = await fetch(`/api/${name}/${id}`, {
    method: 'DELETE'
  })
  await handleJson<{ success: boolean }>(res)
}


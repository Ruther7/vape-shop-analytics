import type { CollectionName } from './collections'

export type CollectionRecord = Record<string, unknown> & { id?: number }

export type Database = Record<CollectionName, CollectionRecord[]>


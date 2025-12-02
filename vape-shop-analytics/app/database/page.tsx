'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Database, CollectionRecord } from '@/backend/db/types'
import { COLLECTIONS, COLLECTION_LABELS, type CollectionName } from '@/backend/db/collections'
import { createRecord, deleteRecord, fetchCollection, fetchDatabase } from '@/frontend/lib/apiClient'

const DEFAULT_TAB: CollectionName = 'products'

export default function DatabasePage() {
  const [snapshot, setSnapshot] = useState<Database | null>(null)
  const [activeTab, setActiveTab] = useState<CollectionName>(DEFAULT_TAB)
  const [records, setRecords] = useState<CollectionRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshingSnapshot, setIsRefreshingSnapshot] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteInFlight, setDeleteInFlight] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadSnapshot = useCallback(async () => {
    try {
      setIsRefreshingSnapshot(true)
      const db = await fetchDatabase()
      setSnapshot(db)
    } catch (err) {
      console.error(err)
      setError('Unable to load database snapshot.')
    } finally {
      setIsRefreshingSnapshot(false)
    }
  }, [])

  useEffect(() => {
    loadSnapshot()
  }, [loadSnapshot])

  const loadRecords = useCallback(
    async (collection: CollectionName) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchCollection(collection)
        setRecords(data)
      } catch (err) {
        console.error(err)
        setError(`Failed to load ${COLLECTION_LABELS[collection]} data.`)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    loadRecords(activeTab)
  }, [activeTab, loadRecords])

  const headers = useMemo(() => {
    if (!records.length) return []
    return Object.keys(records[0])
  }, [records])

  const seedRecord = useMemo(() => {
    if (records.length > 0) return records[0]
    return snapshot?.[activeTab]?.[0] ?? null
  }, [records, snapshot, activeTab])

  const formFields = useMemo(() => {
    if (!seedRecord) return []
    return Object.entries(seedRecord)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => ({
        key,
        type: typeof value === 'number' ? 'number' : 'text'
      }))
  }, [seedRecord])

  useEffect(() => {
    if (!formFields.length) {
      setFormValues({})
      return
    }
    setFormValues((prev) => {
      const next: Record<string, string> = {}
      formFields.forEach((field) => {
        next[field.key] = prev[field.key] ?? ''
      })
      return next
    })
  }, [formFields])

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCreate = async () => {
    setFormError(null)
    setSuccessMessage(null)
    if (!formFields.length) {
      setFormError('No sample data available for this table, please add a record via JSON.')
      return
    }

    const payload = formFields.reduce<Record<string, unknown>>((acc, field) => {
      const rawValue = formValues[field.key]
      if (rawValue === '' || rawValue === undefined) {
        return acc
      }

      acc[field.key] = field.type === 'number' ? Number(rawValue) : rawValue
      return acc
    }, {})

    if (Object.keys(payload).length === 0) {
      setFormError('Fill in at least one field.')
      return
    }

    setIsSaving(true)
    try {
      await createRecord(activeTab, payload)
      setFormValues((prev) => {
        const cleared: Record<string, string> = {}
        Object.keys(prev).forEach((key) => {
          cleared[key] = ''
        })
        return cleared
      })
      setSuccessMessage('Record saved.')
      await Promise.all([loadRecords(activeTab), loadSnapshot()])
    } catch (err: any) {
      console.error(err)
      setFormError(err.message ?? 'Failed to save record.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    setSuccessMessage(null)
    setFormError(null)
    setDeleteInFlight(id)
    try {
      await deleteRecord(activeTab, id)
      await Promise.all([loadRecords(activeTab), loadSnapshot()])
      setSuccessMessage(`Record ${id} deleted.`)
    } catch (err: any) {
      console.error(err)
      setFormError(err.message ?? 'Failed to delete record.')
    } finally {
      setDeleteInFlight(null)
    }
  }

  if (!snapshot) {
    return <div className="p-8 text-gray-700">Loading database snapshot...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 no-print flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
          <button
            onClick={loadSnapshot}
            disabled={isRefreshingSnapshot}
            className="rounded border border-blue-200 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-60"
          >
            {isRefreshingSnapshot ? 'Refreshing...' : 'Refresh Stats'}
          </button>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-6">Database View</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-4 no-print">
            {COLLECTIONS.map((collection) => {
              const count = snapshot[collection]?.length ?? 0
              return (
                <button
                  key={collection}
                  onClick={() => setActiveTab(collection)}
                  className={`px-4 py-2 rounded ${
                    activeTab === collection
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {COLLECTION_LABELS[collection]} ({count})
                </button>
              )
            })}
          </div>

          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                {COLLECTION_LABELS[activeTab]} Table
              </h2>
              <p className="text-gray-600">
                Total Records: {snapshot[activeTab]?.length ?? 0}
              </p>
            </div>
            <button
              onClick={() => loadRecords(activeTab)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {isLoading ? 'Loading…' : 'Reload data'}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {records.length === 0 ? (
            <p className="text-gray-600">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left border-b font-semibold text-gray-700"
                      >
                        {header.charAt(0).toUpperCase() + header.slice(1)}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left border-b font-semibold text-gray-700 no-print">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, rowIndex) => {
                    const rowId = typeof row.id === 'number' ? row.id : rowIndex
                    return (
                      <tr key={`${activeTab}-${rowId}`} className="hover:bg-gray-50">
                        {headers.map((header) => (
                          <td key={`${rowId}-${header}`} className="px-4 py-2 border-b text-gray-600">
                            {typeof row[header] === 'number'
                              ? (row[header] as number).toLocaleString()
                              : String(row[header])}
                          </td>
                        ))}
                        <td className="px-4 py-2 border-b text-right text-sm no-print">
                          <button
                            onClick={() => handleDelete(typeof row.id === 'number' ? row.id : undefined)}
                            disabled={deleteInFlight === row.id}
                            className="text-red-600 hover:underline disabled:opacity-60"
                          >
                            {deleteInFlight === row.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add Record</h2>
          {formFields.length === 0 ? (
            <p className="text-gray-600">
              This table doesn’t have a template yet. Add the first row via the API or JSON to unlock the
              guided form.
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Enter values for the fields below. An <code>id</code> will be assigned automatically.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {formFields.map((field) => (
                  <label key={field.key} className="flex flex-col text-sm text-gray-700">
                    {field.key.charAt(0).toUpperCase() + field.key.slice(1)}
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formValues[field.key] ?? ''}
                      onChange={(event) => handleFieldChange(field.key, event.target.value)}
                      className="mt-1 rounded border border-gray-300 px-3 py-2 text-base text-gray-900"
                      placeholder={field.type === 'number' ? '0' : 'Enter text'}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-60"
                >
                  {isSaving ? 'Saving…' : `Save to ${COLLECTION_LABELS[activeTab]}`}
                </button>
                {formError && <span className="text-sm text-red-600">{formError}</span>}
                {successMessage && <span className="text-sm text-green-600">{successMessage}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


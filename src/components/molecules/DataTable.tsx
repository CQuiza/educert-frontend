import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import Spinner from '../atoms/Spinner'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  sortValue?: (item: T) => unknown
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (item: T) => void
  fixed?: boolean
}

function getSortValue<T>(item: T, col: Column<T>): unknown {
  if (col.sortValue) return col.sortValue(item)
  return (item as Record<string, unknown>)[String(col.key)]
}

function compareValues(a: unknown, b: unknown, dir: 'asc' | 'desc'): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return dir === 'asc' ? a - b : b - a
  const aStr = String(a)
  const bStr = String(b)
  return dir === 'asc' ? aStr.localeCompare(bStr, 'es') : bStr.localeCompare(aStr, 'es')
}

export default function DataTable<T>({ columns, data, loading, onRowClick, fixed }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null)

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); return }
      if (sortDir === 'desc') { setSortKey(null); setSortDir(null); return }
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const colMap = new Map(columns.map((c) => [String(c.key), c]))
  const sorted = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    const col = colMap.get(sortKey)
    if (!col) return 0
    return compareValues(getSortValue(a, col), getSortValue(b, col), sortDir)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
        <p className="text-sm">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${fixed ? 'table-fixed' : ''}`}>
        <thead>
          <tr className="border-b border-neutral-200">
            {columns.map((col) => {
              const colKey = String(col.key)
              const canSort = col.sortable ?? colKey !== 'actions'
              const active = sortKey === colKey
              return (
                <th
                  key={colKey}
                  onClick={canSort ? () => handleSort(colKey) : undefined}
                  className={`px-4 py-3 font-medium text-neutral-600 ${canSort ? 'cursor-pointer select-none hover:text-neutral-900' : ''} ${col.className ?? ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {canSort && (
                      <span className="inline-flex flex-col leading-none">
                        <ChevronUp className={`h-3 w-3 -mb-0.5 ${active && sortDir === 'asc' ? 'text-primary-600' : 'text-neutral-300'}`} />
                        <ChevronDown className={`h-3 w-3 -mt-0.5 ${active && sortDir === 'desc' ? 'text-primary-600' : 'text-neutral-300'}`} />
                      </span>
                    )}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => (
            <tr
              key={String((item as Record<string, unknown>).id ?? idx)}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-neutral-100 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-4 py-3 text-neutral-900 ${col.className ?? ''}`}>
                  {col.render ? col.render(item) : ((item as Record<string, unknown>)[col.key as string] as React.ReactNode) ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

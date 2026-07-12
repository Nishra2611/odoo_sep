import { useState, type ReactNode } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TableSkeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ columns, data, rowKey, loading, emptyTitle = 'No records found', emptyDescription, onRowClick }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(col: Column<T>) {
    if (!col.sortValue) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  let rows = data
  if (sortKey) {
    const col = columns.find((c) => c.key === sortKey)
    if (col?.sortValue) {
      rows = [...data].sort((a, b) => {
        const av = col.sortValue!(a)
        const bv = col.sortValue!(b)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
  }

  if (loading) return <TableSkeleton cols={columns.length} />
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn('whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500', col.className)}
              >
                {col.sortValue ? (
                  <button className="flex items-center gap-1 hover:text-ink" onClick={() => toggleSort(col)}>
                    {col.header}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn('border-b border-slate-100 last:border-0', onRowClick && 'cursor-pointer hover:bg-slate-50/80')}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 align-middle text-ink', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

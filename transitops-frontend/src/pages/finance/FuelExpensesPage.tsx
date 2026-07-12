import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { PlusCircle, Fuel, Wallet, Download, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FileUpload } from '@/components/ui/FileUpload'
import { LineChartCard, DonutChartCard } from '@/components/ui/ChartCards'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import type { Expense, ExpenseCategory } from '@/types'

export function FuelExpensesPage() {
  const { push } = useToast()
  const { fuelLogs, expenses, addExpense: contextAddExpense, vehicleById } = useData()

  const [tab, setTab] = useState<'fuel' | 'expenses'>('fuel')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ExpenseCategory>('ALL')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [form, setForm] = useState({ category: 'Fuel' as ExpenseCategory, amount: 2000, vendor: '', notes: '' })

  const kpis = useMemo(() => {
    const totalFuelCost = fuelLogs.reduce((s, f) => s + f.totalCost, 0)
    const avgEfficiency = fuelLogs.length === 0 ? 0 : fuelLogs.reduce((s, f) => s + f.efficiencyKmPerL, 0) / fuelLogs.length
    const anomalies = fuelLogs.filter((f) => f.anomaly).length
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    return { totalFuelCost, avgEfficiency, anomalies, totalExpenses }
  }, [fuelLogs, expenses])

  const monthlySpend = useMemo(() => {
    const buckets: Record<string, number> = {}
    ;[...fuelLogs.map((f) => ({ date: f.date, amount: f.totalCost })), ...expenses.map((e) => ({ date: e.date, amount: e.amount }))].forEach((row) => {
      const key = new Date(row.date).toLocaleDateString('en-IN', { month: 'short' })
      buckets[key] = (buckets[key] ?? 0) + row.amount
    })
    return Object.entries(buckets).map(([month, amount]) => ({ month, amount }))
  }, [fuelLogs, expenses])

  const expenseSplit = useMemo(() => {
    const buckets: Record<string, number> = {}
    expenses.forEach((e) => {
      buckets[e.category] = (buckets[e.category] ?? 0) + e.amount
    })
    return Object.entries(buckets).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const filteredFuel = fuelLogs.filter((f) => vehicleById(f.vehicleId)?.regNumber.toLowerCase().includes(search.toLowerCase()))
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.vendor.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const fuelColumns: Column<(typeof fuelLogs)[number]>[] = [
    { key: 'vehicle', header: 'Vehicle', render: (f) => vehicleById(f.vehicleId)?.regNumber ?? '—' },
    { key: 'date', header: 'Date', sortValue: (f) => f.date, render: (f) => formatDate(f.date) },
    { key: 'liters', header: 'Liters', sortValue: (f) => f.liters, render: (f) => `${f.liters} L` },
    { key: 'cost', header: 'Total cost', sortValue: (f) => f.totalCost, render: (f) => formatCurrency(f.totalCost) },
    { key: 'vendor', header: 'Vendor', render: (f) => f.vendor },
    {
      key: 'efficiency',
      header: 'Efficiency',
      sortValue: (f) => f.efficiencyKmPerL,
      render: (f) => (
        <span className={f.anomaly ? 'text-alert font-medium' : ''}>{f.efficiencyKmPerL} km/L</span>
      ),
    },
    {
      key: 'flag',
      header: 'Flag',
      render: (f) =>
        f.anomaly ? (
          <Badge className="bg-alert-soft text-alert border-alert/30">
            <AlertTriangle className="h-3 w-3" /> Anomaly
          </Badge>
        ) : (
          <Badge className="bg-go-soft text-go border-go/30">
            <CheckCircle2 className="h-3 w-3" /> Normal
          </Badge>
        ),
    },
  ]

  const expenseColumns: Column<Expense>[] = [
    { key: 'category', header: 'Category', render: (e) => e.category },
    { key: 'vehicle', header: 'Vehicle', render: (e) => (e.vehicleId ? vehicleById(e.vehicleId)?.regNumber : 'Fleet-wide') ?? '—' },
    { key: 'amount', header: 'Amount', sortValue: (e) => e.amount, render: (e) => formatCurrency(e.amount) },
    { key: 'date', header: 'Date', sortValue: (e) => e.date, render: (e) => formatDate(e.date) },
    { key: 'vendor', header: 'Vendor', render: (e) => e.vendor },
    {
      key: 'approved',
      header: 'Approval',
      render: (e) =>
        e.approved ? (
          <Badge className="bg-go-soft text-go border-go/30">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        ) : (
          <Badge className="bg-signal-soft text-signal-dim border-signal/30">
            <XCircle className="h-3 w-3" /> Pending
          </Badge>
        ),
    },
  ]

  function handleAddExpense(e: FormEvent) {
    e.preventDefault()
    if (!form.vendor) {
      push('Vendor is required', 'error')
      return
    }
    contextAddExpense({
      vehicleId: null,
      category: form.category,
      amount: form.amount,
      vendor: form.vendor,
      notes: form.notes,
    })
    push('Expense recorded and pending approval')
    setExpenseOpen(false)
    setForm({ category: 'Fuel', amount: 2000, vendor: '', notes: '' })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Fuel & Expenses</h1>
          <p className="text-sm text-slate-500">Fuel efficiency anomalies are flagged automatically from rolling per-vehicle averages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => push('Exporting cost report as CSV…', 'info')}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button onClick={() => setExpenseOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" /> Add expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total fuel cost" value={formatCurrency(kpis.totalFuelCost)} icon={Fuel} accent="signal" />
        <KpiCard label="Avg. efficiency" value={`${kpis.avgEfficiency.toFixed(1)} km/L`} icon={Fuel} accent="route" />
        <KpiCard label="Fuel anomalies flagged" value={kpis.anomalies} icon={AlertTriangle} accent="alert" />
        <KpiCard label="Total other expenses" value={formatCurrency(kpis.totalExpenses)} icon={Wallet} accent="ink" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChartCard title="Monthly cost trend" data={monthlySpend} dataKey="amount" xKey="month" color="#2FB67C" />
        </div>
        <DonutChartCard title="Expense breakdown" data={expenseSplit} />
      </div>

      <Tabs
        tabs={[
          { key: 'fuel', label: 'Fuel logs' },
          { key: 'expenses', label: 'Other expenses' },
        ]}
        active={tab}
        onChange={(k) => setTab(k as any)}
      />

      {tab === 'fuel' ? (
        <Card>
          <div className="border-b border-slate-100 p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by vehicle registration…" className="w-72" />
          </div>
          <CardContent className="px-0 pb-0">
            <DataTable columns={fuelColumns} data={filteredFuel} rowKey={(f) => f.id} emptyTitle="No fuel logs match your search" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by vendor…" className="w-72" />
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)} className="w-40">
              <option value="ALL">All categories</option>
              <option>Fuel</option>
              <option>Toll</option>
              <option>Repair</option>
              <option>Insurance</option>
              <option>Permit</option>
              <option>Misc</option>
            </Select>
          </div>
          <CardContent className="px-0 pb-0">
            <DataTable columns={expenseColumns} data={filteredExpenses} rowKey={(e) => e.id} emptyTitle="No expenses match your filters" />
          </CardContent>
        </Card>
      )}

      <Modal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title="Add expense"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setExpenseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddExpense as any}>
              Save expense
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
            <option>Fuel</option>
            <option>Toll</option>
            <option>Repair</option>
            <option>Insurance</option>
            <option>Permit</option>
            <option>Misc</option>
          </Select>
          <Input label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          <Input label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <FileUpload label="Upload receipt" accept="image/*,.pdf" />
        </form>
      </Modal>
    </div>
  )
}

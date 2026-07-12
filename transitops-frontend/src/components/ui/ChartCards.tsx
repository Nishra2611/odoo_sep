import type { ReactNode } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from './Card'

const AXIS_STYLE = { fontSize: 11, fill: '#7C8798' }
const GRID_COLOR = '#EEF1F5'
const PIE_COLORS = ['#F5A623', '#2F6FED', '#2FB67C', '#E5484D', '#8B93A3']

interface ChartCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
  height?: number
}

function ChartShell({ title, action, children, height = 260 }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>{children}</div>
      </CardContent>
    </Card>
  )
}

export function LineChartCard({
  title,
  data,
  dataKey,
  xKey,
  color = '#2F6FED',
  action,
}: {
  title: string
  data: Record<string, any>[]
  dataKey: string
  xKey: string
  color?: string
  action?: ReactNode
}) {
  return (
    <ChartShell title={title} action={action}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #EEF1F5' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function BarChartCard({
  title,
  data,
  dataKey,
  xKey,
  color = '#F5A623',
  action,
}: {
  title: string
  data: Record<string, any>[]
  dataKey: string
  xKey: string
  color?: string
  action?: ReactNode
}) {
  return (
    <ChartShell title={title} action={action}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #EEF1F5' }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function DonutChartCard({
  title,
  data,
  action,
}: {
  title: string
  data: { name: string; value: number }[]
  action?: ReactNode
}) {
  return (
    <ChartShell title={title} action={action}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #EEF1F5' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

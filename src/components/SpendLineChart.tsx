// @ts-nocheck
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider'
import { subMonths, format } from 'date-fns'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function SpendLineChart() {
  const { subscriptions } = useSubscriptions()

  // compute spends per month last 12 months
  const labels: string[] = []
  const totals: number[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const label = format(monthDate, 'MMM yy')
    labels.push(label)

    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()
    const total = subscriptions.reduce((sum, sub) => {
      const date = sub.nextBillingDate instanceof Date ? sub.nextBillingDate : new Date(sub.nextBillingDate)
      if (date.getMonth() === month && date.getFullYear() === year) {
        return sum + sub.price
      }
      return sum
    }, 0)
    totals.push(Number(total.toFixed(2)))
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Spend',
        data: totals,
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value}`,
        },
      },
    },
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border">
      <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Spend last 12 months</h3>
      <Line data={data} options={options} height={200} />
    </div>
  )
} 
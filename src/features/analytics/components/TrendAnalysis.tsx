import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DateRange } from './DateRangePicker'

interface TrendData {
  date: string
  amount: number
  count: number
}

interface TrendAnalysisProps {
  dateRange: DateRange
  data: TrendData[]
  className?: string
}

export function TrendAnalysis({ dateRange, data, className }: TrendAnalysisProps) {
  const trends = useMemo(() => {
    if (data.length < 2) return null

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstPeriod = sortedData.slice(0, Math.floor(sortedData.length / 2))
    const secondPeriod = sortedData.slice(Math.floor(sortedData.length / 2))

    const firstAvg = firstPeriod.reduce((sum, item) => sum + item.amount, 0) / firstPeriod.length
    const secondAvg = secondPeriod.reduce((sum, item) => sum + item.amount, 0) / secondPeriod.length

    const change = ((secondAvg - firstAvg) / firstAvg) * 100
    const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'

    return {
      change: Math.abs(change),
      trend,
      direction: change > 0 ? 'increasing' : 'decreasing',
      firstAvg,
      secondAvg
    }
  }, [data])

  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0)
  const avgDailySpending = totalSpending / data.length

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={className}>
      {/* Trend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {data.length} days in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgDailySpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per day average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trends ? (
              <div className="flex items-center gap-2">
                {getTrendIcon(trends.trend)}
                <div>
                  <div className="text-2xl font-bold">{trends.change.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {trends.direction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">-</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
          <CardDescription>
            Daily spending patterns over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend Insights */}
      {trends && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Trend Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spending Pattern</span>
                <Badge className={getTrendColor(trends.trend)}>
                  {trends.trend === 'up' ? 'Increasing' : trends.trend === 'down' ? 'Decreasing' : 'Stable'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">First half average:</span>
                  <div className="font-medium">${trends.firstAvg.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Second half average:</span>
                  <div className="font-medium">${trends.secondAvg.toFixed(2)}</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {trends.trend === 'up' && (
                  <p>Your spending has increased by {trends.change.toFixed(1)}% in the second half of this period. Consider reviewing your subscription costs.</p>
                )}
                {trends.trend === 'down' && (
                  <p>Great job! Your spending has decreased by {trends.change.toFixed(1)}% in the second half of this period.</p>
                )}
                {trends.trend === 'stable' && (
                  <p>Your spending has remained relatively stable throughout this period.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
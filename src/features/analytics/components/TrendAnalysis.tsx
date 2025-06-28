import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateRange } from './DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TrendData {
  date: string;
  amount: number;
  count: number;
}

interface TrendAnalysisProps {
  dateRange: DateRange;
  data: TrendData[];
  className?: string;
}

export function TrendAnalysis({
  dateRange,
  data,
  className,
}: TrendAnalysisProps) {
  const [selectedMetric, setSelectedMetric] = useState<'spending' | 'subscriptions'>('spending');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const metrics = [
    {
      value: 'spending',
      label: 'Total Spending',
      description: 'Track your spending over time',
    },
    {
      value: 'subscriptions',
      label: 'Active Subscriptions',
      description: 'Number of active subscriptions',
    },
  ];

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const trends = useMemo(() => {
    if (data.length < 2) return null;

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstPeriod = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondPeriod = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstAvg =
      firstPeriod.reduce((sum, item) => sum + item.amount, 0) /
      firstPeriod.length;
    const secondAvg =
      secondPeriod.reduce((sum, item) => sum + item.amount, 0) /
      secondPeriod.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

    return {
      change: Math.abs(change),
      trend,
      direction: change > 0 ? 'increasing' : 'decreasing',
      firstAvg,
      secondAvg,
    };
  }, [data]);

  const totalSpending = data.reduce((sum, item) => sum + item.amount, 0);
  const avgDailySpending = totalSpending / data.length;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>
            Analyze spending patterns and trends over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select value={selectedMetric} onValueChange={(value: 'spending' | 'subscriptions') => setSelectedMetric(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.value} value={metric.value}>
                      <div>
                        <div className="font-medium">{metric.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={selectedPeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <p>Chart will be displayed here</p>
              <p className="text-sm">Showing {selectedMetric} trends ({selectedPeriod})</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">+12.5%</div>
              <div className="text-sm text-muted-foreground">vs last period</div>
            </div>
            <div>
              <div className="text-2xl font-bold">$1,234</div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">$5,678</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpending.toFixed(2)}
            </div>
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
            <div className="text-2xl font-bold">
              ${avgDailySpending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per day average</p>
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
                  <div className="text-2xl font-bold">
                    {trends.change.toFixed(1)}%
                  </div>
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
                  tickFormatter={value =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis tickFormatter={value => `$${value}`} />
                <Tooltip
                  labelFormatter={value => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    'Amount',
                  ]}
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
                  {trends.trend === 'up'
                    ? 'Increasing'
                    : trends.trend === 'down'
                      ? 'Decreasing'
                      : 'Stable'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    First half average:
                  </span>
                  <div className="font-medium">
                    ${trends.firstAvg.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Second half average:
                  </span>
                  <div className="font-medium">
                    ${trends.secondAvg.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {trends.trend === 'up' && (
                  <p>
                    Your spending has increased by {trends.change.toFixed(1)}%
                    in the second half of this period. Consider reviewing your
                    subscription costs.
                  </p>
                )}
                {trends.trend === 'down' && (
                  <p>
                    Great job! Your spending has decreased by{' '}
                    {trends.change.toFixed(1)}% in the second half of this
                    period.
                  </p>
                )}
                {trends.trend === 'stable' && (
                  <p>
                    Your spending has remained relatively stable throughout this
                    period.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

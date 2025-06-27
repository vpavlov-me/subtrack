import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DateRangePicker,
  DateRange,
} from '@/features/analytics/components/DateRangePicker';
import { ReportExporter } from '@/features/analytics/components/ReportExporter';
import { TrendAnalysis } from '@/features/analytics/components/TrendAnalysis';
import { DashboardCategoryChart } from '@/components/DashboardCategoryChart';
import KPICards from '@/components/KPICards';
import SpendLineChart from '@/components/SpendLineChart';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { subDays, format } from 'date-fns';
import Skeleton from '@/components/ui/skeleton';

interface Subscription {
  id: string;
  name: string;
  price: number;
  category: string;
  next_billing_date: string;
}

interface CategoryData {
  category: string;
  total: number;
  count: number;
}

interface TrendData {
  date: string;
  amount: number;
  count: number;
}

export default function Analytics() {
  const user = useUser() as any;
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    categoryData: [] as CategoryData[],
    trendData: [] as TrendData[],
    kpiData: {
      totalSpending: 0,
      activeSubscriptions: 0,
      averageMonthlyCost: 0,
      savingsOpportunity: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch subscriptions for the date range
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', (user as any).id)
        .gte('next_billing_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('next_billing_date', format(dateRange.to, 'yyyy-MM-dd'));

      if (subs) {
        setSubscriptions(subs as Subscription[]);

        // Calculate analytics data
        const totalSpending = subs.reduce((sum, sub) => sum + sub.price, 0);
        const activeSubscriptions = subs.length;
        const averageMonthlyCost = totalSpending / activeSubscriptions || 0;

        // Mock trend data - in real app this would come from database
        const trendData: TrendData[] = Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
          amount: Math.random() * 100 + 50,
          count: Math.floor(Math.random() * 5) + 1,
        }));

        // Mock category data
        const categoryData: CategoryData[] = [
          { category: 'Entertainment', total: 45.99, count: 3 },
          { category: 'Productivity', total: 29.99, count: 2 },
          { category: 'Health', total: 19.99, count: 1 },
          { category: 'Education', total: 15.99, count: 1 },
        ];

        setAnalyticsData({
          categoryData,
          trendData,
          kpiData: {
            totalSpending,
            activeSubscriptions,
            averageMonthlyCost,
            savingsOpportunity: totalSpending * 0.15, // 15% potential savings
          },
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-72" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Deep insights into your subscription spending patterns
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Over Time</CardTitle>
                <CardDescription>Monthly spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <SpendLineChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Spending distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardCategoryChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <TrendAnalysis dateRange={dateRange} data={analyticsData.trendData} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown by subscription category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardCategoryChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Insights</CardTitle>
                <CardDescription>Recommendations and insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.categoryData.map(category => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.count} subscriptions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${category.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(
                          (category.total /
                            analyticsData.kpiData.totalSpending) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>
                    Preview of your selected report data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Date Range:
                        </span>
                        <div className="font-medium">
                          {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                          {format(dateRange.to, 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total Records:
                        </span>
                        <div className="font-medium">
                          {subscriptions.length}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Sample Data</h4>
                      <div className="text-sm text-muted-foreground">
                        {subscriptions.slice(0, 3).map(sub => (
                          <div
                            key={sub.id}
                            className="flex justify-between py-1"
                          >
                            <span>{sub.name}</span>
                            <span>${sub.price}</span>
                          </div>
                        ))}
                        {subscriptions.length > 3 && (
                          <div className="text-center py-2 text-muted-foreground">
                            ... and {subscriptions.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ReportExporter dateRange={dateRange} data={subscriptions} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

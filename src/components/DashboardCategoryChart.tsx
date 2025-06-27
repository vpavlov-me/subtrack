import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useCurrency } from '@/features/currency/CurrencyProvider';
import { supabase } from '@/lib/supabase';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryData {
  category: string;
  subscription_count: number;
  monthly_revenue: number;
  yearly_revenue: number;
  avg_price: number;
  min_price: number;
  max_price: number;
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
];

export function DashboardCategoryChart() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userCurrency, convert, formatAmount } = useCurrency();

  const fetchCategoryData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc(
        'get_user_category_analytics',
        { user_id_param: user.id }
      );

      if (error) {
        console.error('Failed to fetch category analytics:', error);
        return;
      }

      // Convert currencies and format data for chart
      const formattedData =
        data?.map((item: CategoryData) => ({
          ...item,
          monthly_revenue: convert(item.monthly_revenue, 'USD', userCurrency),
          yearly_revenue: convert(item.yearly_revenue, 'USD', userCurrency),
          avg_price: convert(item.avg_price, 'USD', userCurrency),
          min_price: convert(item.min_price, 'USD', userCurrency),
          max_price: convert(item.max_price, 'USD', userCurrency),
        })) || [];

      setCategoryData(formattedData);
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Refresh the materialized view
      await supabase.rpc('refresh_category_analytics');
      await fetchCategoryData();
    } catch (error) {
      console.error('Error refreshing category data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [userCurrency]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading category data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No category data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.monthly_revenue,
    subscription_count: item.subscription_count,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monthly: {formatAmount(data.value, userCurrency)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Subscriptions: {data.subscription_count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Spending by Category
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshData}
          disabled={refreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total Categories</p>
            <p className="font-medium">{categoryData.length}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total Monthly</p>
            <p className="font-medium">
              {formatAmount(
                categoryData.reduce(
                  (sum, item) => sum + item.monthly_revenue,
                  0
                ),
                userCurrency
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

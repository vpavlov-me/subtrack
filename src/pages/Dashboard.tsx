import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SubscriptionForm from '@/components/SubscriptionForm';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  format,
  isBefore,
  isToday,
} from 'date-fns';
import { useSubscriptions } from '@/features/subscriptions/SubscriptionsProvider';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { exportToCSV, importFromCSV } from '@/features/subscriptions/api';
import { Filter } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
} from '@/features/subscriptions/types';
import MonthlySpendWidget from '@/components/MonthlySpendWidget';
import SpendLineChart from '@/components/SpendLineChart';
import { SubscriptionList } from '@/features/subscriptions/components/SubscriptionList';
import KPICards from '@/components/KPICards';
import { usePlanGuard } from '@/features/billing/hooks/usePlanGuard';
import { UpgradeModal } from '@/features/billing/components/UpgradeModal';
import { toast } from 'sonner';
import { DashboardCategoryChart } from '@/components/DashboardCategoryChart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FadeIn,
  SlideIn,
  StaggeredList,
  LoadingSpinner,
} from '@/components/ui/transitions';
import { useCurrency } from '@/features/currency/CurrencyProvider';

// Категории можно получать динамически из подписок, но оставим дефолтный набор + "All"
const defaultCategories = [
  'Entertainment',
  'Productivity',
  'Utilities',
  'Education',
  'Business',
  'Health',
];

// Тип данных, приходящих из формы подписки
type SubscriptionFormValues = {
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'custom';
  nextPayment: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
};

function CalendarView({
  subscriptions,
  onEdit,
}: {
  subscriptions: Subscription[];
  onEdit: (sub: Subscription) => void;
}) {
  const [month, setMonth] = useState(new Date());
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }
  // Группируем подписки по дате
  const subsByDate: Record<string, Subscription[]> = {};
  subscriptions.forEach(sub => {
    const key =
      typeof sub.nextBillingDate === 'string'
        ? sub.nextBillingDate
        : format(sub.nextBillingDate, 'yyyy-MM-dd');
    if (!subsByDate[key]) subsByDate[key] = [];
    subsByDate[key].push(sub);
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonth(subMonths(month, 1))}
        >
          <span className="sr-only">Prev</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <div className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          {format(month, 'MMMM yyyy')}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <span className="sr-only">Next</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-zinc-500 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(d, month);
          const isPast = isBefore(d, new Date()) && !isToday(d);
          const subs = subsByDate[key] || [];
          const total = subs.reduce(
            (sum, s) =>
              sum +
              (typeof s.price === 'number' ? s.price : parseFloat(s.price)),
            0
          );
          const currency = subs[0]?.currency || '';
          return (
            <div
              key={key}
              className={`rounded-xl min-h-[64px] p-1 flex flex-col gap-1 border ${isCurrentMonth ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800'} ${isToday(d) ? 'border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-700'} ${isPast && !isToday(d) ? 'opacity-50' : ''}`}
            >
              <div
                className={`text-xs font-semibold text-right pr-1 ${isToday(d) ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}
              >
                {d.getDate()}
              </div>
              {subs.map(sub => (
                <Button
                  key={sub.id}
                  variant="ghost"
                  className="justify-between px-1 h-7 w-full text-xs font-medium text-zinc-900 dark:text-zinc-100"
                  onClick={() => onEdit(sub)}
                >
                  <span>{sub.name}</span>
                  <span className="ml-1 text-zinc-500 dark:text-zinc-300">
                    {sub.currency} {sub.price}
                  </span>
                </Button>
              ))}
              {subs.length > 1 && (
                <div className="text-xs text-zinc-700 dark:text-zinc-200 mt-1 text-right font-semibold">
                  Total: {currency} {total.toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Empty state */}
      {Object.keys(subsByDate).filter(
        date =>
          date >= format(monthStart, 'yyyy-MM-dd') &&
          date <= format(monthEnd, 'yyyy-MM-dd')
      ).length === 0 && (
        <div className="text-center text-zinc-400 py-12">
          No upcoming payments this month
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const {
    subscriptions,
    filteredSubscriptions,
    categoryFilter: category,
    setCategoryFilter: setCategory,
    billingCycleFilter: billingCycle,
    setBillingCycleFilter: setBillingCycle,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    reload,
  } = useSubscriptions();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<'list' | 'calendar'>('list');

  // CSV import
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState('');

  // Plan guard
  const {
    canAddSubscription,
    showUpgradeModal,
    openUpgradeModal,
    closeUpgradeModal,
    subscriptionCount,
    maxSubscriptions,
  } = usePlanGuard();

  const filtered = filteredSubscriptions;

  // For demo, add loading state
  const loading = false;
  const [isLoading, setIsLoading] = useState(true);

  const { userCurrency } = useCurrency();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const totalSpend = subscriptions.reduce(
    (sum, sub) => sum + (sub.price || 0),
    0
  );
  const activeSubscriptions = subscriptions.filter(
    sub => sub.status === 'active'
  );
  const upcomingRenewals = subscriptions
    .filter(sub => sub.status === 'active')
    .sort(
      (a, b) =>
        new Date(a.nextBillingDate).getTime() -
        new Date(b.nextBillingDate).getTime()
    )
    .slice(0, 5);

  const kpiCards = [
    {
      title: 'Total Spend',
      value: `${userCurrency}${totalSpend.toFixed(2)}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions.length.toString(),
      change: '+2',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Monthly Average',
      value: `${userCurrency}${(totalSpend / Math.max(activeSubscriptions.length, 1)).toFixed(2)}`,
      change: '-5.2%',
      trend: 'down' as const,
      icon: TrendingUp,
    },
  ];

  if (loading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </FadeIn>

        <StaggeredList className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </StaggeredList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function handleAdd(sub: SubscriptionFormValues) {
    if (!canAddSubscription) {
      openUpgradeModal();
      return;
    }

    const { nextPayment, ...rest } = sub;
    const payload: SubscriptionCreate = {
      ...rest,
      nextBillingDate: new Date(nextPayment),
    };
    void addSubscription(payload);
    setOpen(false);
  }

  function handleEdit(sub: Subscription) {
    setEditSub(sub);
    setEditOpen(true);
  }

  function handleEditSave(values: SubscriptionFormValues) {
    if (!editSub) return;
    const { nextPayment, ...rest } = values;
    const payload: SubscriptionUpdate = {
      ...rest,
      nextBillingDate: new Date(nextPayment),
    };
    void updateSubscription(editSub.id, payload);
    setEditOpen(false);
    setEditSub(null);
  }

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  function confirmDelete() {
    if (deleteId) void deleteSubscription(deleteId);
    setDeleteId(null);
  }

  // CSV handlers
  function handleExportCSV() {
    const csv = exportToCSV(subscriptions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleImportCSV() {
    try {
      const result = await importFromCSV(importData);

      if (result.success && result.data) {
        // Refresh subscriptions list
        await reload();

        // Show success message with count
        toast.success(
          `Successfully imported ${result.data.length} subscription(s)`
        );

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            toast.warning(warning);
          });
        }

        setImportData('');
        setImportOpen(false);
      } else {
        // Show errors
        if (result.errors) {
          result.errors.forEach(error => {
            toast.error(error);
          });
        }
      }
    } catch (err) {
      console.error('CSV import failed', err);
      toast.error(
        'Failed to import CSV. Please check the format and try again.'
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Your Subscriptions</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportOpen(true)}>
                Import CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canAddSubscription}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
              </DialogHeader>
              <SubscriptionForm onSubmit={handleAdd} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plan limit warning */}
      {!canAddSubscription && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Free Plan Limit Reached
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You have {subscriptionCount}/{maxSubscriptions} subscriptions.
                Upgrade to Pro for unlimited subscriptions.
              </p>
            </div>
            <Button size="sm" onClick={openUpgradeModal}>
              Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Фильтры и summary */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        {/* Desktop filters */}
        <div className="hidden md:flex gap-4 items-center">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {[
                'All',
                ...Array.from(
                  new Set([
                    ...defaultCategories,
                    ...subscriptions.map(s => s.category || '').filter(Boolean),
                  ])
                ),
              ].map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">Monthly</span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={v => setBillingCycle(v ? 'yearly' : 'monthly')}
            />
            <span className="text-sm text-zinc-600">Yearly</span>
          </div>
        </div>

        {/* Mobile filter popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden gap-1">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] space-y-4 md:hidden">
            <div className="space-y-2">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'All',
                    ...Array.from(
                      new Set([
                        ...defaultCategories,
                        ...subscriptions
                          .map(s => s.category || '')
                          .filter(Boolean),
                      ])
                    ),
                  ].map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Monthly</span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={v => setBillingCycle(v ? 'yearly' : 'monthly')}
              />
              <span className="text-sm">Yearly</span>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Widgets row */}
      <div className="grid md:grid-cols-2 gap-4">
        <MonthlySpendWidget />
        <SpendLineChart />
      </div>

      {/* Category Analytics */}
      <DashboardCategoryChart />

      {/* Tabs: List/Calendar */}
      <Tabs
        value={tab}
        onValueChange={v => setTab(v as 'list' | 'calendar')}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {/* Mobile: card grid */}
          <div className="md:hidden">
            <SubscriptionList
              subscriptions={filtered}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Desktop: таблица */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-zinc-400"
                    >
                      No subscriptions yet.{' '}
                      <Button variant="link" onClick={() => setOpen(true)}>
                        Add one
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-zinc-900">
                        {sub.name}
                      </TableCell>
                      <TableCell>
                        {sub.nextBillingDate instanceof Date
                          ? format(sub.nextBillingDate, 'yyyy-MM-dd')
                          : sub.nextBillingDate}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {userCurrency}
                          {sub.price}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded px-2 text-xs text-zinc-700 border-zinc-300 bg-zinc-100"
                        >
                          {sub.billingCycle.charAt(0).toUpperCase() +
                            sub.billingCycle.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded px-2 text-xs text-zinc-700 bg-zinc-50 border-zinc-200"
                        >
                          {sub.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span className="sr-only">Actions</span>
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="5" cy="12" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="19" cy="12" r="1.5" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(sub)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(sub.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="calendar">
          <Card className="p-4">
            <CalendarView subscriptions={filtered} onEdit={handleEdit} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog для редактирования */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {editSub && (
            <SubscriptionForm
              defaultValues={
                editSub
                  ? {
                      name: editSub.name,
                      price: editSub.price,
                      currency: editSub.currency ?? 'USD',
                      billingCycle: editSub.billingCycle,
                      nextPayment: format(
                        editSub.nextBillingDate,
                        'yyyy-MM-dd'
                      ),
                      category: editSub.category ?? 'General',
                      paymentMethod: editSub.paymentMethod,
                      notes: editSub.notes,
                    }
                  : undefined
              }
              onSubmit={handleEditSave}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog для подтверждения удаления */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>Delete subscription?</DialogTitle>
          </DialogHeader>
          <div className="text-zinc-500 mb-4">
            Это действие нельзя отменить.
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog для импорта CSV */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-textarea">CSV data</Label>
              <Textarea
                id="csv-textarea"
                className="h-32"
                value={importData}
                onChange={e => setImportData(e.target.value)}
                placeholder="Paste CSV here..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setImportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportCSV}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={closeUpgradeModal}
        currentCount={subscriptionCount}
        maxCount={maxSubscriptions}
      />
    </div>
  );
}

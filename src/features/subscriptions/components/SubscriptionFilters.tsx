import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type SortField = 'name' | 'price' | 'nextBillingDate';
export type SortOrder = 'asc' | 'desc';
export type BillingCycleFilter = 'all' | 'monthly' | 'yearly';

interface Props {
  sortField: SortField;
  sortOrder: SortOrder;
  billingCycleFilter: BillingCycleFilter;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onBillingCycleFilterChange: (cycle: BillingCycleFilter) => void;
}

export function SubscriptionFilters({
  sortField,
  sortOrder,
  billingCycleFilter,
  onSortFieldChange,
  onSortOrderChange,
  onBillingCycleFilterChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as SortField)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="nextBillingDate">Next Billing Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Order</Label>
        <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as SortOrder)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Billing Cycle</Label>
        <Select value={billingCycleFilter} onValueChange={(value) => onBillingCycleFilterChange(value as BillingCycleFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Billing Cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 
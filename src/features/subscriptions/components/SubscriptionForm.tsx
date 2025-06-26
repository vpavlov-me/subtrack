import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubscriptionCreate } from '../types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency required'),
  billingCycle: z.enum(['monthly', 'yearly', 'custom']),
  nextBillingDate: z.date(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: SubscriptionCreate) => void;
}

export function SubscriptionForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: new Date(),
    },
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Netflix, Spotify, etc."
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          placeholder="9.99"
        />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input
          id="currency"
          {...register('currency')}
          placeholder="USD, EUR, etc."
        />
        {errors.currency && (
          <p className="text-sm text-red-500">{errors.currency.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="billingCycle">Billing Cycle</Label>
        <Select
          onValueChange={(value) => setValue('billingCycle', value as 'monthly' | 'yearly' | 'custom')}
          defaultValue="monthly"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select billing cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {errors.billingCycle && (
          <p className="text-sm text-red-500">{errors.billingCycle.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextBillingDate">Next Billing Date</Label>
        <Input
          id="nextBillingDate"
          type="date"
          {...register('nextBillingDate', { valueAsDate: true })}
        />
        {errors.nextBillingDate && (
          <p className="text-sm text-red-500">{errors.nextBillingDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...register('category')} placeholder="e.g. SaaS, Hosting" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input id="paymentMethod" {...register('paymentMethod')} placeholder="Visa **** 4242" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea id="notes" className="w-full border rounded p-2" rows={3} {...register('notes')} />
      </div>

      <Button type="submit" className="w-full">
        Add Subscription
      </Button>
    </form>
  );
} 
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Subscription, SubscriptionUpdate } from '../types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  billingCycle: z.enum(['monthly', 'yearly', 'custom']),
  nextBillingDate: z.date(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  subscription: Subscription | null;
  onClose: () => void;
  onSave: (data: SubscriptionUpdate) => void;
}

export function SubscriptionEditDialog({
  subscription,
  onClose,
  onSave,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (subscription) {
      setValue('name', subscription.name);
      setValue('price', subscription.price);
      setValue('billingCycle', subscription.billingCycle);
      setValue('nextBillingDate', subscription.nextBillingDate);
    } else {
      reset();
    }
  }, [subscription, setValue, reset]);

  const onSubmit = (data: FormData) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={!!subscription} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              onValueChange={value =>
                setValue(
                  'billingCycle',
                  value as 'monthly' | 'yearly' | 'custom'
                )
              }
              defaultValue={subscription?.billingCycle}
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
              <p className="text-sm text-red-500">
                {errors.billingCycle.message}
              </p>
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
              <p className="text-sm text-red-500">
                {errors.nextBillingDate.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

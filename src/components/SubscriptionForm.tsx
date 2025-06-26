import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const schema = z.object({
  name: z.string().min(2, 'Введите название'),
  price: z.coerce.number().min(0.01, 'Цена > 0'),
  currency: z.string().min(1),
  billingCycle: z.enum(['monthly', 'yearly', 'custom']),
  nextPayment: z.string().min(1),
  category: z.string().min(1),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
})

type SubscriptionFormValues = z.infer<typeof schema>

const currencies = ['USD', 'EUR', 'RUB']
const categories = ['Entertainment', 'Productivity', 'Utilities', 'Other']

export default function SubscriptionForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<SubscriptionFormValues>
  onSubmit: (values: SubscriptionFormValues) => void
  onCancel?: () => void
}) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit((data) => { onSubmit(data); reset(); })}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} autoFocus />
        {errors.name && <div className="text-sm text-red-500 mt-1">{errors.name.message}</div>}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
          {errors.price && <div className="text-sm text-red-500 mt-1">{errors.price.message}</div>}
        </div>
        <div className="flex-1">
          <Label htmlFor="currency">Currency</Label>
          <Select value={watch('currency') || ''} onValueChange={v => setValue('currency', v)}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(cur => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currency && <div className="text-sm text-red-500 mt-1">{errors.currency.message}</div>}
        </div>
      </div>
      <div>
        <Label>Billing cycle</Label>
        <RadioGroup defaultValue={defaultValues?.billingCycle || 'monthly'} onValueChange={v => setValue('billingCycle', v as 'monthly' | 'yearly' | 'custom')} className="flex gap-4 mt-1">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly">Yearly</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom">Custom</Label>
          </div>
        </RadioGroup>
        {errors.billingCycle && <div className="text-sm text-red-500 mt-1">{errors.billingCycle.message}</div>}
      </div>
      <div>
        <Label htmlFor="nextPayment">Next payment date</Label>
        <Input id="nextPayment" type="date" {...register('nextPayment')} />
        {errors.nextPayment && <div className="text-sm text-red-500 mt-1">{errors.nextPayment.message}</div>}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={watch('category') || ''} onValueChange={v => setValue('category', v)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <div className="text-sm text-red-500 mt-1">{errors.category.message}</div>}
      </div>
      <div>
        <Label htmlFor="paymentMethod">Payment method</Label>
        <Input id="paymentMethod" {...register('paymentMethod')} />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={2} />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
} 
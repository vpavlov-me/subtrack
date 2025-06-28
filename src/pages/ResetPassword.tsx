import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Введите корректный email'),
});

type ResetForm = z.infer<typeof schema>;

export default function ResetPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(data: ResetForm) {
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: window.location.origin + '/reset-password/confirm',
    });
    if (error) {
      toast.error(error.message || 'Ошибка отправки письма');
    } else {
      setSent(true);
      toast.success('Письмо для сброса пароля отправлено');
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm p-6 rounded-2xl border bg-white shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">Сброс пароля</h1>
        {sent ? (
          <div className="text-green-600 text-center">Проверьте e-mail для восстановления пароля.</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} disabled={isSubmitting} />
              {errors.email && <div className="text-sm text-red-500 mt-1">{errors.email.message}</div>}
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Сбросить пароль'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
} 
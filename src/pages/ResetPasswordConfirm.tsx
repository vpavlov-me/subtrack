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
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirm: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
}).refine(data => data.password === data.confirm, {
  message: 'Пароли не совпадают',
  path: ['confirm'],
});

type ConfirmForm = z.infer<typeof schema>;

export default function ResetPasswordConfirm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ConfirmForm>({
    resolver: zodResolver(schema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(data: ConfirmForm) {
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      toast.error(error.message || 'Ошибка смены пароля');
    } else {
      setSuccess(true);
      toast.success('Пароль успешно изменён!');
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm p-6 rounded-2xl border bg-white shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">Новый пароль</h1>
        {success ? (
          <div className="text-green-600 text-center">Пароль изменён. <a href="/login" className="underline">Войти</a></div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="password">Новый пароль</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} disabled={isSubmitting} />
              {errors.password && <div className="text-sm text-red-500 mt-1">{errors.password.message}</div>}
            </div>
            <div>
              <Label htmlFor="confirm">Повторите пароль</Label>
              <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} disabled={isSubmitting} />
              {errors.confirm && <div className="text-sm text-red-500 mt-1">{errors.confirm.message}</div>}
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем...' : 'Сменить пароль'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
} 
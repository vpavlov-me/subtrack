import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/AuthProvider';
import { useState } from 'react';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

const schema = z
  .object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirm: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  })
  .refine(data => data.password === data.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  });

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });
  const { signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(data: RegisterForm) {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        toast.error(error.message || 'Ошибка регистрации');
      } else {
        toast.success('Регистрация успешна! Проверьте email для подтверждения.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) toast.error(error.message);
    } catch (e) {
      toast.error('Ошибка входа через соц. сеть');
    }
  }

  async function handleDevRegister() {
    setIsSubmitting(true);
    try {
      // Dev backdoor: auto-register with test credentials
      const { error } = await signUp('dev@subtrack.dev', 'dev123');
      if (error) {
        toast.error('Dev register failed: ' + error.message);
      } else {
        toast.success('Dev registration successful');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Dev register error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-2 text-zinc-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm p-6 rounded-2xl border bg-white shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">Регистрация</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <div className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <div className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="confirm">Повторите пароль</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
              disabled={isSubmitting}
            />
            {errors.confirm && (
              <div className="text-sm text-red-500 mt-1">
                {errors.confirm.message}
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-zinc-500">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-zinc-900 underline">
            Войти
          </Link>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" variant="outline" className="w-full flex items-center gap-2 justify-center" onClick={() => handleOAuth('google')}>
            <FcGoogle className="w-5 h-5" /> Войти через Google
          </Button>
          <Button type="button" variant="outline" className="w-full flex items-center gap-2 justify-center" onClick={() => handleOAuth('github')}>
            <FaGithub className="w-5 h-5" /> Войти через GitHub
          </Button>
        </div>
        {import.meta.env.DEV && (
          <div className="mt-4 pt-4 border-t border-zinc-200">
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-xs text-zinc-500 hover:text-zinc-700"
              onClick={handleDevRegister}
              disabled={isSubmitting}
            >
              🚀 Dev Register (dev@subtrack.dev)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

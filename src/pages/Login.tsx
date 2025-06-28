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

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });
  const { signIn, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Debug: Check if we're in development mode
  console.log('🔧 Login component: import.meta.env.DEV =', import.meta.env.DEV);
  console.log('🔧 Login component: import.meta.env.MODE =', import.meta.env.MODE);
  console.log('🔧 Login component: import.meta.env =', import.meta.env);

  async function onSubmit(data: LoginForm) {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(error.message || 'Ошибка входа');
      } else {
        toast.success('Успешный вход');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Произошла ошибка при входе');
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

  async function handleDevLogin() {
    console.log('🚀 Dev login button clicked');
    setIsSubmitting(true);
    try {
      console.log('🔧 Calling signIn with dev credentials...');
      // Dev backdoor: auto-login with test credentials
      const { error } = await signIn('dev@subtrack.dev', 'dev123');
      console.log('🔧 SignIn result:', { error });
      
      if (error) {
        console.error('❌ Dev login failed:', error);
        toast.error('Dev login failed: ' + error.message);
      } else {
        console.log('✅ Dev login successful');
        toast.success('Dev login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Dev login error:', error);
      toast.error('Dev login error: ' + (error as Error).message);
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
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">
          Вход в SubTrack
        </h1>
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
              autoComplete="current-password"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <div className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-zinc-500">
          <Link to="/reset-password" className="text-zinc-900 underline mr-2">
            Забыли пароль?
          </Link>
          Нет аккаунта?{' '}
          <Link to="/register" className="text-zinc-900 underline">
            Зарегистрироваться
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
        {/* Debug: Always show dev button for now */}
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <div className="text-xs text-zinc-400 mb-2">
            DEV: {import.meta.env.DEV ? 'true' : 'false'} | MODE: {import.meta.env.MODE}
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-xs text-zinc-500 hover:text-zinc-700"
            onClick={handleDevLogin}
            disabled={isSubmitting}
          >
            🚀 Dev Login (dev@subtrack.dev)
          </Button>
        </div>
      </Card>
    </div>
  );
}

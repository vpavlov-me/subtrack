import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@workos-inc/authkit-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirm: z.string().min(6),
}).refine(data => data.password === data.confirm, {
  message: 'Пароли не совпадают',
  path: ['confirm'],
})

type RegisterForm = z.infer<typeof schema>

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  })
  const { signUp, isLoading } = useAuth()

  function onSubmit(_data: RegisterForm) {
    void _data
    signUp()
  }

  if (isLoading) return null

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm p-6 rounded-2xl border bg-white shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900">Регистрация</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <div className="text-sm text-red-500 mt-1">{errors.email.message}</div>}
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <div className="text-sm text-red-500 mt-1">{errors.password.message}</div>}
          </div>
          <div>
            <Label htmlFor="confirm">Повторите пароль</Label>
            <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} />
            {errors.confirm && <div className="text-sm text-red-500 mt-1">{errors.confirm.message}</div>}
          </div>
          <Button type="submit" className="w-full mt-2">Зарегистрироваться</Button>
        </form>
        <div className="mt-4 text-center text-sm text-zinc-500">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-zinc-900 underline">Войти</Link>
        </div>
      </Card>
    </div>
  )
} 
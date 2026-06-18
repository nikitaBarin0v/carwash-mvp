import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLocation } from "react-router-dom"

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/'

  async function onSubmit(data: LoginForm) {
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('Неверный email или пароль')
      setIsLoading(false)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-64px)] px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Вход в аккаунт</CardTitle>
          <CardDescription>Введите email и пароль для входа</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='example@mail.com' {...register('email')} />
              {errors.email && (
                <p className='text-sm text-destructive'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Пароль</Label>
              <Input id='password' type='password' placeholder='••••••••' {...register('password')} />
              {errors.password && (
                <p className='text-sm text-destructive'>{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className='text-sm text-destructive'>{error}</p>
            )}

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Входим...' : 'Войти'}
            </Button>

            <p className='text-sm text-center text-muted-foreground'>
              Нет аккаунта?{' '}
              <Link to='/register' className='text-primary hover:underline'>
                Зарегистрироваться
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
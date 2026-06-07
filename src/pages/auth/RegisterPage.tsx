import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Пароли не совпадают',
  path: ['confirm_password'],
});

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name
        },
      }
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    navigate('/')
  }


  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-64px)] px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт для записи на мойку</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='full_name'>Имя</Label>
              <Input id='full_name' placeholder='Иван Иванов' {...register('full_name')} />
              {errors.full_name && (
                <p className='text-sm text-destructive'>{errors.full_name.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='example@mail.com' {...register('email')} />
              {errors.password && (
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

            <div className='space-y-2'>
              <Label htmlFor='confirm_password'>Повторите пароль</Label>
              <Input id='confirm_password' type='password' placeholder='••••••••' {...register('confirm_password')} />
              {errors.confirm_password && (
                <p className='text-sm text-destructive'>{errors.confirm_password.message}</p>
              )}
            </div>

            {error && (
              <p className='text-sm text-destructive'>{error}</p>
            )}

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Регистрируем' : 'Зарегистрироваться'}
            </Button>

            <p className='text-sm text-center text-muted-foreground'>
              Уже есть аккаунт?{' '}
              <Link to='/login' className='text-primary hover:underline'>Войти</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
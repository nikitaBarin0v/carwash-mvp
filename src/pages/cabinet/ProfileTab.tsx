import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const profileSchema = z.object({
  full_name: z.string().min(2, 'Минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер'),
  car_brand: z.string().min(2, 'Введите марку'),
  car_model: z.string().min(1, 'Введите модель'),
  car_year: z.coerce.number()
    .min(1990, 'Минимальный год 1990')
    .max(new Date().getFullYear(), 'Некорректный год')
    .optional(),
})

type ProfileForm = z.infer<typeof profileSchema>


export function ProfileTab() {
  const { profile } = useAuthContext();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      car_brand: profile?.car_brand ?? '',
      car_model: profile?.car_model ?? '',
      car_year: profile?.car_year ?? undefined,
    }
  });

  async function onSubmit(data: ProfileForm) {
    if (!profile) return
    setIsLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        car_brand: data.car_brand,
        car_model: data.car_model,
        car_year: data.car_year ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (!error) {
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Личные данные</CardTitle>
        <CardDescription>
          Заполните данные — они будут автоматически подставляться при записи
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-lg'>
          <div className='space-y-2'>
            <Label htmlFor='full_name'>Имя</Label>
            <Input id='full_name' placeholder='Иван Иванов' {...register('full_name')} />
            {errors.full_name && (
              <p className='text-sm text-destructive'>{errors.full_name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Номер телефона</Label>
            <Input id='phone' placeholder='+7 (999) 000-00-00' {...register('phone')} />
            {errors.phone && (
              <p className='text-sm text-destructive'>{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car_brand">Марка</Label>
              <Input id="car_brand" placeholder="Toyota" {...register('car_brand')} />
              {errors.car_brand && (
                <p className="text-sm text-destructive">{errors.car_brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_model">Модель</Label>
              <Input id="car_model" placeholder="Camry" {...register('car_model')} />
              {errors.car_model && (
                <p className="text-sm text-destructive">{errors.car_model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_year">Год</Label>
              <Input id="car_year" type="number" placeholder="2020" {...register('car_year')} />
              {errors.car_year && (
                <p className="text-sm text-destructive">{errors.car_year.message}</p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-4 pt-2'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Сохраняем...' : 'Сохранить'}
            </Button>
            {isSaved && (
              <p className='text-sm text-green-600'>✓ Данные сохранены</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
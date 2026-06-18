import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useAuthContext } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { PhoneInput } from "@/components/shared/PhoneInput"

const WORK_HOURS_START = 8;
const WORK_HOURS_END = 20;
const SLOT_DURATION = 30;
const BOXES_COUNT = 3;

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = WORK_HOURS_START; h < WORK_HOURS_END; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

interface WashProgram {
  id: string
  name: string
  description: string | null
  price: number
  duration_min: number
}

interface BookedSlot {
  time_slot: string
  box_id: string
}

const bookingSchema = z.object({
  client_name: z.string().min(2, 'Минимум 2 символа'),
  client_phone: z.string().min(10, 'Введите корректный номер'),
  car_brand: z.string().min(2, 'Введите марку автомобиля'),
  car_model: z.string().min(1, 'Введите модель автомобиля')
})

type BookingForm = z.infer<typeof bookingSchema>

export function BookingPage() {
  const { user, profile } = useAuthContext();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<WashProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WashProgram | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [boxes, setBoxes] = useState<{ id: string; number: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      client_name: profile?.full_name ?? '',
      client_phone: profile?.phone ?? '',
      car_brand: profile?.car_brand ?? '',
      car_model: profile?.car_model ?? '',
    }
  })

  useEffect(() => {
    if (profile) {
      setValue('client_name', profile.full_name ?? '')
      setValue('client_phone', profile.phone ?? '')
      setValue('car_brand', profile.car_brand ?? '')
      setValue('car_model', profile.car_model ?? '')
    }
  }, [profile, setValue])

  useEffect(() => {
    async function fetchData() {
      const programsResult = await supabase
        .from('wash_programs')
        .select('*')
        .eq('is_active', true)
        .order('price')

      const boxesResult = await supabase
        .from('boxes')
        .select('*')
        .eq('is_active', true)

      if (programsResult.data) setPrograms(programsResult.data)
      if (boxesResult.data) setBoxes(boxesResult.data)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedDate) return

    async function fetchBookedSlots() {
      const dateStr = format(selectedDate!, 'yyyy-MM-dd')
      const { data } = await supabase
        .from('bookings')
        .select('time_slot, box_id')
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled')

      if (data) setBookedSlots(data as BookedSlot[])
    }
    fetchBookedSlots()
  }, [selectedDate])

  function getSlotAvailability(time: string) {
    const booked = bookedSlots.filter(s => s.time_slot === time + ':00')
    const available = BOXES_COUNT - booked.length
    return available
  }

  function findAvailableBox(time: string): string | null {
    const bookedBoxIds = bookedSlots
      .filter(s => s.time_slot === time + ':00')
      .map(s => s.box_id)

    const freeBox = boxes.find(b => !bookedBoxIds.includes(b.id))
    return freeBox?.id ?? null
  }

  async function onSubmit(data: BookingForm) {
    if (!selectedProgram || !selectedDate || !selectedTime) return

    setIsLoading(true)

    const boxId = findAvailableBox(selectedTime)
    if (!boxId) {
      alert('К сожалению, это время уже занято. Выберите другое.')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from('bookings').insert({
      user_id: user?.id ?? null,
      box_id: boxId,
      program_id: selectedProgram.id,
      client_name: data.client_name,
      client_phone: data.client_phone,
      car_brand: data.car_brand,
      car_model: data.car_model,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTime + ':00',
      status: 'pending',
      total_price: selectedProgram.price
    })

    if (error) {
      console.log('booking error:', JSON.stringify(error))
      alert('Ошибка при записи. Попробуйте другое время.')
      setIsLoading(false)
      return
    }

    setIsSubmitted(true)
    setIsLoading(false)
  }

  function isSlotTooSoon(date: Date, time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    return slotDateTime < oneHourFromNow
  }

  if (isSubmitted) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-64px)] px-4'>
        <Card className='w-full max-w-md text-center'>
          <CardContent className='pt-10 pb-8 space-y-4'>
            <div className='text-6xl'>✅</div>
            <h2 className='text-2xl font-bold text-gray-900'>Запись подтверждена!</h2>
            <p className='text-gray-500'>
              Вы записаны на{' '}
              <span className='font-medium text-gray-900'>
                {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </span>{' '}
              в <span className='font-medium text-gray-900'>{selectedTime}</span>
            </p>
            <p className='text-gray-500'>
              Программа: {' '}
              <span className='font-medium text-gray-900'>{selectedProgram?.name}</span>
            </p>
            <div className='flex flex-col gap-3 pt-4'>
              <Button onClick={() => navigate('/')}>На главную</Button>
              {user && (
                <Button variant='outline' onClick={() => navigate('/cabinet')}>Мои записи</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold text-gray-900 mb-2'>Запись на мойку</h1>
      <p className='text-gray-500 mb-8'>Заполните форму и выберите удобное время</p>

      <div className='flex items-center gap-2 mb-8'>
        {[1, 2, 3].map((s) => (
          <div key={s} className='flex items-center gap-2'>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              step >= s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400'
            )}>
              {s}
            </div>
            {s < 3 && (
              <div className={cn(
                'h-0.5 w-12 transition-colors',
                step > s ? 'bg-blue-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
        <div className='ml-2 text-sm text-gray-500'>
          {step === 1 && 'Выберите программу'},
          {step === 2 && 'Выберите дату и время'},
          {step === 3 && 'Контактные данные'},
        </div>
      </div>

      {step === 1 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {programs.map((program) => (
            <Card key={program.id} className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedProgram?.id === program.id
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'hover:border-blue-300'
            )} onClick={() => setSelectedProgram(program)}>
              <CardHeader>
                <CardTitle className='text-lg'>{program.name}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <p className='text-2xl font-bold text-blue-600'>{program.price} ₽</p>
                <p className='text-sm text-gray-500'>⏱ {program.duration_min} мин</p>
              </CardContent>
            </Card>
          ))}
          <div className='col-span-full flex justify-end'>
            <Button onClick={() => setStep(2)} disabled={!selectedProgram}>
              Далее →
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Выберите дату</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode='single' selected={selectedDate} onSelect={setSelectedDate} locale={ru} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0,))}
                className='rounded-md' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Выберите время</CardTitle>
              {selectedDate && (
                <CardDescription>
                  {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              {!selectedDate ? (
                <p className='text-sm text-gray-400'>Сначала выберите дату</p>
              ) : (
                <div className='grid grid-cols-3 gap-2'>
                  {TIME_SLOTS.map((time) => {
                    const available = getSlotAvailability(time);
                    const isUnavailable = available === 0;
                    const isSelected = selectedTime === time;
                    const isTooSoon = selectedDate
                      ? isSlotTooSoon(selectedDate, time)
                      : false
                    const isDisabled = isUnavailable || isTooSoon;

                    return (
                      <button
                        key={time}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedTime(time)}
                        className={cn(
                          'py-2 px-3 rounded-lg text-sm font-medium border transition-all',
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isUnavailable
                              ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                        )}
                      >
                        {time}
                        {!isUnavailable && !isSelected && (
                          <span className='block text-xs text-gray-400'>
                            {available} бокс{available === 1 ? '' : available < 5 ? 'а' : 'ов'}
                          </span>
                        )}
                        {isUnavailable && !isTooSoon && (
                          <span className='block text-xs'>Занято</span>
                        )}
                        {isTooSoon && !isUnavailable && (
                          <span className='block text-xs'>Недоступно</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className='col-span-full flex justify-between'>
            <Button variant='outline' onClick={() => setStep(1)}>
              ← Назад
            </Button>
            <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime}>
              Далее →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className='max-w-lg'>
          <Card className='mb-6 bg-blue-50 border-blue-100'>
            <CardContent className='pt-4 pb-4'>
              <div className='flex flex-wrap gap-3 text-sm'>
                <Badge variant='secondary'>
                  {selectedProgram?.name} - {selectedProgram?.price} ₽
                </Badge>
                <Badge variant='secondary'>
                  {selectedDate && format(selectedDate, 'd MMM', { locale: ru })} в {selectedTime}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='client_name'>Ваше имя</Label>
              <Input
                id='client_name'
                placeholder='Иван Иванов'
                {...register('client_name')}
              />
              {errors.client_name && (
                <p className='text-sm text-destructive'>{errors.client_name.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='client_phone'>Номер телефона</Label>
              <Controller
                name='client_phone'
                control={control}
                render={({ field }) => (
                  <PhoneInput value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.client_phone && (
                <p className='text-sm text-destructive'>{errors.client_phone.message}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='car_brand'>Марка авто</Label>
                <Input
                  id='car_brand'
                  placeholder='Toyota'
                  {...register('car_brand')}
                />
                {errors.car_brand && (
                  <p className='text-sm text-destructive'>{errors.car_brand.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='car_model'>Модель авто</Label>
                <Input
                  id='car_model'
                  placeholder='Camry'
                  {...register('car_model')}
                />
                {errors.car_model && (
                  <p className='text-sm text-destructive'>{errors.car_model.message}</p>
                )}
              </div>
            </div>

            {user && (
              <p className='text-sm text-gray-500'>
                ✓ Данные подгружены из вашего профиля
              </p>
            )}

            <div className='flex justify-between pt-2'>
              <Button variant='outline' type='button' onClick={() => setStep(2)}>
                ← Назад
              </Button>

              <Button type='submit' disabled={isLoading}>{isLoading ? 'Записываем...' : 'Записаться'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
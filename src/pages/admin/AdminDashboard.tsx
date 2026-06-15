import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Booking {
  id: string
  client_name: string
  client_phone: string
  car_brand: string
  car_model: string
  time_slot: string
  status: string
  total_price: number
  boxes: { number: number } | null
  wash_programs: { name: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string; next: string | null }> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800', next: 'in_progress' },
  in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-800', next: 'completed' },
  completed: { label: 'Завершено', color: 'bg-green-100 text-green-800', next: null },
  cancelled: { label: 'Отменено', color: 'bg-gray-100 text-gray-500', next: null },
}

const STATUS_NEXT_LABEL: Record<string, string> = {
  pending: 'В работу →',
  in_progress: 'Завершить ✓'
}

export function AdminDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), 'd MMMM yyyy', { locale: ru })

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `booking_date=eq.${today}`,
      }, () => fetchBookings())
      .subscribe()

    return () => { supabase.removeChannel(channel) }

  }, [])

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_phone,
        car_brand,
        car_model,
        time_slot,
        status,
        total_price,
        boxes (number),
        wash_programs (name)  
      `)
      .eq('booking_date', today)
      .order('time_slot')

    if (data) setBookings(data as Booking[])
      setIsLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (newStatus === 'completed') {
      const booking = bookings.find(b => b.id === id)
      if (booking) await updateLoyalty(id, booking.total_price)
    }

    fetchBookings()
  }

  async function updateLoyalty(bookingId: string, price: number) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id')
      .eq('id', bookingId)
      .single()
    
    if (!booking?.user_id) return 

    const { data: loyalty } = await supabase
      .from('loyalty_points')
      .select('points, total_visits, total_spent')
      .eq('user_id', booking.user_id)
      .single()
    
    if (!loyalty) return 

    await supabase
      .from('loyalty_points')
      .update({
        points: loyalty.points + 10,
        total_visits: loyalty.total_visits + 1,
        total_spent: loyalty.total_spent + price,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', booking.user_id)
  }

  const totalBookings = bookings.filter(b => b.status !== 'cancelled').length
  const inProgress = bookings.filter(b => b.status === 'in_progress').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const totalRevenue = bookings 
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0)

  if (isLoading) return <p className='text-muted-foreground'>Загрузка...</p>

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Дашборд</h1>
        <p className='text-muted-foreground'>{todayLabel}</p>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Записей на сегодня</p>
            <p className='text-3xl font-bold text-gray-900'>{totalBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>В работе</p>
            <p className='text-3xl font-bold text-blue-600'>{inProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Завершено</p>
            <p className='text-3xl font-bold text-green-600'>{completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Выручка за день</p>
            <p className='text-3xl font-bold text-blue-600'>{totalRevenue}</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {[1, 2, 3].map((boxNum) => {
          const activeBooking = bookings.find(
            b => b.boxes?.number === boxNum && b.status === 'in_progress'
          )
          return (
            <Card key={boxNum} className={activeBooking ? 'border-blue-400' : ''}>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Бокс {boxNum}</CardTitle>
              </CardHeader>
              <CardContent>
                {activeBooking ? (
                  <div className='space-y-1'>
                    <span className='inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium'>
                      В работе
                    </span>
                    <p className='text-sm font-medium'>
                      {activeBooking.car_brand} {activeBooking.car_model}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {activeBooking.client_name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {activeBooking.wash_programs?.name}
                    </p>
                  </div>
                ) : (
                  <span className='inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium'>
                    Свободен
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Записи на сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className='text-muted-foreground text-sm'>Записей на сегодня нет</p>
          ) : (
            <div className='space-y-3'>
              {bookings.map((booking) => {
                const status = STATUS_MAP[booking.status];
                const nextStatus = status.next;

                return (
                  <div
                    key={booking.id}
                    className='flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3'
                  >
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className='font-medium'>
                          {booking.time_slot.slice(0, 5)}
                        </span>
                        <span className='text-muted-foreground'>
                          Бокс {booking.boxes?.number}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className='text-sm font-medium'>
                        {booking.client_name} · {booking.client_phone}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {booking.car_brand} {booking.car_model} · {booking.wash_programs?.name}
                      </p>
                    </div>
                    <div className='flex flex-center gap-3'>
                      <span className='font-semibold text-blue-600'>
                        {booking.total_price} ₽
                      </span>
                      {nextStatus && (
                        <Button
                          size='sm'
                          variant={nextStatus === 'completed' ? 'default' : 'outline'}
                          onClick={() => updateStatus(booking.id, nextStatus)}
                        >
                          {STATUS_NEXT_LABEL[booking.status]}
                        </Button>
                      )}
                      {booking.status === 'pending' && (
                        <Button
                          size='sm'
                          variant='ghost'
                          className='text-red-500 hover;text-red-700'
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                        >
                          Отменить
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
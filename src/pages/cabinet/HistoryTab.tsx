import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { supabase } from "@/lib/supabase"
import { useAuthContext } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Booking {
  id: string
  booking_data: string
  time_slot: string
  status: string
  total_price: number
  client_name: string
  car_brand: string
  car_model: string
  wash_program: {
    name: string
  } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Завершено', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменено', color: 'bg-gray-100 text-gray-500' },
}

export function HistoryTab() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  });

  useEffect(() => {
    if (!user) return
    fetchBookings()
    fetchStats()
  }, [user])

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        status,
        total_price,
        client_name,
        car_brand,
        car_model,  
        wash_programs (name)
      `)
      .eq('user_id', user!.id)
      .order('booking_date', { ascending: false })

    if (data) setBookings(data as unknown as Booking[])
    setIsLoading(false)
  }

  async function fetchStats() {
    const { data: loyaltyData } = await supabase
      .from('loyalty_points')
      .select('points, total_visits, total_spent')
      .eq('user_id', user!.id)
      .single()

    if (loyaltyData) {
      setStats({
        totalVisits: loyaltyData.total_visits,
        totalSpent: loyaltyData.total_spent,
        loyaltyPoints: loyaltyData.points,
      })
    }
  }

  async function cancelBooking(id: string) {
    if (!confirm('Отменить запись?')) return

    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)

    fetchBookings()
  }

  if (isLoading) {
    return <p className='text-muted-foreground'>Загрузка...</p>
  }

  return (
    <div className='space-y-6'>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Всего моек</p>
            <p className='text-3xl font-bold text-blue-600'>{stats.totalVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Потрачено всего</p>
            <p className='text-3xl font-bold text-blue-600'>{stats.totalSpent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Баллы лояльности</p>
            <p className='text-3xl font-bold text-blue-600'>{stats.loyaltyPoints}</p>
            <p className='text-xs text-muted-foreground mt-1'>
              До скидки 15%: {Math.max(0, 10 - stats.totalVisits)} моек
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>История записей</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className='text-muted-foreground text-sm'>У вас пока нет записей</p>
          ) : (
            <div className='space-y-3'>
              {bookings.map((booking) => {
                const status = STATUS_MAP[booking.status];
                const isPending = booking.status === 'pending';
                const date = new Date(booking.booking_data);
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

                return (
                  <div key={booking.id} className='flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className='font-medium'>
                          {format(date, 'd MMMM yyyy', { locale: ru })}
                        </span>
                        <span className='text-muted-foreground'>
                          {booking.time_slot.slice(0, 5)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {booking.wash_program?.name} · {booking.car_brand} {booking.car_model}
                      </p>
                    </div>

                    <div className='flex items-center gap-3'>
                      <span className='font-semibold text-blue-600'>
                        {booking.total_price} ₽
                      </span>
                      {isPending && !isPast && (
                        <button onClick={() => cancelBooking(booking.id)} className='text-sm text-red-500 hover:text-red-700 hover;underline'>
                          Отменить
                        </button>
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
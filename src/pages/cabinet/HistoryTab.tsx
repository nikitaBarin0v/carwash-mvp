import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuthContext } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/shared/Spinner"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'

interface Booking {
  id: string
  booking_date: string
  time_slot: string
  status: string
  total_price: number
  client_name: string
  car_brand: string
  car_model: string
  wash_programs: { name: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Завершено', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменено', color: 'bg-gray-100 text-gray-500' },
}

export function HistoryTab() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  })

  useEffect(() => {
    if (!user) return
    fetchBookings()
    fetchStats()
  }, [user])

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, booking_date, time_slot, status, total_price,
        client_name, car_brand, car_model,
        wash_programs (name)
      `)
      .eq('user_id', user!.id)
      .order('booking_date', { ascending: false })

    if (data) setBookings(data as unknown as Booking[])
    setIsLoading(false)
  }

  async function fetchStats() {
    const { data } = await supabase
      .from('loyalty_points')
      .select('points, total_visits, total_spent')
      .eq('user_id', user!.id)
      .single()

    if (data) {
      setStats({
        totalVisits: data.total_visits,
        totalSpent: data.total_spent,
        loyaltyPoints: data.points,
      })
    }
  }

  async function confirmCancel() {
    if (!cancelId) return
    setIsCancelling(true)

    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', cancelId)

    setCancelId(null)
    setIsCancelling(false)
    fetchBookings()
  }

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <Spinner />
    </div>
  )

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Всего моек</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Потрачено всего</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalSpent} ₽</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Баллы лояльности</p>
            <p className="text-3xl font-bold text-blue-600">{stats.loyaltyPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">
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
            <EmptyState
              icon="🚗"
              title="Записей пока нет"
              description="Вы ещё не записывались на мойку. Запишитесь прямо сейчас!"
              action={{ label: 'Записаться на мойку', onClick: () => navigate('/booking') }}
            />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const status = STATUS_MAP[booking.status]
                const isPending = booking.status === 'pending'
                const date = new Date(booking.booking_date)
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {format(date, 'd MMMM yyyy', { locale: ru })}
                        </span>
                        <span className="text-muted-foreground">
                          {booking.time_slot.slice(0, 5)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.wash_programs?.name} · {booking.car_brand} {booking.car_model}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-blue-600">
                        {booking.total_price} ₽
                      </span>
                      {isPending && !isPast && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setCancelId(booking.id)}
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

      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить запись?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Вы уверены что хотите отменить запись на мойку?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelId(null)}
              disabled={isCancelling}
            >
              Не отменять
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Отменяем...' : 'Да, отменить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
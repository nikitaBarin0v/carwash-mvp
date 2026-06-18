import { useEffect, useState } from "react"
import { format, addDays } from "date-fns"
import { ru } from "date-fns/locale"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  client_name: string
  client_phone: string
  car_brand: string
  car_model: string
  time_slot: string
  status: string
  box_id: string
  wash_programs: { name: string } | null
}

interface Box {
  id: string
  number: number
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = 8 + Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200',
}

export function AdminSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [boxes, setBoxes] = useState<Box[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    fetchBoxes()
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [selectedDate])

  async function fetchBoxes() {
    const { data } = await supabase
      .from('boxes')
      .select('id, number')
      .eq('is_active', true)
      .order('number')
    if (data) setBoxes(data)
  }

  async function fetchBookings() {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, client_name, client_phone, car_brand, car_model,
        time_slot, status, box_id,
        wash_programs (name)
      `)
      .eq('booking_date', dateStr)
      .neq('status', 'cancelled')
    if (data) setBookings(data as Booking[])
  }

  async function confirmCancel() {
    if (!selectedBooking) return
    setIsCancelling(true)

    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', selectedBooking.id)

    setSelectedBooking(null)
    setIsCancelling(false)
    fetchBookings()
  }

  function getBooking(boxId: string, time: string) {
    return bookings.find(
      b => b.box_id === boxId && b.time_slot === time + ':00'
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
      </div>

      {/* Навигация по датам */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(d => addDays(d, -1))}>
          ←
        </Button>
        <span className="font-medium min-w-40 text-center">
          {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
        </span>
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(d => addDays(d, 1))}>
          →
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
          Сегодня
        </Button>
      </div>

      {/* Сетка расписания */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="w-20 py-2" />
              {boxes.map(box => (
                <th key={box.id} className="py-2 px-2">
                  <div className="bg-gray-100 rounded-lg py-2 text-center text-sm font-medium">
                    Бокс {box.number}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(time => (
              <tr key={time}>
                <td className="text-xs text-muted-foreground pr-3 py-1 text-right w-20">
                  {time}
                </td>
                {boxes.map(box => {
                  const booking = getBooking(box.id, time)
                  return (
                    <td key={box.id} className="py-1 px-1">
                      <div
                        className={cn(
                          "h-10 rounded border text-xs flex items-center px-2 truncate mx-1",
                          booking
                            ? cn(STATUS_COLORS[booking.status], "cursor-pointer hover:opacity-80")
                            : "border-gray-100 bg-gray-50"
                        )}
                        onClick={() => booking && setSelectedBooking(booking)}
                      >
                        {booking ? (
                          <span className="truncate">
                            {booking.car_brand} {booking.car_model} · {booking.client_name}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Диалог с деталями записи и отменой */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Запись</DialogTitle>
            <DialogDescription>
              Детали записи и управление
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Клиент</p>
                  <p className="font-medium">{selectedBooking.client_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Телефон</p>
                  <p className="font-medium">{selectedBooking.client_phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Автомобиль</p>
                  <p className="font-medium">
                    {selectedBooking.car_brand} {selectedBooking.car_model}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Программа</p>
                  <p className="font-medium">{selectedBooking.wash_programs?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Время</p>
                  <p className="font-medium">{selectedBooking.time_slot.slice(0, 5)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Статус</p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    STATUS_COLORS[selectedBooking.status]
                  )}>
                    {selectedBooking.status === 'pending' && 'Ожидает'}
                    {selectedBooking.status === 'in_progress' && 'В работе'}
                    {selectedBooking.status === 'completed' && 'Завершено'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedBooking(null)}
              disabled={isCancelling}
            >
              Закрыть
            </Button>
            {selectedBooking?.status === 'pending' && (
              <Button
                variant="destructive"
                onClick={confirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Отменяем...' : 'Отменить запись'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
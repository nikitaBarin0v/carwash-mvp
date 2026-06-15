import { useEffect, useState } from "react"
import { format, subDays } from "date-fns"
import { ru } from "date-fns/locale"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DayStat {
  date: string
  total: number
  completed: number
  cancelled: number
  revenue: number
}

export function AdminAnalytics() {
  const [stats, setStats] = useState<DayStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [])

  async function fetchStats() {
    const days = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    );

    const results = await Promise.all(
      days.map(async (date) => {
        const { data } = await supabase
          .from('bookings')
          .select('status, total_price')
          .eq('booking_date', date)

        if (!data) return { date, total: 0, completed: 0, cancelled: 0, revenue: 0 }

        return {
          date,
          total: data.filter(b => b.status !== 'cancelled').length,
          completed: data.filter(b => b.status === 'completed').length,
          cancelled: data.filter(b => b.status === 'cancelled').length,
          revenue: data
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + b.total_price, 0),
        }
      })
    )

    setStats(results.reverse());
    setIsLoading(false);
  }

  const totalRevenue = stats.reduce((sum, d) => sum + d.revenue, 0);
  const totalCompleted = stats.reduce((sum, d) => sum + d.cancelled, 0);

  if (isLoading) return <p className='text-muted-foreground'>Загрузка...</p>

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Аналитика</h1>
        <p className='text-muted-foreground'>Последние 7 дней</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Выручка за 7 дней</p>
            <p className='text-3xl font-bold text-blue-600'>{totalRevenue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>Завершено моек</p>
            <p className='text-3xl font-bold text-blue-600'>{totalCompleted}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>По дням</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {stats.map((day) => (
              <div
                key={day.date}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div>
                  <p className='font-medium text-sm'>
                    {format(new Date(day.date), 'd MMMM', { locale: ru })}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Записей: {day.total} · Завершено: {day.completed} · Отменено: {day.cancelled}
                  </p>
                </div>
                <p className='font-semibold text-blue-600'>{day.revenue} ₽</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
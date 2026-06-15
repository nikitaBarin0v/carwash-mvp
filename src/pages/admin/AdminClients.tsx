import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Client {
  id: string
  full_name: string | null
  phone: string | null
  car_brand: string | null
  car_model: string | null
  created_at: string
  loyalty_points: { points: number; total_visits: number; total_spent: number }[]
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    const { data } = await supabase
      .from('profiles')
      .select(`
        id, full_name, phone, car_brand, car_model, created_at, loyalty_points (points, total_visits, total_spent)  
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    if (data) setClients(data as unknown as Client[])
    setIsLoading(false)
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();

    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.car_brand?.toLowerCase().includes(q) ||
      c.car_model?.toLowerCase().includes(q)
    )
  })

  if (isLoading) return <p className='text-muted-foreground'>Загрузка...</p>

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Клиенты</h1>
        <p className='text-muted-foreground'>Всего: {clients.length}</p>
      </div>

      <Input
        placeholder='Поиск по имени, телефону, марке авто...'
        value={search}
        onChange={e => setSearch(e.target.value)}
        className='max-w-sm'
      />

      <div className='space-y-3'>
        {filtered.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Клиент не найден</p>
        ) : (
          filtered.map(client => {
            const loyalty = client.loyalty_points[0];
            return (
              <Card key={client.id}>
                <CardContent className='pt-4 pb-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                    <div className='space-y-1'>
                      <p className='font-medium'>
                        {client.full_name ?? 'Имя не указано'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {client.phone ?? 'Телефон не указано'}
                      </p>
                      {(client.car_brand || client.car_model) && (
                        <p className='text-sm text-muted-foreground'>
                          {client.full_name ?? 'Имя не указано'}
                        </p>
                      )}
                      <p className='text-sm text-muted-foreground'>
                        С нами с {format(new Date(client.created_at), 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                    {loyalty && (
                      <div className='flex gap-4 text-center shrink-0'>
                        <div>
                          <p className='text-lg font-bold text-blue-600'>{loyalty.total_visits}</p>
                          <p className='text-xs text-muted-foreground'>моек</p>
                        </div>
                        <div>
                          <p className='text-lg font-bold text-blue-600'>{loyalty.total_spent}</p>
                          <p className='text-xs text-muted-foreground'>потрачено</p>
                        </div>
                        <div>
                          <p className='text-lg font-bold text-blue-600'>{loyalty.points}</p>
                          <p className='text-xs text-muted-foreground'>баллов</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
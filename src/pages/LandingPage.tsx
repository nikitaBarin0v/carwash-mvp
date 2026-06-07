import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const programs = [
  {
    name: 'Экспресс',
    description: 'Наружная мойка кузова, продувка дверных проёмов',
    price: 300,
    duration: 20,
    badge: null,
  },
  {
    name: 'Стандарт',
    description: 'Кузов + колёса + пороги + сушка',
    price: 600,
    duration: 30,
    badge: 'Популярный',
  },
  {
    name: 'Комплексная',
    description: 'Стандарт + чернение резины + зеркала + стёкла',
    price: 900,
    duration: 45,
    badge: null,
  },
  {
    name: 'Премиум',
    description: 'Комплексная + пылесос салона + влажная уборка торпеды',
    price: 1500,
    duration: 60,
    badge: 'Хит',
  },
  {
    name: 'Детейлинг',
    description: 'Полная полировка кузова + защитное керамическое покрытие',
    price: 3000,
    duration: 120,
    badge: 'Премиум',
  },
]

const features = [
  {
    icon: '🚗',
    title: '3 бокса',
    description: 'Три современных бокса для одновременного обслуживания',
  },
  {
    icon: '📅',
    title: 'Онлайн запись',
    description: 'Записывайтесь на удобное время без звонков',
  },
  {
    icon: '⭐',
    title: 'Программа лояльности',
    description: 'Накапливайте баллы и получайте скидки',
  },
  {
    icon: '⚡',
    title: 'Быстро и качественно',
    description: 'Профессиональное оборудование и опытные мастера',
  },
]


export function LandingPage() {
  return (
    <main>
      <section className='bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-6'>
            Профессиональная мойка вашего автомобиля
          </h1>
          <p className='text-xl text-blue-100 mb-10 max-w-2xl mx-auto'>
            Запишитесь онлайн, выберите удобное время и доверьте уход за вашим авто профессионалам
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/booking'>
              <Button size='lg' className='bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto'>
                Записаться на мойку
              </Button>
            </Link>
            <a href="#programs">
              <Button size='lg' variant='outline' className='bg-transparent border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto'>
                Смотреть программы
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className='py-16 px-4 bg-gray-50'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
            Почему выбирают нас
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature) => (
              <Card key={feature.title} className='text-center border-0 shadow-sm'>
                <CardContent className='pt-6'>
                  <div className='text-4xl mb-4'>{feature.icon}</div>
                  <h3 className='font-semibold text-gray-900 mb-2'>{feature.title}</h3>
                  <p className='text-sm text-gray-500'>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id='programs' className='py-16 px-4'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-4'>
            Программы мойки
          </h2>
          <p className='text-center text-gray-500 mb-12'>
            Выберите подходящую программу и запишитесь онлайн
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {programs.map((program) => (
              <Card key={program.name} className='relative hover:shadow-md transition-shadow'>
                {program.badge && (
                  <Badge className='absolute top-4 right-4 bg-blue-600'>
                    {program.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{program.name}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-end gap-1'>
                    <span className='text-3xl font-bold text-blue-600'>{program.price} ₽</span>
                  </div>
                  <p className='text-sm text-gray-500'>⏱ Время: {program.duration} мин</p>
                  <Link to='/booking'>
                    <Button className='w-full mt-2'>Записаться</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='py-16 px-4 bg-blue-600 text-white'>
        <div className='max-w-2xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-4'>Готовы записаться?</h2>
          <p className='text-blue-100 mb-8'>Выберите удобное время и доверьте уход за вашим авто профессионалам</p>
          <Link to='/booking'>
            <Button size='lg' className='bg-white text-blue-600 hover:bg-blue-50'>Записаться сейчас</Button>
          </Link>
        </div>
      </section>

      <footer className='py-8 px-4 bg-gray-900 text-gray-400'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='font-semibold text-white'>АвтоМойка</p>
          <p className='text-sm'>Работаем ежедневно с 08:00 до 20:00</p>
          <p className='text-sm'>© 2026 АвтоМойка. Все права защищены.</p>
        </div>
      </footer>
    </main>
  )
}
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase'

export function Header() {
  const { user, profile, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <header className='border-b bg-white sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
        <Link to='/' className='font-bold text-xl text-blue-600'>
          Автомойка
        </Link>

        <nav className='hidden md:flex items-center gap-6'>
          <Link to='/' className='text-sm text-gray-600 hover:text-blue-600 transition-colors'>Главная</Link>
          <Link to='/booking' className='text-sm text-gray-600 hover:text-blue-600 transition-colors'>Записаться</Link>

          {isAdmin && (
            <Link to='/admin' className='text-sm text-gray-600 hover:text-blue-600 transition-colors'>
              Админ панель
            </Link>
          )}
        </nav>

        <div className='flex items-center gap-3'>
          {user ? (
            <>
              <Link to='/cabinet'>
                <Button variant='outline' size='sm'>
                  {profile?.full_name ?? 'Личный кабинет'}
                </Button>
              </Link>
              <Button variant='ghost' size='sm' onClick={handleSignOut}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to='/login'>
                <Button variant='outline' size='sm'>
                  Войти
                </Button>
              </Link>
              <Link to='/register'>
                <Button size='sm'>
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
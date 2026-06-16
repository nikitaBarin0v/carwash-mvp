import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, profile, isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const navLinks = [
    { to: '/', label: 'Главная' },
    { to: '/booking', label: 'Записаться' },
    ...(isAdmin ? [{ to: '/admin', label: 'Админ панель' }] : []),
  ]

  return (
    <header className='border-b bg-white sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
        <Link to='/' className='font-bold text-xl text-blue-600 shrink-0'>
          Автомойка
        </Link>

        <nav className='hidden md:flex items-center gap-6'>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'text-sm transition-colors',
                location.pathname === link.to
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-blue-600'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='hidden md:flex items-center gap-3'>
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

        <button
          className='md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-100 transition-colors'
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label='Меню'
        >
          <span className={cn(
            'block w-6 h-0.5 bg-gray-700 transition-transform duration-300',
            isMenuOpen && 'translate-y-2 rotate-45'
          )} />
          <span className={cn(
            'block w-6 h-0.5 bg-gray-700 transition-opacity duration-300',
            isMenuOpen && 'opacity-0'
          )} />
          <span className={cn(
            'block w-6 h-0.5 bg-gray-700 transition-transform duration-300',
            isMenuOpen && '-translate-y-2 -rotate-45'
          )} />
        </button>
      </div>

      <div className={cn(
        'md:hidden border-t bg-white overflow-hidden transition-all duration-300',
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <nav className='flex flex-col px-4 py-3 gap-1'>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                'px-3 py-2 rounded-md text-sm transition-colors',
                location.pathname === link.to
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className='border-t mt-2 pt-2 flex flex-col gap-2'>
            {user ? (
              <>
                <Link
                  to='/cabinet'
                  onClick={() => setIsMenuOpen(false)}
                  className='px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50'
                >
                  {profile?.full_name ?? 'Личный кабинет'}
                </Link>
                <button
                  onClick={() => { handleSignOut(); setIsMenuOpen(false) }}
                  className='px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 text-left'
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  onClick={() => setIsMenuOpen(false)}
                  className='px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50'
                >
                  Войти
                </Link>
                <Link
                  to='/register'
                  onClick={() => setIsMenuOpen(false)}
                  className='px-3 py-2 rounded-md text-sm bg-blue-600 text-white rounded-md text-center'
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
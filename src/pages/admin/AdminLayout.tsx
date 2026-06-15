import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuthContext } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { path: '/admin', label: '📊 Дашборд', exact: true },
  { path: '/admin/schedule', label: '📅 Расписание' },
  { path: '/admin/clients', label: '👥 Клиенты' },
  { path: '/admin/analytics', label: '📈 Аналитика' },
]

export function AdminLayout() {
  const { profile } = useAuthContext();
  const location = useLocation();

  return (
    <div className='flex min-h-[calc(100vh-64px)]'>

      <aside className='w-56 border-r bg-gray-50 p-4 space-y-1 shrink-0'>
        <p className='text-xs text-muted-foreground uppercase tracking-wider mb-4 px-2'>
          Админ панель
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </aside>

      <main className='flex-1 p-6 overflow-auto'>
        <Outlet />
      </main>

    </div>
  )
}
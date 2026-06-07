import { useAuthContext } from "@/contexts/AuthContext"
import { Navigate, Outlet } from "react-router-dom";


interface ProtectedRouterProps {
  requiredRole?: 'admin' | 'client' 
}

export function ProtectedRoute({ requiredRole }: ProtectedRouterProps) {
  const { user, profile, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-muted-foreground'>Загрузка...</p>
      </div>
    )
  }

  if (!user) return <Navigate to='/login' replace />

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to='/' replace />
  }

  return <Outlet />
}
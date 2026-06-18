import { useAuthContext } from "@/contexts/AuthContext"
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageSpinner } from "../shared/Spinner";


interface ProtectedRouterProps {
  requiredRole?: 'admin' | 'client'
}

export function ProtectedRoute({ requiredRole }: ProtectedRouterProps) {
  const { user, profile, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) return <PageSpinner />

  if (!user) return <Navigate to='/login' replace state={{ from: location.pathname }} />

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to='/' replace />
  }

  return <Outlet />
}
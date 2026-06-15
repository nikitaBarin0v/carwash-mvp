import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { BookingPage } from '@/pages/BookingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { CabinetPage } from '@/pages/cabinet/CabinetPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminSchedule } from './pages/admin/AdminSchedule';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename='/carwash-mvp'>
        <AuthProvider>
          <Header />

          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/booking' element={<BookingPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path='/cabinet' element={<CabinetPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole='admin' />}>
              <Route path='/admin' element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path='schedule' element={<AdminSchedule />} />
                <Route path='clients' element={<AdminClients />} />
                <Route path='analytics' element={<AdminAnalytics />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard';
import { PropertiesPage } from './pages/properties/PropertiesPage';
import { UsersPage } from './pages/users/UsersPage';
import { BrokersPage } from './pages/brokers/BrokersPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function LoginPage(): React.ReactElement {
  const { setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleLogin = async (): Promise<void> => {
    const res = await fetch('/api/auth/dev-login', { method: 'POST' });
    const { data } = await res.json();
    setAuth(
      { id: 'usr-admin-001', phone: '+201000000001', firstName: 'أحمد', lastName: 'المدير', role: 'ADMIN', avatarUrl: null },
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
    );
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-white">برج العرب العقارية</h1>
          <p className="text-gray-400 mt-2">لوحة تحكم المدير</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                placeholder="+201000000000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#0a1628] text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
            >
              إرسال رمز التحقق
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">وضع التطوير — انقر للدخول مباشرة</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AnalyticsDashboard />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="brokers" element={<BrokersPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="subscriptions" element={<ComingSoon title="الاشتراكات" />} />
            <Route path="ads" element={<ComingSoon title="الإعلانات" />} />
            <Route path="reports" element={<ComingSoon title="البلاغات" />} />
            <Route path="notifications" element={<ComingSoon title="الإشعارات" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function ComingSoon({ title }: { title: string }): React.ReactElement {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]" dir="rtl">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-500 mt-2">هذا القسم قيد التطوير</p>
    </div>
  );
}

export default App;

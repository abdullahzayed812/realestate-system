import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, UserCheck, CalendarDays,
  Bell, CreditCard, BarChart3, Settings, LogOut, Menu, X,
  Megaphone, FileText,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/properties', label: 'العقارات', icon: Building2 },
  { href: '/users', label: 'المستخدمين', icon: Users },
  { href: '/brokers', label: 'الوسطاء', icon: UserCheck },
  { href: '/bookings', label: 'الحجوزات', icon: CalendarDays },
  { href: '/subscriptions', label: 'الاشتراكات', icon: CreditCard },
  { href: '/ads', label: 'الإعلانات', icon: Megaphone },
  { href: '/reports', label: 'البلاغات', icon: FileText },
  { href: '/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function DashboardLayout(): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-[#0a1628] text-white transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && (
            <span className="text-xl font-bold text-white">برج العرب العقارية</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white',
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400">مدير النظام</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-white/10 text-gray-400"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          sidebarOpen ? 'mr-64' : 'mr-16',
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}

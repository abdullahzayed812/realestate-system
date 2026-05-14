import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Building2, Users, CalendarDays, TrendingUp,
  DollarSign, Eye, Heart, Star,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps): React.ReactElement {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`text-sm font-medium px-2.5 py-1 rounded-full ${
              change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}

export function AnalyticsDashboard(): React.ReactElement {
  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data.data;
    },
    // Mock data for development
    placeholderData: {
      stats: {
        totalProperties: 1248,
        totalUsers: 8742,
        totalBookings: 342,
        totalRevenue: 2850000,
        propertiesChange: 12.5,
        usersChange: 8.3,
        bookingsChange: -3.2,
        revenueChange: 15.7,
      },
      propertiesByType: [
        { name: 'شقق', value: 420, key: 'APARTMENT' },
        { name: 'فيلا', value: 180, key: 'VILLA' },
        { name: 'أراضي', value: 290, key: 'LAND' },
        { name: 'مكاتب', value: 150, key: 'OFFICE' },
        { name: 'مخازن', value: 208, key: 'WAREHOUSE' },
      ],
      monthlyViews: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2026, i).toLocaleString('ar-EG', { month: 'short' }),
        views: Math.floor(Math.random() * 50000) + 10000,
        bookings: Math.floor(Math.random() * 100) + 20,
      })),
      recentBookings: [],
    },
  });

  if (!analytics) return <div>Loading...</div>;

  const { stats, propertiesByType, monthlyViews } = analytics;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">منصة برج العرب العقارية - نظرة عامة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي العقارات"
          value={stats.totalProperties.toLocaleString('ar-EG')}
          change={stats.propertiesChange}
          icon={<Building2 size={22} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers.toLocaleString('ar-EG')}
          change={stats.usersChange}
          icon={<Users size={22} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard
          title="الحجوزات النشطة"
          value={stats.totalBookings.toLocaleString('ar-EG')}
          change={stats.bookingsChange}
          icon={<CalendarDays size={22} className="text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          title="الإيرادات الإجمالية"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={<DollarSign size={22} className="text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">مشاهدات العقارات الشهرية</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyViews}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="المشاهدات"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#viewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Property types */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">توزيع أنواع العقارات</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={propertiesByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {propertiesByType.map((_: unknown, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {propertiesByType.map((item: { name: string; value: number }, index: number) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bookings bar chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">الحجوزات الشهرية</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyViews} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="bookings" name="الحجوزات" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

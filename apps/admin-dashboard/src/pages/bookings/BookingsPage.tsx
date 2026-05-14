import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CalendarDays, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate, formatCurrency } from '../../lib/utils';

type BookingStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلّق',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <AlertCircle size={14} />,
  CONFIRMED: <Clock size={14} />,
  COMPLETED: <CheckCircle size={14} />,
  CANCELLED: <XCircle size={14} />,
};

const TYPE_LABELS: Record<string, string> = {
  VIEWING: 'معاينة',
  RENTAL: 'إيجار',
  PURCHASE: 'شراء',
};

interface Booking {
  id: string;
  property: { id: string; titleAr: string; type: string };
  customer: { firstName: string; lastName: string; phone: string };
  broker: { firstName: string; lastName: string };
  type: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number | null;
  message: string | null;
  createdAt: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-001',
    property: { id: 'prop-001', titleAr: 'شقة فاخرة في برج العرب الجديدة', type: 'APARTMENT' },
    customer: { firstName: 'سارة', lastName: 'أحمد', phone: '+201000000010' },
    broker: { firstName: 'محمد', lastName: 'السيد' },
    type: 'VIEWING', status: 'CONFIRMED',
    scheduledDate: '2026-05-20', scheduledTime: '10:00:00',
    totalPrice: null, message: 'أود معاينة الشقة في الموعد المحدد',
    createdAt: '2026-05-13T09:00:00Z',
  },
  {
    id: 'book-002',
    property: { id: 'prop-003', titleAr: 'شقة مفروشة للإيجار', type: 'APARTMENT' },
    customer: { firstName: 'عمر', lastName: 'حسن', phone: '+201000000011' },
    broker: { firstName: 'محمد', lastName: 'السيد' },
    type: 'RENTAL', status: 'PENDING',
    scheduledDate: '2026-05-18', scheduledTime: '14:00:00',
    totalPrice: 27000, message: 'مهتم بالإيجار لمدة 6 أشهر',
    createdAt: '2026-05-12T16:00:00Z',
  },
  {
    id: 'book-003',
    property: { id: 'prop-006', titleAr: 'استوديو - إيجار يومي', type: 'STUDIO' },
    customer: { firstName: 'نور', lastName: 'إبراهيم', phone: '+201000000012' },
    broker: { firstName: 'محمد', lastName: 'السيد' },
    type: 'RENTAL', status: 'COMPLETED',
    scheduledDate: '2026-04-10', scheduledTime: '11:00:00',
    totalPrice: 2450, message: 'حجز لأسبوع',
    createdAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'book-004',
    property: { id: 'prop-002', titleAr: 'فيلا عصرية للبيع', type: 'VILLA' },
    customer: { firstName: 'سارة', lastName: 'أحمد', phone: '+201000000010' },
    broker: { firstName: 'محمد', lastName: 'السيد' },
    type: 'PURCHASE', status: 'PENDING',
    scheduledDate: '2026-05-25', scheduledTime: '15:00:00',
    totalPrice: null, message: 'مهتم بشراء الفيلا',
    createdAt: '2026-05-14T08:00:00Z',
  },
];

export function BookingsPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('ALL');

  const { data } = useQuery({
    queryKey: ['bookings', { search, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await api.get(`/bookings?${params}`);
      return data.data;
    },
    placeholderData: {
      data: MOCK_BOOKINGS.filter((b) => {
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        const matchesSearch = !search || b.customer.firstName.includes(search) || b.property.titleAr.includes(search);
        return matchesStatus && matchesSearch;
      }),
      meta: { total: 4 },
    },
  });

  const bookings: Booking[] = data?.data || [];

  const statCounts = MOCK_BOOKINGS.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الحجوزات</h1>
        <p className="text-gray-500 mt-1">متابعة جميع طلبات الحجز والمعاينات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { status: 'PENDING', label: 'معلّق', color: 'text-amber-600', bg: 'bg-amber-50' },
          { status: 'CONFIRMED', label: 'مؤكد', color: 'text-blue-600', bg: 'bg-blue-50' },
          { status: 'COMPLETED', label: 'مكتمل', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { status: 'CANCELLED', label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.status} className={`${s.bg} rounded-2xl p-5 border border-white`}>
            <p className={`text-2xl font-bold ${s.color}`}>{statCounts[s.status] || 0}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالعميل أو العقار..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'الكل' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right px-6 py-4 font-semibold text-gray-600">العقار</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">العميل</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">الوسيط</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">النوع</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">الموعد</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">القيمة</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 max-w-[200px] truncate">{booking.property.titleAr}</p>
                    <p className="text-xs text-gray-400 mt-0.5">#{booking.id.slice(-6)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{booking.customer.firstName} {booking.customer.lastName}</p>
                    <p className="text-xs text-gray-500">{booking.customer.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {booking.broker.firstName} {booking.broker.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                      {TYPE_LABELS[booking.type] || booking.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <CalendarDays size={13} className="text-gray-400" />
                      <span className="text-xs">{formatDate(booking.scheduledDate)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{booking.scheduledTime?.slice(0, 5)}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {booking.totalPrice ? formatCurrency(booking.totalPrice) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                      {STATUS_ICONS[booking.status]}
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

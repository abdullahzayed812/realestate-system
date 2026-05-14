import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Trash2, Phone, Mail, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';

type Role = 'ALL' | 'CUSTOMER' | 'BROKER' | 'ADMIN';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'عميل',
  BROKER: 'وسيط',
  COMPANY: 'شركة',
  ADMIN: 'مدير',
};

const ROLE_COLORS: Record<string, string> = {
  CUSTOMER: 'bg-blue-100 text-blue-700',
  BROKER: 'bg-emerald-100 text-emerald-700',
  COMPANY: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
};

interface User {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const MOCK_USERS: User[] = [
  { id: 'usr-admin-001', phone: '+201000000001', email: 'admin@borgalarab.com', firstName: 'أحمد', lastName: 'المدير', role: 'ADMIN', isActive: true, isVerified: true, phoneVerified: true, createdAt: '2026-01-01T00:00:00Z', lastLoginAt: '2026-05-14T08:00:00Z' },
  { id: 'usr-broker-001', phone: '+201000000002', email: 'broker1@borgalarab.com', firstName: 'محمد', lastName: 'السيد', role: 'BROKER', isActive: true, isVerified: true, phoneVerified: true, createdAt: '2026-01-15T00:00:00Z', lastLoginAt: '2026-05-13T14:30:00Z' },
  { id: 'usr-broker-002', phone: '+201000000003', email: 'broker2@borgalarab.com', firstName: 'خالد', lastName: 'عبدالله', role: 'BROKER', isActive: true, isVerified: true, phoneVerified: true, createdAt: '2026-02-01T00:00:00Z', lastLoginAt: '2026-05-12T10:00:00Z' },
  { id: 'usr-cust-001', phone: '+201000000010', email: 'customer1@example.com', firstName: 'سارة', lastName: 'أحمد', role: 'CUSTOMER', isActive: true, isVerified: true, phoneVerified: true, createdAt: '2026-03-01T00:00:00Z', lastLoginAt: '2026-05-13T20:00:00Z' },
  { id: 'usr-cust-002', phone: '+201000000011', email: 'customer2@example.com', firstName: 'عمر', lastName: 'حسن', role: 'CUSTOMER', isActive: true, isVerified: true, phoneVerified: true, createdAt: '2026-03-15T00:00:00Z', lastLoginAt: '2026-05-10T12:00:00Z' },
  { id: 'usr-cust-003', phone: '+201000000012', email: 'customer3@example.com', firstName: 'نور', lastName: 'إبراهيم', role: 'CUSTOMER', isActive: false, isVerified: false, phoneVerified: false, createdAt: '2026-04-01T00:00:00Z', lastLoginAt: null },
];

export function UsersPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role>('ALL');
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['users', { search, role: roleFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.append('search', search);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      const { data } = await api.get(`/users?${params}`);
      return data.data;
    },
    placeholderData: {
      data: MOCK_USERS.filter((u) => {
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesSearch = !search || `${u.firstName} ${u.lastName} ${u.phone}`.includes(search);
        return matchesRole && matchesSearch;
      }),
      meta: { total: 6, page: 1, limit: 20, totalPages: 1 },
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.patch(`/users/${id}`, { isActive: !isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const users: User[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-gray-500 mt-1">عرض وإدارة جميع مستخدمي المنصة</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'CUSTOMER', 'BROKER', 'ADMIN'] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {role === 'ALL' ? 'الكل' : ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: meta.total, color: 'text-blue-600' },
          { label: 'العملاء', value: MOCK_USERS.filter(u => u.role === 'CUSTOMER').length, color: 'text-blue-600' },
          { label: 'الوسطاء', value: MOCK_USERS.filter(u => u.role === 'BROKER').length, color: 'text-emerald-600' },
          { label: 'غير مفعّلين', value: MOCK_USERS.filter(u => !u.isActive).length, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right px-6 py-4 font-semibold text-gray-600">المستخدم</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">التواصل</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">الدور</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">الحالة</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">تاريخ الانضمام</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">آخر دخول</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">#{user.id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone size={12} />
                        <span className="text-xs">{user.phone}</span>
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Mail size={12} />
                          <span className="text-xs">{user.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'نشط' : 'معطّل'}
                      </span>
                      {user.phoneVerified && (
                        <p className="text-xs text-emerald-600">✓ هاتف مُتحقق</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={13} />
                      <span className="text-xs">{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'لم يسجل دخولاً'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: user.isActive })}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={user.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">إجمالي {meta.total} مستخدم</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                السابق
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Star, CheckCircle, XCircle, Phone, Building2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';

interface Broker {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string; phone: string; email: string | null; avatarUrl: string | null };
  licenseNumber: string | null;
  rating: number;
  totalRatings: number;
  totalProperties: number;
  totalDeals: number;
  isVerified: boolean;
  isFeatured: boolean;
  specializations: string[];
  serviceAreas: string[];
  createdAt: string;
}

const SPEC_LABELS: Record<string, string> = {
  APARTMENT: 'شقق', VILLA: 'فيلات', LAND: 'أراضي',
  OFFICE: 'مكاتب', WAREHOUSE: 'مخازن', FACTORY: 'مصانع',
};

const MOCK_BROKERS: Broker[] = [
  {
    id: 'brk-001', userId: 'usr-broker-001',
    user: { firstName: 'محمد', lastName: 'السيد', phone: '+201000000002', email: 'broker1@borgalarab.com', avatarUrl: null },
    licenseNumber: 'LIC-2024-001', rating: 4.80, totalRatings: 95, totalProperties: 12, totalDeals: 14,
    isVerified: true, isFeatured: true,
    specializations: ['APARTMENT', 'VILLA', 'LAND'],
    serviceAreas: ['برج العرب', 'الإسكندرية الجديدة'],
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'brk-002', userId: 'usr-broker-002',
    user: { firstName: 'خالد', lastName: 'عبدالله', phone: '+201000000003', email: 'broker2@borgalarab.com', avatarUrl: null },
    licenseNumber: 'LIC-2024-002', rating: 4.60, totalRatings: 42, totalProperties: 8, totalDeals: 9,
    isVerified: true, isFeatured: false,
    specializations: ['OFFICE', 'WAREHOUSE', 'FACTORY'],
    serviceAreas: ['المنطقة الصناعية', 'برج العرب'],
    createdAt: '2026-02-01T00:00:00Z',
  },
];

export function BrokersPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const { data } = useQuery({
    queryKey: ['brokers', { search, verified: verifiedFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (search) params.append('search', search);
      if (verifiedFilter !== 'ALL') params.append('isVerified', String(verifiedFilter === 'VERIFIED'));
      const { data } = await api.get(`/brokers?${params}`);
      return data.data;
    },
    placeholderData: {
      data: MOCK_BROKERS.filter((b) => {
        const matchesVerified = verifiedFilter === 'ALL' || (verifiedFilter === 'VERIFIED') === b.isVerified;
        const matchesSearch = !search || `${b.user.firstName} ${b.user.lastName}`.includes(search);
        return matchesVerified && matchesSearch;
      }),
      meta: { total: 2 },
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verify }: { id: string; verify: boolean }) => {
      await api.patch(`/brokers/${id}/verify`, { isVerified: verify });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brokers'] }),
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, feature }: { id: string; feature: boolean }) => {
      await api.patch(`/brokers/${id}/feature`, { isFeatured: feature });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brokers'] }),
  });

  const brokers: Broker[] = data?.data || [];

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الوسطاء</h1>
        <p className="text-gray-500 mt-1">مراجعة والتحقق من وسطاء العقارات</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="بحث باسم الوسيط..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'ALL', label: 'الكل' },
            { key: 'VERIFIED', label: 'موثّق' },
            { key: 'PENDING', label: 'قيد المراجعة' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setVerifiedFilter(f.key as typeof verifiedFilter)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                verifiedFilter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Broker cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {brokers.map((broker) => (
          <div key={broker.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {broker.user.firstName[0]}{broker.user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg">{broker.user.firstName} {broker.user.lastName}</h3>
                  {broker.isVerified && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">موثّق ✓</span>
                  )}
                  {broker.isFeatured && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">⭐ مميز</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                  <Phone size={13} />
                  <span className="text-sm">{broker.user.phone}</span>
                </div>
                {broker.licenseNumber && (
                  <p className="text-xs text-gray-400 mt-0.5">رقم الترخيص: {broker.licenseNumber}</p>
                )}
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-700 text-sm">{broker.rating.toFixed(1)}</span>
                <span className="text-xs text-amber-500">({broker.totalRatings})</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: Building2, label: 'العقارات', value: broker.totalProperties },
                { icon: Star, label: 'الصفقات', value: broker.totalDeals },
                { icon: CheckCircle, label: 'التقييمات', value: broker.totalRatings },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {broker.specializations.map((spec) => (
                <span key={spec} className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {SPEC_LABELS[spec] || spec}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => verifyMutation.mutate({ id: broker.id, verify: !broker.isVerified })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  broker.isVerified
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {broker.isVerified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                {broker.isVerified ? 'إلغاء التوثيق' : 'توثيق الوسيط'}
              </button>
              <button
                onClick={() => featureMutation.mutate({ id: broker.id, feature: !broker.isFeatured })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  broker.isFeatured
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
              >
                <Star size={16} />
                {broker.isFeatured ? 'إلغاء التمييز' : 'تمييز الوسيط'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Filter, Eye, Check, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProperties, useApproveProperty, useRejectProperty, useDeleteProperty } from '../../hooks/useProperties';
import { cn, getStatusColor, formatCurrency, formatDate } from '../../lib/utils';

const STATUS_OPTIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING', label: 'قيد المراجعة' },
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'SUSPENDED', label: 'موقوف' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'كل الأنواع' },
  { value: 'APARTMENT', label: 'شقة' },
  { value: 'VILLA', label: 'فيلا' },
  { value: 'LAND', label: 'أرض' },
  { value: 'OFFICE', label: 'مكتب' },
  { value: 'SHOP', label: 'محل' },
  { value: 'WAREHOUSE', label: 'مخزن' },
  { value: 'FACTORY', label: 'مصنع' },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد المراجعة', ACTIVE: 'نشط', REJECTED: 'مرفوض',
  SUSPENDED: 'موقوف', SOLD: 'مباع', RENTED: 'مؤجر', DRAFT: 'مسودة',
};

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة', VILLA: 'فيلا', LAND: 'أرض', OFFICE: 'مكتب',
  SHOP: 'محل', WAREHOUSE: 'مخزن', FACTORY: 'مصنع',
  COMMERCIAL_BUILDING: 'مبنى تجاري', STUDIO: 'استوديو',
};

export function PropertiesPage(): React.ReactElement {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useProperties({ page, limit: 20, status, type, search });
  const approve = useApproveProperty();
  const reject = useRejectProperty();
  const deleteProperty = useDeleteProperty();

  const properties = data?.data || [];
  const meta = data?.meta || {};

  const handleApprove = async (id: string): Promise<void> => {
    await approve.mutateAsync(id);
  };

  const handleReject = async (): Promise<void> => {
    if (!rejectId || !rejectReason) return;
    await reject.mutateAsync({ id: rejectId, reason: rejectReason });
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة العقارات</h1>
          <p className="text-gray-500 mt-1">
            {meta.total ? `${meta.total} عقار` : 'جارٍ التحميل...'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث عن عقار..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">العقار</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-600">النوع</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-600">السعر</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-600">المساحة</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-600">الحالة</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-600">التاريخ</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    لا توجد عقارات
                  </td>
                </tr>
              ) : (
                properties.map((property: Record<string, unknown>) => (
                  <tr key={property.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {property.title as string}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {property.listingType === 'SALE' ? 'للبيع' : property.listingType === 'RENT' ? 'للإيجار' : 'إيجار يومي'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {TYPE_LABELS[property.type as string] || property.type as string}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {formatCurrency(property.price as number, property.currency as string)}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {property.area as number} م²
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        getStatusColor(property.status as string),
                      )}>
                        {STATUS_LABELS[property.status as string] || property.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {formatDate(property.createdAt as string)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {property.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(property.id as string)}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="موافقة"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => setRejectId(property.id as string)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="رفض"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <button
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="عرض"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => deleteProperty.mutate(property.id as string)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              صفحة {meta.page} من {meta.totalPages} ({meta.total} نتيجة)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrev}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNext}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" dir="rtl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">رفض العقار</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض..."
              rows={4}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                رفض العقار
              </button>
              <button
                onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

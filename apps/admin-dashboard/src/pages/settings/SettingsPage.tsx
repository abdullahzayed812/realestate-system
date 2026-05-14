import React, { useState } from 'react';
import { Save, Shield, Bell, Database, Globe, Smartphone } from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SECTIONS: SettingSection[] = [
  { id: 'general', title: 'الإعدادات العامة', icon: <Globe size={20} /> },
  { id: 'security', title: 'الأمان', icon: <Shield size={20} /> },
  { id: 'notifications', title: 'الإشعارات', icon: <Bell size={20} /> },
  { id: 'system', title: 'النظام', icon: <Database size={20} /> },
  { id: 'mobile', title: 'التطبيق المحمول', icon: <Smartphone size={20} /> },
];

export function SettingsPage(): React.ReactElement {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'برج العرب العقارية',
    platformNameEn: 'Borg El Arab Real Estate',
    supportPhone: '+201000000001',
    supportEmail: 'support@borgalarab.com',
    defaultCurrency: 'EGP',
    defaultLanguage: 'ar',
  });

  const [securitySettings, setSecuritySettings] = useState({
    otpExpiryMinutes: 10,
    maxOtpAttempts: 5,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '30d',
    requirePhoneVerification: true,
    autoSuspendInactiveUsers: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    sendBookingConfirmation: true,
    sendNewMessageAlert: true,
    sendPropertyApproval: true,
    sendWeeklyReport: true,
    adminEmailOnNewBroker: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 mt-1">تخصيص وضبط إعدادات المنصة</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-6">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-right ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeSection === 'general' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">الإعدادات العامة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المنصة (عربي)</label>
                  <input
                    type="text"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المنصة (إنجليزي)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={generalSettings.platformNameEn}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformNameEn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">هاتف الدعم الفني</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={generalSettings.supportPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني للدعم</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">العملة الافتراضية</label>
                  <select
                    value={generalSettings.defaultCurrency}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultCurrency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EUR">يورو (EUR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">اللغة الافتراضية</label>
                  <select
                    value={generalSettings.defaultLanguage}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الأمان</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">انتهاء صلاحية OTP (دقائق)</label>
                    <input
                      type="number"
                      value={securitySettings.otpExpiryMinutes}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, otpExpiryMinutes: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">حد محاولات OTP</label>
                    <input
                      type="number"
                      value={securitySettings.maxOtpAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxOtpAttempts: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">انتهاء Access Token</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={securitySettings.accessTokenExpiry}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, accessTokenExpiry: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">انتهاء Refresh Token</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={securitySettings.refreshTokenExpiry}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, refreshTokenExpiry: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {[
                  { key: 'requirePhoneVerification', label: 'إلزامية التحقق من الهاتف عند التسجيل' },
                  { key: 'autoSuspendInactiveUsers', label: 'تعليق الحسابات غير النشطة تلقائياً (90 يوم)' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setSecuritySettings({ ...securitySettings, [key]: !securitySettings[key as keyof typeof securitySettings] })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${securitySettings[key as keyof typeof securitySettings] ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${securitySettings[key as keyof typeof securitySettings] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الإشعارات</h2>
              <div className="space-y-4">
                {[
                  { key: 'sendBookingConfirmation', label: 'إشعار تأكيد الحجز للعميل' },
                  { key: 'sendNewMessageAlert', label: 'إشعار الرسائل الجديدة' },
                  { key: 'sendPropertyApproval', label: 'إشعار اعتماد العقار للوسيط' },
                  { key: 'sendWeeklyReport', label: 'تقرير أسبوعي للمدير' },
                  { key: 'adminEmailOnNewBroker', label: 'إشعار المدير عند تسجيل وسيط جديد' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <div
                      onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key as keyof typeof notificationSettings] })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${notificationSettings[key as keyof typeof notificationSettings] ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationSettings[key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(activeSection === 'system' || activeSection === 'mobile') && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {activeSection === 'system' ? 'إعدادات النظام' : 'إعدادات التطبيق المحمول'}
              </h2>
              <div className="bg-blue-50 rounded-xl p-4 text-blue-700 text-sm">
                هذا القسم قيد التطوير. سيتضمن إعدادات {activeSection === 'system' ? 'قاعدة البيانات، التخزين المؤقت، والأداء' : 'الإصدارات الإلزامية، الرسائل، والمحتوى الديناميكي'}.
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
                saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Save size={16} />
              {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

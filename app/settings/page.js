'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useLangStore } from '@/lib/store';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Bell, Shield, Globe, Moon, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLangStore();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLanguageChange = async (newLang) => {
    setLoading(true);
    try {
      setLang(newLang);
      await userAPI.updateLanguage({ language: newLang });
      toast.success('Language updated');
    } catch {
      toast.error('Failed to update language');
    }
    setLoading(false);
  };

  const sections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Globe,
          label: 'Language',
          action: (
            <select
              value={lang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={loading}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          )
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          action: <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Coming Soon</span>
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          action: (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          )
        }
      ]
    },
    {
      title: 'Account & Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy Policy',
          action: <ChevronRight className="w-5 h-5 text-gray-400" />
        },
        {
          icon: LogOut,
          label: 'Logout',
          onClick: logout,
          action: null,
          danger: true
        }
      ]
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-orange-500" /> Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account preferences and settings</p>
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-700">{section.title}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {section.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      onClick={item.onClick}
                      className={`px-5 py-4 flex items-center justify-between ${item.onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.danger ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className={`font-medium ${item.danger ? 'text-red-600' : 'text-gray-700'}`}>{item.label}</span>
                      </div>
                      {item.action && (
                        <div>{item.action}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

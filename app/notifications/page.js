'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notificationAPI } from '@/lib/api';
import { useNotificationStore } from '@/lib/store';
import { toDisplayText } from '@/lib/display';
import toast from 'react-hot-toast';
import { Bell, Check, CheckCheck, Home, MessageCircle, Heart } from 'lucide-react';

function getNotifIcon(type) {
  switch (type) {
    case 'PROPERTY':
    case 'PROPERTY_ALERT_MATCH':
    case 'LISTING_VERIFIED':
      return <Home className="w-5 h-5 text-orange-500" />;
    case 'SERVICE_LAUNCHED':
      return <Bell className="w-5 h-5 text-emerald-500" />;
    case 'CHAT': case 'MESSAGE': case 'NEW_CHAT_MESSAGE': return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'INTEREST': case 'ROOMMATE': case 'ROOMMATE_INTEREST_RECEIVED': case 'ROOMMATE_INTEREST_ACCEPTED': return <Heart className="w-5 h-5 text-pink-500" />;
    default: return <Bell className="w-5 h-5 text-gray-400" />;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { setUnreadCount } = useNotificationStore();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications((data._list || data.notifications || data.data || []).map((item) => ({
        ...item,
        read: item.read ?? item.isRead ?? false,
      })));
    } catch { toast.error('Failed to load notifications'); }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
      setUnreadCount(notifications.filter(n => !n.read && n.id !== id).length);
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-orange-500 font-medium">{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-100">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="flex bg-white border border-orange-100 rounded-xl p-1 mb-6">
            <button onClick={() => setFilter('all')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-orange-50'}`}>
              All
            </button>
            <button onClick={() => setFilter('unread')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'unread' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-orange-50'}`}>
              Unread {unreadCount > 0 && <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${filter === 'unread' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>{unreadCount}</span>}
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex gap-3 border border-orange-100/40">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-orange-50 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-orange-50 animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-gray-500">We&apos;ll notify you when something happens</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(notif => {
                const title = toDisplayText(notif.title || notif.message, 'Notification');
                const body = toDisplayText(notif.body || notif.data?.body, '');
                return (
                <div key={notif.id}
                  className={`bg-white rounded-xl border p-4 flex gap-3 transition-all ${
                    notif.read ? 'border-gray-100' : 'border-orange-200 bg-orange-50/30'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.read ? 'bg-gray-100' : 'bg-orange-100'
                  }`}>
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{title}</p>
                    {body && <p className="text-xs text-gray-400 mt-0.5">{body}</p>}
                    <p className="text-[10px] text-gray-300 mt-1">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </p>
                  </div>
                  {!notif.read && (
                    <button onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg shrink-0" title="Mark as read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

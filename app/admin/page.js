'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ShieldCheck, Home, Utensils, ChefHat, Users, Ban, Bell, Send, Clock, BadgeCheck } from 'lucide-react';

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState('properties');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [messListings, setMessListings] = useState([]);
  const [cookListings, setCookListings] = useState([]);
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('PENDING');
  const [notificationForm, setNotificationForm] = useState({ title: '', body: '', userId: '' });
  const [busy, setBusy] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';

  const getList = (payload, ...keys) => {
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?._list)) return payload._list;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const loadData = async () => {
    setPageLoading(true);
    const requests = await Promise.allSettled([
      adminAPI.dashboard(),
      adminAPI.getUsers({ page: 1, limit: 25 }),
      adminAPI.getProperties({
        ...(propertyStatusFilter === 'ALL' ? {} : { status: propertyStatusFilter }),
        page: 1,
        limit: 25,
      }),
      adminAPI.getMess({ page: 1, limit: 25 }),
      adminAPI.getCooks({ page: 1, limit: 25 }),
    ]);

    const [dashboardRes, usersRes, propertiesRes, messRes, cooksRes] = requests;
    let failedCount = 0;

    if (dashboardRes.status === 'fulfilled') {
      const dashboardData = dashboardRes.value.data?.stats ? dashboardRes.value.data : (dashboardRes.value.data?.data || dashboardRes.value.data || {});
      setStats(dashboardData.stats || {});
    } else {
      failedCount += 1;
      setStats({});
    }

    if (usersRes.status === 'fulfilled') {
      setUsers(getList(usersRes.value.data, 'users'));
    } else {
      failedCount += 1;
      setUsers([]);
    }

    if (propertiesRes.status === 'fulfilled') {
      setProperties(getList(propertiesRes.value.data, 'properties'));
    } else {
      failedCount += 1;
      setProperties([]);
    }

    if (messRes.status === 'fulfilled') {
      setMessListings(getList(messRes.value.data, 'listings', 'mess'));
    } else {
      failedCount += 1;
      setMessListings([]);
    }

    if (cooksRes.status === 'fulfilled') {
      setCookListings(getList(cooksRes.value.data, 'cooks'));
    } else {
      failedCount += 1;
      setCookListings([]);
    }

    if (failedCount > 0) {
      toast.error(`Some admin sections failed to load (${failedCount}/5).`);
    }

    setPageLoading(false);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/admin/login');
      return;
    }
    if (!loading && isAuthenticated && !isAdmin) {
      router.replace('/');
      return;
    }
    if (!loading && isAuthenticated && isAdmin) {
      loadData();
    }
  }, [loading, isAuthenticated, isAdmin, router, propertyStatusFilter]);

  const withAction = async (fn, successMessage) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMessage);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Action failed');
    }
    setBusy(false);
  };

  const handleSendNotification = async () => {
    const title = notificationForm.title.trim();
    const body = notificationForm.body.trim();
    const userId = notificationForm.userId.trim();
    if (!title || !body) {
      toast.error('Enter notification title and body');
      return;
    }

    setBusy(true);
    try {
      await adminAPI.sendNotification({ title, body, ...(userId ? { userId } : {}) });
      toast.success(userId ? 'Notification sent to user' : 'Notification broadcast sent');
      setNotificationForm({ title: '', body: '', userId: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send notification');
    }
    setBusy(false);
  };

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'users', label: 'User Verification', icon: Users },
    { key: 'properties', label: 'Property Approvals', icon: Home },
    { key: 'mess', label: 'Mess Verification', icon: Utensils },
    { key: 'cooks', label: 'Cook Verification', icon: ChefHat },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const statCards = [
    { label: 'Users', value: stats?.users ?? 0 },
    { label: 'Properties', value: stats?.properties ?? 0 },
    { label: 'Mess', value: stats?.mess ?? 0 },
    { label: 'Cooks', value: stats?.cooks ?? 0 },
    { label: 'Roommates', value: stats?.roommates ?? 0 },
    { label: 'Pending Reports', value: stats?.pendingReports ?? 0 },
    { label: 'Coming Soon', value: stats?.comingSoonSignups ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-orange-500" /> Admin Approval Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">Approve listings before they go live on the platform.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="glass-panel p-4">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === item.key
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : 'bg-white border border-orange-100 text-gray-600 hover:bg-orange-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </div>

        {pageLoading ? (
          <div className="glass-panel p-10 text-center text-sm text-gray-500">Loading admin data...</div>
        ) : tab === 'users' ? (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="glass-panel p-10 text-center text-sm text-gray-500">No users found.</div>
            ) : (
              users.map((account) => (
                <div key={account.id} className="glass-panel p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{account.name || 'Unnamed User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{account.phone} {account.email ? `· ${account.email}` : ''}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">{account.role}</span>
                      {account.city && <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-semibold">{account.city}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${account.isPhoneVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {account.isPhoneVerified ? 'Verified' : 'Pending'}
                      </span>
                      {account.isBlocked && <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold">Blocked</span>}
                    </div>
                    {account.createdAt && (
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Joined {new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!account.isPhoneVerified && (
                      <button
                        onClick={() => withAction(() => adminAPI.verifyUser(account.id), 'User verified')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Verify
                      </button>
                    )}
                    <button
                      onClick={() => withAction(() => adminAPI.blockUser(account.id, { block: !account.isBlocked }), account.isBlocked ? 'User unblocked' : 'User blocked')}
                      disabled={busy}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                        account.isBlocked
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <Ban className="w-4 h-4" /> {account.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === 'properties' ? (
          <div className="space-y-3">
            <div className="glass-panel p-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 mr-1">Filter:</span>
              {['PENDING', 'DRAFT', 'ACTIVE', 'REJECTED', 'ALL'].map((status) => (
                <button
                  key={status}
                  onClick={() => setPropertyStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    propertyStatusFilter === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-orange-100 text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {properties.length === 0 ? (
              <div className="glass-panel p-10 text-center text-sm text-gray-500">No properties found for {propertyStatusFilter}.</div>
            ) : (
              properties.map((p) => (
                <div key={p.id} className="glass-panel p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{p.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                        p.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{p.status || 'PENDING'}</span>
                      {p.isVerified && <BadgeCheck className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{p.area}, {p.city} · ₹{(p.rent || 0).toLocaleString('en-IN')}/month</p>
                    <p className="text-xs text-gray-400 mt-1">Owner: {p.owner?.name || 'Unknown'} ({p.owner?.phone || 'N/A'})</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.propertyType?.replace(/_/g, ' ') || 'Property'} {p.availableFor ? `· ${p.availableFor.replace(/_/g, ' ')}` : ''} {p.createdAt ? `· ${new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {p.status !== 'ACTIVE' && (
                      <button
                        onClick={() => withAction(() => adminAPI.approveProperty(p.id), 'Property approved')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {p.status !== 'REJECTED' && (
                      <button
                        onClick={() => withAction(() => adminAPI.rejectProperty(p.id), 'Property rejected')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === 'mess' ? (
          <div className="space-y-3">
            {messListings.length === 0 ? (
              <div className="glass-panel p-10 text-center text-sm text-gray-500">No mess listings found.</div>
            ) : (
              messListings.map((m) => (
                <div key={m.id} className="glass-panel p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{m.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {m.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{m.area}, {m.city}</p>
                    <p className="text-xs text-gray-400 mt-1">Owner: {m.ownerName || m.owner?.name || 'Unknown'} · ₹{m.pricePerMeal || 0}/meal</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {m.foodType?.replace(/_/g, ' ') || 'Food'} {m.tiffinService ? '· Tiffin' : ''} {m.deliveryAvailable ? '· Delivery' : ''} {m.createdAt ? `· ${new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                    </p>
                  </div>
                  {!m.isVerified && (
                    <button
                      onClick={() => withAction(() => adminAPI.verifyMess(m.id), 'Mess verified')}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : tab === 'notifications' ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <div className="glass-panel p-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-orange-500" /> Send Notification
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Title *</label>
                  <input
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="Welcome to fyndkro"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Message *</label>
                  <textarea
                    value={notificationForm.body}
                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, body: e.target.value }))}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Write the announcement or update"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">User ID (optional)</label>
                  <input
                    value={notificationForm.userId}
                    onChange={(e) => setNotificationForm((prev) => ({ ...prev, userId: e.target.value }))}
                    className="input-field"
                    placeholder="Leave empty to broadcast"
                  />
                </div>
                <button
                  onClick={handleSendNotification}
                  disabled={busy}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {busy ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
            </div>
            <div className="glass-panel p-5">
              <h3 className="font-bold text-gray-900 mb-3">Preview</h3>
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <p className="text-sm font-bold text-gray-900">{notificationForm.title || 'Notification title'}</p>
                <p className="text-xs text-gray-500 mt-1">{notificationForm.body || 'Notification message will appear here.'}</p>
                <p className="text-[10px] text-orange-600 mt-3 font-semibold">
                  {notificationForm.userId.trim() ? `Target: ${notificationForm.userId.trim()}` : 'Target: All users'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cookListings.length === 0 ? (
              <div className="glass-panel p-10 text-center text-sm text-gray-500">No cook listings found.</div>
            ) : (
              cookListings.map((c) => (
                <div key={c.id} className="glass-panel p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{c.fullName || c.name || 'Cook'}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {c.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.city} {c.pincode ? `· ${c.pincode}` : ''}</p>
                    <p className="text-xs text-gray-400 mt-1">Experience: {c.experience || 0} years · ₹{c.pricePerVisit || 0}/visit</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {c.speciality?.replace(/_/g, ' ') || 'Cook'} {c.serviceAreas?.length ? `· ${c.serviceAreas.slice(0, 3).join(', ')}` : ''}
                    </p>
                  </div>
                  {!c.isVerified && (
                    <button
                      onClick={() => withAction(() => adminAPI.verifyCook(c.id), 'Cook verified')}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

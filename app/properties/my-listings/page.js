'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/EmptyState';
import { propertyAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye, Share2, MoreHorizontal, Home, CheckCircle, Clock, FileText } from 'lucide-react';

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = tab === 'active'
        ? { status: 'ACTIVE,RENTED' }
        : tab !== 'all'
          ? { status: tab.toUpperCase() }
          : {};
      const { data } = await propertyAPI.getMyListings(params);
      setListings(data.properties || data._list || data.data || []);
    } catch { toast.error('Failed to load listings'); }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [tab]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await propertyAPI.delete(id);
      toast.success('Deleted');
      fetchListings();
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await propertyAPI.updateStatus(id, { status });
      toast.success(`Marked as ${status.toLowerCase()}`);
      fetchListings();
    } catch { toast.error('Failed to update'); }
  };

  const tabs = [
    { key: 'all', label: 'All', icon: Home },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'active', label: 'Active', icon: CheckCircle },
    { key: 'rented', label: 'Rented', icon: Clock },
    { key: 'draft', label: 'Draft', icon: FileText },
  ];

  const stats = {
    total: listings.length,
    pending: listings.filter(l => l.status === 'PENDING').length,
    active: listings.filter(l => l.status === 'ACTIVE').length,
    views: listings.reduce((a, l) => a + (l.viewCount || l.views || 0), 0),
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">My Listings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your property listings</p>
            </div>
            <Link href="/properties/create" className="btn-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add New
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-400">Total Listings</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
              <p className="text-xs text-gray-400">Pending Approval</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-bold text-orange-500">{stats.views}</p>
              <p className="text-xs text-gray-400">Total Views</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 sm:flex-1 justify-center ${
                    tab === t.key ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Listings */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 flex gap-4">
                  <div className="w-32 h-24 bg-gray-200 animate-pulse rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState icon="\ud83c\udfe0" title="No listings yet" description="List your first property and start getting inquiries!"
              ctaLabel="List Property" ctaHref="/properties/create" />
          ) : (
            <div className="space-y-3">
              {listings.map(p => (
                <div key={p.id} className={`bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 transition-all duration-300 ${
                  p.status === 'RENTED' ? 'opacity-65 saturate-[85%]' : ''
                }`}>
                  <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img src={p.photos?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop'}
                      alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{p.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{p.area}, {p.city}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                        p.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                        p.status === 'RENTED' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>{p.status}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-bold text-gray-900">₹{(p.rent || 0).toLocaleString('en-IN')}/mo</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {p.viewCount || p.views || 0} views</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/properties/edit/${p.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200">
                        <Edit3 className="w-3 h-3" /> Edit
                      </Link>
                      {p.status === 'ACTIVE' && (
                        <button onClick={() => handleStatusChange(p.id, 'RENTED')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100">
                          <CheckCircle className="w-3 h-3" /> Mark Rented
                        </button>
                      )}
                      {p.status === 'RENTED' && (
                        <button onClick={() => handleStatusChange(p.id, 'ACTIVE')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100">
                          <CheckCircle className="w-3 h-3" /> Mark Active
                        </button>
                      )}
                      <button onClick={() => handleDelete(p.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

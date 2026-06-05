'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/api';
import { CITIES, CITY_AREAS, USER_INTEREST_OPTIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { Check, ArrowRight } from 'lucide-react';

export default function ProfileSetup() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || 'Bhopal',
    area: user?.area || '',
    interests: user?.interests || [],
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const areas = CITY_AREAS[form.city] || [];

  const toggleInterest = (id) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleSubmit = async () => {
    if (!form.city) { toast.error('Select your city'); return; }
    setLoading(true);
    try {
      const { data } = await userAPI.profileSetup(form);
      updateUser(data.user || data.data?.user || data.data || data);
      toast.success('Profile setup complete!');
      router.push('/properties');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">\ud83d\udc4b</div>
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome to fyndkro!</h1>
            <p className="text-sm text-gray-500 mt-1">Let&apos;s set up your profile</p>
          </div>

          <div className="glass-panel p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Your Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                className="input-field" placeholder="Full name" />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">City *</label>
              {isHydrated && (
                <select value={form.city} onChange={e => { update('city', e.target.value); update('area', ''); }} className="input-field">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Area</label>
              {isHydrated && (
                <>
                  <input list="profile-area-options" value={form.area} onChange={e => update('area', e.target.value)}
                    placeholder="Select or type your area" className="input-field" />
                  <datalist id="profile-area-options">
                    {areas.map(a => <option key={a} value={a} />)}
                  </datalist>
                </>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">I want to...</label>
              <div className="grid grid-cols-2 gap-2">
                {USER_INTEREST_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => toggleInterest(opt.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.interests.includes(opt.id) ? 'border-orange-500 bg-orange-50 shadow-[0_4px_12px_-4px_rgba(249,115,22,0.3)]' : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'
                    }`}>
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                    {form.interests.includes(opt.id) && (
                      <Check className="w-4 h-4 text-orange-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Complete Setup</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

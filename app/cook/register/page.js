'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cookAPI } from '@/lib/api';
import { useUpload } from '@/hooks/useAPI';
import { CITIES, CITY_AREAS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';

export default function RegisterCook() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { upload, loading: uploading } = useUpload();

  const [form, setForm] = useState({
    fullName: '', photo: '', gender: 'FEMALE', age: '', experience: '',
    speciality: 'VEG',
    cuisineTypes: [], serviceTypes: ['DAILY_COOK'],
    pricePerVisit: '', monthlyOneMeal: '', monthlyTwoMeals: '',
    serviceAreas: [], city: 'Bhopal', pincode: '',
    availableSlots: { morning: '6:00-10:00', evening: '17:00-21:00' },
  });
  const areas = CITY_AREAS[form.city] || [];

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    try {
      const res = await upload('/users/upload-image', file, { folder: 'projectx/cooks' });
      if (res?.imageUrl) {
        update('photo', res.imageUrl);
        toast.success('Photo uploaded successfully');
      }
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  const toggleArr = (key, val) => update(key, form[key].includes(val) ? form[key].filter(v => v !== val) : [...form[key], val]);

  const cuisineOptions = ['NORTH_INDIAN', 'SOUTH_INDIAN', 'CHINESE', 'CONTINENTAL', 'BENGALI', 'GUJARATI', 'RAJASTHANI', 'MAHARASHTRIAN', 'MUGHLAI'];
  const serviceOptions = ['DAILY_COOK', 'MONTHLY_SUBSCRIPTION', 'PARTY_COOK', 'CATERING'];

  const nextStep = () => {
    if (step === 0 && (!form.fullName || !form.age)) { toast.error('Fill name and age'); return; }
    if (step === 1 && form.cuisineTypes.length === 0) { toast.error('Select at least one cuisine'); return; }
    if (step === 2 && !form.pricePerVisit) { toast.error('Enter price per visit'); return; }
    setStep(s => Math.min(3, s + 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = { ...form,
        age: parseInt(form.age) || 25, experience: parseInt(form.experience) || 0,
        pricePerVisit: parseInt(form.pricePerVisit) || 0,
        monthlyOneMeal: parseInt(form.monthlyOneMeal) || undefined,
        monthlyTwoMeals: parseInt(form.monthlyTwoMeals) || undefined,
      };
      await cookAPI.register(data);
      toast.success('Cook profile registered!');
      router.push('/cook/dashboard');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to register'); }
    setLoading(false);
  };

  const steps = ['Personal Info', 'Skills', 'Pricing', 'Service Areas'];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Register as Cook</h1>
          <p className="text-sm text-gray-500 mb-6">Create your cook profile and start getting bookings</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">{steps[step]}</h2>

            {step === 0 && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="e.g., Sunita Devi" className="input-field" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Age *</label>
                    <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="35" className="input-field" /></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Experience (yrs)</label>
                    <input type="number" value={form.experience} onChange={e => update('experience', e.target.value)} placeholder="10" className="input-field" /></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Gender</label>
                    <select value={form.gender} onChange={e => update('gender', e.target.value)} className="input-field">
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Speciality</label>
                  <div className="flex gap-2">
                    {['VEG', 'NON_VEG', 'BOTH'].map(t => (
                      <button key={t} onClick={() => update('speciality', t)} className={`px-4 py-2 rounded-lg text-sm font-medium border flex-1 transition-colors ${form.speciality === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {t === 'VEG' ? '🥗 Veg' : t === 'NON_VEG' ? '🍖 Non-Veg' : '🍽️ Both'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-orange-100 relative group">
                      {form.photo ? (
                        <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Upload className="w-6 h-6" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div className="flex-1">
                      {uploading ? (
                        <p className="text-sm text-orange-500 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" /> Uploading...
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-700 font-medium">Upload a clear photo</p>
                          <p className="text-xs text-gray-400">JPG, PNG up to 5MB. Clear face visible.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Cuisine Types *</label>
                  <div className="flex flex-wrap gap-2">
                    {cuisineOptions.map(c => (
                      <button key={c} onClick={() => toggleArr('cuisineTypes', c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.cuisineTypes.includes(c) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {c.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Service Types</label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map(s => (
                      <button key={s} onClick={() => toggleArr('serviceTypes', s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.serviceTypes.includes(s) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Price Per Visit (₹) *</label>
                  <input type="number" value={form.pricePerVisit} onChange={e => update('pricePerVisit', e.target.value)} placeholder="300" className="input-field" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Monthly 1 Meal (₹)</label>
                    <input type="number" value={form.monthlyOneMeal} onChange={e => update('monthlyOneMeal', e.target.value)} placeholder="4000" className="input-field" /></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Monthly 2 Meals (₹)</label>
                    <input type="number" value={form.monthlyTwoMeals} onChange={e => update('monthlyTwoMeals', e.target.value)} placeholder="7000" className="input-field" /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                    <select value={form.city} onChange={e => { update('city', e.target.value); update('serviceAreas', []); }} className="input-field">{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Pincode</label>
                    <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="462011" className="input-field" maxLength={6} /></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Service Areas (select multiple)</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {areas.map(a => (
                      <button key={a} onClick={() => toggleArr('serviceAreas', a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.serviceAreas.includes(a) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>{a}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${step === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              {step < 3 ? (
                <button onClick={nextStep} className="btn-primary flex items-center gap-1.5">Next <ArrowRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-1.5">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Register</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

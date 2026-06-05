'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { messAPI } from '@/lib/api';
import { useUpload } from '@/hooks/useAPI';
import { CITIES, CITY_AREAS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';

export default function RegisterMess() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { upload, loading: uploading } = useUpload();

  const [form, setForm] = useState({
    name: '', ownerName: '', description: '',
    foodType: 'VEG', mealTypes: ['LUNCH', 'DINNER'],
    timings: { breakfast: '7:30-10:00', lunch: '12:00-15:00', dinner: '19:00-22:00' },
    pricePerMeal: '', monthlyOneMeal: '', monthlyTwoMeals: '', monthlyThreeMeals: '', trialMealPrice: '',
    deliveryAvailable: false, deliveryRadius: '', tiffinService: false, seatingCapacity: '',
    features: [],
    address: '', area: '', city: 'Bhopal', pincode: '',
    photos: [],
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const areas = CITY_AREAS[form.city] || [];

  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} must be less than 5MB`);
        continue;
      }

      try {
        const res = await upload('/users/upload-image', file, { folder: 'projectx/mess' });
        if (res?.imageUrl) {
          setForm(prev => ({ ...prev, photos: [...prev.photos, res.imageUrl] }));
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const toggleMealType = (t) => update('mealTypes', form.mealTypes.includes(t) ? form.mealTypes.filter(m => m !== t) : [...form.mealTypes, t]);
  const toggleFeature = (f) => update('features', form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f]);

  const nextStep = () => {
    if (step === 0 && (!form.name || !form.ownerName)) { toast.error('Fill name and owner name'); return; }
    if (step === 1 && !form.pricePerMeal) { toast.error('Enter price per meal'); return; }
    if (step === 2 && (!form.address || !form.city || !form.area)) { toast.error('Enter address, city and area'); return; }
    setStep(s => Math.min(3, s + 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = { ...form,
        pricePerMeal: parseInt(form.pricePerMeal) || 0,
        monthlyOneMeal: parseInt(form.monthlyOneMeal) || undefined,
        monthlyTwoMeals: parseInt(form.monthlyTwoMeals) || undefined,
        monthlyThreeMeals: parseInt(form.monthlyThreeMeals) || undefined,
        trialMealPrice: parseInt(form.trialMealPrice) || undefined,
        seatingCapacity: parseInt(form.seatingCapacity) || undefined,
        deliveryRadius: parseInt(form.deliveryRadius) || undefined,
        location: {
          type: 'manual',
          address: form.address.trim(),
          area: form.area.trim(),
          city: form.city,
          pincode: form.pincode,
        },
      };
      await messAPI.register(data);
      toast.success('Mess registered successfully!');
      router.push('/mess/dashboard');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to register mess'); }
    setLoading(false);
  };

  const steps = ['Basic Info', 'Menu & Pricing', 'Location', 'Photos'];
  const featureOptions = ['HOME_STYLE', 'UNLIMITED_FOOD', 'SUNDAY_SPECIAL', 'AC_DINING', 'CLEAN_KITCHEN', 'ORGANIC', 'JAIN_FOOD'];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Register Your Mess</h1>
          <p className="text-sm text-gray-500 mb-6">Start getting customers for your mess/tiffin service</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">{steps[step]}</h2>

            {step === 0 && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Mess Name *</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g., Annapurna Mess" className="input-field" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Owner Name *</label>
                  <input type="text" value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="Full name" className="input-field" /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your mess..." className="input-field min-h-[80px] resize-none" maxLength={500} /></div>
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Food Type</label>
                  <div className="flex gap-2">
                    {['VEG', 'NON_VEG', 'BOTH'].map(t => (
                      <button key={t} onClick={() => update('foodType', t)} className={`px-4 py-2 rounded-lg text-sm font-medium border flex-1 transition-colors ${form.foodType === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {t === 'VEG' ? '🥗 Veg' : t === 'NON_VEG' ? '🍖 Non-Veg' : '🍽️ Both'}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Meal Types</label>
                  <div className="flex gap-2">
                    {['BREAKFAST', 'LUNCH', 'DINNER'].map(t => (
                      <button key={t} onClick={() => toggleMealType(t)} className={`px-4 py-2 rounded-lg text-sm font-medium border flex-1 transition-colors ${form.mealTypes.includes(t) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-2 block">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map(f => (
                      <button key={f} onClick={() => toggleFeature(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.features.includes(f) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                        {f.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.deliveryAvailable} onChange={e => update('deliveryAvailable', e.target.checked)} className="rounded text-orange-500" /><span className="text-sm">Delivery Available</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.tiffinService} onChange={e => update('tiffinService', e.target.checked)} className="rounded text-orange-500" /><span className="text-sm">Tiffin Service</span></label>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Price/Meal (₹) *</label>
                    <input type="number" value={form.pricePerMeal} onChange={e => update('pricePerMeal', e.target.value)} placeholder="60" className="input-field" /></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Trial Meal (₹)</label>
                    <input type="number" value={form.trialMealPrice} onChange={e => update('trialMealPrice', e.target.value)} placeholder="50" className="input-field" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">1 Meal/mo (₹)</label>
                    <input type="number" value={form.monthlyOneMeal} onChange={e => update('monthlyOneMeal', e.target.value)} placeholder="1500" className="input-field" /></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">2 Meals/mo (₹)</label>
                    <input type="number" value={form.monthlyTwoMeals} onChange={e => update('monthlyTwoMeals', e.target.value)} placeholder="2800" className="input-field" /></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">3 Meals/mo (₹)</label>
                    <input type="number" value={form.monthlyThreeMeals} onChange={e => update('monthlyThreeMeals', e.target.value)} placeholder="3800" className="input-field" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Seating Capacity</label>
                    <input type="number" value={form.seatingCapacity} onChange={e => update('seatingCapacity', e.target.value)} placeholder="30" className="input-field" /></div>
                  {form.deliveryAvailable && <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Delivery Radius (km)</label>
                    <input type="number" value={form.deliveryRadius} onChange={e => update('deliveryRadius', e.target.value)} placeholder="3" className="input-field" /></div>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Address *</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Full address" className="input-field" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                    <select value={form.city} onChange={e => { update('city', e.target.value); update('area', ''); }} className="input-field">{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Area *</label>
                    <input list="mess-area-options" value={form.area} onChange={e => update('area', e.target.value)} placeholder="Select or type area" className="input-field" />
                    <datalist id="mess-area-options">{areas.map(a => <option key={a} value={a} />)}</datalist></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Pincode</label>
                  <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="462011" className="input-field" maxLength={6} /></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-orange-200 bg-orange-50/20 rounded-2xl p-8 text-center relative group hover:border-orange-400 transition-colors">
                  <Upload className="w-10 h-10 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  {uploading ? (
                    <p className="text-sm text-orange-500 font-medium flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" /> Uploading image(s)...
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-700">Click to upload photos</p>
                      <p className="text-xs text-gray-400 mt-1">Select one or multiple images (up to 5MB each)</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
                {form.photos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Uploaded Photos ({form.photos.length})</p>
                    <div className="grid grid-cols-3 gap-3">
                      {form.photos.map((url, i) => (
                        <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-250 shadow-sm">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => update('photos', form.photos.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Register Mess</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { propertyAPI } from '@/lib/api';
import { useUpload } from '@/hooks/useAPI';
import { PROPERTY_TYPES, FURNISHING_OPTIONS, AVAILABLE_FOR, AMENITIES, CITIES, CITY_AREAS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Upload, X, Plus, MapPin } from 'lucide-react';

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[...Array(total)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            i < current ? 'bg-green-500 text-white' : i === current ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 flex-1 ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function CreateProperty() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { upload, loading: uploading } = useUpload();
  const [uploadCount, setUploadCount] = useState(0);

  const [form, setForm] = useState({
    title: '', description: '', propertyType: '2BHK', category: 'Residential',
    availableFor: 'Anyone', dependency: 'Independent',
    rent: '', deposit: '', negotiable: 'Fixed', maintenanceExtra: false, maintenanceAmount: '',
    minimumStay: '6 Months', availableFrom: '',
    furnishing: 'Semi Furnished', amenities: [],
    address: '', city: 'Bhopal', area: '', pincode: '',
    photos: [], status: 'PENDING',
  });
  const areas = CITY_AREAS[form.city] || [];

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (form.photos.length + files.length > 10) {
      toast.error('You can only upload a maximum of 10 photos');
      return;
    }

    setUploadCount(files.length);
    const uploadedUrls = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        continue;
      }
      try {
        const res = await upload('/users/upload-image', file, { folder: 'projectx/properties' });
        if (res?.imageUrl) uploadedUrls.push(res.imageUrl);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    if (uploadedUrls.length) {
      setForm(prev => ({ ...prev, photos: [...prev.photos, ...uploadedUrls] }));
      toast.success(`Successfully uploaded ${uploadedUrls.length} photos`);
    }
    setUploadCount(0);
  };

  const toggleAmenity = (id) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const nextStep = () => {
    if (step === 0 && (!form.title || !form.propertyType)) { toast.error('Fill title and property type'); return; }
    if (step === 1 && !form.rent) { toast.error('Enter rent amount'); return; }
    if (step === 3 && (!form.city || !form.address)) { toast.error('Enter address and city'); return; }
    setStep(s => Math.min(4, s + 1));
  };

  const handleSubmit = async (status = 'PENDING') => {
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error('Title should be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        rent: parseInt(form.rent) || 0,
        deposit: parseInt(form.deposit) || 0,
        maintenanceAmount: form.maintenanceAmount ? parseInt(form.maintenanceAmount) || 0 : undefined,
        status,
        photos: form.photos.length ? form.photos : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'],
      };
      await propertyAPI.create(data);
      toast.success(status === 'DRAFT' ? 'Saved as draft!' : 'Property submitted for admin approval!');
      router.push('/properties/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create property');
    }
    setLoading(false);
  };

  const steps = ['Details', 'Pricing', 'Amenities', 'Location', 'Photos'];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">List Your Property</h1>
          <p className="text-sm text-gray-500 mb-6">Fill in the details to list your property. Zero brokerage, always.</p>

          <StepIndicator current={step} total={5} />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">{steps[step]}</h2>

            {/* Step 1: Details */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Title *</label>
                  <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
                    placeholder="e.g., Spacious 2BHK in MP Nagar" className="input-field" maxLength={100} />
                  <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)}
                    placeholder="Describe your property..." className="input-field min-h-[100px] resize-none" maxLength={500} />
                  <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Property Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.slice(0, 10).map(t => (
                      <button key={t} onClick={() => update('propertyType', t)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          form.propertyType === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Available For</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FOR.map(a => (
                      <button key={a} onClick={() => update('availableFor', a)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          form.availableFor === a ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                        }`}>{a}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Rent (₹/month) *</label>
                  <input type="number" value={form.rent} onChange={e => update('rent', e.target.value)}
                    placeholder="e.g., 12000" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Deposit (₹)</label>
                  <input type="number" value={form.deposit} onChange={e => update('deposit', e.target.value)}
                    placeholder="e.g., 24000" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Negotiable</label>
                  <div className="flex gap-2">
                    {['Fixed', 'Slightly', 'Negotiable'].map(n => (
                      <button key={n} onClick={() => update('negotiable', n)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border flex-1 transition-colors ${
                          form.negotiable === n ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Minimum Stay</label>
                  <select value={form.minimumStay} onChange={e => update('minimumStay', e.target.value)} className="input-field">
                    {['1 Month', '3 Months', '6 Months', '11 Months', '1 Year+'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Amenities */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Furnishing</label>
                  <div className="grid grid-cols-3 gap-3">
                    {FURNISHING_OPTIONS.map(f => (
                      <button key={f} onClick={() => update('furnishing', f)}
                        className={`p-3 rounded-xl text-center border-2 transition-colors ${
                          form.furnishing === f ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="text-xl mb-1">{f === 'Fully Furnished' ? '\ud83c\udfe0' : f === 'Semi Furnished' ? '\ud83e\uddf3' : '\ud83d\udce6'}</div>
                        <div className="text-xs font-medium">{f}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES.map(a => (
                      <button key={a.id} onClick={() => toggleAmenity(a.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-colors ${
                          form.amenities.includes(a.id) ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <span className="text-lg">{a.icon}</span>
                        <span className="text-xs font-medium">{a.label}</span>
                        {form.amenities.includes(a.id) && <Check className="w-3.5 h-3.5 text-orange-500 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Address *</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                    placeholder="Full address" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                    <select value={form.city} onChange={e => { update('city', e.target.value); update('area', ''); }} className="input-field">
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Area</label>
                    <input list="property-area-options" value={form.area} onChange={e => update('area', e.target.value)}
                      placeholder="Select or type area" className="input-field" />
                    <datalist id="property-area-options">
                      {areas.map(a => <option key={a} value={a} />)}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pincode</label>
                  <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit pincode" className="input-field" maxLength={6} />
                </div>
              </div>
            )}

            {/* Step 5: Photos */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center relative overflow-hidden">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 mb-3 animate-spin">
                        <div className="w-full h-full rounded-full border-4 border-orange-200 border-t-orange-500" />
                      </div>
                      <p className="text-sm font-medium text-orange-500">Uploading {uploadCount} photos...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Click or drag & drop photos here</p>
                      <p className="text-xs text-gray-400">Max 10 photos, 5MB each. Supported formats: JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>

                {form.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {form.photos.map((url, i) => (
                      <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                        <img src={url} alt={`Property ${i+1}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => update('photos', form.photos.filter((_, j) => j !== i))}
                          type="button"
                          className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors z-20">
                          <X className="w-4 h-4" />
                        </button>
                        {i === 0 && <span className="absolute bottom-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md">Cover Photo</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Listing Preview</h4>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">{form.propertyType} \u00b7 {form.furnishing}</p>
                      <p className="text-lg font-extrabold text-gray-900">₹{parseInt(form.rent || 0).toLocaleString('en-IN')}<span className="text-xs text-gray-500 font-medium">/mo</span></p>
                    </div>
                    <p className="font-bold text-base text-gray-900 mb-1 leading-snug">{form.title || 'Your property title will appear here'}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {form.area || 'Area'}, {form.city}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${step === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              {step < 4 ? (
                <button onClick={nextStep}
                  className="btn-primary flex items-center gap-1.5">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleSubmit('DRAFT')} disabled={loading}
                    className="btn-secondary">
                    Save Draft
                  </button>
                  <button onClick={() => handleSubmit('PENDING')} disabled={loading}
                    className="btn-primary flex items-center gap-1.5">
                    {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Publish</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

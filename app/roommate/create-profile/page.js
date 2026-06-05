'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { roommateAPI } from '@/lib/api';
import { useUpload } from '@/hooks/useAPI';
import { CITIES, CITY_AREAS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[...Array(total)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            i < current ? 'bg-green-500 text-white' : i === current ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>{i < current ? <Check className="w-4 h-4" /> : i + 1}</div>
          {i < total - 1 && <div className={`h-0.5 flex-1 ${i < current ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function ChipSelect({ options, value, onChange, multiple = false }) {
  const toggle = (opt) => {
    if (multiple) {
      onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
    } else {
      onChange(opt);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt.replace(/_/g, ' ') : opt.label;
        const selected = multiple ? value.includes(v) : value === v;
        return (
          <button key={v} type="button" onClick={() => toggle(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              selected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
            }`}>{label}</button>
        );
      })}
    </div>
  );
}

export default function CreateRoommateProfile() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { upload, loading: uploading } = useUpload();

  const [form, setForm] = useState({
    photo: '', age: '', gender: 'MALE', profession: 'STUDENT',
    collegeName: '', companyName: '',
    food: 'VEG', smoking: 'NO', drinking: 'NO', sleep: 'NIGHT_OWL',
    personality: 'AMBIVERT', cleanliness: 'NORMAL', guests: 'SOMETIMES', noise: 'OKAY',
    budgetMin: '', budgetMax: '', preferredAreas: [], hasRoom: false,
    bio: '', city: 'Bhopal', area: '',
  });
  const areas = CITY_AREAS[form.city] || [];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    try {
      const res = await upload('/users/upload-image', file, { folder: 'projectx/roommates' });
      if (res?.imageUrl) {
        setForm(prev => ({ ...prev, photo: res.imageUrl }));
        toast.success('Photo uploaded successfully');
      }
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const nextStep = () => {
    if (step === 0 && (!form.age || !form.gender)) { toast.error('Fill age and gender'); return; }
    if (step === 2 && (!form.budgetMin || !form.budgetMax)) { toast.error('Set your budget range'); return; }
    if (step === 3 && !form.city) { toast.error('Select your city'); return; }
    setStep(s => Math.min(4, s + 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...form,
        age: parseInt(form.age) || 20,
        budgetMin: parseInt(form.budgetMin) || 0,
        budgetMax: parseInt(form.budgetMax) || 0,
      };
      await roommateAPI.createProfile(data);
      toast.success('Roommate profile created!');
      router.push('/roommate');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create profile');
    }
    setLoading(false);
  };

  const steps = ['Basic Info', 'Lifestyle', 'Preferences', 'Location', 'Review'];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Create Roommate Profile</h1>
          <p className="text-sm text-gray-500 mb-6">Help us match you with compatible roommates</p>

          <StepIndicator current={step} total={5} />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">{steps[step]}</h2>

            {/* Step 1: Basic Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Age *</label>
                    <input type="number" value={form.age} onChange={e => update('age', e.target.value)}
                      placeholder="e.g., 22" className="input-field" min="16" max="60" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Gender *</label>
                    <ChipSelect options={['MALE', 'FEMALE', 'OTHER']} value={form.gender} onChange={v => update('gender', v)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Profession</label>
                  <ChipSelect options={['STUDENT', 'WORKING_PROFESSIONAL', 'FREELANCER', 'BUSINESS']} value={form.profession} onChange={v => update('profession', v)} />
                </div>
                {form.profession === 'STUDENT' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">College Name</label>
                    <input type="text" value={form.collegeName} onChange={e => update('collegeName', e.target.value)}
                      placeholder="e.g., MANIT Bhopal" className="input-field" />
                  </div>
                )}
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

            {/* Step 2: Lifestyle */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Food Preference</label>
                  <ChipSelect options={[{value: 'VEG', label: '🥗 Veg'}, {value: 'NON_VEG', label: '🍖 Non-Veg'}, {value: 'BOTH', label: '🍽️ Both'}]}
                    value={form.food} onChange={v => update('food', v)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sleep Schedule</label>
                  <ChipSelect options={[{value: 'EARLY_BIRD', label: '🌅 Early Bird'}, {value: 'NIGHT_OWL', label: '🌙 Night Owl'}]}
                    value={form.sleep} onChange={v => update('sleep', v)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Smoking</label>
                  <ChipSelect options={[{value: 'NO', label: '🚫 No'}, {value: 'YES', label: '🚬 Yes'}, {value: 'OCCASIONALLY', label: '🔥 Occasionally'}]}
                    value={form.smoking} onChange={v => update('smoking', v)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Drinking</label>
                  <ChipSelect options={[{value: 'NO', label: '🚫 No'}, {value: 'YES', label: '🍺 Yes'}, {value: 'OCCASIONALLY', label: '🥂 Occasionally'}]}
                    value={form.drinking} onChange={v => update('drinking', v)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Personality</label>
                  <ChipSelect options={['INTROVERT', 'EXTROVERT', 'AMBIVERT']} value={form.personality} onChange={v => update('personality', v)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Cleanliness</label>
                  <ChipSelect options={['VERY_CLEAN', 'NORMAL', 'RELAXED']} value={form.cleanliness} onChange={v => update('cleanliness', v)} />
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Budget Min (₹/mo) *</label>
                    <input type="number" value={form.budgetMin} onChange={e => update('budgetMin', e.target.value)}
                      placeholder="e.g., 3000" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Budget Max (₹/mo) *</label>
                    <input type="number" value={form.budgetMax} onChange={e => update('budgetMax', e.target.value)}
                      placeholder="e.g., 7000" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Guests Preference</label>
                  <ChipSelect options={['NO_GUESTS', 'SOMETIMES', 'OFTEN']} value={form.guests} onChange={v => update('guests', v)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Noise Tolerance</label>
                  <ChipSelect options={['QUIET', 'OKAY', 'LOUD_OK']} value={form.noise} onChange={v => update('noise', v)} />
                </div>
                <label className="flex items-center gap-3 p-3 bg-green-50 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={form.hasRoom} onChange={e => update('hasRoom', e.target.checked)}
                    className="rounded text-orange-500 w-5 h-5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">I already have a room</p>
                    <p className="text-xs text-gray-400">Mark this if you&apos;re looking for someone to share your existing room</p>
                  </div>
                </label>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bio</label>
                  <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                    placeholder="Tell potential roommates about yourself..." className="input-field min-h-[80px] resize-none" maxLength={300} />
                  <p className="text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">City *</label>
                  <select value={form.city} onChange={e => { update('city', e.target.value); update('area', ''); update('preferredAreas', []); }} className="input-field">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Area</label>
                  <input list="roommate-area-options" value={form.area} onChange={e => update('area', e.target.value)}
                    placeholder="Select or type area" className="input-field" />
                  <datalist id="roommate-area-options">
                    {areas.map(a => <option key={a} value={a} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Areas (select multiple)</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {areas.map(a => (
                      <button key={a} type="button"
                        onClick={() => update('preferredAreas', form.preferredAreas.includes(a) ? form.preferredAreas.filter(x => x !== a) : [...form.preferredAreas, a])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          form.preferredAreas.includes(a) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
                        }`}>{a}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-400">Age:</span> <span className="font-medium text-gray-900">{form.age}</span></div>
                    <div><span className="text-gray-400">Gender:</span> <span className="font-medium text-gray-900">{form.gender}</span></div>
                    <div><span className="text-gray-400">Profession:</span> <span className="font-medium text-gray-900">{form.profession.replace(/_/g, ' ')}</span></div>
                    <div><span className="text-gray-400">Food:</span> <span className="font-medium text-gray-900">{form.food}</span></div>
                    <div><span className="text-gray-400">Sleep:</span> <span className="font-medium text-gray-900">{form.sleep.replace(/_/g, ' ')}</span></div>
                    <div><span className="text-gray-400">Smoking:</span> <span className="font-medium text-gray-900">{form.smoking}</span></div>
                    <div><span className="text-gray-400">Budget:</span> <span className="font-medium text-gray-900">₹{form.budgetMin}-{form.budgetMax}/mo</span></div>
                    <div><span className="text-gray-400">City:</span> <span className="font-medium text-gray-900">{form.city}</span></div>
                  </div>
                </div>
                {form.bio && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">&ldquo;{form.bio}&rdquo;</p>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium ${step === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              {step < 4 ? (
                <button onClick={nextStep} className="btn-primary flex items-center gap-1.5">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-1.5">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Create Profile</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

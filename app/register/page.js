'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';
import { USER_INTEREST_OPTIONS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', interests: ['FIND_ROOM'] });
  const [otp, setOtp] = useState('');

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest],
    }));
  };

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.password) { toast.error('Fill all required fields'); return; }
    if (form.phone.length !== 10) { toast.error('Enter valid 10-digit phone'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.interests.length === 0) { toast.error('Select at least one interest'); return; }
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, phone: '+91' + form.phone, email: form.email || undefined, password: form.password, interests: form.interests });
      toast.success('Registered! Verify OTP (use 123456 for demo)');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOtp({ phone: '+91' + form.phone, otp });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success('Account verified!');
      router.push('/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="fyndkro logo"
            className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4 border border-orange-100 shadow-md"
          />
          <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join fyndkro — it&apos;s free!</p>
        </div>

        <div className="glass-panel p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                    placeholder="Enter your full name" className="input-field !pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">+91</span>
                  <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit phone" className="input-field !rounded-l-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email (optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                    placeholder="your@email.com" className="input-field !pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => updateForm('password', e.target.value)} placeholder="Min 6 characters" className="input-field !pl-10 !pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{strengthLabels[strength]}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">What are you interested in? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {USER_INTEREST_OPTIONS.map((option) => {
                    const selected = form.interests.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleInterest(option.id)}
                        className={`rounded-xl border p-3 text-left transition-colors ${selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                          }`}
                      >
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div className="text-xs font-semibold text-gray-800">{option.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleRegister} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900">Verify Your Phone</h3>
                <p className="text-sm text-gray-500 mt-1">OTP sent to +91 {form.phone}</p>
              </div>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP" className="input-field text-center text-2xl tracking-[0.5em] font-bold" maxLength={6} />
              <button onClick={handleVerify} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Verify & Continue</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">Already have an account?{' '}
              <Link href="/login" className="text-orange-500 font-semibold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

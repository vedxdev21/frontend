'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleClientId } from '@/components/GoogleAuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = useGoogleClientId();

  // Primary register form state
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', interests: ['FIND_ROOM'] });

  // If a new Google user registers, we store their Google data and show the phone input field
  const [googleData, setGoogleData] = useState(null);
  const [googlePhone, setGooglePhone] = useState('');

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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
    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name: form.name,
        phone: '+91' + form.phone,
        email: form.email || undefined,
        password: form.password,
        interests: form.interests
      });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success('Registration successful! Welcome to fyndkaro.');
      router.push('/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google sign-in failed');
      return;
    }
    setGoogleLoading(true);
    try {
      const { data } = await authAPI.googleAuth({ idToken: credentialResponse.credential });
      if (data?.accessToken && !data?.isNewUser) {
        login(data.accessToken, data.refreshToken, data.user);
        toast.success('Welcome back!');
        router.push(data.user?.city ? '/properties' : '/profile-setup');
      } else if (data?.isNewUser) {
        toast.success('Google verification successful! Please enter your phone number.');
        setGoogleData(data.googleData);
      } else {
        toast.error('Google login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google login failed');
    }
    setGoogleLoading(false);
  };

  const handleCompleteGoogleSignup = async () => {
    if (!googlePhone || googlePhone.length !== 10) {
      toast.error('Enter valid 10-digit phone');
      return;
    }
    setGoogleLoading(true);
    try {
      const { data } = await authAPI.googleAuthComplete({
        googleId: googleData.googleId,
        name: googleData.name,
        email: googleData.email,
        phone: '+91' + googlePhone,
        picture: googleData.picture
      });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success('Registration successful! Welcome to fyndkaro.');
      router.push('/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="fyndkaro logo"
            className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4 border border-orange-100 shadow-md"
          />
          <h1 className="text-2xl font-extrabold text-gray-900">
            {googleData ? 'Complete Registration' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {googleData ? 'Provide your phone number to get started' : 'Join fyndkaro — it\'s free!'}
          </p>
        </div>

        <div className="glass-panel p-6">
          {googleData ? (
            // Google Signup completion view
            <div className="space-y-4">
              <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100 flex items-center gap-3">
                {googleData.picture && (
                  <img src={googleData.picture} alt={googleData.name} className="w-10 h-10 rounded-full border border-orange-200" />
                )}
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-snug">{googleData.name}</p>
                  <p className="text-xs text-gray-500">{googleData.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">+91</span>
                  <input
                    type="tel"
                    value={googlePhone}
                    onChange={e => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit phone"
                    className="input-field !rounded-l-none"
                  />
                </div>
              </div>
              <button
                onClick={handleCompleteGoogleSignup}
                disabled={googleLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {googleLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Finish Signup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setGoogleData(null)}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel and use regular signup
              </button>
            </div>
          ) : (
            // Standard Signup view
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
              <button onClick={handleRegister} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
              </button>

              {googleClientId && (
                <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-3">
                  <p className="text-xs text-gray-400">Or sign up with</p>
                  <div className={`flex justify-center ${googleLoading ? 'pointer-events-none opacity-70' : ''}`}>
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => toast.error('Google sign-in failed')}
                      theme="outline"
                      shape="pill"
                      size="large"
                      width="280"
                    />
                  </div>
                </div>
              )}
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

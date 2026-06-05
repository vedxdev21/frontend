'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Phone, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleClientId } from '@/components/GoogleAuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState('phone');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = useGoogleClientId();

  // Phone login
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Email login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSendOTP = async () => {
    if (phone.length !== 10) { toast.error('Enter valid 10-digit phone number'); return; }
    setLoading(true);
    try {
      await authAPI.sendOtp({ phone: '+91' + phone });
      toast.success('OTP sent successfully!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.loginPhone({ phone: '+91' + phone, otp });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success('Welcome back!');
      router.push(data.user?.city ? '/properties' : '/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.loginEmail({ email, password });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success('Welcome back!');
      router.push(data.user?.city ? '/properties' : '/profile-setup');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
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
      if (data?.accessToken) {
        login(data.accessToken, data.refreshToken, data.user);
        toast.success('Welcome back!');
        router.push(data.user?.city ? '/properties' : '/profile-setup');
      } else if (data?.isNewUser) {
        toast.error(data?.message || 'Phone verification required. Please sign up with phone to continue.');
      } else {
        toast.error('Google login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google login failed');
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
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to your fyndkaro account</p>
        </div>

        <div className="glass-panel p-6">
          {/* Tab Toggle */}
          <div className="flex bg-white border border-orange-100 rounded-xl p-1 mb-6">
            <button onClick={() => { setTab('phone'); setStep(1); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'phone' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-orange-50'}`}>
              <Phone className="w-4 h-4 inline mr-1.5" /> Phone OTP
            </button>
            <button onClick={() => { setTab('email'); setStep(1); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'email' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-gray-500 hover:bg-orange-50'}`}>
              <Mail className="w-4 h-4 inline mr-1.5" /> Email
            </button>
          </div>

          {tab === 'phone' ? (
            step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">+91</span>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number" className="input-field !rounded-l-none" />
                  </div>
                </div>
                <button onClick={handleSendOTP} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Send OTP</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Enter OTP</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP" className="input-field text-center text-2xl tracking-[0.5em] font-bold" maxLength={6} />
                  <p className="text-xs text-gray-400 mt-2">OTP sent to +91 {phone}</p>
                </div>
                <button onClick={handleVerifyOTP} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Verify & Login</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button onClick={() => setStep(1)} className="text-sm text-orange-500 hover:underline w-full text-center">Change Number</button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" className="input-field !pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="input-field !pl-10 !pr-10" />
                  <button onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot Password?</Link>
              </div>
              <button onClick={handleEmailLogin} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Login</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {googleClientId && (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-3">
              <p className="text-xs text-gray-400">Or continue with</p>
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

          <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">Don&apos;t have an account?{' '}
              <Link href="/register" className="text-orange-500 font-semibold hover:underline">Sign Up</Link>
            </p>
            <p className="text-sm">
              <Link href="/forgot-password" className="text-gray-400 hover:text-orange-500 transition-colors">Forgot Password?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

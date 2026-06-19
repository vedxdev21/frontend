'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleClientId } from '@/components/GoogleAuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = useGoogleClientId();

  // Email or Phone login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.loginEmail({ email: identifier, password });
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
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email or Phone Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                  placeholder="your@email.com or 10-digit phone" className="input-field !pl-10" />
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
            <button onClick={handleLogin} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Login</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

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

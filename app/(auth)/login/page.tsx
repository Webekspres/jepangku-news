'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense } from 'react';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'ADMIN') router.push('/admin');
      else router.push(from);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="bg-white border border-jepang-black p-8 hard-shadow">
          <div className="text-center mb-6">
            <Link href="/" className="font-heading font-black text-3xl tracking-tighter">
              <span className="text-jepang-red">Jepang</span><span className="text-jepang-black">ku</span>
            </Link>
            <p className="small-caps text-jepang-muted mt-2">Welcome Back</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="small-caps mb-2 block">Email or Username</label>
              <input type="text" className="jepang-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid="login-email-input" />
            </div>
            <div>
              <label className="small-caps mb-2 block">Password</label>
              <input type="password" className="jepang-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required data-testid="login-password-input" />
            </div>

            {error && <div className="bg-jepang-red text-white p-3 text-sm" data-testid="login-error">{error}</div>}

            <button type="submit" disabled={loading} className="jepang-btn-primary w-full disabled:opacity-50" data-testid="login-submit-btn">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-jepang-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-jepang-red font-semibold hover:underline" data-testid="link-to-register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="small-caps text-jepang-muted">Loading...</p></div>}><LoginForm /></Suspense>;
}

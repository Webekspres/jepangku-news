import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { formatApiErrorDetail } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="bg-white border border-jepang-black p-8 hard-shadow">
          <div className="text-center mb-6">
            <Link to="/" className="font-heading font-black text-3xl tracking-tighter">
              <span className="text-jepang-red">Jepang</span><span className="text-jepang-black">ku</span>
            </Link>
            <p className="small-caps text-jepang-muted mt-2">Welcome Back</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="small-caps mb-2 block">Email or Username</label>
              <input
                type="text"
                className="jepang-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                data-testid="login-email-input"
              />
            </div>
            <div>
              <label className="small-caps mb-2 block">Password</label>
              <input
                type="password"
                className="jepang-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                data-testid="login-password-input"
              />
            </div>

            {error && (
              <div className="bg-jepang-red text-white p-3 text-sm" data-testid="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="jepang-btn-primary w-full disabled:opacity-50"
              data-testid="login-submit-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-jepang-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-jepang-red font-semibold hover:underline" data-testid="link-to-register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

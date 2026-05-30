import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { formatApiErrorDetail } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ name: form.name, username: form.username, email: form.email, password: form.password });
      navigate('/');
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white" data-testid="register-page">
      <div className="w-full max-w-md">
        <div className="bg-white border border-jepang-black p-8 hard-shadow">
          <div className="text-center mb-6">
            <Link to="/" className="font-heading font-black text-3xl tracking-tighter">
              <span className="text-jepang-red">Jepang</span><span className="text-jepang-black">ku</span>
            </Link>
            <p className="small-caps text-jepang-muted mt-2">Join the Community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div>
              <label className="small-caps mb-2 block">Display Name</label>
              <input
                type="text"
                className="jepang-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                data-testid="register-name-input"
              />
            </div>
            <div>
              <label className="small-caps mb-2 block">Username</label>
              <input
                type="text"
                className="jepang-input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                required
                pattern="[a-z0-9_]+"
                data-testid="register-username-input"
              />
            </div>
            <div>
              <label className="small-caps mb-2 block">Email</label>
              <input
                type="email"
                className="jepang-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                data-testid="register-email-input"
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
                minLength={6}
                data-testid="register-password-input"
              />
            </div>
            <div>
              <label className="small-caps mb-2 block">Confirm Password</label>
              <input
                type="password"
                className="jepang-input"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                data-testid="register-confirm-password-input"
              />
            </div>

            {error && (
              <div className="bg-jepang-red text-white p-3 text-sm" data-testid="register-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="jepang-btn-primary w-full disabled:opacity-50"
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-jepang-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-jepang-red font-semibold hover:underline" data-testid="link-to-login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

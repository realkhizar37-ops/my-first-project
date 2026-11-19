import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import { SeoHead } from '../../components/SeoHead';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export function AdminLoginPage() {
  const { user, isAdmin, signIn, requestPasswordReset } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (resetMode) {
        await requestPasswordReset(email);
        notify('Password reset email sent if account exists.', 'success');
        setResetMode(false);
      } else {
        await signIn(email, password);
        notify('Signed in as Administrator', 'success');
        navigate('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-theme" style={{ display: 'grid', placeItems: 'center', padding: '40px 16px' }}>
      <SeoHead title="Admin Login | Amplix Ecom" description="Secure administrator login for Amplix Ecom." />
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(214,189,138,0.2)', color: 'var(--admin-primary)', display: 'grid', placeItems: 'center' }}>
            <Lock size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>Admin Portal</h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--admin-muted)' }}>AMPLIX ECOM &bull; Executive Control</p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div style={{ padding: 14, borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 18, fontSize: '0.84rem', color: '#92400E' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <ShieldAlert size={16} /> Supabase Not Configured
            </div>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment and run the SQL migrations.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label" htmlFor="admin-email">Admin Email</label>
            <input id="admin-email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@amplixecom.com" />
          </div>

          {!resetMode && (
            <div>
              <label className="label" htmlFor="admin-pass">Password</label>
              <input id="admin-pass" type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>
          )}

          {error && (
            <div style={{ padding: 10, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading || !isSupabaseConfigured}>
            {loading ? 'Please wait...' : resetMode ? 'Send Reset Email' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: '0.84rem' }}>
          <button type="button" className="btn-ghost" style={{ border: 'none', cursor: 'pointer', fontSize: '0.84rem' }} onClick={() => setResetMode((v) => !v)}>
            {resetMode ? 'Back to Login' : 'Forgot Password?'}
          </button>
          <Link to="/" style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>&larr; Public Site</Link>
        </div>
      </div>
    </div>
  );
}

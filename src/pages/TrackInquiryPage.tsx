import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { trackInquiryByReference } from '../services/api';

interface TrackResult {
  reference_code: string;
  kind: string;
  status: string;
  service_label: string;
  created_at: string;
  updates: { title: string; status_label: string; message: string; created_at: string }[];
}

export function TrackInquiryPage() {
  const [params] = useSearchParams();
  const [refInput, setRefInput] = useState(params.get('ref') || '');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runLookup(code: string) {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await trackInquiryByReference(code);
      if (!data) {
        setError('No inquiry found with that reference code.');
      } else {
        setResult(data as TrackResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to look up inquiry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = params.get('ref');
    if (initial) runLookup(initial);
  }, [params]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runLookup(refInput);
  }

  return (
    <>
      <SeoHead title="Track Your Inquiry | Amplix Ecom" description="Check live status updates for your quote or project inquiry." />
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <span className="section-eyebrow">CLIENT PORTAL</span>
          <h1 className="section-title">Track Project Inquiry</h1>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>
            Enter the non-guessable reference code (e.g. QTE-A1B2C3D4E5F6) provided when you submitted your request.
          </p>

          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <input
              className="input"
              placeholder="Enter reference code (e.g. QTE-...)"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} /> {loading ? 'Checking...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.45)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {result && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reference</span>
                  <h3>{result.reference_code}</h3>
                </div>
                <span className="badge badge-blue">{result.status}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Service: <strong style={{ color: 'var(--text-white)' }}>{result.service_label}</strong>
              </p>

              <h4 style={{ marginBottom: 12 }}>Status Updates</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(result.updates || []).map((u, idx) => (
                  <div key={idx} style={{ padding: 14, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{u.title}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--blue-electric)' }}>{u.status_label}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{u.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

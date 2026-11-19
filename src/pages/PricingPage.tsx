import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_PACKAGES } from '../data/defaultCatalog';
import { fetchPricingPackages } from '../services/api';
import type { PricingPackage } from '../types';

export function PricingPage() {
  const [packages, setPackages] = useState<PricingPackage[]>(DEFAULT_PACKAGES);

  useEffect(() => {
    fetchPricingPackages().then(setPackages);
  }, []);

  return (
    <>
      <SeoHead
        title="Pricing & Packages | Amplix Ecom"
        description="Transparent Starter, Growth, Professional, and Enterprise packages for Shopify and web development."
      />
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="section-eyebrow">PRICING PACKAGES</span>
            <h1 className="section-title">Clear Packages Built Around Your Stage</h1>
            <p className="section-subtitle" style={{ margin: '0 auto 24px' }}>
              Choose a structured package or use our interactive Cost Calculator for a tailored estimate.
            </p>
            <Link to="/quote" className="btn btn-primary">Open Interactive Cost Calculator &rarr;</Link>
          </div>

          <div className="grid-4" style={{ marginBottom: 56 }}>
            {packages.map((pkg) => (
              <div
                key={pkg.slug}
                className="card"
                style={{
                  borderColor: pkg.is_featured ? 'var(--blue-electric)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong style={{ color: 'var(--blue-electric)' }}>{pkg.name}</strong>
                    {pkg.is_featured && <span className="badge badge-blue">Recommended</span>}
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 6 }}>
                    {pkg.currency} ${pkg.price}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>{pkg.tagline}</p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                    <div>Delivery: <strong style={{ color: 'var(--text-white)' }}>{pkg.delivery_time}</strong></div>
                    <div>Revisions: <strong style={{ color: 'var(--text-white)' }}>{pkg.revisions}</strong></div>
                    <div>Support: <strong style={{ color: 'var(--text-white)' }}>{pkg.support_duration}</strong></div>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22, fontSize: '0.88rem' }}>
                    {pkg.features.map((f) => (
                      <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, color: f.included ? 'var(--text-white)' : 'var(--text-muted)' }}>
                        {f.included ? <Check size={15} color="var(--success)" /> : <X size={15} color="var(--danger)" />}
                        {f.feature_text}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to={`/quote?package=${pkg.slug}`} className={`btn ${pkg.is_featured ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                  {pkg.cta_text}
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <h2 style={{ fontSize: '1.6rem', marginBottom: 20 }}>Package Comparison</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Deliverable</th>
                  {packages.map((p) => (
                    <th key={p.slug}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Starting Price</td>
                  {packages.map((p) => <td key={p.slug}><strong>${p.price}</strong></td>)}
                </tr>
                <tr>
                  <td>Delivery Time</td>
                  {packages.map((p) => <td key={p.slug}>{p.delivery_time}</td>)}
                </tr>
                <tr>
                  <td>Revisions</td>
                  {packages.map((p) => <td key={p.slug}>{p.revisions}</td>)}
                </tr>
                <tr>
                  <td>Post-Launch Support</td>
                  {packages.map((p) => <td key={p.slug}>{p.support_duration}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

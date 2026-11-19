import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_PROJECTS, DEFAULT_SERVICES } from '../data/defaultCatalog';
import { fetchPublishedProjects, fetchPublishedServices } from '../services/api';
import type { ProjectItem, ServiceItem } from '../types';

export function ServiceDetailPage() {
  const { slug } = useParams();
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    fetchPublishedServices().then(setServices);
    fetchPublishedProjects().then(setProjects);
  }, []);

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Service Not Found</h1>
          <Link to="/services" className="btn btn-primary">Back to All Services</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <SeoHead title={`${service.title} | Amplix Ecom`} description={service.short_description} />
      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 18 }}>
            <Link to="/">Home</Link> / <Link to="/services">Services</Link> / <span style={{ color: 'var(--text-white)' }}>{service.title}</span>
          </nav>

          <span className="badge badge-blue" style={{ marginBottom: 14 }}>{service.category}</span>
          <h1 className="section-title">{service.title}</h1>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>{service.description}</p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <Link to={`/quote?service=${service.slug}`} className="btn btn-primary">
              Request Quote (From ${service.starting_price})
            </Link>
            <Link to="/contact" className="btn btn-outline">Ask a Question</Link>
          </div>

          <div className="grid-2" style={{ marginBottom: 48 }}>
            <div className="card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Key Benefits</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {service.benefits.map((b) => (
                  <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={17} color="var(--blue-electric)" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Included Features</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {service.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={17} color="var(--success)" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>Delivery Process</h2>
          <div className="grid-4" style={{ marginBottom: 48 }}>
            {service.process_steps.map((st) => (
              <div key={st.step} className="card">
                <strong style={{ color: 'var(--blue-electric)' }}>{st.step}</strong>
                <h3 style={{ fontSize: '1.05rem', margin: '8px 0 6px' }}>{st.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{st.detail}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>Related Portfolio</h2>
          <div className="grid-3">
            {projects.slice(0, 3).map((p) => (
              <Link key={p.slug} to={`/portfolio/${p.slug}`} className="card card-hover">
                <span className="badge badge-blue" style={{ marginBottom: 10 }}>{p.category}</span>
                <h3 style={{ fontSize: '1.08rem', marginBottom: 6 }}>{p.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{p.short_description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_PROJECTS } from '../data/defaultCatalog';
import { fetchPublishedProjects } from '../services/api';
import type { ProjectItem } from '../types';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    fetchPublishedProjects().then(setProjects);
  }, []);

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Project Not Found</h1>
          <Link to="/portfolio" className="btn btn-primary">Back to Portfolio</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <SeoHead title={`${project.title} | Amplix Ecom`} description={project.short_description} />
      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 18 }}>
            <Link to="/">Home</Link> / <Link to="/portfolio">Portfolio</Link> / <span style={{ color: 'var(--text-white)' }}>{project.title}</span>
          </nav>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className="badge badge-blue">{project.category}</span>
            {project.is_demo && <span className="badge badge-amber">Demonstration Project</span>}
            {project.completion_date && <span className="badge">Completed: {project.completion_date}</span>}
          </div>

          <h1 className="section-title">{project.title}</h1>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>{project.description}</p>

          <div className="card" style={{ padding: 14, marginBottom: 32 }}>
            <img
              src={project.cover_image || 'images/project-shopify.jpg'}
              alt={project.title}
              style={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 12 }}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 36 }}>
            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Technologies Used</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.technologies.map((t) => (
                  <span key={t} className="badge badge-blue">{t}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 14 }}>Project Links &amp; Next Step</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {project.project_url && (
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    Visit Preview <ExternalLink size={15} />
                  </a>
                )}
                <Link to="/quote" className="btn btn-primary">Request Similar Build</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

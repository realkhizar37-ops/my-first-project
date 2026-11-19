import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { DEFAULT_SERVICES } from '../data/defaultCatalog';
import './Navbar.css';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-bar">
        <Link to="/" className="brand-logo" onClick={() => setDrawerOpen(false)}>
          <span className="brand-mark">A</span>
          <span>AMPLIX <span className="brand-accent">ECOM</span></span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary Navigation">
          <NavLink to="/" end className="nav-item">Home</NavLink>
          <NavLink to="/about" className="nav-item">About</NavLink>

          <div
            className="nav-dropdown"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className="nav-item dropdown-trigger"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
            >
              Services <ChevronDown size={15} />
            </button>
            {servicesOpen && (
              <div className="dropdown-panel">
                <div className="dropdown-grid">
                  {DEFAULT_SERVICES.slice(0, 8).map((svc) => (
                    <Link
                      key={svc.slug}
                      to={`/services/${svc.slug}`}
                      className="dropdown-link"
                      onClick={() => setServicesOpen(false)}
                    >
                      <strong>{svc.title}</strong>
                      <span>{svc.category}</span>
                    </Link>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <Link to="/services" onClick={() => setServicesOpen(false)}>
                    Explore All 15 Services &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div
            className="nav-dropdown"
            onMouseEnter={() => setPortfolioOpen(true)}
            onMouseLeave={() => setPortfolioOpen(false)}
          >
            <button
              type="button"
              className="nav-item dropdown-trigger"
              onClick={() => setPortfolioOpen((v) => !v)}
              aria-expanded={portfolioOpen}
            >
              Portfolio <ChevronDown size={15} />
            </button>
            {portfolioOpen && (
              <div className="dropdown-panel dropdown-panel-sm">
                <Link to="/portfolio" className="dropdown-link" onClick={() => setPortfolioOpen(false)}>
                  <strong>All Portfolio &amp; Inspirations</strong>
                  <span>Our Work &amp; Brand References</span>
                </Link>
                <Link to="/portfolio/shopify" className="dropdown-link" onClick={() => setPortfolioOpen(false)}>
                  <strong>Shopify Showcase</strong>
                  <span>5 Luxury Ecommerce References</span>
                </Link>
                <Link to="/portfolio/wordpress" className="dropdown-link" onClick={() => setPortfolioOpen(false)}>
                  <strong>WordPress Showcase</strong>
                  <span>5 Corporate &amp; Industry References</span>
                </Link>
              </div>
            )}
          </div>

          <NavLink to="/pricing" className="nav-item">Pricing</NavLink>
          <NavLink to="/contact" className="nav-item">Contact</NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/quote" className="btn btn-primary btn-sm">
            Get a Free Quote
          </Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle Menu"
          >
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="mobile-drawer">
          <Link to="/" onClick={() => setDrawerOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setDrawerOpen(false)}>About Us</Link>
          <Link to="/services" onClick={() => setDrawerOpen(false)}>All Services (15)</Link>
          <Link to="/portfolio" onClick={() => setDrawerOpen(false)}>Portfolio (All)</Link>
          <Link to="/portfolio/shopify" onClick={() => setDrawerOpen(false)}>Shopify References</Link>
          <Link to="/portfolio/wordpress" onClick={() => setDrawerOpen(false)}>WordPress References</Link>
          <Link to="/pricing" onClick={() => setDrawerOpen(false)}>Pricing</Link>
          <Link to="/faq" onClick={() => setDrawerOpen(false)}>FAQ</Link>
          <Link to="/contact" onClick={() => setDrawerOpen(false)}>Contact</Link>
          <Link to="/track" onClick={() => setDrawerOpen(false)}>Track Inquiry</Link>
          <Link to="/quote" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
            Get a Free Quote
          </Link>
        </div>
      )}
    </header>
  );
}

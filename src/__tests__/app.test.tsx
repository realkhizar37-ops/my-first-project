import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { DEFAULT_REFERENCES, DEFAULT_SERVICES } from '../data/defaultCatalog';
import { calculateProjectEstimate } from '../services/api';

function renderRoute(initialEntry: string) {
  return render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

describe('Amplix Ecom Luxury Black & Champagne Gold Platform', () => {
  it('renders homepage with luxury headline and verified contact info', () => {
    renderRoute('/');
    expect(screen.getByText(/Crafting Digital Experiences That/i)).toBeInTheDocument();
    expect(screen.getByText(/realkhizar37@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\+923099050330/i)).toBeInTheDocument();
  });

  it('includes all 15 services and 10 Shopify/WordPress references', () => {
    expect(DEFAULT_SERVICES).toHaveLength(15);
    expect(DEFAULT_REFERENCES.filter((r) => r.platform === 'Shopify')).toHaveLength(5);
    expect(DEFAULT_REFERENCES.filter((r) => r.platform === 'WordPress')).toHaveLength(5);
    renderRoute('/portfolio');
    expect(screen.getByText('Exceptional Digital Experiences. Inspired by Great Brands.')).toBeInTheDocument();
    expect(screen.getByText('Kith')).toBeInTheDocument();
    expect(screen.getByText('Raymond Realty')).toBeInTheDocument();
  });

  it('calculates project cost estimate accurately', () => {
    const std = calculateProjectEstimate(450, 'standard', 5, 0);
    const adv = calculateProjectEstimate(450, 'advanced', 10, 2);
    expect(std).toBe(450);
    expect(adv).toBeGreaterThan(std);
  });

  it('redirects unauthenticated visitors from /admin to /admin/login', async () => {
    renderRoute('/admin');
    expect(await screen.findByText('Admin Portal')).toBeInTheDocument();
  });

  it('renders custom 404 page for unknown routes', () => {
    renderRoute('/non-existent-route');
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});

import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { PricingPage } from './pages/PricingPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { QuotePage } from './pages/QuotePage';
import { ReferenceDetailPage } from './pages/ReferenceDetailPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { FaqPage, NotFoundPage, PrivacyPage, ProcessPage, TermsPage } from './pages/StaticPages';
import { TrackInquiryPage } from './pages/TrackInquiryPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export function AppRoutes() {
  return (
    <LayoutShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/portfolio" element={<PortfolioPage defaultPlatform="All" />} />
        <Route path="/portfolio/shopify" element={<PortfolioPage defaultPlatform="Shopify" />} />
        <Route path="/portfolio/wordpress" element={<PortfolioPage defaultPlatform="WordPress" />} />
        <Route path="/portfolio/reference/:slug" element={<ReferenceDetailPage />} />
        <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/track" element={<TrackInquiryPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </LayoutShell>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL === './' ? undefined : import.meta.env.BASE_URL;
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

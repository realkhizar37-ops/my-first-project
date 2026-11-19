import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  DollarSign,
  Download,
  FileText,
  FolderKanban,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { SeoHead } from '../../components/SeoHead';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import {
  exportToCsv,
  fetchAdminOverview,
  fetchDesignReferences,
  fetchFaqs,
  fetchPricingPackages,
  fetchPublishedProjects,
  fetchPublishedServices,
  fetchSiteSettings,
  fetchTestimonials,
} from '../../services/api';
import type {
  DesignReferenceItem,
  FaqItem,
  LeadItem,
  LeadPriority,
  LeadStatus,
  NotificationItem,
  PricingPackage,
  ProjectItem,
  QuoteRequestItem,
  QuoteStatus,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from '../../types';

type TabKey =
  | 'overview'
  | 'leads'
  | 'quotes'
  | 'services'
  | 'portfolio'
  | 'shopify_refs'
  | 'wordpress_refs'
  | 'pricing'
  | 'testimonials'
  | 'faqs'
  | 'content'
  | 'media'
  | 'notifications'
  | 'settings';

const NAV_ITEMS: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'quotes', label: 'Quotes', icon: FileText },
  { key: 'services', label: 'Services', icon: Briefcase },
  { key: 'portfolio', label: 'Our Work', icon: FolderKanban },
  { key: 'shopify_refs', label: 'Shopify Refs', icon: ShoppingBag },
  { key: 'wordpress_refs', label: 'WordPress Refs', icon: Globe },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
  { key: 'content', label: 'Site Content', icon: FileText },
  { key: 'media', label: 'Media Library', icon: ImageIcon },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function AdminDashboardPage() {
  const { user, signOut } = useAuth();
  const { notify } = useToast();

  const [tab, setTab] = useState<TabKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [references, setReferences] = useState<DesignReferenceItem[]>([]);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string }[]>([]);

  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');

  // Form states
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjCat, setNewProjCat] = useState('Shopify');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newRefName, setNewRefName] = useState('');
  const [newRefIndustry, setNewRefIndustry] = useState('');
  const [newRefUrl, setNewRefUrl] = useState('');
  const [newRefDesc, setNewRefDesc] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestQuote, setNewTestQuote] = useState('');

  async function loadAll() {
    const [ov, svc, prj, refs, pkg, tst, fq, stg] = await Promise.all([
      fetchAdminOverview(),
      fetchPublishedServices(true),
      fetchPublishedProjects(true),
      fetchDesignReferences(true),
      fetchPricingPackages(true),
      fetchTestimonials(true),
      fetchFaqs(true),
      fetchSiteSettings(),
    ]);
    setLeads(ov.leads);
    setQuotes(ov.quotes);
    setNotifications(ov.notifications);
    setServices(svc);
    setProjects(prj);
    setReferences(refs);
    setPackages(pkg);
    setTestimonials(tst);
    setFaqs(fq);
    setSettings(stg);

    if (supabase) {
      const { data: files } = await supabase.storage.from('media').list('', { limit: 50 });
      if (files) {
        setMediaFiles(
          files.map((f) => ({
            name: f.name,
            url: supabase!.storage.from('media').getPublicUrl(f.name).data.publicUrl,
          }))
        );
      }
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function updateLead(id: string, patch: Partial<LeadItem>) {
    if (!supabase) return;
    const { error } = await supabase.from('leads').update(patch).eq('id', id);
    if (error) return notify(error.message, 'error');
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    notify('Lead updated', 'success');
  }

  async function updateQuoteStatus(q: QuoteRequestItem, status: QuoteStatus, estimated_price?: number) {
    if (!supabase) return;
    const { error } = await supabase
      .from('quote_requests')
      .update({ status, estimated_price: estimated_price ?? q.estimated_price })
      .eq('id', q.id);
    if (error) return notify(error.message, 'error');
    setQuotes((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, status, estimated_price: estimated_price ?? item.estimated_price } : item))
    );
    await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'notify_quote_status',
        reference_code: q.reference_code,
        status,
        estimated_price: estimated_price ?? q.estimated_price,
        client_email: q.email,
        client_name: q.full_name,
      },
    });
    notify('Quote updated & client notified', 'success');
  }

  async function toggleServicePublish(s: ServiceItem) {
    if (!supabase) return;
    const next = !s.is_published;
    const { error } = await supabase.from('services').update({ is_published: next }).eq('id', s.id);
    if (error) return notify(error.message, 'error');
    setServices((prev) => prev.map((item) => (item.id === s.id ? { ...item, is_published: next } : item)));
    notify(`Service ${next ? 'published' : 'hidden'}`, 'success');
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const slug = `${newProjTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const { data, error } = await supabase
      .from('projects')
      .insert({
        slug,
        title: newProjTitle,
        category: newProjCat,
        short_description: newProjDesc,
        description: newProjDesc,
        cover_image: 'images/project-shopify.jpg',
        is_demo: false,
        is_published: true,
      })
      .select()
      .single();
    if (error) return notify(error.message, 'error');
    setProjects((prev) => [data as ProjectItem, ...prev]);
    setNewProjTitle('');
    setNewProjDesc('');
    notify('Project created', 'success');
  }

  async function deleteProject(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return notify(error.message, 'error');
    setProjects((prev) => prev.filter((p) => p.id !== id));
    notify('Project deleted', 'success');
  }

  async function addReference(e: React.FormEvent, platform: 'Shopify' | 'WordPress') {
    e.preventDefault();
    if (!supabase) return;
    const slug = `${newRefName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const { data, error } = await supabase
      .from('design_references')
      .insert({
        slug,
        name: newRefName,
        platform,
        industry: newRefIndustry,
        reference_url: newRefUrl,
        design_inspiration: newRefDesc,
        preview_image: platform === 'Shopify' ? 'images/project-shopify.jpg' : 'images/project-web.jpg',
        is_published: true,
      })
      .select()
      .single();
    if (error) return notify(error.message, 'error');
    setReferences((prev) => [...prev, data as DesignReferenceItem]);
    setNewRefName('');
    setNewRefIndustry('');
    setNewRefUrl('');
    setNewRefDesc('');
    notify(`${platform} reference added`, 'success');
  }

  async function deleteReference(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('design_references').delete().eq('id', id);
    if (error) return notify(error.message, 'error');
    setReferences((prev) => prev.filter((r) => r.id !== id));
    notify('Reference deleted', 'success');
  }

  async function addFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { data, error } = await supabase
      .from('faqs')
      .insert({ question: newFaqQ, answer: newFaqA, sort_order: faqs.length + 1, is_published: true })
      .select()
      .single();
    if (error) return notify(error.message, 'error');
    setFaqs((prev) => [...prev, data as FaqItem]);
    setNewFaqQ('');
    setNewFaqA('');
    notify('FAQ added', 'success');
  }

  async function addTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        client_name: newTestName,
        client_role: 'Verified Client',
        quote: newTestQuote,
        is_sample: false,
        is_approved: true,
        is_published: true,
      })
      .select()
      .single();
    if (error) return notify(error.message, 'error');
    setTestimonials((prev) => [data as TestimonialItem, ...prev]);
    setNewTestName('');
    setNewTestQuote('');
    notify('Testimonial added', 'success');
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !settings) return;
    const { error } = await supabase.from('site_settings').update(settings).eq('id', 'default');
    if (error) return notify(error.message, 'error');
    notify('Settings saved', 'success');
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error } = await supabase.storage.from('media').upload(fileName, file);
    if (error) return notify(error.message, 'error');
    const url = supabase.storage.from('media').getPublicUrl(fileName).data.publicUrl;
    setMediaFiles((prev) => [{ name: fileName, url }, ...prev]);
    notify('Uploaded to Media Library', 'success');
  }

  async function markAllNotificationsRead() {
    if (!supabase) return;
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    notify('All notifications marked read', 'success');
  }

  const filteredLeads = leads.filter((l) => {
    const matchStatus = leadStatusFilter === 'All' || l.status === leadStatusFilter;
    const matchSearch =
      !leadSearch.trim() ||
      l.full_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.reference_code.toLowerCase().includes(leadSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="admin-theme">
      <SeoHead title="Admin Dashboard | Amplix Ecom" description="Amplix Ecom Luxury White & Gold Admin Dashboard" />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 245,
            background: '#FFFFFF',
            borderRight: '1px solid var(--admin-border)',
            padding: 20,
            display: sidebarOpen ? 'flex' : undefined,
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--admin-text)' }}>
                AMPLIX <span style={{ color: 'var(--admin-primary)' }}>ADMIN</span>
              </Link>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'inline-flex' : 'none' }}>
                <X size={18} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setTab(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <Icon size={15} /> {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <button type="button" className="btn btn-outline btn-sm" onClick={signOut} style={{ marginTop: 20 }}>
            <LogOut size={15} /> Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header
            style={{
              height: 68,
              borderBottom: '1px solid var(--admin-border)',
              background: '#FFFFFF',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSidebarOpen((v) => !v)}>
                <Menu size={16} />
              </button>
              <strong style={{ textTransform: 'capitalize' }}>{tab.replace('_', ' ')}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" className="badge badge-gold" style={{ cursor: 'pointer' }} onClick={() => setTab('notifications')}>
                <Bell size={13} /> {unreadCount} Unread
              </button>
              <span style={{ fontSize: '0.84rem', color: 'var(--admin-muted)' }}>{user?.email}</span>
            </div>
          </header>

          <main style={{ padding: 24, flex: 1 }}>
            {tab === 'overview' && (
              <div>
                <div className="grid-4" style={{ marginBottom: 24 }}>
                  {[
                    ['Total Leads', leads.length],
                    ['New Leads', leads.filter((l) => l.status === 'New').length],
                    ['Pending Quotes', quotes.filter((q) => q.status === 'Pending').length],
                    ['Published Projects', projects.filter((p) => p.is_published).length],
                  ].map(([lbl, val]) => (
                    <div key={String(lbl)} className="card">
                      <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>{lbl}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--admin-primary)', fontFamily: 'var(--font-display)' }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div className="grid-2">
                  <div className="card">
                    <h3 style={{ marginBottom: 14 }}>Lead Pipeline (Live DB)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted'] as LeadStatus[]).map((st) => {
                        const cnt = leads.filter((l) => l.status === st).length;
                        const pct = leads.length ? Math.round((cnt / leads.length) * 100) : 0;
                        return (
                          <div key={st}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 4 }}>
                              <span>{st}</span>
                              <span>{cnt}</span>
                            </div>
                            <div style={{ height: 8, background: 'var(--admin-background)', borderRadius: 999 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--admin-primary)', borderRadius: 999 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="card">
                    <h3 style={{ marginBottom: 14 }}>Recent Notifications</h3>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>No notifications yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notifications.slice(0, 5).map((n) => (
                          <div key={n.id} style={{ padding: 10, background: 'var(--admin-background)', borderRadius: 8, fontSize: '0.84rem' }}>
                            <strong>{n.title}</strong>
                            <div style={{ color: 'var(--admin-muted)' }}>{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === 'leads' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input className="input" placeholder="Search leads..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} style={{ width: 220 }} />
                    <select className="select" value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)} style={{ width: 160 }}>
                      <option>All</option>
                      {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed'] as LeadStatus[]).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => exportToCsv('amplix-leads.csv', leads as unknown as Record<string, unknown>[])}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Ref</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((l) => (
                        <tr key={l.id}>
                          <td>{l.reference_code}</td>
                          <td>
                            <strong>{l.full_name}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>{l.email} • {l.whatsapp}</div>
                          </td>
                          <td>{l.service_required}</td>
                          <td>
                            <select className="select" value={l.priority} onChange={(e) => updateLead(l.id, { priority: e.target.value as LeadPriority })}>
                              {(['Low', 'Medium', 'High', 'Urgent'] as LeadPriority[]).map((p) => (
                                <option key={p}>{p}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select className="select" value={l.status} onChange={(e) => updateLead(l.id, { status: e.target.value as LeadStatus })}>
                              {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed'] as LeadStatus[]).map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'quotes' && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Estimate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q.id}>
                        <td>{q.reference_code}</td>
                        <td><strong>{q.full_name}</strong><div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>{q.email}</div></td>
                        <td>{q.service_slug}</td>
                        <td>${q.calculated_estimate}</td>
                        <td>
                          <select className="select" value={q.status} onChange={(e) => updateQuoteStatus(q, e.target.value as QuoteStatus)}>
                            {(['Pending', 'Reviewed', 'Quoted', 'Approved', 'Declined'] as QuoteStatus[]).map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'services' && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id}>
                        <td>{s.title}</td>
                        <td>{s.category}</td>
                        <td>${s.starting_price}</td>
                        <td>
                          <button type="button" className={`btn btn-sm ${s.is_published ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleServicePublish(s)}>
                            {s.is_published ? 'Published' : 'Hidden'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'portfolio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <form className="card grid-3" onSubmit={addProject}>
                  <input className="input" placeholder="Verified Project Title" required value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} />
                  <select className="select" value={newProjCat} onChange={(e) => setNewProjCat(e.target.value)}>
                    <option>Shopify</option>
                    <option>Speed</option>
                    <option>Web</option>
                  </select>
                  <button type="submit" className="btn btn-primary">Add Verified Project</button>
                  <input className="input" style={{ gridColumn: '1 / -1' }} placeholder="Project Description" required value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} />
                </form>
                <div className="grid-3">
                  {projects.map((p) => (
                    <div key={p.id} className="card">
                      <strong>{p.title}</strong>
                      <p style={{ color: 'var(--admin-muted)', fontSize: '0.86rem', margin: '8px 0 12px' }}>{p.short_description}</p>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteProject(p.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(tab === 'shopify_refs' || tab === 'wordpress_refs') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <form className="card grid-4" onSubmit={(e) => addReference(e, tab === 'shopify_refs' ? 'Shopify' : 'WordPress')}>
                  <input className="input" placeholder="Brand Name" required value={newRefName} onChange={(e) => setNewRefName(e.target.value)} />
                  <input className="input" placeholder="Industry" required value={newRefIndustry} onChange={(e) => setNewRefIndustry(e.target.value)} />
                  <input className="input" placeholder="https://..." required value={newRefUrl} onChange={(e) => setNewRefUrl(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Add Reference</button>
                  <input className="input" style={{ gridColumn: '1 / -1' }} placeholder="Design Inspiration Summary" required value={newRefDesc} onChange={(e) => setNewRefDesc(e.target.value)} />
                </form>
                <div className="grid-3">
                  {references
                    .filter((r) => r.platform === (tab === 'shopify_refs' ? 'Shopify' : 'WordPress'))
                    .map((r) => (
                      <div key={r.id} className="card">
                        <span className="badge badge-gold" style={{ marginBottom: 8 }}>{r.industry}</span>
                        <h4 style={{ marginBottom: 6 }}>{r.name}</h4>
                        <p style={{ fontSize: '0.84rem', color: 'var(--admin-muted)', marginBottom: 12 }}>{r.design_inspiration}</p>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteReference(r.id)}>Delete</button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {tab === 'pricing' && (
              <div className="grid-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="card">
                    <strong style={{ color: 'var(--admin-primary)' }}>{pkg.name}</strong>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '8px 0' }}>{pkg.currency} ${pkg.price}</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--admin-muted)' }}>{pkg.delivery_time} • {pkg.support_duration}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'testimonials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <form className="card grid-3" onSubmit={addTestimonial}>
                  <input className="input" placeholder="Client Name" required value={newTestName} onChange={(e) => setNewTestName(e.target.value)} />
                  <input className="input" placeholder="Verified Testimonial" required value={newTestQuote} onChange={(e) => setNewTestQuote(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Add Review</button>
                </form>
                <div className="grid-3">
                  {testimonials.map((t) => (
                    <div key={t.id} className="card">
                      <strong>{t.client_name}</strong>
                      <p style={{ fontSize: '0.86rem', color: 'var(--admin-muted)', marginTop: 8 }}>{t.quote}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'faqs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <form className="card grid-3" onSubmit={addFaq}>
                  <input className="input" placeholder="Question" required value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} />
                  <input className="input" placeholder="Answer" required value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} />
                  <button type="submit" className="btn btn-primary">Add FAQ</button>
                </form>
                {faqs.map((f) => (
                  <div key={f.id} className="card">
                    <strong>{f.question}</strong>
                    <p style={{ fontSize: '0.86rem', color: 'var(--admin-muted)', marginTop: 6 }}>{f.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {(tab === 'content' || tab === 'settings') && settings && (
              <form className="card" onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 }}>
                <h3>{tab === 'content' ? 'Website Content & SEO' : 'Business & Notification Settings'}</h3>
                <div>
                  <label className="label">Hero Headline</label>
                  <input className="input" value={settings.hero_headline} onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })} />
                </div>
                <div>
                  <label className="label">Hero Subheading</label>
                  <textarea className="textarea" rows={3} value={settings.hero_subcopy} onChange={(e) => setSettings({ ...settings, hero_subcopy: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div>
                    <label className="label">WhatsApp Number</label>
                    <input className="input" value={settings.whatsapp_number} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Contact Email</label>
                    <input className="input" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
              </form>
            )}

            {tab === 'media' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="card">
                  <label className="label">Upload Image to Supabase Media Library</label>
                  <input type="file" accept="image/*" onChange={handleFileUpload} />
                </div>
                <div className="grid-4">
                  {mediaFiles.map((m) => (
                    <div key={m.name} className="card" style={{ padding: 12 }}>
                      <img src={m.url} alt={m.name} style={{ height: 120, width: '100%', objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', wordBreak: 'break-all' }}>{m.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>Notification Center</h3>
                  <button type="button" className="btn btn-outline btn-sm" onClick={markAllNotificationsRead}>Mark All Read</button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--admin-muted)' }}>No notifications recorded.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ padding: 12, borderRadius: 8, background: 'var(--admin-background)', border: '1px solid var(--admin-border)' }}>
                        <strong>{n.title}</strong>
                        <p style={{ fontSize: '0.86rem', color: 'var(--admin-muted)' }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

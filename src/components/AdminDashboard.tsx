import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Database,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Monitor,
  Moon,
  Package,
  Pencil,
  Plus,
  Quote,
  Settings,
  ShoppingBag,
  Sun,
  Trash2,
  Upload,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
} from '../lib/firebase';
import {
  removeConsultation,
  removeEnquiry,
  removeProject,
  removeService,
  removeTestimonial,
  saveProject,
  saveService,
  saveSiteContent,
  saveTestimonial,
  seedStudioCatalogue,
  updateConsultationStatus,
  updateEnquiryStatus,
  useAdminStudioData,
} from '../hooks/useStudioData';
import { STUDIO_IMAGES } from '../lib/studioDefaults';
import type {
  ConsultationItem,
  ConsultationStatus,
  EnquiryStatus,
  OrderItem,
  ProductItem,
  ProjectCategory,
  ProjectItem,
  ServiceItem,
  SiteContent,
  TestimonialItem,
  ThemeMode,
} from '../types';
import { AdminLoginPage } from './AdminLoginPage';
import { CustomersSection } from './admin/CustomersSection';
import { OrdersSection } from './admin/OrdersSection';
import { OverviewSection } from './admin/OverviewSection';
import { ProductsSection } from './admin/ProductsSection';
import { WebsiteContentSection } from './admin/WebsiteContentSection';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  projects: ProjectItem[];
  products: ProductItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  siteContent: SiteContent;
  isSyncedFromDb: boolean;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onExitAdmin: () => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'settings'
  | 'projects'
  | 'consultations'
  | 'enquiries'
  | 'services'
  | 'testimonials';

const VALID_ADMIN_TABS: AdminTab[] = [
  'overview',
  'products',
  'orders',
  'customers',
  'settings',
  'projects',
  'consultations',
  'enquiries',
  'services',
  'testimonials',
];

function getInitialAdminTab(): AdminTab {
  if (typeof window === 'undefined') return 'overview';
  const slug = window.location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  if (slug === 'content') return 'settings';
  if (VALID_ADMIN_TABS.includes(slug as AdminTab)) {
    return slug as AdminTab;
  }
  return 'overview';
}

export function AdminDashboard({
  projects,
  products,
  services,
  testimonials,
  siteContent,
  isSyncedFromDb,
  theme,
  onThemeChange,
  onExitAdmin,
}: AdminDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialAdminTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [inspectOrder, setInspectOrder] = useState<OrderItem | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [seeding, setSeeding] = useState(false);

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
    if (typeof window !== 'undefined') {
      const targetPath = tab === 'overview' ? '/admin' : `/admin/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setActiveTab(getInitialAdminTab());
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Auth listener & server/Firestore RBAC verification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAuthorizedAdmin(false);
        setAuthLoading(false);
        return;
      }

      const emailMatch =
        Boolean(currentUser.emailVerified) &&
        currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

      if (emailMatch) {
        setIsAuthorizedAdmin(true);
        setAuthLoading(false);
        if (window.location.pathname === '/admin/login') {
          window.history.replaceState({}, '', '/admin');
        }
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        const authorized = adminDoc.exists() && Boolean(currentUser.emailVerified);
        setIsAuthorizedAdmin(authorized);
        if (authorized && window.location.pathname === '/admin/login') {
          window.history.replaceState({}, '', '/admin');
        }
      } catch {
        setIsAuthorizedAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Auto-seed Firestore collections once when an authorized admin opens an empty DB
  // and migrate legacy default phone numbers if present in site_content/landing
  useEffect(() => {
    if (!isAuthorizedAdmin) return;
    if (!isSyncedFromDb) {
      seedStudioCatalogue().catch(() => {
        // non-blocking; user can also trigger manually
      });
      return;
    }

    getDoc(doc(db, 'site_content', 'landing'))
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as SiteContent;
        const needsPhoneUpdate = data.studioPhone === '+1 (212) 555-0194';
        const needsWhatsappUpdate = data.whatsappNumber === '12125550194';
        if (needsPhoneUpdate || needsWhatsappUpdate) {
          saveSiteContent({
            ...data,
            studioPhone: needsPhoneUpdate ? '+91 8950123700' : data.studioPhone,
            whatsappNumber: needsWhatsappUpdate ? '918950123700' : data.whatsappNumber,
          }).catch(() => {
            // non-blocking migration
          });
        }
      })
      .catch(() => {
        // ignore read notice
      });
  }, [isAuthorizedAdmin, isSyncedFromDb]);

  const { consultations, enquiries, orders, customers, loadingAdminData } =
    useAdminStudioData(isAuthorizedAdmin);

  const notify = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    window.setTimeout(() => {
      setStatusBanner((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  };

  const handleLogout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/admin/login');
    }
  };

  const uploadStudioImage = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Administrator authentication required.');
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image must be smaller than 8 MB.');
    }

    const idToken = await user.getIdToken();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        dataBase64: base64,
      }),
    });

    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Image upload failed.');
    }
    return data.url;
  };

  // --- PROJECT FORM STATE ---
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState<ProjectCategory>('Residential');
  const [projLocation, setProjLocation] = useState('');
  const [projYear, setProjYear] = useState('2026');
  const [projArea, setProjArea] = useState('');
  const [projStyle, setProjStyle] = useState('');
  const [projSummary, setProjSummary] = useState('');
  const [projChallenge, setProjChallenge] = useState('');
  const [projSolution, setProjSolution] = useState('');
  const [projImageUrl, setProjImageUrl] = useState<string>(STUDIO_IMAGES.skyline);
  const [projFeatured, setProjFeatured] = useState(true);
  const [projOrder, setProjOrder] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjTitle('');
    setProjCategory('Residential');
    setProjLocation('');
    setProjYear('2026');
    setProjArea('');
    setProjStyle('');
    setProjSummary('');
    setProjChallenge('');
    setProjSolution('');
    setProjImageUrl(STUDIO_IMAGES.skyline);
    setProjFeatured(true);
    setProjOrder(projects.length + 1);
  };

  const startEditProject = (p: ProjectItem) => {
    setEditingProjectId(p.id);
    setProjTitle(p.title);
    setProjCategory(p.category);
    setProjLocation(p.location);
    setProjYear(p.year);
    setProjArea(p.area);
    setProjStyle(p.style);
    setProjSummary(p.summary);
    setProjChallenge(p.challenge || '');
    setProjSolution(p.solution || '');
    setProjImageUrl(p.imageUrl);
    setProjFeatured(p.featured);
    setProjOrder(p.order);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 8 * 1024 * 1024) {
      notify('error', 'Image must be smaller than 8 MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const idToken = await user.getIdToken();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          dataBase64: base64,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        notify('error', data.error || 'Image upload failed.');
        return;
      }

      setProjImageUrl(data.url);
      notify('success', 'Project image uploaded and attached.');
    } catch {
      notify('error', 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      await saveProject(
        {
          title: projTitle,
          category: projCategory,
          location: projLocation,
          year: projYear,
          area: projArea,
          style: projStyle,
          summary: projSummary,
          challenge: projChallenge,
          solution: projSolution,
          imageUrl: projImageUrl,
          featured: projFeatured,
          order: projOrder,
        },
        editingProjectId || undefined
      );
      notify('success', editingProjectId ? 'Project updated in Firestore.' : 'New project published.');
      resetProjectForm();
    } catch {
      notify('error', 'Failed to save project. Ensure all required fields are valid.');
    } finally {
      setSavingProject(false);
    }
  };

  // --- SERVICE FORM STATE ---
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvNumber, setSrvNumber] = useState('07');
  const [srvTitle, setSrvTitle] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvDeliverables, setSrvDeliverables] = useState('');
  const [srvDuration, setSrvDuration] = useState('8 – 12 Weeks');
  const [srvOrder, setSrvOrder] = useState(1);

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setSrvNumber(String(services.length + 1).padStart(2, '0'));
    setSrvTitle('');
    setSrvDesc('');
    setSrvDeliverables('');
    setSrvDuration('8 – 12 Weeks');
    setSrvOrder(services.length + 1);
  };

  const handleServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await saveService(
        {
          number: srvNumber,
          title: srvTitle,
          description: srvDesc,
          deliverables: srvDeliverables,
          duration: srvDuration,
          order: srvOrder,
        },
        editingServiceId || undefined
      );
      notify('success', editingServiceId ? 'Service updated.' : 'Service added.');
      resetServiceForm();
    } catch {
      notify('error', 'Could not save service.');
    }
  };

  // --- TESTIMONIAL FORM STATE ---
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testName, setTestName] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testProject, setTestProject] = useState('');
  const [testQuote, setTestQuote] = useState('');
  const [testOrder, setTestOrder] = useState(1);

  const resetTestForm = () => {
    setEditingTestId(null);
    setTestName('');
    setTestRole('');
    setTestProject('');
    setTestQuote('');
    setTestOrder(testimonials.length + 1);
  };

  const handleTestimonialSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await saveTestimonial(
        {
          clientName: testName,
          clientRole: testRole,
          projectTitle: testProject,
          quote: testQuote,
          order: testOrder,
        },
        editingTestId || undefined
      );
      notify('success', editingTestId ? 'Testimonial updated.' : 'Testimonial published.');
      resetTestForm();
    } catch {
      notify('error', 'Could not save testimonial.');
    }
  };

  // --- SITE CONTENT & SETTINGS STATE ---
  const [contentForm, setContentForm] = useState<SiteContent>(siteContent);
  useEffect(() => {
    setContentForm(siteContent);
  }, [siteContent]);

  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSiteContent(contentForm);
      notify('success', 'Website content and settings saved to Firestore.');
    } catch {
      notify('error', 'Failed to update website settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- CONSULTATION NOTES EDITOR ---
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [consultFilter, setConsultFilter] = useState<'all' | ConsultationStatus>('all');
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | EnquiryStatus>('all');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1EA] dark:bg-[#141412] text-[#252522] dark:text-[#F5F1EA]">
        <div className="text-center space-y-3">
          <div className="font-serif text-2xl tracking-[0.2em]">LUXORA LIVING</div>
          <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  // Protected Admin Gate: render dedicated AdminLoginPage if unauthenticated or unauthorized
  if (!user || !isAuthorizedAdmin) {
    return (
      <AdminLoginPage
        currentUser={user}
        isAuthorizedAdmin={isAuthorizedAdmin}
        onExitAdmin={onExitAdmin}
      />
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingConsultations = consultations.filter((c) => c.status === 'new').length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'unread').length;

  const filteredConsultations =
    consultFilter === 'all'
      ? consultations
      : consultations.filter((c) => c.status === consultFilter);

  const filteredEnquiries =
    enquiryFilter === 'all'
      ? enquiries
      : enquiries.filter((e) => e.status === enquiryFilter);

  const navItems: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard; count?: number }> = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: pendingOrdersCount || undefined },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length || undefined },
    { id: 'settings', label: 'Website Content', icon: Settings },
    { id: 'projects', label: 'Portfolio Projects', icon: FolderKanban, count: projects.length },
    { id: 'consultations', label: 'Consultations', icon: CalendarCheck, count: pendingConsultations || undefined },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquareText, count: unreadEnquiries || undefined },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'testimonials', label: 'Testimonials', icon: Quote },
  ];

  const handleInspectOrder = (order: OrderItem) => {
    setInspectOrder(order);
    selectTab('orders');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1EA] dark:bg-[#141412] text-[#252522] dark:text-[#F5F1EA]">
      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        aria-label="Mobile Admin Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#1A1A17] border-r border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 flex flex-col justify-between transition-transform duration-200 lg:hidden ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-xl tracking-[0.16em]">LUXORA LIVING</div>
              <p className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                Studio Admin Console
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav aria-label="Mobile Admin Sections" className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#252522] text-[#F5F1EA] dark:bg-[#C6A15B] dark:text-[#141412]'
                      : 'text-[#5A5851] dark:text-[#B8B2A6] hover:bg-[#F5F1EA] dark:hover:bg-[#252522]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span className="font-mono text-[11px] tabular-nums opacity-80">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 space-y-3">
          <div className="text-xs">
            <p className="font-medium truncate">{user.displayName || 'Studio Principal'}</p>
            <p className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6] truncate">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExitAdmin}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs hover:border-[#C6A15B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="p-2 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-[#5A5851] dark:text-[#B8B2A6] hover:text-red-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Centered Top Console Header & Desktop Navigation */}
      <header className="bg-white/90 dark:bg-[#1A1A17]/90 backdrop-blur-md border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 sticky top-0 z-30">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-[#5A5851] dark:text-[#B8B2A6]">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-[#252522] dark:text-[#F5F1EA]"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base sm:text-lg tracking-[0.14em] text-[#252522] dark:text-[#F5F1EA]">
                    LUXORA LIVING
                  </span>
                  <span className="hidden sm:inline text-[#D8C7B0] dark:text-[#F5F1EA]/25">/</span>
                  <span className="hidden sm:inline text-[#A8843F] dark:text-[#C6A15B] font-medium">
                    {navItems.find((n) => n.id === activeTab)?.label || activeTab}
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                  Studio Admin · {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="inline-flex items-center p-1 rounded-lg bg-[#EFE9DF] dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
                {(
                  [
                    { id: 'light', icon: Sun },
                    { id: 'dark', icon: Moon },
                    { id: 'system', icon: Monitor },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-label={`Switch to ${t.id} theme`}
                      onClick={() => onThemeChange(t.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        theme === t.id
                          ? 'bg-white dark:bg-[#141412] text-[#C6A15B] shadow-sm'
                          : 'text-[#5A5851] dark:text-[#B8B2A6]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={seeding}
                onClick={async () => {
                  setSeeding(true);
                  try {
                    await seedStudioCatalogue();
                    notify('success', 'Studio default catalogue synced to Firestore.');
                  } catch {
                    notify('error', 'Failed to sync default catalogue.');
                  } finally {
                    setSeeding(false);
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-medium hover:border-[#C6A15B] transition-colors disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>{seeding ? 'Syncing...' : 'Sync Catalogue'}</span>
              </button>

              <button
                type="button"
                onClick={onExitAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-medium hover:border-[#C6A15B] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Site</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="p-2 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-[#5A5851] dark:text-[#B8B2A6] hover:text-red-600 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Centered Desktop Section Navigation Bar */}
          <nav
            aria-label="Admin sections"
            className="hidden lg:flex items-center justify-center flex-wrap gap-1.5 pt-2.5 border-t border-[#D8C7B0]/40 dark:border-[#F5F1EA]/10"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#252522] text-[#F5F1EA] dark:bg-[#C6A15B] dark:text-[#141412]'
                      : 'text-[#5A5851] dark:text-[#B8B2A6] hover:bg-[#F5F1EA] dark:hover:bg-[#252522]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className="font-mono text-[11px] tabular-nums opacity-80">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Centered Workspace Column */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          {statusBanner && (
            <div
              role="status"
              className={`px-4 py-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
              }`}
            >
              <span>{statusBanner.text}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <OverviewSection
              products={products}
              orders={orders}
              customers={customers}
              consultations={consultations}
              enquiries={enquiries}
              loadingAdminData={loadingAdminData}
              onSelectTab={selectTab}
              onInspectOrder={handleInspectOrder}
            />
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <ProductsSection
              products={products}
              categories={siteContent.productCategories || []}
              onUploadImage={uploadStudioImage}
              onNotify={notify}
            />
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <OrdersSection
              orders={orders}
              products={products}
              selectedOrder={inspectOrder}
              onSelectOrder={setInspectOrder}
              onNotify={notify}
            />
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <CustomersSection
              customers={customers}
              orders={orders}
              onInspectOrder={handleInspectOrder}
              onNotify={notify}
            />
          )}

          {/* PORTFOLIO PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl">Portfolio Projects</h1>
                  <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
                    Add, edit, upload photography, or remove featured commissions.
                  </p>
                </div>
                {editingProjectId && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={resetProjectForm}
                      className="px-4 py-2 rounded-full text-xs border border-[#D8C7B0] dark:border-[#F5F1EA]/15"
                    >
                      Cancel Edit &amp; Create New
                    </button>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleProjectSubmit}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5"
              >
                <h2 className="font-serif text-2xl text-center sm:text-left">
                  {editingProjectId ? 'Edit Portfolio Commission' : 'Add New Commission'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <label className="space-y-1.5 md:col-span-2">
                    <span className="font-medium">Project Title *</span>
                    <input
                      type="text"
                      required
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="e.g., Belgravia Limestone Townhouse"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="font-medium">Category *</span>
                    <select
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value as ProjectCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Kitchen & Bath">Kitchen &amp; Bath</option>
                      <option value="Hospitality">Hospitality</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <label className="space-y-1.5">
                    <span className="font-medium">Location *</span>
                    <input
                      type="text"
                      required
                      value={projLocation}
                      onChange={(e) => setProjLocation(e.target.value)}
                      placeholder="London, UK"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-medium">Year *</span>
                    <input
                      type="text"
                      required
                      value={projYear}
                      onChange={(e) => setProjYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-medium">Area *</span>
                    <input
                      type="text"
                      required
                      value={projArea}
                      onChange={(e) => setProjArea(e.target.value)}
                      placeholder="4,200 sq ft"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-medium">Design Style *</span>
                    <input
                      type="text"
                      required
                      value={projStyle}
                      onChange={(e) => setProjStyle(e.target.value)}
                      placeholder="Warm Minimalism"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                </div>

                {/* Image Upload & Preview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#F5F1EA]/50 dark:bg-[#252522]/70 border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
                  <div className="md:col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-[#EFE9DF] dark:bg-[#141412]">
                    <ResilientImage
                      src={projImageUrl}
                      alt={projTitle || 'Project preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-8 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] font-medium cursor-pointer hover:opacity-90 transition-opacity">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Project Image'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <span className="text-[#5A5851] dark:text-[#B8B2A6]">
                        JPG, PNG, or WebP up to 8 MB
                      </span>
                    </div>
                    <label className="block space-y-1">
                      <span className="text-[#5A5851] dark:text-[#B8B2A6]">
                        Or specify image path / URL
                      </span>
                      <input
                        type="text"
                        required
                        value={projImageUrl}
                        onChange={(e) => setProjImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-mono"
                      />
                    </label>
                  </div>
                </div>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium">Project Summary *</span>
                  <textarea
                    required
                    rows={2}
                    value={projSummary}
                    onChange={(e) => setProjSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <label className="space-y-1.5">
                    <span className="font-medium">Spatial Brief (Optional)</span>
                    <textarea
                      rows={2}
                      value={projChallenge}
                      onChange={(e) => setProjChallenge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-medium">Material Resolution (Optional)</span>
                    <textarea
                      rows={2}
                      value={projSolution}
                      onChange={(e) => setProjSolution(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-6 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projFeatured}
                        onChange={(e) => setProjFeatured(e.target.checked)}
                        className="accent-[#C6A15B]"
                      />
                      <span>Featured on Landing Gallery</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <span>Display Order</span>
                      <input
                        type="number"
                        min={1}
                        value={projOrder}
                        onChange={(e) => setProjOrder(Number(e.target.value))}
                        className="w-16 px-2.5 py-1.5 rounded-lg bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs tabular-nums"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProject}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {savingProject
                        ? 'Saving...'
                        : editingProjectId
                          ? 'Update Commission'
                          : 'Publish Commission'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Existing Projects List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10"
                  >
                    <div className="w-28 h-24 shrink-0 rounded-xl overflow-hidden bg-[#EFE9DF] dark:bg-[#252522]">
                      <ResilientImage src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                          {p.category} · {p.location} · {p.year}
                        </p>
                        <h3 className="font-serif text-xl truncate">{p.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => startEditProject(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs hover:border-[#C6A15B]"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await removeProject(p.id);
                              notify('success', 'Project removed from Firestore.');
                            } catch {
                              notify('error', 'Failed to delete project.');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONSULTATIONS TAB */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl">Consultation Requests</h1>
                  <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
                    Review private client bookings, update appointment status, and store studio notes.
                  </p>
                </div>

                <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-xl bg-[#EFE9DF] dark:bg-[#1E1E1B] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-xs">
                  {(['all', 'new', 'scheduled', 'completed', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setConsultFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                        consultFilter === st
                          ? 'bg-white dark:bg-[#252522] shadow-sm'
                          : 'text-[#5A5851] dark:text-[#B8B2A6]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredConsultations.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 text-sm text-[#5A5851] dark:text-[#B8B2A6]">
                  No consultation requests matching this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConsultations.map((c: ConsultationItem) => (
                    <div
                      key={c.id}
                      className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-serif text-2xl">{c.fullName}</h3>
                          <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                            {c.email} · {c.phone}
                          </p>
                          <p className="text-xs text-[#A8843F] dark:text-[#C6A15B]">
                            {c.projectType} · {c.budgetRange} · {c.preferredStyle}
                            {c.propertySize ? ` · ${c.propertySize}` : ''}
                            {c.preferredDate ? ` · Target Date: ${c.preferredDate}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            aria-label={`Status for ${c.fullName}`}
                            value={c.status}
                            onChange={async (e) => {
                              try {
                                await updateConsultationStatus(
                                  c.id,
                                  e.target.value as ConsultationStatus
                                );
                                notify('success', 'Consultation status updated.');
                              } catch {
                                notify('error', 'Failed to update status.');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#F5F1EA] dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs capitalize"
                          >
                            <option value="new">New</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                          </select>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await removeConsultation(c.id);
                                notify('success', 'Consultation deleted.');
                              } catch {
                                notify('error', 'Failed to delete consultation.');
                              }
                            }}
                            aria-label={`Delete consultation for ${c.fullName}`}
                            className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {c.message && (
                        <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                          {c.message}
                        </p>
                      )}

                      {editingNotesId === c.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <input
                            type="text"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Internal principal notes..."
                            className="flex-1 px-3.5 py-2 rounded-lg bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateConsultationStatus(c.id, c.status, notesDraft);
                                setEditingNotesId(null);
                                notify('success', 'Studio notes saved.');
                              } catch {
                                notify('error', 'Failed to save notes.');
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-[#C6A15B] text-[#141412] text-xs font-medium"
                          >
                            Save Notes
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2 border-t border-[#D8C7B0]/40 dark:border-[#F5F1EA]/10 text-xs">
                          <span className="text-[#5A5851] dark:text-[#B8B2A6]">
                            {c.adminNotes ? `Studio Note: ${c.adminNotes}` : 'No internal notes yet.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotesId(c.id);
                              setNotesDraft(c.adminNotes || '');
                            }}
                            className="text-[#A8843F] dark:text-[#C6A15B] hover:underline"
                          >
                            {c.adminNotes ? 'Edit Note' : 'Add Note'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ENQUIRIES TAB */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl">Customer Enquiries</h1>
                  <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
                    Leads from the Contact section and LUXORA AI assistant.
                  </p>
                </div>

                <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-xl bg-[#EFE9DF] dark:bg-[#1E1E1B] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-xs">
                  {(['all', 'unread', 'replied', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEnquiryFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                        enquiryFilter === st
                          ? 'bg-white dark:bg-[#252522] shadow-sm'
                          : 'text-[#5A5851] dark:text-[#B8B2A6]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredEnquiries.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 text-sm text-[#5A5851] dark:text-[#B8B2A6]">
                  No enquiries matching this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEnquiries.map((eq) => (
                    <div
                      key={eq.id}
                      className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[#A8843F] dark:text-[#C6A15B]">
                            <span>{eq.source === 'ai_assistant' ? 'LUXORA AI Concierge' : 'Direct Contact Form'}</span>
                            <span>·</span>
                            <span className="capitalize">{eq.status}</span>
                          </div>
                          <h3 className="font-serif text-2xl">{eq.subject}</h3>
                          <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                            {eq.name} · {eq.email} {eq.phone ? `· ${eq.phone}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateEnquiryStatus(
                                  eq.id,
                                  eq.status === 'replied' ? 'archived' : 'replied'
                                );
                                notify('success', 'Enquiry status updated.');
                              } catch {
                                notify('error', 'Failed to update enquiry.');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs hover:border-[#C6A15B]"
                          >
                            <Check className="w-3.5 h-3.5 text-[#C6A15B]" />
                            <span>{eq.status === 'replied' ? 'Archive' : 'Mark Replied'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await removeEnquiry(eq.id);
                                notify('success', 'Enquiry removed.');
                              } catch {
                                notify('error', 'Failed to delete enquiry.');
                              }
                            }}
                            aria-label="Delete enquiry"
                            className="p-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                        {eq.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="font-serif text-3xl sm:text-4xl">Manage Services</h1>
                <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
                  Customize studio disciplines, deliverables, and duration windows displayed on the landing page.
                </p>
              </div>

              <form
                onSubmit={handleServiceSubmit}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="space-y-1">
                    <span className="font-medium">Number</span>
                    <input
                      type="text"
                      required
                      value={srvNumber}
                      onChange={(e) => setSrvNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="font-medium">Service Title *</span>
                    <input
                      type="text"
                      required
                      value={srvTitle}
                      onChange={(e) => setSrvTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-medium">Timeline *</span>
                    <input
                      type="text"
                      required
                      value={srvDuration}
                      onChange={(e) => setSrvDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-medium">Description *</span>
                  <textarea
                    required
                    rows={2}
                    value={srvDesc}
                    onChange={(e) => setSrvDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <label className="space-y-1 md:col-span-3">
                    <span className="font-medium">Deliverables *</span>
                    <input
                      type="text"
                      required
                      value={srvDeliverables}
                      onChange={(e) => setSrvDeliverables(e.target.value)}
                      placeholder="Concept Books · Material Boards · Full Procurement"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-full bg-[#C6A15B] text-[#141412] font-medium hover:bg-[#b5904b]"
                  >
                    {editingServiceId ? 'Update Service' : 'Add Service'}
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-mono text-[#A8843F] dark:text-[#C6A15B]">
                        {s.number}. · {s.duration}
                      </div>
                      <h3 className="font-serif text-xl mt-1">{s.title}</h3>
                      <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] mt-1.5 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(s.id);
                          setSrvNumber(s.number);
                          setSrvTitle(s.title);
                          setSrvDesc(s.description);
                          setSrvDeliverables(s.deliverables);
                          setSrvDuration(s.duration);
                          setSrvOrder(s.order);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await removeService(s.id);
                            notify('success', 'Service removed.');
                          } catch {
                            notify('error', 'Failed to delete service.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTIMONIALS TAB */}
          {activeTab === 'testimonials' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="font-serif text-3xl sm:text-4xl">Client Testimonials</h1>
                <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
                  Curate attributable client perspectives displayed on the public studio landing page.
                </p>
              </div>

              <form
                onSubmit={handleTestimonialSubmit}
                className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="space-y-1">
                    <span className="font-medium">Client Name *</span>
                    <input
                      type="text"
                      required
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-medium">Role &amp; City *</span>
                    <input
                      type="text"
                      required
                      value={testRole}
                      onChange={(e) => setTestRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-medium">Commission Title *</span>
                    <input
                      type="text"
                      required
                      value={testProject}
                      onChange={(e) => setTestProject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-medium">Quote *</span>
                  <textarea
                    required
                    rows={3}
                    value={testQuote}
                    onChange={(e) => setTestQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
                  />
                </label>

                <div className="flex justify-center pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] font-medium hover:bg-[#b5904b]"
                  >
                    {editingTestId ? 'Update Testimonial' : 'Publish Testimonial'}
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <p className="font-serif text-lg italic">“{t.quote}”</p>
                      <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                        {t.clientName} · {t.clientRole} · {t.projectTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestId(t.id);
                          setTestName(t.clientName);
                          setTestRole(t.clientRole);
                          setTestProject(t.projectTitle);
                          setTestQuote(t.quote);
                          setTestOrder(t.order);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await removeTestimonial(t.id);
                            notify('success', 'Testimonial removed.');
                          } catch {
                            notify('error', 'Failed to delete testimonial.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENT & SETTINGS TAB */}
          {activeTab === 'settings' && (
            <WebsiteContentSection
              contentForm={contentForm}
              setContentForm={setContentForm}
              onSubmit={handleSettingsSubmit}
              saving={savingSettings}
              onUploadImage={uploadStudioImage}
              onNotify={notify}
            />
          )}
        </main>
    </div>
  );
}

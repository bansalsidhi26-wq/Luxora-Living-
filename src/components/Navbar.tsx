import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import luxoraLogo from '../../Images/Luxora Living Luxury Logo.png';
import type { ThemeMode } from '../types';

interface NavbarProps {
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  forceSolidHeader?: boolean;
}

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Projects' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar({
  theme,
  onThemeChange,
  onNavigateSection,
  onOpenAdmin,
  forceSolidHeader = false,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigateSection(id);
  };

  const isSolid = forceSolidHeader || scrolled;
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isSolid
          ? 'bg-[#F5F1EA]/92 dark:bg-[#141412]/92 backdrop-blur-md border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 py-3.5'
          : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent py-5'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4 lg:gap-6">
        {/* Zone 1: Brand Logo & Wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          className={`inline-flex items-center gap-2.5 sm:gap-3 font-serif text-base sm:text-2xl tracking-[0.12em] sm:tracking-[0.18em] font-medium whitespace-nowrap shrink-0 transition-colors ${
            isSolid ? 'text-[#252522] dark:text-[#F5F1EA]' : 'text-white'
          }`}
        >
          <span className="w-12 h-8 sm:w-14 sm:h-9 rounded-md overflow-hidden border border-[#C6A15B]/75 bg-[#F8F4EC] shrink-0 shadow-sm">
            <img
              src={luxoraLogo}
              alt="LUXORA LIVING Luxury Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </span>
          <span>LUXORA LIVING</span>
        </a>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className={`group relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                isSolid
                  ? 'text-[#252522]/85 hover:text-[#252522] dark:text-[#F5F1EA]/85 dark:hover:text-[#F5F1EA]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-[#C6A15B] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Zone 3: Admin Panel Access, Theme Switcher & Primary CTA */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C6A15B] ${
              isSolid
                ? 'border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-[#252522] dark:text-[#F5F1EA] hover:border-[#C6A15B] hover:text-[#A8843F] dark:hover:text-[#C6A15B]'
                : 'border-white/25 text-white hover:border-[#C6A15B] bg-black/20'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Admin Panel</span>
          </button>

          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setThemeMenuOpen((prev) => !prev)}
              aria-label={`Theme: ${theme}`}
              aria-expanded={themeMenuOpen}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C6A15B] ${
                isSolid
                  ? 'border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-[#252522] dark:text-[#F5F1EA] hover:border-[#C6A15B]'
                  : 'border-white/25 text-white hover:border-[#C6A15B] bg-black/20'
              }`}
            >
              <ThemeIcon className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span className="capitalize">{theme}</span>
            </button>

            {themeMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 shadow-xl py-1.5 z-50"
              >
                {(
                  [
                    { id: 'light', label: 'Light Theme', icon: Sun },
                    { id: 'dark', label: 'Dark Theme', icon: Moon },
                    { id: 'system', label: 'System Theme', icon: Monitor },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      role="menuitemradio"
                      aria-checked={active}
                      type="button"
                      onClick={() => {
                        onThemeChange(opt.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors ${
                        active
                          ? 'text-[#A8843F] dark:text-[#C6A15B] font-semibold bg-[#F5F1EA]/70 dark:bg-[#252522]'
                          : 'text-[#252522] dark:text-[#F5F1EA]/85 hover:bg-[#F5F1EA]/50 dark:hover:bg-[#252522]/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <a
            href="#consultation"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('consultation');
            }}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-medium tracking-wide bg-[#C6A15B] text-[#141412] hover:bg-[#b5904b] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A15B]"
          >
            Book Consultation
          </a>
        </div>

        {/* Mobile / Tablet Quick Admin + Menu Toggle */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenAdmin();
            }}
            aria-label="Open Admin Panel"
            className={`inline-flex items-center gap-1.5 px-3 h-10 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              isSolid
                ? 'border-[#D8C7B0] dark:border-[#F5F1EA]/20 text-[#252522] dark:text-[#F5F1EA] hover:border-[#C6A15B]'
                : 'border-white/30 text-white bg-black/25 hover:border-[#C6A15B]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
              isSolid
                ? 'border-[#D8C7B0] dark:border-[#F5F1EA]/20 text-[#252522] dark:text-[#F5F1EA]'
                : 'border-white/30 text-white bg-black/25'
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#F5F1EA] dark:bg-[#141412] border-b border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 px-6 py-6 space-y-5 shadow-lg">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className="min-h-[44px] flex items-center text-base font-medium text-[#252522] dark:text-[#F5F1EA] border-b border-[#D8C7B0]/35 dark:border-[#F5F1EA]/10"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="space-y-2.5">
            <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">Appearance</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onThemeChange(opt.id)}
                    className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-[#252522] text-[#F5F1EA] dark:bg-[#C6A15B] dark:text-[#141412] border-transparent'
                        : 'border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-[#252522] dark:text-[#F5F1EA]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <a
              href="#consultation"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('consultation');
              }}
              className="w-full min-h-[44px] flex items-center justify-center rounded-full bg-[#C6A15B] text-[#141412] text-sm font-medium"
            >
              Book Consultation
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdmin();
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/20 text-sm font-medium text-[#252522] dark:text-[#F5F1EA]"
            >
              <LayoutDashboard className="w-4 h-4 text-[#C6A15B]" />
              <span>Open Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

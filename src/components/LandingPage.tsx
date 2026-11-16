import { FormEvent, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import luxoraFooterLogo from '../../Images/Luxora Living Luxury Logo.png';
import {
  DESIGN_PROCESS_STEPS,
  STUDIO_IMAGES,
  WHY_CHOOSE_PILLARS,
} from '../lib/studioDefaults';
import { submitConsultation, submitEnquiry, submitOrder } from '../hooks/useStudioData';
import type {
  ProductItem,
  ProjectCategory,
  ProjectItem,
  ServiceItem,
  SiteContent,
  TestimonialItem,
  ThemeMode,
} from '../types';
import { BackToTop } from './BackToTop';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { BrandLoader } from './BrandLoader';
import { LuxoraAssistant } from './LuxoraAssistant';
import { Navbar } from './Navbar';
import { ProjectLightbox } from './ProjectLightbox';
import { ResilientImage } from './ResilientImage';

interface LandingPageProps {
  projects: ProjectItem[];
  products: ProductItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  siteContent: SiteContent;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onOpenAdmin: () => void;
  onOpenTerms: () => void;
}

const CATEGORIES: Array<'All' | ProjectCategory> = [
  'All',
  'Residential',
  'Penthouse',
  'Kitchen & Bath',
  'Hospitality',
];

const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

const SCROLL_VIEWPORT = {
  once: true,
  amount: 0.12,
  margin: '0px 0px -48px 0px',
} as const;

const sectionFade = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.02 },
  transition: { duration: 0.75, ease: LUXURY_EASE },
};

const slideUp = (delay = 0, distance = 26) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: SCROLL_VIEWPORT,
  transition: { duration: 0.72, delay, ease: LUXURY_EASE },
});

const clipImageReveal = (delay = 0) => ({
  initial: { opacity: 0, clipPath: 'inset(10% 0% 0% 0%)' },
  whileInView: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' },
  viewport: SCROLL_VIEWPORT,
  transition: { duration: 0.85, delay, ease: LUXURY_EASE },
});

const imageZoomSettle = (delay = 0) => ({
  initial: { scale: 1.09 },
  whileInView: { scale: 1 },
  viewport: SCROLL_VIEWPORT,
  transition: { duration: 0.9, delay, ease: LUXURY_EASE },
});

export function LandingPage({
  projects,
  products,
  services,
  testimonials,
  siteContent,
  theme,
  onThemeChange,
  onOpenAdmin,
  onOpenTerms,
}: LandingPageProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.09]);

  const aboutImageRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutImageRef,
    offset: ['start end', 'end start'],
  });
  const aboutImageY = useTransform(aboutScrollProgress, [0, 1], ['-5%', '5%']);

  const [activeCategory, setActiveCategory] = useState<'All' | ProjectCategory>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Curated Collection & Order Placement State
  const [activeProductCategory, setActiveProductCategory] = useState<string>('All');
  const [orderProduct, setOrderProduct] = useState<ProductItem | null>(null);
  const [orderQty, setOrderQty] = useState('1');
  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');
  const [orderError, setOrderError] = useState('');

  // Consultation Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('Private Residence');
  const [propertySize, setPropertySize] = useState('');
  const [budgetRange, setBudgetRange] = useState('$150,000 – $350,000');
  const [preferredStyle, setPreferredStyle] = useState('Architectural Warm Minimalism');
  const [preferredDate, setPreferredDate] = useState('');
  const [consultMessage, setConsultMessage] = useState('');
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);
  const [consultError, setConsultError] = useState('');

  // Quick Contact Enquiry State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const handleConsultationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConsultError('');

    if (fullName.trim().length < 2) {
      setConsultError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setConsultError('Please provide a valid email address.');
      return;
    }
    if (phone.trim().length < 5) {
      setConsultError('Please provide a contact phone number.');
      return;
    }

    setConsultSubmitting(true);
    try {
      await submitConsultation({
        fullName,
        email,
        phone,
        projectType,
        propertySize,
        budgetRange,
        preferredStyle,
        preferredDate,
        message: consultMessage,
      });
      setConsultSuccess(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setPropertySize('');
      setPreferredDate('');
      setConsultMessage('');
    } catch {
      setConsultError('Unable to submit consultation booking. Please verify your inputs and try again.');
    } finally {
      setConsultSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactError('');

    if (contactName.trim().length < 2) {
      setContactError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError('Please provide a valid email address.');
      return;
    }
    if (contactMessage.trim().length < 5) {
      setContactError('Please share a brief message.');
      return;
    }

    setContactSubmitting(true);
    try {
      await submitEnquiry({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        subject: contactSubject.trim() || 'Studio General Enquiry',
        message: contactMessage,
        source: 'contact',
      });
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactSubject('');
      setContactMessage('');
    } catch {
      setContactError('Unable to send message right now. Please try WhatsApp or email directly.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const rawWhatsapp = siteContent.whatsappNumber.replace(/[^0-9]/g, '') || '918950123700';
  const cleanWhatsapp = rawWhatsapp.length === 10 ? `91${rawWhatsapp}` : rawWhatsapp;
  const whatsappHref = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hello LUXORA LIVING, I would like to inquire about a private interior design consultation.'
  )}`;

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#252522] dark:bg-[#141412] dark:text-[#F5F1EA]">
      <BrandLoader />
      <Navbar
        theme={theme}
        onThemeChange={onThemeChange}
        onNavigateSection={scrollToSection}
        onOpenAdmin={onOpenAdmin}
      />

      <main>
        {/* 1. HERO SECTION */}
        <section
          id="hero"
          ref={heroRef}
          className="relative min-h-[92vh] lg:min-h-screen flex items-end overflow-hidden bg-[#141412]"
        >
          <motion.div
            style={{ y: heroImageY, scale: heroImageScale }}
            className="absolute inset-0 -top-10 -bottom-10 will-change-transform"
          >
            <ResilientImage
              src={siteContent.heroImageUrl || STUDIO_IMAGES.hero}
              alt="LUXORA LIVING luxury architectural living room with travertine fireplace, curved cream boucle sofa, and champagne gold lighting"
              loading="eager"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Measured gradient scrim for WCAG AA legibility */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
          />

          <div className="relative z-10 max-w-[1360px] mx-auto w-full px-5 sm:px-8 pt-36 pb-16 sm:pb-24">
            <div className="max-w-3xl space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: LUXURY_EASE }}
                className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#D8C7B0]"
              >
                LUXORA LIVING · Designing Spaces. Defining Elegance.
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.18, ease: LUXURY_EASE }}
                className="font-serif text-[clamp(2.45rem,5vw,4.35rem)] leading-[1.06] font-normal text-white tracking-tight"
              >
                {siteContent.heroHeadline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.28, ease: LUXURY_EASE }}
                className="text-sm sm:text-base text-[#F5F1EA]/90 max-w-2xl leading-relaxed"
              >
                {siteContent.heroSubtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.72, delay: 0.38, ease: LUXURY_EASE }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <a
                  href="#projects"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('projects');
                  }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#C6A15B] text-[#141412] text-sm font-medium hover:bg-[#d4b06b] transition-colors whitespace-nowrap"
                >
                  <span>Explore Our Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#consultation"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('consultation');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/35 text-white text-sm font-medium hover:border-[#C6A15B] hover:text-[#C6A15B] transition-colors whitespace-nowrap backdrop-blur-sm"
                >
                  <span>Schedule Private Consultation</span>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Optional Admin-Managed Announcement Strip */}
        {siteContent.announcementEnabled && siteContent.announcementText && (
          <div className="bg-[#252522] text-[#F5F1EA] border-b border-[#C6A15B]/30 py-3 px-5 text-center text-xs tracking-[0.12em] uppercase">
            <span className="text-[#C6A15B] mr-2">Studio Notice ·</span>
            <span>{siteContent.announcementText}</span>
          </div>
        )}

        {/* 2. ABOUT LUXORA LIVING SECTION */}
        <motion.section
          id="about"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
        >
          <div className="max-w-[1360px] mx-auto space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between gap-8">
                <div className="space-y-5">
                  <motion.p
                    {...slideUp(0.02, 18)}
                    className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
                  >
                    About The Studio
                  </motion.p>
                  <motion.h2
                    {...slideUp(0.1)}
                    className="font-serif text-3xl sm:text-5xl font-normal leading-[1.12]"
                  >
                    {siteContent.aboutTitle}
                  </motion.h2>
                  <motion.p
                    {...slideUp(0.18)}
                    className="text-base text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed"
                  >
                    {siteContent.aboutDescription}
                  </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12">
                  <motion.div {...slideUp(0.22, 20)}>
                    <h3 className="font-serif text-xl mb-1.5">Material Honesty</h3>
                    <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                      Honed Roman travertine, limewash plaster, Belgian flax, and solid fumed walnut selected to age gracefully.
                    </p>
                  </motion.div>
                  <motion.div {...slideUp(0.3, 20)}>
                    <h3 className="font-serif text-xl mb-1.5">Global Craftsmanship</h3>
                    <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                      Direct partnerships with Italian stone ateliers, Swiss lighting engineers, and bespoke cabinetmakers.
                    </p>
                  </motion.div>
                </div>
              </div>

              <motion.div
                ref={aboutImageRef}
                {...clipImageReveal(0.12)}
                className="lg:col-span-6 aspect-[4/3] lg:aspect-auto lg:min-h-[460px] rounded-2xl overflow-hidden border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10"
              >
                <motion.div
                  style={{ y: aboutImageY }}
                  {...imageZoomSettle(0.12)}
                  className="w-full h-[112%] -mt-[6%] will-change-transform"
                >
                  <ResilientImage
                    src={STUDIO_IMAGES.about}
                    alt="LUXORA LIVING atelier material library table with travertine stone, brass hardware, and linen swatches"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Full-width Studio Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12">
              {[
                { value: '14 Years', label: 'Architectural Interior Practice' },
                { value: '128 Residences', label: 'Completed Across 9 Cities' },
                { value: '18 Honors', label: 'International Design Distinctions' },
                { value: '98% Referral', label: 'Private Client Retention Rate' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  {...slideUp(idx * 0.08, 20)}
                  className="space-y-1"
                >
                  <p className="font-serif text-3xl sm:text-4xl text-[#252522] dark:text-[#F5F1EA] tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5A5851] dark:text-[#B8B2A6]">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 3. OUR SERVICES SECTION */}
        <motion.section
          id="services"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 bg-[#EFE9DF]/65 dark:bg-[#1A1A17] border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
        >
          <div className="max-w-[1360px] mx-auto space-y-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <motion.p
                  {...slideUp(0.02, 18)}
                  className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
                >
                  Our Services
                </motion.p>
                <motion.h2
                  {...slideUp(0.1)}
                  className="font-serif text-3xl sm:text-5xl font-normal leading-tight"
                >
                  Comprehensive Architectural &amp; Turnkey Disciplines
                </motion.h2>
              </div>
              <motion.p
                {...slideUp(0.18, 22)}
                className="text-sm text-[#5A5851] dark:text-[#B8B2A6] max-w-md leading-relaxed"
              >
                Every commission is tailored to spatial proportion, natural illumination, and effortless daily living.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={SCROLL_VIEWPORT}
                  transition={{
                    duration: 0.7,
                    delay: (idx % 3) * 0.1,
                    ease: LUXURY_EASE,
                  }}
                  className="flex flex-col justify-between p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 hover:border-[#C6A15B] transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#A8843F] dark:text-[#C6A15B] font-mono tabular-nums">
                      <span>{service.number}.</span>
                      <span>{service.duration}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-normal leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
                    <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                      {service.deliverables}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. FEATURED INTERIOR PROJECTS GALLERY */}
        <motion.section
          id="projects"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
        >
          <div className="max-w-[1360px] mx-auto space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3">
                <motion.p
                  {...slideUp(0.02, 18)}
                  className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
                >
                  Selected Commissions
                </motion.p>
                <motion.h2
                  {...slideUp(0.1)}
                  className="font-serif text-3xl sm:text-5xl font-normal leading-tight"
                >
                  Featured Interior Projects
                </motion.h2>
              </div>

              {/* Interactive Filter Controls */}
              <motion.div
                {...slideUp(0.16, 18)}
                role="tablist"
                aria-label="Filter projects by category"
                className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#EFE9DF] dark:bg-[#1E1E1B] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
              >
                {CATEGORIES.map((category) => {
                  const active = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveCategory(category)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-white dark:bg-[#252522] text-[#252522] dark:text-[#F5F1EA] shadow-sm'
                          : 'text-[#5A5851] dark:text-[#B8B2A6] hover:text-[#252522] dark:hover:text-[#F5F1EA]'
                      }`}
                    >
                      {category === 'All' ? 'All Works' : category}
                    </button>
                  );
                })}
              </motion.div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 bg-white/60 dark:bg-[#1E1E1B]">
                <p className="font-serif text-2xl">No projects in this category yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className="mt-4 px-5 py-2 rounded-full text-xs font-medium bg-[#C6A15B] text-[#141412]"
                >
                  Show All Projects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {filteredProjects.map((project, idx) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={SCROLL_VIEWPORT}
                    transition={{
                      duration: 0.72,
                      delay: (idx % 2) * 0.12,
                      ease: LUXURY_EASE,
                    }}
                    className="group cursor-pointer"
                  >
                    <button
                      type="button"
                      data-cursor-label="View Project"
                      onClick={() => setSelectedProject(project)}
                      className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A15B] rounded-2xl"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, clipPath: 'inset(6% 0% 0% 0%)' }}
                        whileInView={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                        viewport={SCROLL_VIEWPORT}
                        transition={{
                          duration: 0.82,
                          delay: (idx % 2) * 0.12,
                          ease: LUXURY_EASE,
                        }}
                        className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 bg-[#EFE9DF] dark:bg-[#1E1E1B]"
                      >
                        <motion.div
                          initial={{ scale: 1.09 }}
                          whileInView={{ scale: 1 }}
                          viewport={SCROLL_VIEWPORT}
                          transition={{
                            duration: 0.88,
                            delay: (idx % 2) * 0.12,
                            ease: LUXURY_EASE,
                          }}
                          className="w-full h-full"
                        >
                          <ResilientImage
                            src={project.imageUrl}
                            alt={`${project.title} — ${project.style} in ${project.location}`}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        </motion.div>
                      </motion.div>

                      <div className="pt-5 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                          <span>{project.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{project.location}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{project.area}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{project.year}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-serif text-2xl sm:text-3xl font-normal group-hover:text-[#A8843F] dark:group-hover:text-[#C6A15B] transition-colors">
                            {project.title}
                          </h3>
                          <ArrowUpRight className="w-5 h-5 shrink-0 text-[#C6A15B] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed line-clamp-2">
                          {project.summary}
                        </p>
                      </div>
                    </button>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* 5. BEFORE & AFTER TRANSFORMATION SECTION */}
        <motion.section
          id="transformation"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 bg-[#EFE9DF]/65 dark:bg-[#1A1A17] border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
        >
          <div className="max-w-[1360px] mx-auto space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-7 space-y-3">
                <motion.p
                  {...slideUp(0.02, 18)}
                  className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
                >
                  Architectural Transformation
                </motion.p>
                <motion.h2
                  {...slideUp(0.1)}
                  className="font-serif text-3xl sm:text-5xl font-normal leading-tight"
                >
                  From Dated Shell to Quiet Sanctuary
                </motion.h2>
              </div>
              <motion.div
                {...slideUp(0.18, 22)}
                className="lg:col-span-5 space-y-2 text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed"
              >
                <p>
                  Kensington Garden Residence underwent a 18-week structural and material transformation: expanding window apertures, hand-applying warm ivory limewash, and integrating fluted walnut millwork with a honed travertine hearth.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, clipPath: 'inset(6% 0% 0% 0%)' }}
              whileInView={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
              viewport={SCROLL_VIEWPORT}
              transition={{ duration: 0.85, ease: LUXURY_EASE }}
            >
              <BeforeAfterSlider />
            </motion.div>
          </div>
        </motion.section>

        {/* 6. OUR DESIGN PROCESS SECTION */}
        <motion.section
          id="process"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
        >
          <div className="max-w-[1360px] mx-auto space-y-14">
            <div className="max-w-2xl space-y-3">
              <motion.p
                {...slideUp(0.02, 18)}
                className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
              >
                Our Design Process
              </motion.p>
              <motion.h2
                {...slideUp(0.1)}
                className="font-serif text-3xl sm:text-5xl font-normal leading-tight"
              >
                Five Disciplined Phases from Blueprint to Key Handover
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {DESIGN_PROCESS_STEPS.map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={SCROLL_VIEWPORT}
                  transition={{
                    duration: 0.68,
                    delay: idx * 0.08,
                    ease: LUXURY_EASE,
                  }}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#A8843F] dark:text-[#C6A15B] tabular-nums">
                      Phase {item.step}
                    </span>
                    <span className="w-6 h-[1px] bg-[#C6A15B]" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-xl font-normal leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                    {item.summary}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 7. WHY CHOOSE US + 8. CLIENT TESTIMONIALS */}
        <motion.section
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 bg-[#252522] text-[#F5F1EA]"
        >
          <div className="max-w-[1360px] mx-auto space-y-24">
            {/* Why Choose Us */}
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <motion.p
                    {...slideUp(0.02, 18)}
                    className="text-xs tracking-[0.2em] uppercase text-[#C6A15B]"
                  >
                    Why Choose LUXORA LIVING
                  </motion.p>
                  <motion.h2
                    {...slideUp(0.1)}
                    className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white"
                  >
                    Architectural Rigor Meets Bespoke Hospitality
                  </motion.h2>
                </div>
                <motion.p
                  {...slideUp(0.18, 22)}
                  className="text-sm text-[#D8C7B0] max-w-md leading-relaxed"
                >
                  Our studio limits annual commissions to twelve select properties to guarantee unhurried creative attention.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {WHY_CHOOSE_PILLARS.map((pillar, idx) => (
                  <motion.div
                    key={pillar.index}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={SCROLL_VIEWPORT}
                    transition={{
                      duration: 0.7,
                      delay: (idx % 4) * 0.08,
                      ease: LUXURY_EASE,
                    }}
                    className="p-7 rounded-2xl bg-[#1E1E1B] border border-[#F5F1EA]/12 space-y-4"
                  >
                    <span className="font-mono text-xs text-[#C6A15B] tabular-nums">
                      {pillar.index}.
                    </span>
                    <h3 className="font-serif text-2xl font-normal text-white leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#D8C7B0]/85 leading-relaxed">
                      {pillar.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Client Testimonials */}
            <div className="space-y-12 pt-16 border-t border-[#F5F1EA]/12">
              <div className="space-y-3 max-w-2xl">
                <motion.p
                  {...slideUp(0.02, 18)}
                  className="text-xs tracking-[0.2em] uppercase text-[#C6A15B]"
                >
                  Client Perspectives
                </motion.p>
                <motion.h2
                  {...slideUp(0.1)}
                  className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white"
                >
                  Enduring Relationships Built Space by Space
                </motion.h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {testimonials.map((item, idx) => (
                  <motion.blockquote
                    key={item.id}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={SCROLL_VIEWPORT}
                    transition={{
                      duration: 0.72,
                      delay: (idx % 3) * 0.1,
                      ease: LUXURY_EASE,
                    }}
                    className="flex flex-col justify-between p-8 rounded-2xl bg-[#1A1A17] border border-[#F5F1EA]/12 space-y-6"
                  >
                    <p className="font-serif text-xl sm:text-2xl italic leading-relaxed text-[#F5F1EA]">
                      “{item.quote}”
                    </p>
                    <footer className="pt-4 border-t border-[#F5F1EA]/10 space-y-1">
                      <div className="text-sm font-medium text-white">
                        {item.clientName}
                      </div>
                      <div className="text-xs text-[#D8C7B0]">
                        {item.clientRole} · {item.projectTitle}
                      </div>
                    </footer>
                  </motion.blockquote>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* OPTIONAL PROMOTIONAL FEATURE & CURATED COLLECTION */}
        {(siteContent.promoEnabled || products.some((p) => p.available)) && (
          <motion.section
            id="collection"
            {...sectionFade}
            className="py-20 sm:py-28 px-5 sm:px-8 border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
          >
            <div className="max-w-[1360px] mx-auto space-y-16">
              {siteContent.promoEnabled && siteContent.promoTitle && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-[#EFE9DF]/70 dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12 overflow-hidden">
                  <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:h-full min-h-[260px]">
                    <ResilientImage
                      src={siteContent.promoImageUrl || STUDIO_IMAGES.about}
                      alt={siteContent.promoTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="lg:col-span-7 p-7 sm:p-10 space-y-4">
                    <p className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]">
                      Atelier Feature
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
                      {siteContent.promoTitle}
                    </h2>
                    {siteContent.promoSubtitle && (
                      <p className="text-sm sm:text-base text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed max-w-2xl">
                        {siteContent.promoSubtitle}
                      </p>
                    )}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => scrollToSection('consultation')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors"
                      >
                        <span>{siteContent.promoCtaText || 'Book Atelier Viewing'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {products.some((p) => p.available) && (
                <div className="space-y-10">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <p className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]">
                        Curated Editions
                      </p>
                      <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
                        {siteContent.featuredCollectionTitle || 'Curated Objects & Bespoke Editions'}
                      </h2>
                      {siteContent.featuredCollectionSubtitle && (
                        <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                          {siteContent.featuredCollectionSubtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#EFE9DF] dark:bg-[#1E1E1B] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
                      {['All', ...(siteContent.productCategories || [])].map((cat) => {
                        const active = activeProductCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveProductCategory(cat)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              active
                                ? 'bg-white dark:bg-[#252522] text-[#252522] dark:text-[#F5F1EA] shadow-sm'
                                : 'text-[#5A5851] dark:text-[#B8B2A6] hover:text-[#252522] dark:hover:text-[#F5F1EA]'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {products
                      .filter(
                        (p) =>
                          p.available &&
                          (activeProductCategory === 'All' || p.category === activeProductCategory)
                      )
                      .map((product) => (
                        <article
                          key={product.id}
                          className="flex flex-col justify-between rounded-2xl overflow-hidden bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10"
                        >
                          <div>
                            <div className="aspect-[4/3] bg-[#EFE9DF] dark:bg-[#252522] overflow-hidden">
                              <ResilientImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                            <div className="p-6 space-y-2.5">
                              <div className="flex items-center justify-between text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                                <span>{product.category}</span>
                                <span className="font-mono tabular-nums">
                                  {product.stock > 0 ? `${product.stock} in atelier` : 'Made to order'}
                                </span>
                              </div>
                              <h3 className="font-serif text-2xl font-normal">{product.name}</h3>
                              <p className="text-xs sm:text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed line-clamp-3">
                                {product.description}
                              </p>
                            </div>
                          </div>

                          <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#D8C7B0]/40 dark:border-[#F5F1EA]/10">
                            <span className="font-serif text-xl tabular-nums text-[#A8843F] dark:text-[#C6A15B]">
                              ${Number(product.price || 0).toLocaleString('en-US')}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setOrderProduct(product);
                                setOrderQty('1');
                                setConfirmedOrderNumber('');
                                setOrderSuccess(false);
                                setOrderError('');
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] text-xs font-medium hover:opacity-90 transition-opacity"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Acquire Piece</span>
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* 9. CONSULTATION BOOKING FORM */}
        <motion.section
          id="consultation"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-5">
                <motion.p
                  {...slideUp(0.02, 18)}
                  className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
                >
                  Private Consultation
                </motion.p>
                <motion.h2
                  {...slideUp(0.1)}
                  className="font-serif text-3xl sm:text-5xl font-normal leading-tight"
                >
                  Begin Your Architectural Commission
                </motion.h2>
                <motion.p
                  {...slideUp(0.18)}
                  className="text-sm sm:text-base text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed"
                >
                  Share your property timeline, aesthetic sensibility, and scope. A Senior Principal will prepare a tailored discovery session—in person at our atelier or via private video walkthrough.
                </motion.p>

                <motion.div
                  {...slideUp(0.24, 20)}
                  className="pt-4 space-y-3 text-sm text-[#5A5851] dark:text-[#B8B2A6]"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#C6A15B] shrink-0" />
                    <span>60-minute complimentary initial spatial briefing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#C6A15B] shrink-0" />
                    <span>Strict NDA &amp; residential privacy protection</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                {...slideUp(0.14, 28)}
                className="lg:col-span-7 p-7 sm:p-10 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12"
              >
                {consultSuccess ? (
                  <div className="py-12 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-[#C6A15B] mx-auto" strokeWidth={1.4} />
                    <h3 className="font-serif text-3xl">Consultation Request Confirmed</h3>
                    <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] max-w-md mx-auto leading-relaxed">
                      Thank you. Your project dossier has been recorded with our studio principals. We will confirm your private appointment within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setConsultSuccess(false)}
                      className="mt-2 px-6 py-2.5 rounded-full text-xs font-medium bg-[#252522] text-[#F5F1EA] dark:bg-[#C6A15B] dark:text-[#141412]"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConsultationSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Full Name *</span>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g., Claire Beaumont"
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        />
                      </label>

                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Email Address *</span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="claire@residence.com"
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Phone / WhatsApp *</span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 8950123700"
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        />
                      </label>

                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Commission Type</span>
                        <select
                          value={projectType}
                          onChange={(e) => setProjectType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        >
                          <option>Private Residence</option>
                          <option>Luxury Penthouse</option>
                          <option>Architectural Kitchen &amp; Bath</option>
                          <option>Villa &amp; Estate Turnkey</option>
                          <option>Boutique Hospitality</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Estimated Area</span>
                        <input
                          type="text"
                          value={propertySize}
                          onChange={(e) => setPropertySize(e.target.value)}
                          placeholder="e.g., 4,200 sq ft"
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        />
                      </label>

                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Investment Scope</span>
                        <select
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        >
                          <option>$150,000 – $350,000</option>
                          <option>$350,000 – $750,000</option>
                          <option>$750,000 – $1.5M</option>
                          <option>$1.5M+ Full Estate</option>
                        </select>
                      </label>

                      <label className="block space-y-1.5 text-xs">
                        <span className="font-medium">Preferred Date</span>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                        />
                      </label>
                    </div>

                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium">Design Direction</span>
                      <select
                        value={preferredStyle}
                        onChange={(e) => setPreferredStyle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                      >
                        <option>Architectural Warm Minimalism</option>
                        <option>Organic Quiet Luxury</option>
                        <option>Monolithic European Contemporary</option>
                        <option>Mediterranean Classicism</option>
                        <option>Undecided — Seeking Guidance</option>
                      </select>
                    </label>

                    <label className="block space-y-1.5 text-xs">
                      <span className="font-medium">Project Vision &amp; Location</span>
                      <textarea
                        rows={4}
                        value={consultMessage}
                        onChange={(e) => setConsultMessage(e.target.value)}
                        placeholder="Describe your property location, target move-in window, and architectural priorities..."
                        className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B] resize-none"
                      />
                    </label>

                    {consultError && (
                      <p className="text-xs text-red-700 dark:text-red-400">{consultError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={consultSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#C6A15B] text-[#141412] text-sm font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
                    >
                      {consultSubmitting ? 'Submitting Request...' : 'Request Private Consultation'}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 10. CONTACT SECTION WITH WHATSAPP INTEGRATION */}
        <motion.section
          id="contact"
          {...sectionFade}
          className="py-20 sm:py-28 px-5 sm:px-8 bg-[#EFE9DF]/65 dark:bg-[#1A1A17]"
        >
          <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <motion.p
                  {...slideUp(0.02, 18)}
                  className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]"
                >
                  Studio Concierge
                </motion.p>
                <motion.h2
                  {...slideUp(0.1)}
                  className="font-serif text-3xl sm:text-5xl font-normal leading-tight"
                >
                  Visit Our Atelier or Connect Directly
                </motion.h2>
              </div>

              <motion.div
                {...slideUp(0.16, 20)}
                className="space-y-5 text-sm text-[#5A5851] dark:text-[#B8B2A6]"
              >
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-1" />
                  <span>{siteContent.studioAddress}</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <Phone className="w-4 h-4 text-[#C6A15B] shrink-0" />
                  <a
                    href={`tel:${siteContent.studioPhone.replace(/[^+0-9]/g, '')}`}
                    className="hover:text-[#252522] dark:hover:text-[#F5F1EA] transition-colors tabular-nums"
                  >
                    {siteContent.studioPhone}
                  </a>
                </div>
                <div className="flex items-center gap-3.5">
                  <Mail className="w-4 h-4 text-[#C6A15B] shrink-0" />
                  <a
                    href={`mailto:${siteContent.studioEmail}`}
                    className="hover:text-[#252522] dark:hover:text-[#F5F1EA] transition-colors"
                  >
                    {siteContent.studioEmail}
                  </a>
                </div>
                <div className="flex items-start gap-3.5">
                  <Clock className="w-4 h-4 text-[#C6A15B] shrink-0 mt-1" />
                  <span>{siteContent.studioHours}</span>
                </div>
              </motion.div>

              {/* Direct WhatsApp Integration */}
              <motion.div
                {...slideUp(0.24, 22)}
                className="p-6 rounded-2xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12 space-y-3"
              >
                <h3 className="font-serif text-2xl font-normal">
                  Instant WhatsApp Concierge
                </h3>
                <p className="text-xs sm:text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                  Prefer direct messaging for floorplan sharing or immediate studio availability? Message our client concierge directly on WhatsApp.
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            </div>

            {/* Quick Enquiry Form */}
            <motion.div
              {...slideUp(0.14, 28)}
              className="lg:col-span-7 p-7 sm:p-10 rounded-2xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12"
            >
              <h3 className="font-serif text-2xl sm:text-3xl font-normal mb-2">
                Send a Studio Enquiry
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5851] dark:text-[#B8B2A6] mb-6">
                For press, architectural collaborations, or general project questions.
              </p>

              {contactSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#C6A15B] mx-auto" strokeWidth={1.5} />
                  <h4 className="font-serif text-2xl">Enquiry Sent</h4>
                  <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6]">
                    Thank you for contacting LUXORA LIVING. Our concierge team will respond promptly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSuccess(false)}
                    className="px-5 py-2 rounded-full text-xs font-medium bg-[#C6A15B] text-[#141412]"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name *"
                      aria-label="Your Name"
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email Address *"
                      aria-label="Email Address"
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      aria-label="Phone Number"
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Subject (e.g., Townhouse Renovation)"
                      aria-label="Subject"
                      className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Your Message *"
                    aria-label="Your Message"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B] resize-none"
                  />
                  {contactError && (
                    <p className="text-xs text-red-700 dark:text-red-400">{contactError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="px-7 py-3 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {contactSubmitting ? 'Sending...' : 'Send Studio Enquiry'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* 11. PREMIUM FOOTER */}
      <motion.footer
        {...sectionFade}
        className="bg-[#141412] text-[#F5F1EA] border-t border-[#F5F1EA]/10 py-14 px-5 sm:px-8"
      >
        <div className="max-w-[1360px] mx-auto space-y-10">
          <motion.div
            {...slideUp(0.06, 20)}
            className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-[#F5F1EA]/12"
          >
            <div className="space-y-3 max-w-sm">
              <div className="inline-block rounded-xl overflow-hidden border border-[#C6A15B]/45 bg-[#F8F4EC] shadow-md">
                <img
                  src={luxoraFooterLogo}
                  alt="LUXORA LIVING — Designing Spaces. Defining Elegance."
                  className="h-20 sm:h-24 w-auto object-contain block"
                />
              </div>
              <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B]">
                Designing Spaces. Defining Elegance.
              </p>
              <p className="text-xs text-[#B8B2A6] leading-relaxed">
                New York · London · Milan
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-xs text-[#D8C7B0]">
              <div className="space-y-2.5">
                <p className="text-white font-medium">Studio</p>
                <ul className="space-y-2">
                  <li>
                    <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="hover:text-[#C6A15B] transition-colors">
                      About Atelier
                    </a>
                  </li>
                  <li>
                    <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-[#C6A15B] transition-colors">
                      Services
                    </a>
                  </li>
                  <li>
                    <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }} className="hover:text-[#C6A15B] transition-colors">
                      Selected Works
                    </a>
                  </li>
                  <li>
                    <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }} className="hover:text-[#C6A15B] transition-colors">
                      Design Process
                    </a>
                  </li>
                  <li>
                    <a href="/terms" onClick={(e) => { e.preventDefault(); onOpenTerms(); }} className="hover:text-[#C6A15B] transition-colors">
                      Terms &amp; Conditions
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <p className="text-white font-medium">Connect</p>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:text-[#C6A15B] transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:text-[#C6A15B] transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:text-[#C6A15B] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Concierge</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <p className="text-white font-medium">Legal</p>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/terms"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenTerms();
                      }}
                      className="hover:text-[#C6A15B] transition-colors"
                    >
                      Terms &amp; Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#consultation"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('consultation');
                      }}
                      className="hover:text-[#C6A15B] transition-colors"
                    >
                      Private Consultation
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('contact');
                      }}
                      className="hover:text-[#C6A15B] transition-colors"
                    >
                      Studio Concierge
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...slideUp(0.12, 16)}
            className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-6 text-xs text-[#B8B2A6] sm:pr-44"
          >
            <p>© {new Date().getFullYear()} LUXORA LIVING Architecture &amp; Interior Design. All rights reserved.</p>
            <span className="hidden sm:inline text-[#F5F1EA]/25" aria-hidden="true">·</span>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onOpenTerms();
              }}
              className="text-[#D8C7B0] hover:text-[#C6A15B] transition-colors underline underline-offset-4"
            >
              Terms &amp; Conditions
            </a>
          </motion.div>
        </div>
      </motion.footer>

      {/* Project Lightbox */}
      <ProjectLightbox
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRequestConsultation={(title) => {
          setSelectedProject(null);
          setConsultMessage(`Inquiring regarding a design direction similar to ${title}.`);
          scrollToSection('consultation');
        }}
      />

      {/* Curated Edition Acquisition / Order Modal */}
      {orderProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
          className="fixed inset-0 z-[105] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setOrderProduct(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-[#F5F1EA] dark:bg-[#1A1A17] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#A8843F] dark:text-[#C6A15B]">
                  Atelier Acquisition
                </p>
                <h3 id="order-modal-title" className="font-serif text-xl sm:text-2xl font-normal">
                  {orderProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderProduct(null)}
                aria-label="Close acquisition modal"
                className="w-9 h-9 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15 flex items-center justify-center hover:border-[#C6A15B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-[#C6A15B] mx-auto" />
                <h4 className="font-serif text-2xl">Order Request Confirmed</h4>
                {confirmedOrderNumber && (
                  <p className="font-mono text-xs tabular-nums text-[#A8843F] dark:text-[#C6A15B]">
                    Reference: {confirmedOrderNumber}
                  </p>
                )}
                <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                  Thank you. Your order for <span className="font-medium text-[#252522] dark:text-[#F5F1EA]">{orderProduct.name}</span> has been recorded in our atelier registry. Our concierge team will coordinate white-glove dispatch shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOrderSuccess(false);
                    setConfirmedOrderNumber('');
                    setOrderProduct(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors"
                >
                  Return to Atelier
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setOrderError('');

                  const cleanName = orderName.trim();
                  const cleanEmail = orderEmail.trim();
                  const cleanPhone = orderPhone.trim();
                  const cleanAddress = orderAddress.trim();
                  const qty = Math.max(1, Math.floor(Number(orderQty) || 1));

                  if (cleanName.length < 2) {
                    setOrderError('Please enter your full name.');
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                    setOrderError('Please enter a valid email address.');
                    return;
                  }
                  if (cleanPhone.length < 5) {
                    setOrderError('Please provide a contact telephone number.');
                    return;
                  }
                  if (cleanAddress.length < 5) {
                    setOrderError('Please provide a complete delivery address.');
                    return;
                  }

                  setOrderSubmitting(true);
                  try {
                    const createdOrderNumber = await submitOrder({
                      customerName: cleanName,
                      customerEmail: cleanEmail,
                      customerPhone: cleanPhone,
                      shippingAddress: cleanAddress,
                      items: [
                        {
                          productId: orderProduct.id,
                          productName: orderProduct.name,
                          category: orderProduct.category,
                          unitPrice: orderProduct.price,
                          quantity: qty,
                        },
                      ],
                      notes: orderNotes.trim(),
                    });
                    setConfirmedOrderNumber(createdOrderNumber);
                    setOrderSuccess(true);
                    setOrderName('');
                    setOrderEmail('');
                    setOrderPhone('');
                    setOrderAddress('');
                    setOrderNotes('');
                    setOrderQty('1');
                  } catch {
                    setOrderError('Unable to submit order right now. Please verify your details and try again.');
                  } finally {
                    setOrderSubmitting(false);
                  }
                }}
                className="p-6 space-y-4"
              >
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#EFE9DF] dark:bg-[#1E1E1B]">
                    <ResilientImage
                      src={orderProduct.imageUrl}
                      alt={orderProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">{orderProduct.category}</p>
                    <p className="font-serif text-base truncate">{orderProduct.name}</p>
                    <p className="font-mono text-xs tabular-nums text-[#A8843F] dark:text-[#C6A15B]">
                      ${Number(orderProduct.price || 0).toLocaleString('en-US')} × {Math.max(1, Math.floor(Number(orderQty) || 1))} = $
                      {(Number(orderProduct.price || 0) * Math.max(1, Math.floor(Number(orderQty) || 1))).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>

                {orderError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300">
                    {orderError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label htmlFor="order-name" className="text-xs font-medium">
                      Full Name *
                    </label>
                    <input
                      id="order-name"
                      type="text"
                      required
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="Eleanor Vance"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="order-email" className="text-xs font-medium">
                      Email Address *
                    </label>
                    <input
                      id="order-email"
                      type="email"
                      required
                      value={orderEmail}
                      onChange={(e) => setOrderEmail(e.target.value)}
                      placeholder="client@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="order-phone" className="text-xs font-medium">
                      Phone Number *
                    </label>
                    <input
                      id="order-phone"
                      type="tel"
                      required
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="+91 8950123700"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="order-qty" className="text-xs font-medium">
                      Quantity
                    </label>
                    <input
                      id="order-qty"
                      type="number"
                      min={1}
                      max={Math.max(1, orderProduct.stock || 25)}
                      value={orderQty}
                      onChange={(e) => setOrderQty(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm tabular-nums focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="order-address" className="text-xs font-medium">
                    Delivery / Installation Address *
                  </label>
                  <input
                    id="order-address"
                    type="text"
                    required
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="Street, Suite / Residence, City, Postal Code"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="order-notes" className="text-xs font-medium">
                    Finish or Delivery Notes
                  </label>
                  <textarea
                    id="order-notes"
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Optional white-glove placement or custom patina request..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderProduct(null)}
                    className="px-4 py-2.5 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-medium hover:border-[#C6A15B] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{orderSubmitting ? 'Recording Order...' : 'Place Atelier Order'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Back-to-top and LUXORA AI (no overlap) */}
      <BackToTop />
      <LuxoraAssistant
        services={services}
        projects={projects}
        onNavigateConsultation={() => scrollToSection('consultation')}
      />
    </div>
  );
}

import { ArrowLeft, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import luxoraLogo from '../assets/images/luxora_luxury_logo_1794763856657.jpg';
import type { SiteContent, ThemeMode } from '../types';

interface TermsPageProps {
  siteContent: SiteContent;
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onNavigateHome: () => void;
  onNavigateConsultation: () => void;
  onOpenAdmin: () => void;
}

interface TermsSectionItem {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
}

export function TermsPage({
  siteContent,
  theme,
  onThemeChange,
  onNavigateHome,
  onNavigateConsultation,
  onOpenAdmin,
}: TermsPageProps) {
  const effectivePhone = siteContent.studioPhone || '+91 8950123700';
  const effectiveEmail = siteContent.studioEmail || 'concierge@luxoraliving.studio';
  const effectiveAddress =
    siteContent.studioAddress || '742 Madison Avenue, Penthouse Studio, New York, NY 10065';
  const effectiveHours = siteContent.studioHours || 'Mon – Sat · 10:00 AM – 7:00 PM';

  const sections: TermsSectionItem[] = [
    {
      id: 'general-terms',
      number: '01',
      title: 'General Terms',
      paragraphs: [
        'Welcome to LUXORA LIVING ("we," "our," or "the Studio"). These Terms & Conditions govern your access to and use of the LUXORA LIVING website, digital consultation portals, curated furniture and object catalogue, and bespoke interior design services.',
        'By browsing this website, booking a private architectural consultation, submitting an enquiry, or placing an order for curated editions, you agree to be bound by these Terms & Conditions. If you do not agree with any provision herein, please refrain from using our digital services or placing an order.',
      ],
    },
    {
      id: 'website-usage',
      number: '02',
      title: 'Website Usage',
      paragraphs: [
        'You agree to use this website solely for lawful personal or commercial design evaluation, consultation scheduling, and authorized acquisition of LUXORA LIVING offerings. You must not attempt to interfere with site security, scrape automated data, transmit malicious code, or misrepresent your identity when submitting consultation requests or orders.',
        'We reserve the right to suspend or restrict access to our platform, decline service requests, or cancel accounts that violate these usage standards or engage in fraudulent activity.',
      ],
    },
    {
      id: 'product-information',
      number: '03',
      title: 'Product Information',
      paragraphs: [
        'LUXORA LIVING curates bespoke furnishings, sculptural lighting, natural stone consoles, and architectural objects crafted with artisanal materials such as travertine, fluted walnut, patinated brass, and hand-woven textiles.',
        'Because natural stone veining, wood grain, and hand-finished patinas vary inherently from piece to piece, subtle organic variations are characteristic of authentic craftsmanship rather than defects. All dimensions, finishes, and lead times displayed on the website are accurate to the best of our studio records and are subject to confirmation prior to fabrication.',
      ],
    },
    {
      id: 'pricing-and-payments',
      number: '04',
      title: 'Pricing and Payments',
      paragraphs: [
        'All product prices listed on the LUXORA LIVING website are stated in United States Dollars (USD) unless otherwise specified in a formal studio proposal, and exclude applicable local taxes, customs duties, white-glove crating, and specialized freight unless explicitly noted.',
        'Prices and availability are subject to change without prior notice prior to order confirmation. Bespoke interior commissions and made-to-order editions require an approved written quotation and milestone retainer or full settlement prior to workshop allocation.',
      ],
    },
    {
      id: 'orders-and-cancellations',
      number: '05',
      title: 'Orders and Cancellations',
      paragraphs: [
        'All orders placed through our website constitute an acquisition request subject to inventory verification and formal acceptance by our concierge team. Once an order is reviewed, you will receive confirmation detailing production status and dispatch scheduling.',
        'Standard in-stock curated objects may be cancelled or modified within 24 hours of submission before dispatch preparation begins. Custom-commissioned, made-to-order, or bespoke-finished pieces cannot be cancelled once material procurement or artisanal fabrication has commenced.',
      ],
    },
    {
      id: 'shipping-and-delivery',
      number: '06',
      title: 'Shipping and Delivery',
      paragraphs: [
        'LUXORA LIVING coordinates insured white-glove delivery and specialized carrier transport for residential and commercial installations. Estimated delivery timelines depend on piece availability, workshop finishing schedules, and destination logistics.',
        'Clients are responsible for ensuring adequate property access—including doorway clearances, elevator dimensions, and staircase turns—prior to scheduled delivery. Any specialized rigging, crane hoisting, or storage delays resulting from restricted site access will be billed accordingly.',
      ],
    },
    {
      id: 'returns-and-refunds',
      number: '07',
      title: 'Returns and Refunds',
      paragraphs: [
        'Eligibility for returns applies to unused, undamaged in-stock curated objects requested within 7 calendar days of delivery, returned in original protective crating or packaging. Clients must inspect all deliveries upon arrival and note any transit concern with photographic documentation within 48 hours of receipt.',
        'Bespoke furniture commissions, custom dimensions, made-to-order finishes, and completed design consultation deliverables are final sale and non-refundable except in the event of verified transit damage or manufacturing fault, in which case LUXORA LIVING will repair, replace, or refund at the studio’s discretion.',
      ],
    },
    {
      id: 'intellectual-property',
      number: '08',
      title: 'Intellectual Property',
      paragraphs: [
        'All architectural drawings, interior concepts, mood boards, photography, brand marks, typography arrangements, visual assets, and copy published on this website—including the LUXORA LIVING name and logo—are the exclusive intellectual property of LUXORA LIVING or its licensed collaborators.',
        'No content from this website may be reproduced, distributed, modified, or used for commercial display without express prior written consent from LUXORA LIVING.',
      ],
    },
    {
      id: 'privacy-and-data-protection',
      number: '09',
      title: 'Privacy and Data Protection',
      paragraphs: [
        'LUXORA LIVING respects client confidentiality and residential privacy. Personal details submitted through consultation bookings, studio enquiries, or product orders—such as your name, email address, telephone number, property details, and delivery address—are stored securely and used strictly to fulfill your design and acquisition requests.',
        'We do not sell or lease client information to third parties. Data is shared only with trusted architectural partners, payment processors, and white-glove logistics providers strictly as needed to deliver contracted services.',
      ],
    },
    {
      id: 'limitation-of-liability',
      number: '10',
      title: 'Limitation of Liability',
      paragraphs: [
        'To the fullest extent permitted by applicable law, LUXORA LIVING shall not be liable for any indirect, incidental, special, or consequential damages—including project scheduling delays caused by third-party contractors, customs clearances, or force majeure events—arising from the use of this website or our products.',
        'In all cases, the studio’s total aggregate liability in connection with any product order or service shall not exceed the total amount actually paid by the client to LUXORA LIVING for that specific order or phase.',
      ],
    },
    {
      id: 'changes-to-terms',
      number: '11',
      title: 'Changes to Terms',
      paragraphs: [
        'LUXORA LIVING reserves the right to revise, update, or clarify these Terms & Conditions at any time to reflect evolving studio practices, product offerings, or legal standards. Any revisions take effect immediately upon publication on this page.',
        'Continued access to the website or engagement of our services following the posting of revised terms constitutes acceptance of the updated Terms & Conditions.',
      ],
    },
    {
      id: 'contact-information',
      number: '12',
      title: 'Contact Information',
      paragraphs: [
        'For questions regarding these Terms & Conditions, active orders, consultation agreements, or data privacy requests, please reach our Studio Concierge directly using the verified channels below.',
      ],
    },
  ];

  const scrollToClause = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1EA] text-[#252522] dark:bg-[#141412] dark:text-[#F5F1EA]">
      {/* Sticky Minimal Brand Header */}
      <header className="sticky top-0 z-40 bg-[#F5F1EA]/92 dark:bg-[#141412]/92 backdrop-blur-md border-b border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="inline-flex items-center gap-3 font-serif text-lg sm:text-xl tracking-[0.16em] font-medium whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-full overflow-hidden border border-[#C6A15B]/75 bg-[#141412] shrink-0">
              <img
                src={luxoraLogo}
                alt="LUXORA LIVING Luxury Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-110"
              />
            </span>
            <span>LUXORA LIVING</span>
          </a>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-medium hover:border-[#C6A15B] transition-colors whitespace-nowrap"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-medium hover:border-[#C6A15B] transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
              <span>Admin Panel</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Legal Document Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20 space-y-12">
        {/* Title Banner */}
        <section className="text-center max-w-2xl mx-auto space-y-4 pb-10 border-b border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12">
          <p className="text-xs tracking-[0.2em] uppercase text-[#A8843F] dark:text-[#C6A15B]">
            Legal &amp; Atelier Governance
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal leading-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm sm:text-base text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
            Clear guidelines governing bespoke architectural commissions, curated furnishing acquisitions, and digital platform usage at LUXORA LIVING.
          </p>
          <p className="text-xs font-mono text-[#8C887F] dark:text-[#B8B2A6]/80">
            Last Updated: November 2026
          </p>
        </section>

        {/* Quick Section Index */}
        <nav
          aria-label="Terms and Conditions index"
          className="p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-[#A8843F] dark:text-[#C6A15B] text-center">
            Section Directory
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToClause(sec.id);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F5F1EA] dark:hover:bg-[#252522] transition-colors text-[#252522] dark:text-[#F5F1EA]"
              >
                <span className="font-mono text-[#A8843F] dark:text-[#C6A15B] tabular-nums">
                  {sec.number}.
                </span>
                <span className="truncate">{sec.title}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="scroll-mt-24 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4"
            >
              <div className="flex items-baseline gap-3 pb-3 border-b border-[#D8C7B0]/40 dark:border-[#F5F1EA]/10">
                <span className="font-mono text-xs text-[#A8843F] dark:text-[#C6A15B] tabular-nums">
                  {sec.number}.
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal">
                  {sec.title}
                </h2>
              </div>

              <div className="space-y-3 text-sm sm:text-[15px] text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                {sec.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {sec.id === 'contact-information' && (
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#F5F1EA]/70 dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[#A8843F] dark:text-[#C6A15B] font-medium">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Telephone</span>
                    </div>
                    <p className="font-mono tabular-nums text-[#252522] dark:text-[#F5F1EA]">
                      {effectivePhone}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5F1EA]/70 dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[#A8843F] dark:text-[#C6A15B] font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Studio Concierge</span>
                    </div>
                    <p className="text-[#252522] dark:text-[#F5F1EA] break-all">
                      {effectiveEmail}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F5F1EA]/70 dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[#A8843F] dark:text-[#C6A15B] font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Atelier</span>
                    </div>
                    <p className="text-[#252522] dark:text-[#F5F1EA] leading-relaxed">
                      {effectiveAddress} ({effectiveHours})
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4 space-y-4">
          <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
            Ready to discuss your upcoming architectural or furnishing commission?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-6 py-3 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/20 text-xs font-medium hover:border-[#C6A15B] transition-colors"
            >
              Return to Home
            </button>
            <button
              type="button"
              onClick={onNavigateConsultation}
              className="px-6 py-3 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors"
            >
              Book Private Consultation
            </button>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#141412] text-[#B8B2A6] border-t border-[#F5F1EA]/10 py-8 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} LUXORA LIVING Architecture &amp; Interior Design. All rights reserved.</p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-[#D8C7B0] hover:text-[#C6A15B] transition-colors underline underline-offset-4"
          >
            Return to LUXORA LIVING
          </button>
        </div>
      </footer>
    </div>
  );
}

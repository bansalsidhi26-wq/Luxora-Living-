import heroImg from '../assets/images/hero_luxury_living_1794763003871.jpg';
import aboutImg from '../assets/images/about_atelier_studio_1794763005419.jpg';
import skylineImg from '../assets/images/project_skyline_penthouse_1794763005595.jpg';
import sanctuaryImg from '../assets/images/project_ivory_sanctuary_1794763005681.jpg';
import kitchenImg from '../assets/images/project_noir_kitchen_1794763006924.jpg';
import courtyardImg from '../assets/images/project_courtyard_villa_1794763006838.jpg';
import beforeImg from '../assets/images/before_space_renovation_1794763007751.jpg';
import afterImg from '../assets/images/after_space_renovation_1794763007932.jpg';

import type {
  ProductItem,
  ProjectItem,
  ServiceItem,
  SiteContent,
  TestimonialItem,
} from '../types';

export const STUDIO_IMAGES = {
  hero: heroImg,
  about: aboutImg,
  skyline: skylineImg,
  sanctuary: sanctuaryImg,
  kitchen: kitchenImg,
  courtyard: courtyardImg,
  before: beforeImg,
  after: afterImg,
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroHeadline: 'Transforming Spaces Into Timeless Experiences.',
  heroSubtitle:
    'LUXORA LIVING is an architectural interior design studio crafting tactile sanctuaries in honed stone, warm timber, and sculptural light for discerning private residences and boutique hospitality.',
  aboutTitle: 'Quiet Architecture Built Around How You Live',
  aboutDescription:
    'Founded on the conviction that enduring luxury resides in proportion, natural light, and honest materiality, LUXORA LIVING guides every commission from initial spatial blueprint to final object placement. Our studio works across Manhattan, London, and Milan, uniting master cabinetmakers, stone quarries, and lighting ateliers under one calm, single-point creative direction.',
  studioEmail: 'concierge@luxoraliving.studio',
  studioPhone: '+91 8950123700',
  whatsappNumber: '918950123700',
  studioAddress: '458 Mercer Street, Penthouse Atelier, SoHo, New York, NY 10013',
  studioHours: 'Monday – Saturday · 10:00 AM – 6:30 PM EST (By Private Appointment)',
  defaultTheme: 'light',
  heroImageUrl: heroImg,
  announcementEnabled: false,
  announcementText: 'Now Accepting Private Residential & Penthouse Commissions for 2026',
  promoEnabled: false,
  promoTitle: 'Private Material Atelier & Bespoke Editions',
  promoSubtitle:
    'Explore limited-edition travertine consoles, hand-cast bronze luminaires, and signature upholstery crafted exclusively for LUXORA LIVING residences.',
  promoCtaText: 'Book Atelier Viewing',
  promoImageUrl: aboutImg,
  productCategories: [
    'Seating',
    'Lighting',
    'Tables & Consoles',
    'Sculptural Objects',
    'Textiles & Rugs',
  ],
  featuredCollectionTitle: 'Curated Objects & Bespoke Editions',
  featuredCollectionSubtitle:
    'Limited architectural furnishings, stone tables, and sculptural lighting available for private residential acquisition.',
};

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'obsidian-skyline-penthouse',
    title: 'The Obsidian Skyline Penthouse',
    category: 'Penthouse',
    location: 'Tribeca, New York',
    year: '2026',
    area: '5,400 sq ft',
    style: 'Architectural Warm Minimalism',
    summary:
      'A double-height penthouse sculpted in honed Roman travertine, smoked European oak millwork, and custom cast-bronze lighting framing panoramic twilight views.',
    challenge:
      'Unify an expansive glass-walled floorplate into intimate entertaining and quiet living zones without interrupting the sweeping skyline sightlines.',
    solution:
      'Introduced monolithic travertine hearth portals, perimeter recessed cove illumination, and low-slung ivory bouclé seating anchored over hand-knotted silk-wool rugs.',
    imageUrl: skylineImg,
    featured: true,
    order: 1,
  },
  {
    id: 'ivory-travertine-sanctuary',
    title: 'Ivory Fluted Sanctuary',
    category: 'Residential',
    location: 'Beverly Hills, California',
    year: '2025',
    area: '6,800 sq ft',
    style: 'Organic Quiet Luxury',
    summary:
      'A serene primary residence suite composed with floor-to-ceiling fluted walnut joinery, Belgian flax drapery, and carved alabaster sconces.',
    challenge:
      'Transform an oversized, echo-prone master wing into an acoustically calm, warm private retreat illuminated softly from dawn to dusk.',
    solution:
      'Engineered an acoustic slatted American walnut headboard wall paired with hand-troweled limewash plaster, monolithic travertine plinths, and layered warm dimmable lighting.',
    imageUrl: sanctuaryImg,
    featured: true,
    order: 2,
  },
  {
    id: 'atelier-noir-culinary-suite',
    title: 'Atelier Noir Culinary Suite',
    category: 'Kitchen & Bath',
    location: 'Zurich, Switzerland',
    year: '2025',
    area: '1,350 sq ft',
    style: 'Monolithic European Contemporary',
    summary:
      'A sculptural kitchen anchored by a four-meter mitered travertine island, charred charcoal oak tall cabinetry, and a brushed champagne brass range hood.',
    challenge:
      'Conceal commercial-grade culinary appliances while elevating the kitchen as the architectural centerpiece of an open-plan residence.',
    solution:
      'Integrated pocket-door pantry cabinetry in charcoal-stained oak alongside a cantilevered stone island with seamless induction and bespoke brass tapware.',
    imageUrl: kitchenImg,
    featured: true,
    order: 3,
  },
  {
    id: 'mediterranean-courtyard-villa',
    title: 'Villa Oliveto Courtyard Pavilion',
    category: 'Hospitality',
    location: 'Lake Como, Italy',
    year: '2026',
    area: '8,200 sq ft',
    style: 'Mediterranean Architectural Classicism',
    summary:
      'An indoor-outdoor private villa lounge framed by limewash archways, reclaimed limestone flooring, and tailored linen daybeds overlooking an ancient olive court.',
    challenge:
      'Create seamless thermal and visual continuity between the shaded vaulted salon and the sun-drenched stone garden courtyard.',
    solution:
      'Specified continuous bush-hammered travertine slabs across threshold steel pivot doors, weather-resistant Belgian outdoor linens, and bespoke bronze lanterns.',
    imageUrl: courtyardImg,
    featured: false,
    order: 4,
  },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'turnkey-residential-interiors',
    number: '01',
    title: 'Turnkey Residential Interiors',
    description:
      'End-to-end architectural interior design for private residences, townhomes, and estates—covering spatial planning, custom finishes, furnishings, and art curation.',
    deliverables: 'Concept Books · Material Boards · Full Procurement · Site Direction',
    duration: '16 – 32 Weeks',
    order: 1,
  },
  {
    id: 'architectural-space-planning',
    number: '02',
    title: 'Architectural Space Planning',
    description:
      'Structural reconfiguration of floorplans to optimize natural daylight, circulation sightlines, acoustic privacy, and proportional harmony before construction begins.',
    deliverables: 'CAD Floorplans · Elevations · Lighting Layouts · Permit Coordination',
    duration: '6 – 10 Weeks',
    order: 2,
  },
  {
    id: 'bespoke-millwork-furniture',
    number: '03',
    title: 'Bespoke Millwork & Furniture',
    description:
      'One-of-a-kind fluted cabinetry, monolithic stone islands, and custom upholstered silhouettes fabricated exclusively by our partner European and American artisans.',
    deliverables: 'Shop Drawings · Stone & Timber Prototyping · Custom Fabrication',
    duration: '10 – 18 Weeks',
    order: 3,
  },
  {
    id: 'penthouse-villa-styling',
    number: '04',
    title: 'Penthouse & Villa Styling',
    description:
      'Curated furnishing, heirloom textiles, sculptural lighting, and gallery-grade object placement for newly completed turnkey properties seeking soul and warmth.',
    deliverables: 'FF&E Curation · Art Advisory · White-Glove Installation',
    duration: '8 – 14 Weeks',
    order: 4,
  },
  {
    id: 'boutique-hospitality-spaces',
    number: '05',
    title: 'Boutique Hospitality & Private Clubs',
    description:
      'Atmosphere-driven interiors for private members clubs, executive lounges, luxury spas, and flagship showrooms engineered for durability and unforgettable arrival.',
    deliverables: 'Brand Spatial Identity · Custom Lighting · Commercial FF&E',
    duration: '14 – 28 Weeks',
    order: 5,
  },
  {
    id: 'lighting-material-curation',
    number: '06',
    title: 'Lighting & Material Direction',
    description:
      'Precision architectural lighting choreography and tactile surface specification—pairing natural travertine, Venetian plaster, bronze hardware, and woven textiles.',
    deliverables: '2700K Dimming Schedules · Finish Schedules · Quarry Selection',
    duration: '4 – 8 Weeks',
    order: 6,
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testimonial-elena-rostova',
    clientName: 'Elena & Marcus Vance',
    clientRole: 'Private Residence Owners · Tribeca',
    projectTitle: 'The Obsidian Skyline Penthouse',
    quote:
      'Before LUXORA LIVING stepped in, our double-height penthouse felt vast yet impersonal. Their spatial reconfiguration and travertine hearth anchored every room with calm intimacy—and the entire turnkey installation finished on the exact week promised.',
    order: 1,
  },
  {
    id: 'testimonial-henrik-lindqvist',
    clientName: 'Henrik Lindqvist',
    clientRole: 'Managing Partner, Aurelia Capital · Zurich',
    projectTitle: 'Atelier Noir Culinary Suite',
    quote:
      'Every millwork seam, stone vein, and concealed lighting channel was executed with watchmaker precision. Working with a single dedicated principal designer made complex international sourcing effortless.',
    order: 2,
  },
  {
    id: 'testimonial-camille-laurent',
    clientName: 'Camille Laurent',
    clientRole: 'Founder, Maison Laurent Hospitality · Milan',
    projectTitle: 'Villa Oliveto Courtyard Pavilion',
    quote:
      'LUXORA LIVING possesses rare restraint—they know when to let natural stone and sunlight speak. Guests frequently ask who architected the salon within minutes of arriving.',
    order: 3,
  },
];

export const DESIGN_PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery & Spatial Audit',
    summary:
      'Private site walkthrough, lifestyle study, architectural measurement, and investment framework alignment.',
  },
  {
    step: '02',
    title: 'Concept & Material Palette',
    summary:
      'Physical material curation in stone, timber, plaster, and textiles accompanied by directional spatial studies.',
  },
  {
    step: '03',
    title: 'Technical Drawings & 3D Visualization',
    summary:
      'Photorealistic light-calibrated renderings, bespoke millwork elevations, and electrical-lighting schedules.',
  },
  {
    step: '04',
    title: 'Artisan Fabrication & Procurement',
    summary:
      'Direct commissioning with master workshops, stone quarries, and custom furniture ateliers with weekly QA.',
  },
  {
    step: '05',
    title: 'White-Glove Installation & Styling',
    summary:
      'Coordinated site placement, art hanging, textile steaming, and final lighting calibration for key handover.',
  },
];

export const WHY_CHOOSE_PILLARS = [
  {
    index: '01',
    title: 'Single-Point Principal Stewardship',
    detail:
      'Every commission is personally led by a Senior Architectural Principal from concept sketch through final key handover—never delegated to junior account tiers.',
  },
  {
    index: '02',
    title: 'Direct Quarry & Atelier Sourcing',
    detail:
      'We procure travertine slabs, hand-troweled limewash, and bespoke bronze hardware directly from master workshops in Italy, Belgium, and Switzerland.',
  },
  {
    index: '03',
    title: 'Transparent Fixed-Milestone Budgets',
    detail:
      'Open-book procurement schedules and clearly itemized phase milestones eliminate unexpected overages during construction.',
  },
  {
    index: '04',
    title: 'Timeless Material Longevity',
    detail:
      'We reject fleeting decorative trends in favor of natural solid woods, unlacquered brass, and honed stone that develop richer patina each decade.',
  },
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'monolith-travertine-console',
    name: 'Monolith Honed Travertine Console',
    description:
      'Architectural console carved from solid Roman ivory travertine with hand-honed mitered edge detailing for foyers and private gallery corridors.',
    price: 4850,
    category: 'Tables & Consoles',
    stock: 4,
    available: true,
    imageUrl: skylineImg,
    featured: true,
  },
  {
    id: 'aurelia-fluted-walnut-lounge',
    name: 'Aurelia Fluted Walnut Lounge Chair',
    description:
      'Sculpted American walnut barrel frame paired with Belgian ivory bouclé upholstery engineered for calm acoustic warmth.',
    price: 3200,
    category: 'Seating',
    stock: 6,
    available: true,
    imageUrl: sanctuaryImg,
    featured: true,
  },
  {
    id: 'atelier-bronze-suspension-light',
    name: 'Atelier Cast-Bronze Suspension Luminaire',
    description:
      'Hand-patinated architectural brass suspension fixture calibrated for warm 2700K dining and salon illumination.',
    price: 2650,
    category: 'Lighting',
    stock: 5,
    available: true,
    imageUrl: kitchenImg,
    featured: true,
  },
];

export type ThemeMode = 'light' | 'dark' | 'system';

export type ProjectCategory = 'Residential' | 'Penthouse' | 'Kitchen & Bath' | 'Hospitality';

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  year: string;
  area: string;
  style: string;
  summary: string;
  challenge?: string;
  solution?: string;
  imageUrl: string;
  featured: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: string;
  duration: string;
  order: number;
  updatedAt?: unknown;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  projectTitle: string;
  quote: string;
  order: number;
  updatedAt?: unknown;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutDescription: string;
  studioEmail: string;
  studioPhone: string;
  whatsappNumber: string;
  studioAddress: string;
  studioHours: string;
  defaultTheme: ThemeMode;
  heroImageUrl?: string;
  announcementEnabled?: boolean;
  announcementText?: string;
  promoEnabled?: boolean;
  promoTitle?: string;
  promoSubtitle?: string;
  promoCtaText?: string;
  promoImageUrl?: string;
  productCategories?: string[];
  featuredCollectionTitle?: string;
  featuredCollectionSubtitle?: string;
  updatedAt?: unknown;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  available: boolean;
  imageUrl: string;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLineItem {
  productId: string;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderLineItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomerItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ConsultationStatus = 'new' | 'scheduled' | 'completed' | 'archived';

export interface ConsultationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  projectType: string;
  propertySize?: string;
  budgetRange: string;
  preferredStyle: string;
  preferredDate?: string;
  message?: string;
  status: ConsultationStatus;
  adminNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type EnquiryStatus = 'unread' | 'replied' | 'archived';
export type EnquirySource = 'contact' | 'ai_assistant';

export interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: EnquirySource;
  status: EnquiryStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

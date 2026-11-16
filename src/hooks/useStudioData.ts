import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CONTENT,
  DEFAULT_TESTIMONIALS,
} from '../lib/studioDefaults';
import type {
  ConsultationItem,
  ConsultationStatus,
  CustomerItem,
  EnquiryItem,
  EnquirySource,
  EnquiryStatus,
  OrderItem,
  OrderLineItem,
  OrderStatus,
  ProductItem,
  ProjectItem,
  ServiceItem,
  SiteContent,
  TestimonialItem,
} from '../types';

export function usePublicStudioData() {
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isSyncedFromDb, setIsSyncedFromDb] = useState(false);

  useEffect(() => {
    testFirestoreConnection();

    const unsubProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          setProjects(
            snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<ProjectItem, 'id'>),
            }))
          );
          setIsSyncedFromDb(true);
        } else {
          setProjects(DEFAULT_PROJECTS);
        }
      },
      (error) => {
        console.warn('Projects listener notice:', error.message);
      }
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'services'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          setServices(
            snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<ServiceItem, 'id'>),
            }))
          );
        } else {
          setServices(DEFAULT_SERVICES);
        }
      },
      (error) => {
        console.warn('Services listener notice:', error.message);
      }
    );

    const unsubTestimonials = onSnapshot(
      query(collection(db, 'testimonials'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          setTestimonials(
            snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<TestimonialItem, 'id'>),
            }))
          );
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
      },
      (error) => {
        console.warn('Testimonials listener notice:', error.message);
      }
    );

    const unsubContent = onSnapshot(
      doc(db, 'site_content', 'landing'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SiteContent;
          const isLegacyPhone =
            !data.studioPhone || data.studioPhone.trim() === '+1 (212) 555-0194';
          const isLegacyWhatsapp =
            !data.whatsappNumber || data.whatsappNumber.trim() === '12125550194';
          const normalizedWhatsapp = isLegacyWhatsapp
            ? DEFAULT_SITE_CONTENT.whatsappNumber
            : data.whatsappNumber.replace(/[^0-9]/g, '') === '8950123700'
              ? '918950123700'
              : data.whatsappNumber;
          setSiteContent({
            ...DEFAULT_SITE_CONTENT,
            ...data,
            studioPhone: isLegacyPhone ? DEFAULT_SITE_CONTENT.studioPhone : data.studioPhone,
            whatsappNumber: normalizedWhatsapp,
          });
        }
      },
      (error) => {
        console.warn('Site content listener notice:', error.message);
      }
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        if (!snapshot.empty) {
          setProducts(
            snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<ProductItem, 'id'>),
            }))
          );
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
      },
      (error) => {
        console.warn('Products listener notice:', error.message);
      }
    );

    return () => {
      unsubProjects();
      unsubProducts();
      unsubServices();
      unsubTestimonials();
      unsubContent();
    };
  }, []);

  return {
    projects,
    products,
    services,
    testimonials,
    siteContent,
    isSyncedFromDb,
  };
}

export async function submitConsultation(input: {
  fullName: string;
  email: string;
  phone: string;
  projectType: string;
  propertySize?: string;
  budgetRange: string;
  preferredStyle: string;
  preferredDate?: string;
  message?: string;
}): Promise<void> {
  const path = 'consultations';
  try {
    await addDoc(collection(db, path), {
      fullName: input.fullName.trim().slice(0, 120),
      email: input.email.trim().slice(0, 180),
      phone: input.phone.trim().slice(0, 40),
      projectType: input.projectType.trim().slice(0, 80),
      ...(input.propertySize?.trim()
        ? { propertySize: input.propertySize.trim().slice(0, 60) }
        : {}),
      budgetRange: input.budgetRange.trim().slice(0, 80),
      preferredStyle: input.preferredStyle.trim().slice(0, 80),
      ...(input.preferredDate?.trim()
        ? { preferredDate: input.preferredDate.trim().slice(0, 40) }
        : {}),
      ...(input.message?.trim() ? { message: input.message.trim().slice(0, 1500) } : {}),
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function submitEnquiry(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: EnquirySource;
}): Promise<void> {
  const path = 'enquiries';
  try {
    await addDoc(collection(db, path), {
      name: input.name.trim().slice(0, 120),
      email: input.email.trim().slice(0, 180),
      ...(input.phone?.trim() ? { phone: input.phone.trim().slice(0, 40) } : {}),
      subject: input.subject.trim().slice(0, 160),
      message: input.message.trim().slice(0, 1500),
      source: input.source,
      status: 'unread',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function seedStudioCatalogue(): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (const p of DEFAULT_PROJECTS) {
      batch.set(doc(db, 'projects', p.id), {
        title: p.title,
        category: p.category,
        location: p.location,
        year: p.year,
        area: p.area,
        style: p.style,
        summary: p.summary,
        challenge: p.challenge || '',
        solution: p.solution || '',
        imageUrl: p.imageUrl,
        featured: p.featured,
        order: p.order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const s of DEFAULT_SERVICES) {
      batch.set(doc(db, 'services', s.id), {
        number: s.number,
        title: s.title,
        description: s.description,
        deliverables: s.deliverables,
        duration: s.duration,
        order: s.order,
        updatedAt: serverTimestamp(),
      });
    }

    for (const t of DEFAULT_TESTIMONIALS) {
      batch.set(doc(db, 'testimonials', t.id), {
        clientName: t.clientName,
        clientRole: t.clientRole,
        projectTitle: t.projectTitle,
        quote: t.quote,
        order: t.order,
        updatedAt: serverTimestamp(),
      });
    }

    for (const prod of DEFAULT_PRODUCTS) {
      batch.set(doc(db, 'products', prod.id), {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        category: prod.category,
        stock: prod.stock,
        available: prod.available,
        imageUrl: prod.imageUrl,
        featured: prod.featured,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    batch.set(doc(db, 'site_content', 'landing'), {
      ...DEFAULT_SITE_CONTENT,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedStudioCatalogue');
  }
}

export function useAdminStudioData(isAdminReady: boolean) {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loadingAdminData, setLoadingAdminData] = useState(true);

  useEffect(() => {
    if (!isAdminReady) {
      setConsultations([]);
      setEnquiries([]);
      setOrders([]);
      setCustomers([]);
      setLoadingAdminData(false);
      return;
    }

    setLoadingAdminData(true);

    const unsubConsultations = onSnapshot(
      query(collection(db, 'consultations'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setConsultations(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ConsultationItem, 'id'>),
          }))
        );
        setLoadingAdminData(false);
      },
      (error) => {
        setLoadingAdminData(false);
        handleFirestoreError(error, OperationType.LIST, 'consultations');
      }
    );

    const unsubEnquiries = onSnapshot(
      query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setEnquiries(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<EnquiryItem, 'id'>),
          }))
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
      }
    );

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setOrders(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<OrderItem, 'id'>),
          }))
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    const unsubCustomers = onSnapshot(
      query(collection(db, 'customers'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setCustomers(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CustomerItem, 'id'>),
          }))
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'customers');
      }
    );

    return () => {
      unsubConsultations();
      unsubEnquiries();
      unsubOrders();
      unsubCustomers();
    };
  }, [isAdminReady]);

  return { consultations, enquiries, orders, customers, loadingAdminData };
}

// Admin Mutation Helpers
export async function saveProject(project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) {
  const path = existingId ? `projects/${existingId}` : 'projects';
  try {
    if (existingId) {
      await updateDoc(doc(db, 'projects', existingId), {
        title: project.title.trim().slice(0, 120),
        category: project.category,
        location: project.location.trim().slice(0, 100),
        year: project.year.trim().slice(0, 10),
        area: project.area.trim().slice(0, 40),
        style: project.style.trim().slice(0, 80),
        summary: project.summary.trim().slice(0, 600),
        challenge: (project.challenge || '').trim().slice(0, 1000),
        solution: (project.solution || '').trim().slice(0, 1000),
        imageUrl: project.imageUrl.trim().slice(0, 500),
        featured: Boolean(project.featured),
        order: Number(project.order) || 1,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'projects'), {
        title: project.title.trim().slice(0, 120),
        category: project.category,
        location: project.location.trim().slice(0, 100),
        year: project.year.trim().slice(0, 10),
        area: project.area.trim().slice(0, 40),
        style: project.style.trim().slice(0, 80),
        summary: project.summary.trim().slice(0, 600),
        challenge: (project.challenge || '').trim().slice(0, 1000),
        solution: (project.solution || '').trim().slice(0, 1000),
        imageUrl: project.imageUrl.trim().slice(0, 500),
        featured: Boolean(project.featured),
        order: Number(project.order) || 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeProject(id: string) {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveService(service: Omit<ServiceItem, 'id' | 'updatedAt'>, existingId?: string) {
  const path = existingId ? `services/${existingId}` : 'services';
  try {
    const payload = {
      number: service.number.trim().slice(0, 10),
      title: service.title.trim().slice(0, 120),
      description: service.description.trim().slice(0, 600),
      deliverables: service.deliverables.trim().slice(0, 300),
      duration: service.duration.trim().slice(0, 60),
      order: Number(service.order) || 1,
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'services', existingId), payload);
    } else {
      await addDoc(collection(db, 'services'), payload);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeService(id: string) {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveTestimonial(
  testimonial: Omit<TestimonialItem, 'id' | 'updatedAt'>,
  existingId?: string
) {
  const path = existingId ? `testimonials/${existingId}` : 'testimonials';
  try {
    const payload = {
      clientName: testimonial.clientName.trim().slice(0, 100),
      clientRole: testimonial.clientRole.trim().slice(0, 120),
      projectTitle: testimonial.projectTitle.trim().slice(0, 120),
      quote: testimonial.quote.trim().slice(0, 800),
      order: Number(testimonial.order) || 1,
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'testimonials', existingId), payload);
    } else {
      await addDoc(collection(db, 'testimonials'), payload);
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeTestimonial(id: string) {
  const path = `testimonials/${id}`;
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSiteContent(content: SiteContent) {
  const path = 'site_content/landing';
  try {
    const cleanCategories = (content.productCategories || [])
      .map((c) => c.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 20);

    await setDoc(doc(db, 'site_content', 'landing'), {
      heroHeadline: content.heroHeadline.trim().slice(0, 180),
      heroSubtitle: content.heroSubtitle.trim().slice(0, 500),
      aboutTitle: content.aboutTitle.trim().slice(0, 160),
      aboutDescription: content.aboutDescription.trim().slice(0, 1200),
      studioEmail: content.studioEmail.trim().slice(0, 150),
      studioPhone: content.studioPhone.trim().slice(0, 50),
      whatsappNumber: (
        content.whatsappNumber.replace(/[^0-9]/g, '').length === 10
          ? `91${content.whatsappNumber.replace(/[^0-9]/g, '')}`
          : content.whatsappNumber.trim()
      ).slice(0, 30),
      studioAddress: content.studioAddress.trim().slice(0, 240),
      studioHours: content.studioHours.trim().slice(0, 120),
      defaultTheme: content.defaultTheme,
      heroImageUrl: (content.heroImageUrl || '').trim().slice(0, 500),
      announcementEnabled: Boolean(content.announcementEnabled),
      announcementText: (content.announcementText || '').trim().slice(0, 200),
      promoEnabled: Boolean(content.promoEnabled),
      promoTitle: (content.promoTitle || '').trim().slice(0, 160),
      promoSubtitle: (content.promoSubtitle || '').trim().slice(0, 400),
      promoCtaText: (content.promoCtaText || '').trim().slice(0, 60),
      promoImageUrl: (content.promoImageUrl || '').trim().slice(0, 500),
      productCategories: cleanCategories,
      featuredCollectionTitle: (content.featuredCollectionTitle || '').trim().slice(0, 140),
      featuredCollectionSubtitle: (content.featuredCollectionSubtitle || '').trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProduct(
  product: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
) {
  const path = existingId ? `products/${existingId}` : 'products';
  try {
    const cleanPrice = Math.max(0, Number(product.price) || 0);
    const cleanStock = Math.max(0, Math.floor(Number(product.stock) || 0));
    if (existingId) {
      await updateDoc(doc(db, 'products', existingId), {
        name: product.name.trim().slice(0, 140),
        description: product.description.trim().slice(0, 1200),
        price: cleanPrice,
        category: product.category.trim().slice(0, 80),
        stock: cleanStock,
        available: Boolean(product.available),
        imageUrl: product.imageUrl.trim().slice(0, 500),
        featured: Boolean(product.featured),
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'products'), {
        name: product.name.trim().slice(0, 140),
        description: product.description.trim().slice(0, 1200),
        price: cleanPrice,
        category: product.category.trim().slice(0, 80),
        stock: cleanStock,
        available: Boolean(product.available),
        imageUrl: product.imageUrl.trim().slice(0, 500),
        featured: Boolean(product.featured),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeProduct(id: string) {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitOrder(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderLineItem[];
  notes?: string;
  status?: OrderStatus;
  customerId?: string;
}): Promise<string> {
  const path = 'orders';
  try {
    const orderNumber = `LX-${Date.now().toString(36).toUpperCase()}`;
    const totalAmount = input.items.reduce(
      (sum, item) => sum + Math.max(0, Number(item.unitPrice) || 0) * Math.max(1, Number(item.quantity) || 1),
      0
    );

    const cleanItems = input.items.slice(0, 50).map((it) => ({
      productId: it.productId,
      productName: it.productName.slice(0, 140),
      category: it.category.slice(0, 80),
      unitPrice: Math.max(0, Number(it.unitPrice) || 0),
      quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
    }));

    const orderRef = await addDoc(collection(db, 'orders'), {
      orderNumber,
      ...(input.customerId ? { customerId: input.customerId.slice(0, 128) } : {}),
      customerName: input.customerName.trim().slice(0, 120),
      customerEmail: input.customerEmail.trim().slice(0, 180),
      customerPhone: input.customerPhone.trim().slice(0, 40),
      shippingAddress: input.shippingAddress.trim().slice(0, 400),
      items: cleanItems,
      totalAmount,
      status: input.status || 'pending',
      ...(input.notes?.trim() ? { notes: input.notes.trim().slice(0, 1000) } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Also register customer record in Firestore (non-blocking if duplicate/optional)
    try {
      await addDoc(collection(db, 'customers'), {
        fullName: input.customerName.trim().slice(0, 120),
        email: input.customerEmail.trim().toLowerCase().slice(0, 180),
        phone: input.customerPhone.trim().slice(0, 40),
        address: input.shippingAddress.trim().slice(0, 400),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      // order already created; do not fail checkout
    }

    return orderNumber;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  notes?: string,
  shippingAddress?: string
) {
  const path = `orders/${id}`;
  try {
    await updateDoc(doc(db, 'orders', id), {
      status,
      ...(notes !== undefined ? { notes: notes.trim().slice(0, 1000) } : {}),
      ...(shippingAddress !== undefined ? { shippingAddress: shippingAddress.trim().slice(0, 400) } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeOrder(id: string) {
  const path = `orders/${id}`;
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCustomer(
  customer: Omit<CustomerItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
) {
  const path = existingId ? `customers/${existingId}` : 'customers';
  try {
    const payload = {
      fullName: customer.fullName.trim().slice(0, 120),
      email: customer.email.trim().toLowerCase().slice(0, 180),
      ...(customer.phone?.trim() ? { phone: customer.phone.trim().slice(0, 40) } : {}),
      ...(customer.address?.trim() ? { address: customer.address.trim().slice(0, 400) } : {}),
      ...(customer.notes?.trim() ? { notes: customer.notes.trim().slice(0, 1000) } : {}),
      updatedAt: serverTimestamp(),
    };
    if (existingId) {
      await updateDoc(doc(db, 'customers', existingId), payload);
    } else {
      await addDoc(collection(db, 'customers'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeCustomer(id: string) {
  const path = `customers/${id}`;
  try {
    await deleteDoc(doc(db, 'customers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateConsultationStatus(
  id: string,
  status: ConsultationStatus,
  adminNotes?: string,
  preferredDate?: string
) {
  const path = `consultations/${id}`;
  try {
    await updateDoc(doc(db, 'consultations', id), {
      status,
      ...(adminNotes !== undefined ? { adminNotes: adminNotes.slice(0, 1000) } : {}),
      ...(preferredDate !== undefined ? { preferredDate: preferredDate.slice(0, 40) } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeConsultation(id: string) {
  const path = `consultations/${id}`;
  try {
    await deleteDoc(doc(db, 'consultations', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const path = `enquiries/${id}`;
  try {
    await updateDoc(doc(db, 'enquiries', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeEnquiry(id: string) {
  const path = `enquiries/${id}`;
  try {
    await deleteDoc(doc(db, 'enquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

import { ArrowUpRight, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import type {
  ConsultationItem,
  CustomerItem,
  EnquiryItem,
  OrderItem,
  OrderStatus,
  ProductItem,
} from '../../types';

interface OverviewSectionProps {
  products: ProductItem[];
  orders: OrderItem[];
  customers: CustomerItem[];
  consultations: ConsultationItem[];
  enquiries: EnquiryItem[];
  loadingAdminData: boolean;
  onSelectTab: (tab: 'products' | 'orders' | 'customers' | 'consultations' | 'enquiries') => void;
  onInspectOrder: (order: OrderItem) => void;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function getTimestampMs(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts) {
    const fn = (ts as { toMillis?: () => number }).toMillis;
    if (typeof fn === 'function') return fn.call(ts);
  }
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return Number((ts as { seconds?: number }).seconds || 0) * 1000;
  }
  return 0;
}

export function formatOrderDate(ts: unknown): string {
  const ms = getTimestampMs(ts);
  if (!ms) return 'Just now';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(ms));
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OverviewSection({
  products,
  orders,
  customers,
  consultations,
  enquiries,
  loadingAdminData,
  onSelectTab,
  onInspectOrder,
}: OverviewSectionProps) {
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  const statusBreakdown = (
    ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]
  ).map((status) => {
    const matching = orders.filter((o) => o.status === status);
    const revenue = matching.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    return { status, label: STATUS_LABEL[status], count: matching.length, revenue };
  });

  // Real category sales computed strictly from actual order line items
  const categoryRevenueMap = new Map<string, { revenue: number; units: number }>();
  for (const order of activeOrders) {
    for (const item of order.items || []) {
      const cat = item.category || 'Uncategorized';
      const current = categoryRevenueMap.get(cat) || { revenue: 0, units: 0 };
      current.revenue += (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1);
      current.units += Number(item.quantity) || 1;
      categoryRevenueMap.set(cat, current);
    }
  }
  const categorySales = Array.from(categoryRevenueMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
  const maxCategoryRevenue = Math.max(...categorySales.map((c) => c.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl">Studio &amp; Commerce Overview</h1>
        <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6]">
          Real-time metrics synchronized directly from your Firestore database.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: 'Excl. cancelled' },
          { label: 'Total Orders', value: orders.length, sub: `${customers.length} customers` },
          { label: 'Total Products', value: products.length, sub: `${products.filter((p) => p.available).length} available` },
          { label: 'Pending Orders', value: pendingOrders, sub: 'Awaiting fulfillment' },
          { label: 'Completed Orders', value: completedOrders, sub: 'Delivered' },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className={`p-5 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 text-center space-y-1 ${
              idx === 4 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">{stat.label}</p>
            <p className="font-serif text-2xl sm:text-3xl tabular-nums truncate">{stat.value}</p>
            <p className="text-[11px] text-[#8C887F] dark:text-[#B8B2A6]/80">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Overview & Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Sales Overview</h2>
              <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] mt-0.5">
                Revenue distribution by product category across active orders.
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#C6A15B] shrink-0" />
          </div>

          {loadingAdminData ? (
            <div className="space-y-3 py-4">
              <div className="h-6 rounded bg-[#EFE9DF] dark:bg-[#252522] animate-pulse" />
              <div className="h-6 rounded bg-[#EFE9DF] dark:bg-[#252522] animate-pulse w-4/5" />
            </div>
          ) : categorySales.length === 0 ? (
            <div className="py-10 text-center space-y-3 border border-dashed border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-[#C6A15B] mx-auto" />
              <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] max-w-sm mx-auto">
                No completed or active order items recorded yet. Sales analytics populate automatically as customer orders arrive.
              </p>
              <button
                type="button"
                onClick={() => onSelectTab('orders')}
                className="px-4 py-2 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium"
              >
                Open Order Management
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySales.map((row) => {
                const widthPct = Math.max(6, Math.round((row.revenue / maxCategoryRevenue) * 100));
                return (
                  <div key={row.category} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{row.category}</span>
                      <span className="font-mono tabular-nums text-[#5A5851] dark:text-[#B8B2A6]">
                        {row.units} {row.units === 1 ? 'unit' : 'units'} ·{' '}
                        <strong className="text-[#252522] dark:text-[#F5F1EA]">
                          {formatCurrency(row.revenue)}
                        </strong>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#EFE9DF] dark:bg-[#252522] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C6A15B] transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl">Order Pipeline</h2>
              <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] mt-0.5">
                Current order breakdown by fulfillment stage.
              </p>
            </div>
            <Package className="w-4 h-4 text-[#C6A15B] shrink-0" />
          </div>

          <div className="divide-y divide-[#D8C7B0]/40 dark:divide-[#F5F1EA]/10">
            {statusBreakdown.map((item) => (
              <div
                key={item.status}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center gap-4 font-mono tabular-nums">
                  <span className="text-[#5A5851] dark:text-[#B8B2A6]">
                    {item.count} {item.count === 1 ? 'order' : 'orders'}
                  </span>
                  <span className="w-20 text-right">{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">Recent Orders</h2>
          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className="inline-flex items-center gap-1 text-xs text-[#A8843F] dark:text-[#C6A15B] hover:underline"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingAdminData ? (
          <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5A5851] dark:text-[#B8B2A6] space-y-2">
            <p>No customer orders placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-[#5A5851] dark:text-[#B8B2A6]">
                  <th className="py-2.5 pr-4 font-medium">Order</th>
                  <th className="py-2.5 pr-4 font-medium">Customer</th>
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C7B0]/30 dark:divide-[#F5F1EA]/8">
                {orders.slice(0, 6).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onInspectOrder(order)}
                    className="cursor-pointer hover:bg-[#F5F1EA]/60 dark:hover:bg-[#252522]/60 transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono tabular-nums font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-[#5A5851] dark:text-[#B8B2A6] tabular-nums">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="py-3 pr-4 capitalize font-medium text-[#A8843F] dark:text-[#C6A15B]">
                      {order.status}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consultations & Enquiries Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent Consultation Requests</h2>
            <button
              type="button"
              onClick={() => onSelectTab('consultations')}
              className="text-xs text-[#A8843F] dark:text-[#C6A15B] hover:underline"
            >
              Manage All
            </button>
          </div>
          {consultations.length === 0 ? (
            <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
              No consultation bookings submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-[#D8C7B0]/40 dark:divide-[#F5F1EA]/10">
              {consultations.slice(0, 4).map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.fullName}</p>
                    <p className="text-[#5A5851] dark:text-[#B8B2A6] truncate">
                      {c.projectType} · {c.budgetRange}
                    </p>
                  </div>
                  <span className="capitalize font-mono text-[11px] text-[#A8843F] dark:text-[#C6A15B] shrink-0">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent Client Enquiries</h2>
            <button
              type="button"
              onClick={() => onSelectTab('enquiries')}
              className="text-xs text-[#A8843F] dark:text-[#C6A15B] hover:underline"
            >
              Manage All
            </button>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
              No general or AI enquiries received yet.
            </p>
          ) : (
            <div className="divide-y divide-[#D8C7B0]/40 dark:divide-[#F5F1EA]/10">
              {enquiries.slice(0, 4).map((eq) => (
                <div key={eq.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{eq.name}</p>
                    <p className="text-[#5A5851] dark:text-[#B8B2A6] truncate">
                      {eq.subject} · {eq.source === 'ai_assistant' ? 'LUXORA AI' : 'Contact'}
                    </p>
                  </div>
                  <span className="capitalize font-mono text-[11px] text-[#A8843F] dark:text-[#C6A15B] shrink-0">
                    {eq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

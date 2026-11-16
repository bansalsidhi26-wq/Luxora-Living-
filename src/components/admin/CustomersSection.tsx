import { FormEvent, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { removeCustomer, saveCustomer } from '../../hooks/useStudioData';
import type { CustomerItem, OrderItem } from '../../types';
import { formatCurrency, formatOrderDate } from './OverviewSection';

interface CustomersSectionProps {
  customers: CustomerItem[];
  orders: OrderItem[];
  onInspectOrder: (order: OrderItem) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

interface UnifiedCustomerRow {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  orders: OrderItem[];
  totalSpend: number;
}

export function CustomersSection({
  customers,
  orders,
  onInspectOrder,
  onNotify,
}: CustomersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

  // Merge registered Firestore customers with live orders by normalized email
  const customerMap = new Map<string, UnifiedCustomerRow>();
  for (const c of customers) {
    const key = c.email.trim().toLowerCase();
    customerMap.set(key, {
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone || '',
      address: c.address || '',
      notes: c.notes || '',
      orders: [],
      totalSpend: 0,
    });
  }

  for (const order of orders) {
    const key = order.customerEmail.trim().toLowerCase();
    const existing = customerMap.get(key);
    const spend = order.status === 'cancelled' ? 0 : Number(order.totalAmount) || 0;
    if (existing) {
      existing.orders.push(order);
      existing.totalSpend += spend;
      if (!existing.phone && order.customerPhone) existing.phone = order.customerPhone;
      if (!existing.address && order.shippingAddress) existing.address = order.shippingAddress;
    } else {
      customerMap.set(key, {
        fullName: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.shippingAddress,
        notes: '',
        orders: [order],
        totalSpend: spend,
      });
    }
  }

  const unifiedList = Array.from(customerMap.values()).filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const selectedCustomer = selectedCustomerEmail
    ? unifiedList.find((c) => c.email.toLowerCase() === selectedCustomerEmail.toLowerCase()) ||
      null
    : null;

  const openNewCustomer = () => {
    setEditingId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setShowForm(true);
  };

  const openEditCustomer = (row: UnifiedCustomerRow) => {
    setEditingId(row.id || null);
    setFullName(row.fullName);
    setEmail(row.email);
    setPhone(row.phone);
    setAddress(row.address);
    setNotes(row.notes);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      onNotify('error', 'Customer name is required.');
      return;
    }
    setSaving(true);
    try {
      await saveCustomer(
        { fullName, email, phone, address, notes },
        editingId || undefined
      );
      onNotify('success', editingId ? 'Customer record updated.' : 'Customer added.');
      setShowForm(false);
    } catch {
      onNotify('error', 'Could not save customer record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Customer Management</h1>
          <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
            Search registered client profiles, inspect lifetime spend, and trace full order history.
          </p>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={openNewCustomer}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 text-[#8C887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer name, email, phone..."
          aria-label="Search customers"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 text-xs focus:outline-none focus:border-[#C6A15B]"
        />
      </div>

      {unifiedList.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 text-sm text-[#5A5851] dark:text-[#B8B2A6]">
          {customers.length === 0 && orders.length === 0
            ? 'No registered customers yet.'
            : 'No customers match your search.'}
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-[#5A5851] dark:text-[#B8B2A6]">
                  <th className="py-3.5 px-5 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">Phone</th>
                  <th className="py-3.5 px-4 font-medium">Orders</th>
                  <th className="py-3.5 px-4 text-right font-medium">Total Spend</th>
                  <th className="py-3.5 px-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C7B0]/35 dark:divide-[#F5F1EA]/8">
                {unifiedList.map((c) => (
                  <tr
                    key={c.email}
                    className="hover:bg-[#F5F1EA]/50 dark:hover:bg-[#252522]/50 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerEmail(c.email)}
                        className="text-left group"
                      >
                        <div className="font-medium group-hover:text-[#A8843F] dark:group-hover:text-[#C6A15B]">
                          {c.fullName}
                        </div>
                        <div className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                          {c.email}
                        </div>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#5A5851] dark:text-[#B8B2A6]">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">{c.orders.length}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium">
                      {formatCurrency(c.totalSpend)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerEmail(c.email)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 hover:border-[#C6A15B]"
                        >
                          History
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditCustomer(c)}
                          aria-label={`Edit ${c.fullName}`}
                          className="p-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 hover:border-[#C6A15B]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {c.id && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await removeCustomer(c.id!);
                                if (selectedCustomerEmail === c.email) setSelectedCustomerEmail(null);
                                onNotify('success', 'Customer record deleted.');
                              } catch {
                                onNotify('error', 'Failed to delete customer.');
                              }
                            }}
                            aria-label={`Delete ${c.fullName}`}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail & Order History Drawer */}
      {selectedCustomer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Customer profile ${selectedCustomer.fullName}`}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#F5F1EA] dark:bg-[#1E1E1B] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl">{selectedCustomer.fullName}</h2>
                <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] mt-1">
                  {selectedCustomer.email} {selectedCustomer.phone ? `· ${selectedCustomer.phone}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerEmail(null)}
                aria-label="Close"
                className="p-2 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedCustomer.address && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-xs space-y-1">
                <p className="text-[#5A5851] dark:text-[#B8B2A6]">Address</p>
                <p>{selectedCustomer.address}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl">Order History</h3>
                <span className="text-xs font-mono tabular-nums text-[#A8843F] dark:text-[#C6A15B]">
                  Lifetime Spend: {formatCurrency(selectedCustomer.totalSpend)}
                </span>
              </div>

              {selectedCustomer.orders.length === 0 ? (
                <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6]">
                  No orders recorded for this customer yet.
                </p>
              ) : (
                <div className="rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 divide-y divide-[#D8C7B0]/40 dark:divide-[#F5F1EA]/10 text-xs">
                  {selectedCustomer.orders.map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerEmail(null);
                        onInspectOrder(ord);
                      }}
                      className="w-full p-3.5 flex items-center justify-between gap-4 text-left hover:bg-[#F5F1EA]/60 dark:hover:bg-[#1E1E1B]/60 transition-colors"
                    >
                      <div>
                        <p className="font-mono tabular-nums font-medium">{ord.orderNumber}</p>
                        <p className="text-[#5A5851] dark:text-[#B8B2A6]">
                          {formatOrderDate(ord.createdAt)} ·{' '}
                          <span className="capitalize">{ord.status}</span>
                        </p>
                      </div>
                      <span className="font-mono tabular-nums font-medium">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer record form"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-[#F5F1EA] dark:bg-[#1E1E1B] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 p-6 sm:p-8 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">
                {editingId ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
                className="p-1.5 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="font-medium">Full Name *</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium">Email *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 8950123700"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium">Shipping Address</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium">Client Notes</span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-full bg-[#C6A15B] text-[#141412] font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Customer'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

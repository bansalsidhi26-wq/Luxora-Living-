import { FormEvent, useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import {
  removeOrder,
  submitOrder,
  updateOrderStatus,
} from '../../hooks/useStudioData';
import type { OrderItem, OrderStatus, ProductItem } from '../../types';
import { formatCurrency, formatOrderDate } from './OverviewSection';

interface OrdersSectionProps {
  orders: OrderItem[];
  products: ProductItem[];
  selectedOrder: OrderItem | null;
  onSelectOrder: (order: OrderItem | null) => void;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export function OrdersSection({
  orders,
  products,
  selectedOrder,
  onSelectOrder,
  onNotify,
}: OrdersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // Create studio order modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newShippingAddress, setNewShippingAddress] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const [notesDraft, setNotesDraft] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (order: OrderItem, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, nextStatus);
      if (selectedOrder?.id === order.id) {
        onSelectOrder({ ...order, status: nextStatus });
      }
      onNotify('success', `Order ${order.orderNumber} updated to ${nextStatus}.`);
    } catch {
      onNotify('error', 'Failed to update order status.');
    }
  };

  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === newProductId) || products[0];
    if (!product) {
      onNotify('error', 'Please add at least one product before creating an order.');
      return;
    }
    setCreating(true);
    try {
      await submitOrder({
        customerName: newCustomerName,
        customerEmail: newCustomerEmail,
        customerPhone: newCustomerPhone,
        shippingAddress: newShippingAddress,
        items: [
          {
            productId: product.id,
            productName: product.name,
            category: product.category,
            unitPrice: product.price,
            quantity: Math.max(1, Math.floor(Number(newQuantity) || 1)),
          },
        ],
        notes: newNotes,
      });
      onNotify('success', 'Order recorded in Firestore.');
      setShowCreateModal(false);
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      setNewShippingAddress('');
      setNewNotes('');
      setNewQuantity('1');
    } catch {
      onNotify('error', 'Could not create order. Check all required fields.');
    } finally {
      setCreating(false);
    }
  };

  const customerOrderHistory = selectedOrder
    ? orders.filter(
        (o) => o.customerEmail.toLowerCase() === selectedOrder.customerEmail.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Order Management</h1>
          <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
            Inspect full order details, manage fulfillment statuses, and review client order history.
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setNewProductId(products[0].id);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Order</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-[#8C887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, email..."
            aria-label="Search orders"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 text-xs focus:outline-none focus:border-[#C6A15B]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 p-1 rounded-xl bg-[#EFE9DF] dark:bg-[#1E1E1B] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-xs">
          {(['all', ...ORDER_STATUSES] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white dark:bg-[#252522] shadow-sm'
                  : 'text-[#5A5851] dark:text-[#B8B2A6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 text-sm text-[#5A5851] dark:text-[#B8B2A6]">
          {orders.length === 0
            ? 'No orders placed yet. Orders submitted from the storefront or recorded by admins will appear here.'
            : 'No orders match the current search or status filter.'}
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-[#5A5851] dark:text-[#B8B2A6]">
                  <th className="py-3.5 px-5 font-medium">Order #</th>
                  <th className="py-3.5 px-4 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">Items</th>
                  <th className="py-3.5 px-4 font-medium">Date</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 text-right font-medium">Total</th>
                  <th className="py-3.5 px-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C7B0]/35 dark:divide-[#F5F1EA]/8">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F5F1EA]/50 dark:hover:bg-[#252522]/50 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono tabular-nums font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectOrder(order);
                          setEditingNotes(false);
                        }}
                        className="text-[#A8843F] dark:text-[#C6A15B] hover:underline"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#5A5851] dark:text-[#B8B2A6]">
                      {(order.items || []).reduce((s, it) => s + (it.quantity || 1), 0)} piece(s)
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#5A5851] dark:text-[#B8B2A6]">
                      {formatOrderDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        aria-label={`Order status for ${order.orderNumber}`}
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#F5F1EA] dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 capitalize text-xs"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectOrder(order);
                            setEditingNotes(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 hover:border-[#C6A15B]"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await removeOrder(order.id);
                              if (selectedOrder?.id === order.id) onSelectOrder(null);
                              onNotify('success', 'Order deleted.');
                            } catch {
                              onNotify('error', 'Failed to delete order.');
                            }
                          }}
                          aria-label={`Delete order ${order.orderNumber}`}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Order ${selectedOrder.orderNumber} details`}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#F5F1EA] dark:bg-[#1E1E1B] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#A8843F] dark:text-[#C6A15B] tabular-nums">
                  {selectedOrder.orderNumber} · {formatOrderDate(selectedOrder.createdAt)}
                </p>
                <h2 className="font-serif text-3xl mt-1">{selectedOrder.customerName}</h2>
              </div>
              <button
                type="button"
                onClick={() => onSelectOrder(null)}
                aria-label="Close order details"
                className="p-2 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15 hover:border-[#C6A15B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-xs">
              <div className="space-y-1">
                <p className="text-[#5A5851] dark:text-[#B8B2A6]">Customer Contact</p>
                <p className="font-medium">{selectedOrder.customerEmail}</p>
                <p className="tabular-nums">{selectedOrder.customerPhone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[#5A5851] dark:text-[#B8B2A6]">Shipping Address</p>
                <p className="leading-relaxed">{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <h3 className="font-serif text-xl">Ordered Pieces</h3>
              <div className="rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 divide-y divide-[#D8C7B0]/40 dark:divide-[#F5F1EA]/10 text-xs">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="p-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-[#5A5851] dark:text-[#B8B2A6]">
                        {item.category} · Qty {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums font-medium">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="p-3.5 flex items-center justify-between font-medium text-sm">
                  <span>Order Total</span>
                  <span className="font-mono tabular-nums text-[#A8843F] dark:text-[#C6A15B]">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1.5">
                <span className="font-medium">Update Order Status</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder, e.target.value as OrderStatus)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 capitalize"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Order Notes</span>
                  {!editingNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotesDraft(selectedOrder.notes || '');
                        setEditingNotes(true);
                      }}
                      className="text-[#A8843F] dark:text-[#C6A15B] hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await updateOrderStatus(selectedOrder.id, selectedOrder.status, notesDraft);
                          onSelectOrder({ ...selectedOrder, notes: notesDraft });
                          setEditingNotes(false);
                          onNotify('success', 'Order notes updated.');
                        } catch {
                          onNotify('error', 'Failed to update notes.');
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-[#C6A15B] text-[#141412] font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10 text-[#5A5851] dark:text-[#B8B2A6]">
                    {selectedOrder.notes || 'No order notes.'}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Order History */}
            <div className="space-y-2 pt-2 border-t border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10">
              <h3 className="font-serif text-xl">
                Customer Order History ({customerOrderHistory.length})
              </h3>
              <div className="divide-y divide-[#D8C7B0]/40 dark:divide-[#F5F1EA]/10 text-xs">
                {customerOrderHistory.map((h) => (
                  <div key={h.id} className="py-2 flex items-center justify-between gap-4">
                    <span className="font-mono tabular-nums">{h.orderNumber}</span>
                    <span className="text-[#5A5851] dark:text-[#B8B2A6]">
                      {formatOrderDate(h.createdAt)}
                    </span>
                    <span className="capitalize">{h.status}</span>
                    <span className="font-mono tabular-nums font-medium">
                      {formatCurrency(h.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Record customer order"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateOrder}
            className="w-full max-w-lg rounded-2xl bg-[#F5F1EA] dark:bg-[#1E1E1B] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 p-6 sm:p-8 space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Record Customer Order</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
                className="p-1.5 rounded-full border border-[#D8C7B0] dark:border-[#F5F1EA]/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="font-medium">Customer Name *</span>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="font-medium">Customer Email *</span>
                <input
                  type="email"
                  required
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-medium">Phone *</span>
              <input
                type="tel"
                required
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="+91 8950123700"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-medium">Shipping Address *</span>
              <input
                type="text"
                required
                value={newShippingAddress}
                onChange={(e) => setNewShippingAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-1 col-span-2">
                <span className="font-medium">Product *</span>
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.price)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-medium">Quantity *</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm tabular-nums"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-medium">Notes (Optional)</span>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 rounded-full bg-[#C6A15B] text-[#141412] font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
            >
              {creating ? 'Recording Order...' : 'Save Order'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

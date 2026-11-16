import { ChangeEvent, FormEvent, useState } from 'react';
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { removeProduct, saveProduct } from '../../hooks/useStudioData';
import { STUDIO_IMAGES } from '../../lib/studioDefaults';
import type { ProductItem } from '../../types';
import { ResilientImage } from '../ResilientImage';
import { formatCurrency } from './OverviewSection';

interface ProductsSectionProps {
  products: ProductItem[];
  categories: string[];
  onUploadImage: (file: File) => Promise<string>;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export function ProductsSection({
  products,
  categories,
  onUploadImage,
  onNotify,
}: ProductsSectionProps) {
  const safeCategories = categories.length
    ? categories
    : ['Seating', 'Lighting', 'Tables & Consoles', 'Sculptural Objects', 'Textiles & Rugs'];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2400');
  const [category, setCategory] = useState(safeCategories[0]);
  const [stock, setStock] = useState('5');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>(STUDIO_IMAGES.skyline);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('2400');
    setCategory(safeCategories[0]);
    setStock('5');
    setAvailable(true);
    setFeatured(true);
    setImageUrl(STUDIO_IMAGES.skyline);
  };

  const startEdit = (product: ProductItem) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category || safeCategories[0]);
    setStock(String(product.stock));
    setAvailable(product.available);
    setFeatured(product.featured);
    setImageUrl(product.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      setImageUrl(url);
      onNotify('success', 'Product image uploaded.');
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericStock = Math.floor(Number(stock));
    if (name.trim().length < 2) {
      onNotify('error', 'Product name must be at least 2 characters.');
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      onNotify('error', 'Please provide a valid non-negative price.');
      return;
    }
    if (Number.isNaN(numericStock) || numericStock < 0) {
      onNotify('error', 'Please provide a valid stock quantity.');
      return;
    }

    setSaving(true);
    try {
      await saveProduct(
        {
          name,
          description,
          price: numericPrice,
          category,
          stock: numericStock,
          available,
          imageUrl,
          featured,
        },
        editingId || undefined
      );
      onNotify(
        'success',
        editingId ? 'Product updated and synced to storefront.' : 'New product published to storefront.'
      );
      resetForm();
    } catch {
      onNotify('error', 'Could not save product. Please verify fields and permissions.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (product: ProductItem) => {
    try {
      await saveProduct(
        {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          available: !product.available,
          imageUrl: product.imageUrl,
          featured: product.featured,
        },
        product.id
      );
      onNotify(
        'success',
        `${product.name} marked as ${!product.available ? 'Available' : 'Unavailable'}.`
      );
    } catch {
      onNotify('error', 'Unable to update product availability.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    const matchesAvail =
      filterAvailability === 'all' ||
      (filterAvailability === 'available' ? p.available : !p.available);
    return matchesSearch && matchesCat && matchesAvail;
  });

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Product Management</h1>
          <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
            Add, edit, price, and control availability for curated furnishings and bespoke objects.
          </p>
        </div>
        {editingId && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-full text-xs border border-[#D8C7B0] dark:border-[#F5F1EA]/15 hover:border-[#C6A15B]"
            >
              Cancel Edit &amp; Add New
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Product Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5 text-xs"
      >
        <h2 className="font-serif text-2xl text-center sm:text-left">
          {editingId ? 'Edit Product Details' : 'Add New Product'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="space-y-1.5 md:col-span-2">
            <span className="font-medium">Product Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fluted Travertine Console Table"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="font-medium">Category *</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
            >
              {safeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {!safeCategories.includes(category) && (
                <option value={category}>{category}</option>
              )}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="font-medium">Price (USD) *</span>
              <input
                type="number"
                required
                min={0}
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm tabular-nums"
              />
            </label>
            <label className="space-y-1.5">
              <span className="font-medium">Stock Qty *</span>
              <input
                type="number"
                required
                min={0}
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm tabular-nums"
              />
            </label>
          </div>
        </div>

        {/* Image Upload & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#F5F1EA]/50 dark:bg-[#252522]/70 border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
          <div className="md:col-span-3 aspect-[4/3] rounded-xl overflow-hidden bg-[#EFE9DF] dark:bg-[#141412]">
            <ResilientImage
              src={imageUrl}
              alt={name || 'Product preview'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-9 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] font-medium cursor-pointer hover:opacity-90 transition-opacity">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload Product Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <span className="text-[#5A5851] dark:text-[#B8B2A6]">
                JPG, PNG, or WebP up to 8 MB
              </span>
            </div>
            <label className="block space-y-1">
              <span className="text-[#5A5851] dark:text-[#B8B2A6]">Image Path / URL</span>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs font-mono"
              />
            </label>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="font-medium">Description &amp; Material Notes *</span>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe dimensions, stone/timber finishes, lead time, and craftsmanship..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="accent-[#C6A15B]"
              />
              <span>Available on Storefront</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-[#C6A15B]"
              />
              <span>Featured Piece</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C6A15B] text-[#141412] font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Product'
                  : 'Publish Product'}
            </span>
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-[#8C887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 text-xs focus:outline-none focus:border-[#C6A15B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            aria-label="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12"
          >
            <option value="All">All Categories</option>
            {safeCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by availability"
            value={filterAvailability}
            onChange={(e) =>
              setFilterAvailability(e.target.value as 'all' | 'available' | 'unavailable')
            }
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12"
          >
            <option value="all">All Availability</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>
      </div>

      {/* Product Catalogue List */}
      {filteredProducts.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 text-sm text-[#5A5851] dark:text-[#B8B2A6]">
          {products.length === 0
            ? 'No products added yet. Use the form above to publish your first curated piece.'
            : 'No products match your search or filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10"
            >
              <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-[#EFE9DF] dark:bg-[#252522]">
                <ResilientImage
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                    <span className="truncate">{p.category}</span>
                    <span className="font-mono tabular-nums shrink-0">
                      Stock: {p.stock}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl truncate">{p.name}</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono tabular-nums font-semibold text-[#A8843F] dark:text-[#C6A15B]">
                      {formatCurrency(p.price)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={p.available ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                      {p.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs hover:border-[#C6A15B]"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(p)}
                    className="px-3 py-1.5 rounded-lg border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs hover:border-[#C6A15B]"
                  >
                    {p.available ? 'Set Unavailable' : 'Set Available'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removeProduct(p.id);
                        onNotify('success', 'Product removed from Firestore.');
                      } catch {
                        onNotify('error', 'Failed to delete product.');
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
      )}
    </div>
  );
}

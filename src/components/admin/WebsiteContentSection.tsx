import { ChangeEvent, FormEvent, useState } from 'react';
import { Plus, Sparkles, Upload, X } from 'lucide-react';
import { STUDIO_IMAGES } from '../../lib/studioDefaults';
import type { SiteContent, ThemeMode } from '../../types';
import { ResilientImage } from '../ResilientImage';

interface WebsiteContentSectionProps {
  contentForm: SiteContent;
  setContentForm: React.Dispatch<React.SetStateAction<SiteContent>>;
  onSubmit: (e: FormEvent) => Promise<void>;
  saving: boolean;
  onUploadImage: (file: File) => Promise<string>;
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export function WebsiteContentSection({
  contentForm,
  setContentForm,
  onSubmit,
  saving,
  onUploadImage,
  onNotify,
}: WebsiteContentSectionProps) {
  const [newCategory, setNewCategory] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingPromo, setUploadingPromo] = useState(false);

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    target: 'heroImageUrl' | 'promoImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (target === 'heroImageUrl') setUploadingHero(true);
    else setUploadingPromo(true);

    try {
      const url = await onUploadImage(file);
      setContentForm((c) => ({ ...c, [target]: url }));
      onNotify(
        'success',
        target === 'heroImageUrl' ? 'Hero banner image uploaded.' : 'Promotional image uploaded.'
      );
    } catch (err) {
      onNotify('error', err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploadingHero(false);
      setUploadingPromo(false);
    }
  };

  const categories = contentForm.productCategories || [];

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      onNotify('error', 'That category already exists.');
      return;
    }
    setContentForm((c) => ({
      ...c,
      productCategories: [...(c.productCategories || []), trimmed],
    }));
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    setContentForm((c) => ({
      ...c,
      productCategories: (c.productCategories || []).filter((item) => item !== cat),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl">Website Content Management</h1>
        <p className="text-sm text-[#5A5851] dark:text-[#B8B2A6] mt-1">
          Control homepage hero banners, announcements, promotional sections, curated categories, and studio details live.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 text-xs">
        {/* 1. Hero Banner & Image */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5">
          <h2 className="font-serif text-2xl">Homepage Hero Banner</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#F5F1EA]/50 dark:bg-[#252522]/70 border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
            <div className="md:col-span-4 aspect-[16/9] rounded-xl overflow-hidden bg-[#EFE9DF] dark:bg-[#141412]">
              <ResilientImage
                src={contentForm.heroImageUrl || STUDIO_IMAGES.hero}
                alt="Homepage hero banner preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] font-medium cursor-pointer hover:opacity-90">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingHero ? 'Uploading...' : 'Upload Hero Banner'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e, 'heroImageUrl')}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setContentForm((c) => ({ ...c, heroImageUrl: STUDIO_IMAGES.hero }))
                  }
                  className="text-xs text-[#A8843F] dark:text-[#C6A15B] hover:underline"
                >
                  Restore Default Hero Image
                </button>
              </div>
              <input
                type="text"
                value={contentForm.heroImageUrl || ''}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, heroImageUrl: e.target.value }))
                }
                placeholder="Hero image path or URL"
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 font-mono"
              />
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="font-medium">Hero Headline</span>
            <input
              type="text"
              required
              value={contentForm.heroHeadline}
              onChange={(e) =>
                setContentForm((c) => ({ ...c, heroHeadline: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-medium">Hero Introduction</span>
            <textarea
              required
              rows={2}
              value={contentForm.heroSubtitle}
              onChange={(e) =>
                setContentForm((c) => ({ ...c, heroSubtitle: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
            />
          </label>
        </div>

        {/* 2. Website Announcements */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Website Announcement Bar</h2>
              <p className="text-[#5A5851] dark:text-[#B8B2A6]">
                Display a refined studio notice across the top of the public website.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={Boolean(contentForm.announcementEnabled)}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, announcementEnabled: e.target.checked }))
                }
                className="accent-[#C6A15B]"
              />
              <span>Show Announcement</span>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="font-medium">Announcement Text</span>
            <input
              type="text"
              maxLength={200}
              value={contentForm.announcementText || ''}
              onChange={(e) =>
                setContentForm((c) => ({ ...c, announcementText: e.target.value }))
              }
              placeholder="e.g., Now Accepting Private Residential Commissions for 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
            />
          </label>
        </div>

        {/* 3. Promotional Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Promotional Feature Section</h2>
              <p className="text-[#5A5851] dark:text-[#B8B2A6]">
                Highlight seasonal editions, showroom exhibitions, or private atelier previews.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={Boolean(contentForm.promoEnabled)}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, promoEnabled: e.target.checked }))
                }
                className="accent-[#C6A15B]"
              />
              <span>Show Promotional Banner</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#F5F1EA]/50 dark:bg-[#252522]/70 border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
            <div className="md:col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-[#EFE9DF] dark:bg-[#141412]">
              <ResilientImage
                src={contentForm.promoImageUrl || STUDIO_IMAGES.about}
                alt="Promotional feature preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-8 space-y-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] font-medium cursor-pointer hover:opacity-90">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPromo ? 'Uploading...' : 'Upload Promo Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e, 'promoImageUrl')}
                  className="sr-only"
                />
              </label>
              <input
                type="text"
                value={contentForm.promoImageUrl || ''}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, promoImageUrl: e.target.value }))
                }
                placeholder="Promotional image URL"
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="font-medium">Promotional Headline</span>
              <input
                type="text"
                maxLength={160}
                value={contentForm.promoTitle || ''}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, promoTitle: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="font-medium">Button Label</span>
              <input
                type="text"
                maxLength={60}
                value={contentForm.promoCtaText || ''}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, promoCtaText: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="font-medium">Promotional Description</span>
            <textarea
              rows={2}
              maxLength={400}
              value={contentForm.promoSubtitle || ''}
              onChange={(e) =>
                setContentForm((c) => ({ ...c, promoSubtitle: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
            />
          </label>
        </div>

        {/* 4. Categories & Featured Collections */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5">
          <h2 className="font-serif text-2xl">Categories &amp; Featured Collections</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="font-medium">Featured Collection Heading</span>
              <input
                type="text"
                maxLength={140}
                value={contentForm.featuredCollectionTitle || ''}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, featuredCollectionTitle: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="font-medium">Featured Collection Subtitle</span>
              <input
                type="text"
                maxLength={400}
                value={contentForm.featuredCollectionSubtitle || ''}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, featuredCollectionSubtitle: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
          </div>

          <div className="space-y-2.5">
            <span className="font-medium block">Product Categories</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F1EA] dark:bg-[#252522] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/15"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    aria-label={`Remove ${cat}`}
                    className="text-[#5A5851] hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-md pt-1">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="Add new category (e.g., Bespoke Mirrors)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-[#D8C7B0] dark:border-[#F5F1EA]/15 hover:border-[#C6A15B] font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Studio Narrative & Contact Settings */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E1E1B] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 space-y-5">
          <h2 className="font-serif text-2xl">Studio Narrative &amp; Contact Settings</h2>

          <label className="block space-y-1.5">
            <span className="font-medium">About Section Title</span>
            <input
              type="text"
              required
              value={contentForm.aboutTitle}
              onChange={(e) =>
                setContentForm((c) => ({ ...c, aboutTitle: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-medium">About Studio Narrative</span>
            <textarea
              required
              rows={3}
              value={contentForm.aboutDescription}
              onChange={(e) =>
                setContentForm((c) => ({ ...c, aboutDescription: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm resize-none"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1.5">
              <span className="font-medium">Studio Email</span>
              <input
                type="email"
                required
                value={contentForm.studioEmail}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, studioEmail: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="font-medium">Studio Phone</span>
              <input
                type="text"
                required
                value={contentForm.studioPhone}
                placeholder="+91 8950123700"
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, studioPhone: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="font-medium">WhatsApp Number (with country code)</span>
              <input
                type="text"
                required
                value={contentForm.whatsappNumber}
                placeholder="918950123700"
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, whatsappNumber: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="font-medium">Atelier Address</span>
              <input
                type="text"
                required
                value={contentForm.studioAddress}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, studioAddress: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
            <label className="space-y-1.5">
              <span className="font-medium">Studio Hours</span>
              <input
                type="text"
                required
                value={contentForm.studioHours}
                onChange={(e) =>
                  setContentForm((c) => ({ ...c, studioHours: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
              />
            </label>
          </div>

          <label className="block space-y-1.5 max-w-xs">
            <span className="font-medium">Default Website Theme (New Visitors)</span>
            <select
              value={contentForm.defaultTheme}
              onChange={(e) =>
                setContentForm((c) => ({
                  ...c,
                  defaultTheme: e.target.value as ThemeMode,
                }))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F1EA]/65 dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 text-sm"
            >
              <option value="light">Light Theme (Warm Ivory)</option>
              <option value="dark">Dark Theme (Charcoal Gold)</option>
              <option value="system">System Theme (OS Preference)</option>
            </select>
          </label>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={saving || uploadingHero || uploadingPromo}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#C6A15B] text-[#141412] text-xs font-medium hover:bg-[#b5904b] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Website Content & Settings'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

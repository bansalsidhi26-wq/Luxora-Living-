import { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { STUDIO_IMAGES } from '../lib/studioDefaults';
import { ResilientImage } from './ResilientImage';

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(52);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(4, Math.min(96, raw));
    setPosition(Math.round(clamped * 10) / 10);
  }, []);

  return (
    <div className="space-y-5">
      <div
        ref={containerRef}
        data-cursor-label="Drag"
        role="slider"
        tabIndex={0}
        aria-label="Before and after architectural interior transformation slider"
        aria-valuemin={4}
        aria-valuemax={96}
        aria-valuenow={Math.round(position)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPosition((p) => Math.max(4, p - 4));
          if (e.key === 'ArrowRight') setPosition((p) => Math.min(96, p + 4));
        }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          updateFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden select-none touch-none border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/12 bg-[#EFE9DF] dark:bg-[#1E1E1B] focus-visible:outline-2 focus-visible:outline-[#C6A15B]"
      >
        {/* After Layer (Full width base) */}
        <div className="absolute inset-0">
          <ResilientImage
            src={STUDIO_IMAGES.after}
            alt="Transformed LUXORA LIVING residence featuring limewash plaster, walnut shelving, and travertine hearth"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#252522]/80 text-[#F5F1EA] text-xs tracking-wide backdrop-blur-sm">
            After · Completed Residence
          </span>
        </div>

        {/* Before Layer (Clipped via clip-path so image proportions never squash) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <ResilientImage
            src={STUDIO_IMAGES.before}
            alt="Original pre-renovation living room prior to LUXORA LIVING architectural redesign"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-4 left-4 px-3 py-1 rounded bg-[#252522]/80 text-[#F5F1EA] text-xs tracking-wide backdrop-blur-sm">
            Before · Existing Shell
          </span>
        </div>

        {/* Champagne-gold vertical divider & handle */}
        <div
          style={{ left: `${position}%` }}
          className="absolute inset-y-0 -translate-x-1/2 w-[2px] bg-[#C6A15B] shadow-[0_0_16px_rgba(0,0,0,0.35)] pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#252522] border-2 border-[#C6A15B] text-[#F5F1EA] flex items-center justify-center shadow-xl">
            <MoveHorizontal className="w-4 h-4 text-[#C6A15B]" />
          </div>
        </div>
      </div>

      {/* Quick preset comparison controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A5851] dark:text-[#B8B2A6]">
        <span>Drag handle horizontally or use arrow keys to inspect architectural transformation</span>
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#EFE9DF] dark:bg-[#1E1E1B] border border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
          {[
            { label: 'Before', value: 92 },
            { label: '50 / 50', value: 50 },
            { label: 'After', value: 8 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPosition(preset.value)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                Math.abs(position - preset.value) < 6
                  ? 'bg-white dark:bg-[#252522] text-[#252522] dark:text-[#F5F1EA] shadow-sm'
                  : 'hover:text-[#252522] dark:hover:text-[#F5F1EA]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

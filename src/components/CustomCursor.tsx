import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [hoverInteractive, setHoverInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) {
      setEnabled(false);
      document.body.classList.remove('luxora-cursor-enabled');
      return;
    }

    setEnabled(true);
    document.body.classList.add('luxora-cursor-enabled');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      const labeledEl = target?.closest('[data-cursor-label]') as HTMLElement | null;
      const interactiveEl = target?.closest('a, button, [role="button"], input, select, textarea');

      if (labeledEl) {
        const label = labeledEl.getAttribute('data-cursor-label') || '';
        setCursorLabel(label);
        setHoverInteractive(true);
      } else if (interactiveEl) {
        setCursorLabel('');
        setHoverInteractive(true);
      } else {
        setCursorLabel('');
        setHoverInteractive(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId = window.requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('luxora-cursor-enabled');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  const hasLabel = Boolean(cursorLabel);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={ringRef}
        style={{ opacity: isVisible ? 1 : 0 }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 will-change-transform"
      >
        <div
          className={`flex items-center justify-center rounded-full border transition-all duration-200 ease-out ${
            hasLabel
              ? 'w-24 h-24 bg-[#252522]/85 dark:bg-[#F5F1EA]/90 border-[#C6A15B] text-[#F5F1EA] dark:text-[#252522] shadow-lg'
              : hoverInteractive
                ? 'w-12 h-12 border-[#C6A15B] bg-[#C6A15B]/12'
                : 'w-8 h-8 border-[#C6A15B]/80'
          }`}
        >
          {hasLabel && (
            <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-center px-2 leading-tight">
              {cursorLabel}
            </span>
          )}
        </div>
      </div>
      <div
        ref={dotRef}
        style={{ opacity: isVisible && !hasLabel ? 1 : 0 }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C6A15B] transition-opacity duration-150 will-change-transform"
      />
    </div>
  );
}

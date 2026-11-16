import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function BrandLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReduced ? 120 : 850;
    const timer = window.setTimeout(() => setVisible(false), delay);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F1EA] dark:bg-[#141412] pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4 px-6 text-center"
          >
            <span className="font-serif text-3xl sm:text-4xl tracking-[0.22em] text-[#252522] dark:text-[#F5F1EA] font-medium">
              LUXORA LIVING
            </span>
            <div className="w-40 h-[1px] bg-[#D8C7B0]/50 dark:bg-[#F5F1EA]/15 overflow-hidden relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-[#C6A15B]"
              />
            </div>
            <span className="text-[11px] tracking-[0.26em] uppercase text-[#5A5851] dark:text-[#B8B2A6]">
              Designing Spaces · Defining Elegance
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

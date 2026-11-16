import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 right-5 sm:right-7 z-40 w-11 h-11 rounded-full border border-[#C6A15B]/75 bg-[#F5F1EA]/95 dark:bg-[#252522]/95 text-[#C6A15B] shadow-md backdrop-blur-md flex items-center justify-center hover:-translate-y-1 hover:bg-[#C6A15B] hover:text-[#141412] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A15B]"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={1.8} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

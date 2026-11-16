import { useState } from 'react';
import { Compass } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#EFE9DF] to-[#D8C7B0]/50 dark:from-[#1E1E1B] dark:to-[#252522] p-6 text-center"
      >
        <Compass className="w-6 h-6 text-[#C6A15B]" strokeWidth={1.35} />
        <span className="font-serif text-lg tracking-wide text-[#252522] dark:text-[#F5F1EA]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types';

const STORAGE_KEY = 'luxora-theme';

function applyThemeToDom(mode: ThemeMode) {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = mode === 'dark' || (mode === 'system' && prefersDark);
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme(siteDefaultTheme?: ThemeMode) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return siteDefaultTheme || 'system';
  });

  // If user has no explicit local preference yet and Firestore has a defaultTheme, sync it
  useEffect(() => {
    if (!siteDefaultTheme) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setThemeState(siteDefaultTheme);
        applyThemeToDom(siteDefaultTheme);
      }
    } catch {
      // ignore
    }
  }, [siteDefaultTheme]);

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeToDom('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyThemeToDom(next);
  }, []);

  return { theme, setTheme };
}

import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomCursor } from './components/CustomCursor';
import { LandingPage } from './components/LandingPage';
import { TermsPage } from './components/TermsPage';
import { usePublicStudioData } from './hooks/useStudioData';
import { useTheme } from './hooks/useTheme';

type AppRoute = 'home' | 'admin' | 'terms';

function getCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return 'admin';
  if (path === '/terms' || path.startsWith('/terms/')) return 'terms';
  return 'home';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getCurrentRoute);
  const { projects, products, services, testimonials, siteContent, isSyncedFromDb } =
    usePublicStudioData();
  const { theme, setTheme } = useTheme(siteContent.defaultTheme);

  useEffect(() => {
    const onPopState = () => setRoute(getCurrentRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setRoute('admin');
    window.scrollTo({ top: 0 });
  };

  const navigateToTerms = () => {
    window.history.pushState({}, '', '/terms');
    setRoute('terms');
    window.scrollTo({ top: 0 });
  };

  const navigateToPublic = (sectionId?: string) => {
    window.history.pushState({}, '', '/');
    setRoute('home');
    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0 });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <CustomCursor />
      {route === 'admin' ? (
        <AdminDashboard
          projects={projects}
          products={products}
          services={services}
          testimonials={testimonials}
          siteContent={siteContent}
          isSyncedFromDb={isSyncedFromDb}
          theme={theme}
          onThemeChange={setTheme}
          onExitAdmin={() => navigateToPublic()}
        />
      ) : route === 'terms' ? (
        <TermsPage
          siteContent={siteContent}
          theme={theme}
          onThemeChange={setTheme}
          onNavigateHome={() => navigateToPublic()}
          onNavigateConsultation={() => navigateToPublic('consultation')}
          onOpenAdmin={navigateToAdmin}
        />
      ) : (
        <LandingPage
          projects={projects}
          products={products}
          services={services}
          testimonials={testimonials}
          siteContent={siteContent}
          theme={theme}
          onThemeChange={setTheme}
          onOpenAdmin={navigateToAdmin}
          onOpenTerms={navigateToTerms}
        />
      )}
    </MotionConfig>
  );
}

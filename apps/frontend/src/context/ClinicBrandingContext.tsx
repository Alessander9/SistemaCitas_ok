import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { deriveBrandTheme, DerivedBrandTheme } from '../config/clinicPresets';

export interface ClinicBranding {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  phone?: string;
  email?: string;
  address?: string;
  city: string;
  logoUrl?: string;
  specialtyPreset: string;
  landingStyle: 'modern' | 'editorial' | 'express';
  brandColor: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  loginTagline?: string;
  whatsappNumber?: string;
  aiAssistantName: string;
  enableSelfBooking: boolean;
}

export interface ClinicBrandingContextType {
  tenantSlug: string | null;
  branding: ClinicBranding | null;
  isLoading: boolean;
  isSuspended: boolean;
  error: string | null;
  theme: DerivedBrandTheme;
  reloadBranding: () => Promise<void>;
}

const DEFAULT_THEME: DerivedBrandTheme = deriveBrandTheme('#0284c7');

const ClinicBrandingContext = createContext<ClinicBrandingContextType>({
  tenantSlug: null,
  branding: null,
  isLoading: false,
  isSuspended: false,
  error: null,
  theme: DEFAULT_THEME,
  reloadBranding: async () => {},
});

function detectTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const paramSlug = urlParams.get('clinic') || urlParams.get('sede');
  if (paramSlug && paramSlug.trim()) {
    return paramSlug.trim().toLowerCase();
  }

  // Subdomain detection for custom clinic domain (e.g. clinica-san-mateo.tudominio.com)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'localhost') {
    return parts[0].toLowerCase();
  }

  return null;
}

export const ClinicBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantSlug, setTenantSlug] = useState<string | null>(() => detectTenantSlug());
  const [branding, setBranding] = useState<ClinicBranding | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Listen to popstate / location changes for clinic param
  useEffect(() => {
    const handleLocationChange = () => {
      const slug = detectTenantSlug();
      setTenantSlug(slug);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const loadBranding = useCallback(async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiUrl}/public/clinic-branding?slug=${encodeURIComponent(slug)}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError(`No se encontró la clínica con identificador "${slug}".`);
        } else {
          setError('Error al cargar la identidad de la clínica.');
        }
        setBranding(null);
        return;
      }

      const data: ClinicBranding = await res.json();
      setBranding(data);
      if (typeof window !== 'undefined' && data.id) {
        sessionStorage.setItem('vitalsalud_active_clinic_id', data.id);
      }
    } catch {
      setError('No se pudo conectar con el servidor para consultar el branding.');
      setBranding(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenantSlug) {
      loadBranding(tenantSlug);
    } else {
      setBranding(null);
      setError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('vitalsalud_active_clinic_id');
      }
    }
  }, [tenantSlug, loadBranding]);

  const theme = useMemo(() => {
    const hex = branding?.brandColor || '#0284c7';
    return deriveBrandTheme(hex);
  }, [branding?.brandColor]);

  // Inject CSS custom properties dynamically into :root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-primary-dark', theme.primaryDark);
    root.style.setProperty('--brand-primary-light', theme.primaryLight);
    root.style.setProperty('--brand-soft-bg', theme.softBg);
    root.style.setProperty('--brand-border', theme.softBorder);
    root.style.setProperty('--brand-contrast-text', theme.contrastText);

    if (branding?.name) {
      document.title = `${branding.name} | Portal de Citas`;
    }
  }, [theme, branding?.name]);

  const reloadBranding = useCallback(async () => {
    if (tenantSlug) {
      await loadBranding(tenantSlug);
    }
  }, [tenantSlug, loadBranding]);

  const isSuspended = !!branding && !branding.isActive;

  const value = useMemo(
    () => ({
      tenantSlug,
      branding,
      isLoading,
      isSuspended,
      error,
      theme,
      reloadBranding,
    }),
    [tenantSlug, branding, isLoading, isSuspended, error, theme, reloadBranding],
  );

  return (
    <ClinicBrandingContext.Provider value={value}>
      {children}
    </ClinicBrandingContext.Provider>
  );
};

export const useClinicBranding = () => useContext(ClinicBrandingContext);

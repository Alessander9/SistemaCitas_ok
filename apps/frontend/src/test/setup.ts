import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Intercepta peticiones relativas /api/* no mockeadas en jsdom devolviendo respuestas limpias (cero ruido 503)
const originalFetch = globalThis.fetch;
if (typeof originalFetch === 'function') {
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (url.startsWith('/api/')) {
      const jsonOk = (body: unknown) =>
        Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      if (url.startsWith('/api/specialties') || url.startsWith('/api/services') || url.startsWith('/api/professionals')) {
        return jsonOk([]);
      }
      if (url.startsWith('/api/appointments/availability')) {
        return jsonOk([]);
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Offline in jsdom unit test' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    return originalFetch(input, init);
  }) as typeof fetch;
}

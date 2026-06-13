const DEFAULT_UA =
  'Mozilla/5.0 (compatible; AsfaltoYGasImporter/1.0; +https://www.asfaltoygas.es)';

export async function fetchPage(url: string, retries = 3): Promise<string> {
  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': DEFAULT_UA,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-ES,es;q=0.9',
        },
        redirect: 'follow',
      });

      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status} al obtener ${url}`);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al obtener ${url}`);
      }

      return res.text();
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        const wait = attempt * 2000;
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr ?? new Error(`No se pudo obtener ${url}`);
}

export function resolveUrl(base: string, href: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

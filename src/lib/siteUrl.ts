import { getEnv } from './env.js';

/** URL canónica del sitio (www). El apex sin www aún apunta al WordPress antiguo. */
export function getCanonicalSiteUrl(): string {
  const raw = (
    getEnv('SITE_URL') ||
    getEnv('VITE_SITE_URL') ||
    'https://www.asfaltoygas.es'
  ).replace(/\/$/, '');

  if (raw === 'https://asfaltoygas.es' || raw === 'http://asfaltoygas.es') {
    return 'https://www.asfaltoygas.es';
  }

  return raw;
}

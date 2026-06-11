/** URL canónica del sitio (www). El apex sin www aún apunta al WordPress antiguo. */
export function getCanonicalSiteUrl(): string {
  const raw = (
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    'https://www.asfaltoygas.es'
  ).replace(/\/$/, '');

  if (raw === 'https://asfaltoygas.es' || raw === 'http://asfaltoygas.es') {
    return 'https://www.asfaltoygas.es';
  }

  return raw;
}

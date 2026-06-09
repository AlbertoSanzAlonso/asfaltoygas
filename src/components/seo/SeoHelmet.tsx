import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  GOOGLE_SITE_VERIFICATION,
  SITE_NAME,
  absoluteUrl,
  buildTitle,
} from '@/lib/seo/constants';

export type SeoHelmetProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'product';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function SeoHelmet({
  title,
  description,
  path = '/',
  image,
  noindex = false,
  type = 'website',
  jsonLd,
}: SeoHelmetProps) {
  const pageTitle = title ? buildTitle(title) : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const canonicalPath = path.split('?')[0] || '/';
  const url = absoluteUrl(canonicalPath);
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : absoluteUrl(image)
    : DEFAULT_OG_IMAGE;

  return (
    <Helmet prioritizeSeoTags>
      <html lang="es" />
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {GOOGLE_SITE_VERIFICATION && (
        <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
      )}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

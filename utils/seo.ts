type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type RuntimeSeoConfig = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  keywords?: string;
  ogType?: string;
  robots?: string;
  jsonLd?: JsonLdValue;
};

const RUNTIME_JSONLD_ID = 'kiwimu-runtime-jsonld';

const upsertMetaByName = (name: string, content: string) => {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('name', name);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
};

const removeMetaByName = (name: string) => {
  document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.remove();
};

const upsertMetaByProperty = (property: string, content: string) => {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('property', property);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
};

const removeMetaByProperty = (property: string) => {
  document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.remove();
};

const upsertCanonical = (href: string) => {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', 'canonical');
    document.head.appendChild(node);
  }
  node.setAttribute('href', href);
};

const upsertJsonLd = (jsonLd: JsonLdValue) => {
  let node = document.getElementById(RUNTIME_JSONLD_ID) as HTMLScriptElement | null;
  if (!node) {
    node = document.createElement('script');
    node.id = RUNTIME_JSONLD_ID;
    node.type = 'application/ld+json';
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(jsonLd);
};

const removeJsonLd = () => {
  document.getElementById(RUNTIME_JSONLD_ID)?.remove();
};

export const applyRuntimeSeo = ({
  title,
  description,
  canonical,
  image,
  keywords,
  ogType = 'website',
  robots = 'index,follow',
  jsonLd,
}: RuntimeSeoConfig): void => {
  if (typeof document === 'undefined') return;

  document.title = title;
  upsertCanonical(canonical);
  upsertMetaByName('description', description);
  upsertMetaByName('robots', robots);

  if (keywords) {
    upsertMetaByName('keywords', keywords);
  }

  upsertMetaByProperty('og:type', ogType);
  upsertMetaByProperty('og:title', title);
  upsertMetaByProperty('og:description', description);
  upsertMetaByProperty('og:url', canonical);

  upsertMetaByName('twitter:title', title);
  upsertMetaByName('twitter:description', description);
  upsertMetaByName('twitter:card', image ? 'summary_large_image' : 'summary');

  if (image) {
    upsertMetaByProperty('og:image', image);
    upsertMetaByName('twitter:image', image);
  } else {
    removeMetaByProperty('og:image');
    removeMetaByName('twitter:image');
  }

  if (jsonLd) {
    upsertJsonLd(jsonLd);
  } else {
    removeJsonLd();
  }

  if (!keywords) {
    removeMetaByName('keywords');
  }
};

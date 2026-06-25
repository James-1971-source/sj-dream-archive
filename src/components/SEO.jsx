import { useEffect } from 'react';

export const SITE_URL = 'https://dream.sj-hs.or.kr';
export const SITE_NAME = 'S&J드림아카이브';
export const DEFAULT_TITLE = `${SITE_NAME} | 청소년 창작 작품 아카이브`;
export const DEFAULT_DESCRIPTION = 'S&J희망나눔이 운영하는 청소년 창작 플랫폼입니다. 청소년들이 만든 음악, 웹툰, 영상, 이미지, 전자책 작품을 전시하고 공유합니다.';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

const toAbsoluteUrl = (url = '/') => {
  if (!url) return SITE_URL;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const upsertMeta = (attribute, key, content) => {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const upsertCanonical = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

const buildPageTitle = (title) => {
  if (!title) return DEFAULT_TITLE;
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
};

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  url = '/',
  image = DEFAULT_IMAGE,
  type = 'website'
}) => {
  useEffect(() => {
    const pageTitle = buildPageTitle(title);
    const canonicalUrl = toAbsoluteUrl(url);
    const imageUrl = toAbsoluteUrl(image);

    document.title = pageTitle;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', 'index, follow');
    upsertMeta('name', 'keywords', 'S&J드림아카이브, S&J희망나눔, 청소년 창작, 청소년 작품, 창작 플랫폼, 웹툰, 음악, 영상, 전자책');

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', 'ko_KR');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertCanonical(canonicalUrl);
  }, [title, description, url, image, type]);

  return null;
};

export default SEO;

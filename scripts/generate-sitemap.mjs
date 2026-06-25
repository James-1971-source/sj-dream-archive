import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';

const SITE_URL = 'https://dream.sj-hs.or.kr';
const OUTPUT_PATH = 'public/sitemap.xml';

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/awards', changefreq: 'weekly', priority: '0.8' },
  { path: '/upload', changefreq: 'monthly', priority: '0.6' }
];

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const toUrl = (path) => `${SITE_URL}${path}`;

const toDate = (value) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

async function fetchPublicWorks() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[sitemap] Supabase environment variables are missing. Static sitemap only.');
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('works')
      .select('id, created_at, updated_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.warn('[sitemap] Could not fetch works:', error.message);
      return [];
    }

    return (data || []).map((work) => ({
      path: `/works/${work.id}`,
      lastmod: toDate(work.updated_at || work.created_at),
      changefreq: 'weekly',
      priority: '0.7'
    }));
  } catch (error) {
    console.warn('[sitemap] Failed to generate dynamic work URLs:', error.message);
    return [];
  }
}

const renderUrl = ({ path, lastmod = new Date().toISOString(), changefreq, priority }) => `  <url>\n    <loc>${escapeXml(toUrl(path))}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n    <changefreq>${escapeXml(changefreq)}</changefreq>\n    <priority>${escapeXml(priority)}</priority>\n  </url>`;

async function generateSitemap() {
  const dynamicWorkRoutes = await fetchPublicWorks();
  const routes = [...staticRoutes, ...dynamicWorkRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(renderUrl).join('\n')}\n</urlset>\n`;

  await mkdir('public', { recursive: true });
  await writeFile(OUTPUT_PATH, sitemap, 'utf8');

  console.log(`[sitemap] Generated ${OUTPUT_PATH} with ${routes.length} URLs.`);
}

await generateSitemap();

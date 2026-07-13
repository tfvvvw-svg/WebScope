import axios from 'axios';
import * as cheerio from 'cheerio';
import { resolveDNS } from './dnsService.js';
import { getWhoisInfo } from './whoisService.js';
import { getSslInfo } from './sslService.js';
import { getGeolocation } from './geoService.js';
import { extractDomain, normalizeUrl, timeoutPromise } from '../utils/helpers.js';
import * as cache from '../cache/index.js';
import * as log from '../logger/index.js';

// ── Comprehensive technology detection rules ──────────────────────

const TECH_RULES = [
  // JavaScript Frameworks
  { name: 'React', cat: 'frontend', patterns: ['react', '__NEXT_DATA__', '_next/', 'react-root', '__react', 'react-dom'] },
  { name: 'Vue', cat: 'frontend', patterns: ['vue', '__VUE__', 'v-app', 'vuejs', 'vue-router'] },
  { name: 'Angular', cat: 'frontend', patterns: ['ng-version', 'angular', 'ng-app', 'ng-'] },
  { name: 'Svelte', cat: 'frontend', patterns: ['svelte', '__svelte'] },
  { name: 'Solid', cat: 'frontend', patterns: ['solid-js', 'solidjs'] },
  { name: 'Preact', cat: 'frontend', patterns: ['preact'] },
  { name: 'Lit', cat: 'frontend', patterns: ['lit-element', 'lit-html', 'lit.'] },
  { name: 'Alpine.js', cat: 'frontend', patterns: ['alpinejs', 'x-data', 'x-init'] },
  { name: 'HTMX', cat: 'frontend', patterns: ['htmx', 'hx-get', 'hx-post'] },
  { name: 'Stimulus', cat: 'frontend', patterns: ['stimulus'] },
  { name: 'Ember', cat: 'frontend', patterns: ['ember'] },
  { name: 'Backbone', cat: 'frontend', patterns: ['backbone'] },

  // Meta-frameworks (SSR/SSG)
  { name: 'Next.js', cat: 'ssr', patterns: ['__NEXT_DATA__', '_next/', 'next/'] },
  { name: 'Nuxt', cat: 'ssr', patterns: ['__NUXT__', '_nuxt/', 'nuxt'] },
  { name: 'Astro', cat: 'ssr', patterns: ['astro', 'data-astro-'] },
  { name: 'Gatsby', cat: 'ssr', patterns: ['gatsby', '_gatsby'] },
  { name: 'Remix', cat: 'ssr', patterns: ['remix', '__remix'] },
  { name: 'SvelteKit', cat: 'ssr', patterns: ['sveltekit'] },
  { name: 'Qwik', cat: 'ssr', patterns: ['qwik'] },
  { name: 'VitePress', cat: 'ssr', patterns: ['vitepress'] },
  { name: 'Docusaurus', cat: 'ssr', patterns: ['docusaurus'] },
  { name: 'Eleventy', cat: 'ssr', patterns: ['eleventy', '11ty'] },
  { name: 'Hugo', cat: 'ssr', patterns: ['hugo'] },
  { name: 'Jekyll', cat: 'ssr', patterns: ['jekyll'] },

  // CSS Frameworks
  { name: 'Tailwind CSS', cat: 'cssFramework', patterns: ['tailwind'] },
  { name: 'Bootstrap', cat: 'cssFramework', patterns: ['bootstrap', 'bootstrap.min'] },
  { name: 'Bulma', cat: 'cssFramework', patterns: ['bulma'] },
  { name: 'Foundation', cat: 'cssFramework', patterns: ['foundation'] },
  { name: 'Material UI', cat: 'uiLibrary', patterns: ['@mui', 'material-ui', 'Mui'] },
  { name: 'Ant Design', cat: 'uiLibrary', patterns: ['antd', 'ant-design', 'anticon'] },
  { name: 'Chakra UI', cat: 'uiLibrary', patterns: ['chakra', '@chakra'] },
  { name: 'Mantine', cat: 'uiLibrary', patterns: ['@mantine', 'mantine'] },
  { name: 'Shadcn/ui', cat: 'uiLibrary', patterns: ['shadcn', 'radix'] },
  { name: 'Radix UI', cat: 'uiLibrary', patterns: ['@radix'] },
  { name: 'PrimeReact', cat: 'uiLibrary', patterns: ['primereact', 'primeng'] },
  { name: 'Semantic UI', cat: 'uiLibrary', patterns: ['semantic-ui', 'semantic'] },

  // CSS technologies
  { name: 'SASS', cat: 'cssTech', patterns: ['.scss', 'sass'] },
  { name: 'SCSS', cat: 'cssTech', patterns: ['.scss'] },
  { name: 'LESS', cat: 'cssTech', patterns: ['.less', 'less'] },
  { name: 'CSS Modules', cat: 'cssTech', patterns: ['.module.css', '.module'] },
  { name: 'Styled Components', cat: 'cssTech', patterns: ['styled-components', 'styled.'] },
  { name: 'Emotion', cat: 'cssTech', patterns: ['emotion', '@emotion'] },
  { name: 'PostCSS', cat: 'cssTech', patterns: ['postcss'] },

  // Bundlers
  { name: 'Vite', cat: 'bundler', patterns: ['@vite', 'vite'] },
  { name: 'Webpack', cat: 'bundler', patterns: ['webpack', 'webpackJsonp', '__webpack'] },
  { name: 'Parcel', cat: 'bundler', patterns: ['parcel'] },
  { name: 'Rollup', cat: 'bundler', patterns: ['rollup'] },
  { name: 'Turbopack', cat: 'bundler', patterns: ['turbopack'] },
  { name: 'ESBuild', cat: 'bundler', patterns: ['esbuild'] },
  { name: 'SWC', cat: 'bundler', patterns: ['swc'] },

  // Backend
  { name: 'Node.js', cat: 'backend', patterns: ['node', 'express', 'node_modules'] },
  { name: 'PHP', cat: 'backend', patterns: ['php', 'laravel', 'symfony'] },
  { name: 'Laravel', cat: 'backend', patterns: ['laravel'] },
  { name: 'Django', cat: 'backend', patterns: ['django', 'csrftoken'] },
  { name: 'Ruby on Rails', cat: 'backend', patterns: ['rails', 'ruby'] },
  { name: 'Spring Boot', cat: 'backend', patterns: ['spring'] },
  { name: 'ASP.NET', cat: 'backend', patterns: ['asp.net', 'aspx', '__viewstate'] },
  { name: 'Go', cat: 'backend', patterns: ['gorilla', 'gin'] },
  { name: 'Python', cat: 'backend', patterns: ['flask', 'django', 'python'] },
  { name: 'Deno', cat: 'backend', patterns: ['deno'] },
  { name: 'Bun', cat: 'backend', patterns: ['bun'] },
  { name: 'FastAPI', cat: 'backend', patterns: ['fastapi'] },

  // CMS
  { name: 'WordPress', cat: 'cms', patterns: ['wp-content', 'wp-includes', 'wordpress', 'wp-json'] },
  { name: 'Shopify', cat: 'cms', patterns: ['shopify', 'cdn.shopify'] },
  { name: 'Wix', cat: 'cms', patterns: ['wix.com', 'wixstatic'] },
  { name: 'Squarespace', cat: 'cms', patterns: ['squarespace'] },
  { name: 'Webflow', cat: 'cms', patterns: ['webflow'] },
  { name: 'Strapi', cat: 'cms', patterns: ['strapi'] },
  { name: 'Sanity', cat: 'cms', patterns: ['sanity'] },
  { name: 'Ghost', cat: 'cms', patterns: ['ghost'] },
  { name: 'Drupal', cat: 'cms', patterns: ['drupal'] },
  { name: 'Joomla', cat: 'cms', patterns: ['joomla'] },
  { name: 'Contentful', cat: 'cms', patterns: ['contentful'] },

  // Analytics
  { name: 'Google Analytics', cat: 'analytics', patterns: ['google-analytics.com', 'gtag', 'googletagmanager', 'ga.js', 'analytics.js'] },
  { name: 'Google Tag Manager', cat: 'analytics', patterns: ['googletagmanager.com'] },
  { name: 'Hotjar', cat: 'analytics', patterns: ['hotjar'] },
  { name: 'Yandex Metrika', cat: 'analytics', patterns: ['mc.yandex.ru', 'yandex_metrika', 'yandex.com'] },
  { name: 'Mixpanel', cat: 'analytics', patterns: ['mixpanel'] },
  { name: 'PostHog', cat: 'analytics', patterns: ['posthog'] },
  { name: 'Segment', cat: 'analytics', patterns: ['segment'] },
  { name: 'Amplitude', cat: 'analytics', patterns: ['amplitude'] },
  { name: 'Facebook Pixel', cat: 'analytics', patterns: ['facebook.com/tr', 'fbq'] },
  { name: 'HubSpot', cat: 'analytics', patterns: ['hubspot'] },
  { name: 'Intercom', cat: 'analytics', patterns: ['intercom'] },
  { name: 'Crisp', cat: 'analytics', patterns: ['crisp.chat'] },
  { name: 'Zendesk', cat: 'analytics', patterns: ['zendesk'] },
  { name: 'Clarity', cat: 'analytics', patterns: ['clarity.ms'] },
  { name: 'Vercel Analytics', cat: 'analytics', patterns: ['vercel-analytics'] },
  { name: 'Plausible', cat: 'analytics', patterns: ['plausible'] },
  { name: 'Fathom', cat: 'analytics', patterns: ['fathom'] },

  // CDN
  { name: 'Cloudflare', cat: 'cdn', patterns: ['cloudflare'] },
  { name: 'Fastly', cat: 'cdn', patterns: ['fastly'] },
  { name: 'Akamai', cat: 'cdn', patterns: ['akamai', 'akamaized'] },
  { name: 'Vercel', cat: 'cdn', patterns: ['vercel', '_vercel'] },
  { name: 'Netlify', cat: 'cdn', patterns: ['netlify'] },
  { name: 'AWS CloudFront', cat: 'cdn', patterns: ['cloudfront.net'] },
  { name: 'jsDelivr', cat: 'cdn', patterns: ['cdn.jsdelivr'] },
  { name: 'UNPKG', cat: 'cdn', patterns: ['unpkg.com'] },
  { name: 'cdnjs', cat: 'cdn', patterns: ['cdnjs.cloudflare'] },

  // JS Libraries
  { name: 'jQuery', cat: 'jsLibraries', patterns: ['jquery'] },
  { name: 'Lodash', cat: 'jsLibraries', patterns: ['lodash'] },
  { name: 'Axios', cat: 'jsLibraries', patterns: ['axios'] },
  { name: 'Framer Motion', cat: 'jsLibraries', patterns: ['framer-motion', 'framer'] },
  { name: 'GSAP', cat: 'jsLibraries', patterns: ['gsap', 'tweenmax', 'timelinemax'] },
  { name: 'Three.js', cat: 'jsLibraries', patterns: ['three.js', 'three.min'] },
  { name: 'D3.js', cat: 'jsLibraries', patterns: ['d3.js', 'd3.min'] },
  { name: 'Chart.js', cat: 'jsLibraries', patterns: ['chart.js', 'chart.min'] },
  { name: 'Moment.js', cat: 'jsLibraries', patterns: ['moment'] },
  { name: 'Date-fns', cat: 'jsLibraries', patterns: ['date-fns'] },
  { name: 'RxJS', cat: 'jsLibraries', patterns: ['rxjs'] },
  { name: 'Zustand', cat: 'jsLibraries', patterns: ['zustand'] },
  { name: 'Redux', cat: 'jsLibraries', patterns: ['redux'] },
  { name: 'React Query', cat: 'jsLibraries', patterns: ['react-query', '@tanstack/query'] },
  { name: 'SWR', cat: 'jsLibraries', patterns: ['swr'] },
  { name: 'Zod', cat: 'jsLibraries', patterns: ['zod'] },
  { name: 'Prisma', cat: 'jsLibraries', patterns: ['prisma'] },

  // Icons
  { name: 'Font Awesome', cat: 'icons', patterns: ['fontawesome', 'font-awesome', 'fa-'] },
  { name: 'Lucide', cat: 'icons', patterns: ['lucide'] },
  { name: 'Heroicons', cat: 'icons', patterns: ['heroicons'] },
  { name: 'Material Icons', cat: 'icons', patterns: ['material-icons', 'materialicons'] },
  { name: 'Bootstrap Icons', cat: 'icons', patterns: ['bootstrap-icons', 'bi-'] },
  { name: 'Remix Icons', cat: 'icons', patterns: ['remixicon', 'ri-'] },
  { name: 'Tabler Icons', cat: 'icons', patterns: ['tabler-icons', 'ti-'] },
  { name: 'Phosphor Icons', cat: 'icons', patterns: ['phosphor'] },
  { name: 'Ionicons', cat: 'icons', patterns: ['ionicon'] },
  { name: 'Feather Icons', cat: 'icons', patterns: ['feather-icons'] },

  // Animation
  { name: 'AOS', cat: 'animations', patterns: ['aos', 'aos.js'] },
  { name: 'Anime.js', cat: 'animations', patterns: ['animejs', 'anime.min'] },
  { name: 'Lottie', cat: 'animations', patterns: ['lottie'] },
  { name: 'ScrollReveal', cat: 'animations', patterns: ['scrollreveal'] },
  { name: 'Motion', cat: 'animations', patterns: ['motion'] },

  // Payment
  { name: 'Stripe', cat: 'payments', patterns: ['stripe.com/v3', 'stripe.js', 'stripe-'] },
  { name: 'PayPal', cat: 'payments', patterns: ['paypal'] },
  { name: 'Square', cat: 'payments', patterns: ['square'] },

  // Auth
  { name: 'Auth0', cat: 'auth', patterns: ['auth0'] },
  { name: 'Firebase Auth', cat: 'auth', patterns: ['firebase'] },
  { name: 'Clerk', cat: 'auth', patterns: ['clerk'] },
  { name: 'NextAuth', cat: 'auth', patterns: ['next-auth'] },
  { name: 'Supabase Auth', cat: 'auth', patterns: ['supabase'] },

  // Databases
  { name: 'PostgreSQL', cat: 'databases', patterns: ['postgres', 'postgresql'] },
  { name: 'MongoDB', cat: 'databases', patterns: ['mongodb', 'mongoose'] },
  { name: 'MySQL', cat: 'databases', patterns: ['mysql'] },
  { name: 'Redis', cat: 'databases', patterns: ['redis'] },
  { name: 'Supabase', cat: 'cloud', patterns: ['supabase'] },
  { name: 'Firebase', cat: 'cloud', patterns: ['firebase', 'firestore'] },

  // Language detection
  { name: 'TypeScript', cat: 'language', patterns: [/\.tsx?["']/, 'typescript', 'tsconfig'] },
  { name: 'JSX', cat: 'language', patterns: ['jsx', 'react/jsx'] },
  { name: 'TSX', cat: 'language', patterns: ['tsx'] },
  { name: 'JavaScript', cat: 'language', patterns: ['javascript', '.js'] },

  // Monitoring
  { name: 'Sentry', cat: 'monitoring', patterns: ['sentry'] },
  { name: 'Datadog', cat: 'monitoring', patterns: ['datadog'] },
  { name: 'New Relic', cat: 'monitoring', patterns: ['newrelic'] },

  // Email / Marketing
  { name: 'Mailchimp', cat: 'email', patterns: ['mailchimp'] },
  { name: 'SendGrid', cat: 'email', patterns: ['sendgrid'] },
  { name: 'Postmark', cat: 'email', patterns: ['postmark'] },
  { name: 'Resend', cat: 'email', patterns: ['resend'] },

  // Maps
  { name: 'Google Maps', cat: 'maps', patterns: ['maps.google', 'maps.googleapis'] },
  { name: 'Mapbox', cat: 'maps', patterns: ['mapbox'] },

  // Video
  { name: 'YouTube', cat: 'video', patterns: ['youtube.com/embed', 'youtube-nocookie'] },
  { name: 'Vimeo', cat: 'video', patterns: ['vimeo.com'] },
  { name: 'Mux', cat: 'video', patterns: ['mux.com'] },

  // Storage
  { name: 'AWS S3', cat: 'storage', patterns: ['s3.amazonaws', '.s3.'] },
  { name: 'Cloudinary', cat: 'storage', patterns: ['cloudinary'] },
  { name: 'ImageKit', cat: 'storage', patterns: ['imagekit'] },

  // Deployment / CI
  { name: 'GitHub Pages', cat: 'deployment', patterns: ['github.io', 'github.com'] },
  { name: 'Railway', cat: 'deployment', patterns: ['railway'] },
  { name: 'Render', cat: 'deployment', patterns: ['render.com'] },
  { name: 'Heroku', cat: 'deployment', patterns: ['heroku'] },
  { name: 'Fly.io', cat: 'deployment', patterns: ['fly.io'] },
  { name: 'Kubernetes', cat: 'deployment', patterns: ['kubernetes'] },
  { name: 'Docker', cat: 'deployment', patterns: ['docker'] },

  // Package Managers
  { name: 'npm', cat: 'packageManager', patterns: ['package.json', 'node_modules'] },
  { name: 'Yarn', cat: 'packageManager', patterns: ['yarn'] },
  { name: 'pnpm', cat: 'packageManager', patterns: ['pnpm'] },
  { name: 'Bun', cat: 'packageManager', patterns: ['bun.lock'] },
];

function detectTechnologies(html, $) {
  const found = {};
  const lower = html.toLowerCase();

  for (const rule of TECH_RULES) {
    if (!found[rule.cat]) found[rule.cat] = [];
    for (const pattern of rule.patterns) {
      if (typeof pattern === 'string') {
        if (lower.includes(pattern.toLowerCase())) {
          if (!found[rule.cat].includes(rule.name)) found[rule.cat].push(rule.name);
          break;
        }
      } else {
        if (pattern.test(html)) {
          if (!found[rule.cat].includes(rule.name)) found[rule.cat].push(rule.name);
          break;
        }
      }
    }
  }

  // Detect Tailwind CSS by counting class patterns
  let tailwindHits = 0;
  let totalClasses = 0;
  $('[class]').each((_, el) => {
    const cls = $(el).attr('class') || '';
    totalClasses++;
    const twPrefixes = ['flex', 'grid', 'bg-', 'text-', 'p-', 'm-', 'gap-', 'rounded', 'shadow', 'border', 'hover:', 'focus:', 'sm:', 'md:', 'lg:'];
    for (const p of twPrefixes) {
      if (cls.includes(p)) { tailwindHits++; break; }
    }
  });
  if (totalClasses > 0 && tailwindHits / totalClasses >= 0.3) {
    if (!found['cssFramework']) found['cssFramework'] = [];
    if (!found['cssFramework'].includes('Tailwind CSS')) found['cssFramework'].push('Tailwind CSS');
  }

  return found;
}

function detectFonts($, html) {
  const fonts = { google: [], local: [], system: [] };
  
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const families = href.matchAll(/family=([^&:]+)/g);
    for (const m of families) {
      fonts.google.push(decodeURIComponent(m[1]).replace(/\+/g, ' '));
    }
  });

  const fontFaceRegex = /font-family:\s*['"]([^'";,}]+)['"]?/gi;
  let match;
  while ((match = fontFaceRegex.exec(html)) !== null) {
    const name = match[1].trim();
    if (name && !['inherit', 'initial', 'sans-serif', 'serif', 'monospace', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'].includes(name.toLowerCase())) {
      if (!fonts.google.includes(name)) fonts.local.push(name);
    }
  }

  // Detect system font stacks
  const systemFonts = ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif', 'serif', 'monospace'];
  const bodyFont = $('body').css('font-family') || '';
  for (const sf of systemFonts) {
    if (bodyFont.toLowerCase().includes(sf.toLowerCase()) && !fonts.system.includes(sf)) {
      fonts.system.push(sf);
    }
  }

  if (/use\.typekit\.net/i.test(html)) {
    if (!fonts.google.includes('Adobe Fonts')) fonts.google.push('Adobe Fonts');
  }

  return fonts;
}

function detectImages($) {
  const images = { webp: 0, png: 0, jpg: 0, avif: 0, svg: 0, gif: 0, ico: 0 };
  
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    const srcset = $(el).attr('srcset') || '';
    const all = src + ' ' + srcset;
    if (/\.webp/i.test(all)) images.webp++;
    else if (/\.png/i.test(all)) images.png++;
    else if (/\.jpe?g/i.test(all)) images.jpg++;
    else if (/\.avif/i.test(all)) images.avif++;
    else if (/\.svg/i.test(all)) images.svg++;
    else if (/\.gif/i.test(all)) images.gif++;
    else if (/\.ico/i.test(all)) images.ico++;
  });

  return images;
}

function detectFavicon($, url) {
  const result = { href: null, size: null, format: null };
  
  const favEl = $('link[rel="icon"]').first() || $('link[rel="shortcut icon"]').first() || $('link[rel="apple-touch-icon"]').first();
  if (favEl.length) {
    let href = favEl.attr('href') || '';
    const sizes = favEl.attr('sizes') || '';
    if (href && !href.startsWith('http')) {
      try { href = new URL(href, url).href; } catch {}
    }
    result.href = href || null;
    result.size = sizes || null;
    if (href) {
      if (/\.png/i.test(href)) result.format = 'PNG';
      else if (/\.svg/i.test(href)) result.format = 'SVG';
      else if (/\.ico/i.test(href)) result.format = 'ICO';
      else if (/\.webp/i.test(href)) result.format = 'WebP';
    }
  }
  return result;
}

function detectLogo($) {
  // Look for common logo patterns
  const logoSelectors = ['[class*="logo"] img', '[id*="logo"] img', '[class*="brand"] img', 'header img', 'nav img'];
  for (const sel of logoSelectors) {
    const el = $(sel).first();
    if (el.length) {
      let src = el.attr('src') || '';
      if (src && !src.startsWith('http')) {
        try { src = new URL(src, 'https://example.com').href; } catch {}
      }
      return { found: true, src, alt: el.attr('alt') || '' };
    }
  }
  // Check og:image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) return { found: true, src: ogImage, alt: 'Open Graph Image' };
  return { found: false, src: null, alt: '' };
}

function detectDarkTheme($, html) {
  const lower = html.toLowerCase();
  if (lower.includes('prefers-color-scheme') || lower.includes('dark:')) return 'auto';
  if (lower.includes('dark-mode') || lower.includes('darkmode') || lower.includes('data-theme="dark"')) return 'yes';
  if (lower.includes('light-mode') || lower.includes('lightmode') || lower.includes('data-theme="light"')) return 'light';
  return 'unknown';
}

function detectResponsive($) {
  if ($('meta[name="viewport"]').length) return 'yes';
  // Check for responsive CSS patterns
  const styleText = $('style').text() || '';
  if (styleText.includes('@media') || styleText.includes('@viewport')) return 'yes';
  // Check link for responsive CSS
  let responsive = false;
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('responsive') || href.includes('mobile') || href.includes('adaptive')) responsive = true;
  });
  return responsive ? 'yes' : 'unknown';
}

function detectWebServer(headers) {
  const server = (headers['server'] || '').toLowerCase();
  if (!server) return 'Не удалось определить';
  if (server.includes('nginx')) return 'Nginx';
  if (server.includes('apache')) return 'Apache';
  if (server.includes('litespeed')) return 'LiteSpeed';
  if (server.includes('iis')) return 'IIS';
  if (server.includes('caddy')) return 'Caddy';
  if (server.includes('openresty')) return 'OpenResty';
  if (server.includes('cloudflare')) return 'Cloudflare';
  if (server.includes('vercel')) return 'Vercel';
  if (server.includes('netlify')) return 'Netlify';
  if (server.includes('github')) return 'GitHub Pages';
  return server.split('/')[0] || server;
}

function detectOS(headers) {
  const server = (headers['server'] || '').toLowerCase();
  const poweredBy = (headers['x-powered-by'] || '').toLowerCase();
  const combined = server + ' ' + poweredBy;
  if (combined.includes('ubuntu')) return 'Ubuntu Linux';
  if (combined.includes('debian')) return 'Debian Linux';
  if (combined.includes('centos')) return 'CentOS Linux';
  if (combined.includes('red hat') || combined.includes('rhel')) return 'Red Hat Linux';
  if (combined.includes('alpine')) return 'Alpine Linux';
  if (combined.includes('amazon')) return 'Amazon Linux';
  if (combined.includes('windows') || combined.includes('win32') || combined.includes('iis')) return 'Windows Server';
  if (combined.includes('darwin') || combined.includes('mac')) return 'macOS';
  if (combined.includes('freebsd')) return 'FreeBSD';
  if (combined.includes('linux')) return 'Linux';
  return 'Не удалось определить';
}

function generateAiSummary(result) {
  const parts = [];
  const allTechs = [];
  for (const cat of Object.values(result.technologies)) {
    if (Array.isArray(cat)) allTechs.push(...cat);
  }

  if (allTechs.includes('React') || allTechs.includes('Vue') || allTechs.includes('Angular') || allTechs.includes('Svelte')) {
    parts.push(`Сайт использует современный JavaScript-фреймворк (${allTechs.filter(t => ['React','Vue','Angular','Svelte','Next.js','Nuxt','Astro','Gatsby'].includes(t)).join(', ') || 'современный'}).`);
  } else {
    parts.push('Сайт использует статические HTML-страницы или серверный рендеринг.');
  }

  if (result.favicon && result.favicon.href) parts.push('Имеет favicon.');
  if (result.ssl && result.ssl.valid) parts.push('Поддерживает HTTPS с корректным SSL-сертификатом.');
  if (result.httpVersion) parts.push(`Использует протокол ${result.httpVersion}.`);
  if (result.dns && result.dns.NS && result.dns.NS.length > 0) parts.push('DNS-серверы настроены корректно.');
  if (result.cdn && result.cdn.length > 0) parts.push(`Использует CDN (${result.cdn.join(', ')}).`);
  if (result.techCategories && result.techCategories.frontend && result.techCategories.frontend.length > 0) {
    parts.push(`Фронтенд: ${result.techCategories.frontend.join(', ')}.`);
  }
  if (result.techCategories && result.techCategories.cssFramework && result.techCategories.cssFramework.length > 0) {
    parts.push(`CSS-фреймворк: ${result.techCategories.cssFramework.join(', ')}.`);
  }
  if (result.analytics && result.analytics.length > 0) {
    parts.push(`Использует аналитику (${result.analytics.join(', ')}).`);
  }
  if (result.webServer && result.webServer !== 'Не удалось определить') {
    parts.push(`Веб-сервер: ${result.webServer}.`);
  }
  if (result.geo && result.geo.country) {
    parts.push(`Сервер расположен в регионе ${result.geo.country}${result.geo.city ? ', ' + result.geo.city : ''}.`);
  }

  return parts.join('\n') || 'Не удалось сформировать автоматический анализ.';
}

function extractColors($) {
  const freq = {};
  const colorPattern = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/g;
  let total = 0;

  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    let m;
    while ((m = colorPattern.exec(style)) !== null) {
      const hex = normalizeColor(m[0]);
      if (hex) { freq[hex] = (freq[hex] || 0) + 1; total++; }
    }
  });

  $('style').each((_, el) => {
    const text = $(el).text() || '';
    let m;
    while ((m = colorPattern.exec(text)) !== null) {
      const hex = normalizeColor(m[0]);
      if (hex) { freq[hex] = (freq[hex] || 0) + 1; total++; }
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex, count]) => ({
      hex,
      rgb: hexToRgb(hex),
      usage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r},${g},${b})`;
}

function normalizeColor(raw) {
  const trimmed = raw.trim().toLowerCase();
  const hex3 = /^#([0-9a-f]{3})$/.exec(trimmed);
  if (hex3) {
    const [r, g, b] = hex3[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-f]{6}$/.test(trimmed)) return trimmed;
  const rgbMatch = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(trimmed);
  if (rgbMatch) {
    const toHex = (n) => parseInt(n, 10).toString(16).padStart(2, '0');
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }
  return null;
}

export async function scanWebsite(url) {
  const domain = extractDomain(url);
  const cacheKey = `scan_${domain}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    log.info(`Returning cached result for ${domain}`);
    return cached;
  }

  log.info(`Starting scan for ${domain}`);

  const result = {
    domain,
    url: normalizeUrl(url),
    scanDate: new Date().toISOString(),
    title: null,
    description: null,
    language: null,
    charset: null,
    technologies: [],
    techCategories: {},
    fonts: { google: [], local: [], system: [] },
    images: { webp: 0, png: 0, jpg: 0, avif: 0, svg: 0, gif: 0, ico: 0 },
    favicon: { href: null, size: null, format: null },
    logo: { found: false, src: null, alt: '' },
    darkTheme: 'unknown',
    responsive: 'unknown',
    colors: [],
    ogTags: {},
    twitterTags: {},
    h1Tags: [],
    metaRobots: null,
    canonicalUrl: null,
    scriptsCount: 0,
    stylesheetsCount: 0,
    imagesCount: 0,
    internalLinks: 0,
    externalLinks: 0,
    hasViewport: false,
    hasPwaManifest: false,
    pageSizeBytes: 0,
    serverHeaders: {},
    ssl: { issuer: null, expires: null, valid: false },
    dns: { A: [], AAAA: [], MX: [], TXT: [], NS: [], DNSSEC: false },
    whois: { creationDate: null, age: null, registrar: null },
    geo: { ip: null, country: null, city: null, asn: null, hosting: null },
    httpVersion: null,
    webServer: null,
    os: null,
    cdn: [],
    analytics: [],
    aiSummary: null,
    error: null,
  };

  try {
    const response = await timeoutPromise(
      axios.get(result.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        maxRedirects: 5,
        responseType: 'text',
        transformResponse: [(data) => data],
      }),
      15000
    );

    const html = typeof response.data === 'string' ? response.data : '';
    result.pageSizeBytes = new Blob([html]).size;

    if (response.headers) {
      result.serverHeaders = Object.fromEntries(
        Object.entries(response.headers).map(([k, v]) => [k, String(v)])
      );
    }

    if (response.request && response.request.res) {
      result.httpVersion = response.request.res.httpVersion || 'HTTP/1.1';
    }

    result.webServer = detectWebServer(result.serverHeaders);
    result.os = detectOS(result.serverHeaders);

    const $ = cheerio.load(html);

    result.title = $('title').first().text().trim() || null;
    result.description = $('meta[name="description"]').attr('content') || null;
    result.language = $('html').attr('lang') || null;
    result.charset = $('meta[charset]').attr('charset') || null;
    result.canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
    result.metaRobots = $('meta[name="robots"]').attr('content') || null;

    $('meta[property^="og:"]').each((_, el) => {
      const prop = $(el).attr('property');
      const content = $(el).attr('content');
      if (prop && content) result.ogTags[prop] = content;
    });
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && content) result.twitterTags[name] = content;
    });

    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text) result.h1Tags.push(text);
    });

    result.scriptsCount = $('script[src]').length;
    result.stylesheetsCount = $('link[rel="stylesheet"]').length;
    result.imagesCount = $('img').length;
    result.hasViewport = !!$('meta[name="viewport"]').length;
    result.hasPwaManifest = !!$('link[rel="manifest"]').length;

    const hostname = domain;
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('#') || href.startsWith('/') || href.startsWith('?') || href.startsWith('.')) {
        result.internalLinks++;
      } else {
        try {
          const linkHost = new URL(href).hostname.replace(/^www\./, '');
          if (linkHost === hostname) result.internalLinks++;
          else result.externalLinks++;
        } catch { result.internalLinks++; }
      }
    });

    // Tech detection
    const techCategories = detectTechnologies(html, $);
    result.techCategories = techCategories;
    
    // Flatten all techs
    const allTechs = new Set();
    for (const [, techs] of Object.entries(techCategories)) {
      if (Array.isArray(techs)) techs.forEach(t => allTechs.add(t));
    }
    result.technologies = [...allTechs];

    // Categorize for top-level access
    result.cdn = techCategories['cdn'] || [];
    result.analytics = techCategories['analytics'] || [];
    result.frontend = techCategories['frontend'] || [];
    result.backend = techCategories['backend'] || [];
    result.cssFramework = techCategories['cssFramework'] || [];
    result.cssTech = techCategories['cssTech'] || [];
    result.bundler = techCategories['bundler'] || [];
    result.uiLibrary = techCategories['uiLibrary'] || [];
    result.ssr = techCategories['ssr'] || [];
    result.cms = techCategories['cms'] || [];
    result.icons = techCategories['icons'] || [];
    result.animations = techCategories['animations'] || [];
    result.databases = techCategories['databases'] || [];
    result.devLanguage = techCategories['language'] || [];
    result.payments = techCategories['payments'] || [];
    result.cloud = techCategories['cloud'] || [];
    result.auth = techCategories['auth'] || [];
    result.monitoring = techCategories['monitoring'] || [];
    result.email = techCategories['email'] || [];
    result.maps = techCategories['maps'] || [];
    result.video = techCategories['video'] || [];
    result.storage = techCategories['storage'] || [];
    result.deployment = techCategories['deployment'] || [];
    result.packageManager = techCategories['packageManager'] || [];

    // Fonts
    result.fonts = detectFonts($, html);

    // Colors with percentages
    result.colors = extractColors($);

    // Images
    result.images = detectImages($);

    // Favicon
    result.favicon = detectFavicon($, result.url);

    // Logo
    result.logo = detectLogo($, html);

    // Dark theme
    result.darkTheme = detectDarkTheme($, html);

    // Responsive
    result.responsive = detectResponsive($);

  } catch (err) {
    log.warn(`Failed to fetch ${result.url}: ${err.message}`);
    result.error = err.message;
  }

  // Run parallel lookups
  try { result.dns = await resolveDNS(domain); } catch (err) { log.warn(`DNS lookup failed for ${domain}: ${err.message}`); }
  try { result.ssl = await getSslInfo(domain); } catch (err) { log.warn(`SSL lookup failed for ${domain}: ${err.message}`); }
  try { result.whois = await getWhoisInfo(domain); } catch (err) { log.warn(`WHOIS lookup failed for ${domain}: ${err.message}`); }

  if (result.dns.A && result.dns.A.length > 0) {
    result.geo.ip = result.dns.A[0];
    try { result.geo = await getGeolocation(result.dns.A[0]); } catch (err) { log.warn(`Geolocation lookup failed: ${err.message}`); }
  }

  // Generate AI summary
  result.aiSummary = generateAiSummary(result);

  cache.set(cacheKey, result);
  log.info(`Scan completed for ${domain}`);

  return result;
}
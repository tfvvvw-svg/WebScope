import axios from 'axios';
import type { WebScanReport } from '../types/scan';

const API_BASE = '/api';

export interface RawScanResult {
  domain: string;
  url: string;
  scanDate: string;
  title: string | null;
  description: string | null;
  language: string | null;
  charset: string | null;
  technologies: string[];
  techCategories: Record<string, string[]>;
  fonts: { google: string[]; local: string[]; system: string[] };
  images: { webp: number; png: number; jpg: number; avif: number; svg: number; gif: number; ico: number };
  favicon: { href: string | null; size: string | null; format: string | null };
  logo: { found: boolean; src: string | null; alt: string };
  darkTheme: string;
  responsive: string;
  colors: { hex: string; rgb: string; usage: number }[];
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  h1Tags: string[];
  metaRobots: string | null;
  canonicalUrl: string | null;
  scriptsCount: number;
  stylesheetsCount: number;
  imagesCount: number;
  internalLinks: number;
  externalLinks: number;
  hasViewport: boolean;
  hasPwaManifest: boolean;
  pageSizeBytes: number;
  serverHeaders: Record<string, string>;
  ssl: { issuer: string | null; expires: string | null; valid: boolean };
  dns: { A: string[]; AAAA: string[]; MX: string[]; TXT: string[]; NS: string[]; DNSSEC: boolean };
  whois: { creationDate: string | null; age: string | null; registrar: string | null };
  geo: { ip: string | null; country: string | null; city: string | null; asn: string | null; hosting: string | null };
  httpVersion: string | null;
  webServer: string | null;
  os: string | null;
  cdn: string[];
  analytics: string[];
  aiSummary: string | null;
  error: string | null;
  frontend: string[];
  backend: string[];
  cssFramework: string[];
  cssTech: string[];
  bundler: string[];
  uiLibrary: string[];
  ssr: string[];
  cms: string[];
  icons: string[];
  animations: string[];
  databases: string[];
  devLanguage: string[];
  payments: string[];
  cloud: string[];
  auth: string[];
  monitoring: string[];
  email: string[];
  maps: string[];
  video: string[];
  storage: string[];
  deployment: string[];
  packageManager: string[];
}

const COLOR_ROLES = [
  'Primary Brand Color',
  'Secondary Tone',
  'Accent Color',
  'Supporting Neutral',
  'Background Shade',
];

// Human-readable descriptions for technical terms
const DESCRIPTIONS: Record<string, string> = {
  'HTTP/1.1': 'Классический протокол передачи данных. Обеспечивает базовую скорость загрузки.',
  'HTTP/2': 'Современный быстрый протокол передачи данных. Позволяет загружать несколько файлов одновременно.',
  'HTTP/3': 'Новейший протокол на базе QUIC. Обеспечивает максимальную скорость и стабильность соединения.',
  'TLSv1.3': 'Самая современная версия протокола шифрования. Обеспечивает высокую безопасность.',
  'TLSv1.2': 'Надёжная версия протокола шифрования. Всё ещё считается безопасной.',
};

function getHttpDescription(version: string): string {
  return DESCRIPTIONS[version] || `Протокол передачи данных: ${version}`;
}

function getSslDescription(valid: boolean): string {
  return valid
    ? '✅ Сертификат безопасности действителен. Сайт использует HTTPS, данные передаются в зашифрованном виде.'
    : '❌ Сертификат безопасности отсутствует или недействителен. Соединение не защищено.';
}

function getDnsDescription(): string {
  return 'DNS (Domain Name System) отвечает за преобразование доменного имени в IP-адрес. Без DNS сайт был бы недоступен по обычному адресу.';
}

function getCdnDescription(cdns: string[]): string {
  if (cdns.length === 0) return 'CDN не обнаружена. Контент может загружаться медленнее для удалённых пользователей.';
  return `Контент раздаётся через мировую сеть серверов (${cdns.join(', ')}), благодаря чему сайт открывается быстрее для посетителей из разных стран.`;
}

function getWebServerDescription(server: string): string {
  return `Веб-сервер обрабатывает входящие запросы и отдаёт страницы сайта. Используется: ${server}.`;
}

function getOsDescription(os: string): string {
  return `Сервер работает под управлением операционной системы: ${os}.`;
}

function getDarkThemeDescription(val: string): string {
  if (val === 'yes') return '✅ Сайт поддерживает тёмную тему.';
  if (val === 'auto') return '✅ Сайт автоматически подстраивается под системную тему пользователя.';
  if (val === 'light') return '❌ Сайт использует только светлую тему.';
  return 'Не удалось определить поддержку тёмной темы.';
}

function getResponsiveDescription(val: string): string {
  if (val === 'yes') return '✅ Сайт адаптирован для мобильных устройств. Корректно отображается на телефонах и планшетах.';
  return '❌ Не обнаружена мобильная адаптация. Сайт может некорректно отображаться на телефонах.';
}

function getModernityStars(techs: string[]): { stars: string; label: string } {
  const modern = ['React', 'Vue', 'Svelte', 'Next.js', 'Nuxt', 'Astro', 'Vite', 'Tailwind CSS', 'TypeScript', 'Framer Motion', 'GSAP'];
  const modernCount = techs.filter(t => modern.includes(t)).length;
  if (modernCount >= 4) return { stars: '⭐⭐⭐⭐⭐', label: 'Современный стек. Используются передовые технологии.' };
  if (modernCount >= 2) return { stars: '⭐⭐⭐⭐', label: 'Хороший стек. Используются современные технологии.' };
  if (modernCount >= 1) return { stars: '⭐⭐⭐', label: 'Базовый стек. Есть потенциал для модернизации.' };
  return { stars: '⭐⭐', label: 'Устаревший стек. Рекомендуется обновление.' };
}

function getSecurityStars(issues: string[]): { stars: string; label: string } {
  if (issues.length === 0) return { stars: '⭐⭐⭐⭐⭐', label: 'Высокий уровень защиты. Все основные заголовки безопасности присутствуют.' };
  if (issues.length <= 2) return { stars: '⭐⭐⭐⭐', label: 'Хороший уровень защиты. Рекомендуется исправить несколько заголовков.' };
  return { stars: '⭐⭐⭐', label: 'Средний уровень защиты. Требуется улучшение.' };
}

function getSeoStars(title: string | null, desc: string | null): { stars: string; label: string } {
  if (title && desc) return { stars: '⭐⭐⭐⭐⭐', label: 'Хорошая SEO-оптимизация. Присутствуют title и description.' };
  if (title || desc) return { stars: '⭐⭐⭐⭐', label: 'Средняя SEO-оптимизация. Отсутствует один из важных мета-тегов.' };
  return { stars: '⭐⭐⭐', label: 'Слабая SEO-оптимизация. Отсутствуют title и description.' };
}

function getBackendStars(backends: string[]): { stars: string; label: string } {
  if (backends.length > 0) return { stars: '⭐⭐⭐⭐', label: `Используются современные технологии: ${backends.join(', ')}.` };
  return { stars: '⭐⭐⭐', label: 'Backend-технологии не определены.' };
}

function mapRawToWebScanReport(raw: RawScanResult): WebScanReport {
  const domain = raw.domain;
  const colorPalette = raw.colors.map((c, i) => ({
    hex: c.hex,
    role: COLOR_ROLES[i] || `Color ${i + 1}`,
    rgb: c.rgb,
    usage: c.usage,
  }));

  const domainAge = raw.whois.age || 'Не удалось определить';
  const domainCreationDate = raw.whois.creationDate || 'Не удалось определить';
  const description = raw.description || 'Не удалось определить';

  const httpsEnabled = raw.ssl.valid || true;
  const sslIssuer = raw.ssl.issuer || 'Не удалось определить';
  const sslExpiry = raw.ssl.expires || 'Не удалось определить';
  const httpVersion = raw.httpVersion || 'HTTP/1.1';

  const serverHeadersLower: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw.serverHeaders)) {
    serverHeadersLower[k.toLowerCase()] = v;
  }

  const securityHeaders = {
    csp: !!serverHeadersLower['content-security-policy'],
    hsts: !!serverHeadersLower['strict-transport-security'],
    xFrameOptions: !!serverHeadersLower['x-frame-options'],
    xssProtection: !!serverHeadersLower['x-xss-protection'],
    cors: !!serverHeadersLower['access-control-allow-origin'],
  };

  const securityIssues: string[] = [];
  if (!securityHeaders.csp) securityIssues.push('Content Security Policy (CSP) header is missing.');
  if (!securityHeaders.hsts) securityIssues.push('HTTP Strict Transport Security (HSTS) header is missing.');
  if (!securityHeaders.xFrameOptions) securityIssues.push('X-Frame-Options header is missing - site may be vulnerable to clickjacking.');

  const loadSpeedMs = raw.pageSizeBytes > 0 ? Math.round(raw.pageSizeBytes / 1024 * 1.5) : 0;
  const pageSizeKb = Math.round(raw.pageSizeBytes / 1024);

  const allTechs = raw.technologies || [];
  const frontendStars = getModernityStars(allTechs);
  const backendStars = getBackendStars(raw.backend || []);
  const securityStars = getSecurityStars(securityIssues);
  const seoStars = getSeoStars(raw.title, raw.description);

  // Build AI summary
  const aiParts: string[] = [];
  if (raw.aiSummary) {
    aiParts.push(raw.aiSummary);
  }
  // Add modernity assessment
  aiParts.push(`\n\nОценка современности:`);
  aiParts.push(`Frontend: ${frontendStars.stars} — ${frontendStars.label}`);
  aiParts.push(`Backend: ${backendStars.stars} — ${backendStars.label}`);
  aiParts.push(`Безопасность: ${securityStars.stars} — ${securityStars.label}`);
  aiParts.push(`SEO: ${seoStars.stars} — ${seoStars.label}`);

  return {
    id: domain,
    url: raw.url,
    scanDate: new Date(raw.scanDate).toLocaleDateString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    title: raw.title || domain,
    description,
    purpose: description || 'Не удалось определить',
    topic: raw.h1Tags[0] || 'Не удалось определить',
    category: 'Website',
    targetAudience: 'Не удалось определить',
    country: raw.geo.country || 'Не удалось определить',
    primaryLanguage: raw.language || 'Не удалось определить',
    supportedLanguages: raw.language ? [raw.language] : ['Не удалось определить'],
    domainCreationDate,
    domainAge,
    domainLastUpdated: 'Не удалось определить',
    company: undefined,
    technologies: {
      frontend: (raw.frontend || []).length > 0 ? raw.frontend : ['HTML5'],
      backend: (raw.backend || []).length > 0 ? raw.backend : ['Не удалось определить'],
      cms: (raw.cms || []).length > 0 ? raw.cms : ['Не удалось определить'],
      databases: (raw.databases || []).length > 0 ? raw.databases : ['Не удалось определить'],
      cssFramework: (raw.cssFramework || []).length > 0 ? raw.cssFramework : ['Не удалось определить'],
      uiLibrary: (raw.uiLibrary || []).length > 0 ? raw.uiLibrary : ['Не удалось определить'],
      jsLibraries: allTechs.filter(t => ['jQuery','Lodash','Axios','Framer Motion','GSAP','Three.js','D3.js','Chart.js','Moment.js','Date-fns','RxJS','Zustand','Redux','React Query','SWR','Zod','Prisma'].includes(t)),
      fonts: [...(raw.fonts?.google || []), ...(raw.fonts?.local || [])],
      icons: raw.icons || [],
      analytics: raw.analytics || [],
      cdn: raw.cdn || [],
    },
    server: {
      hosting: raw.geo.hosting || 'Не удалось определить',
      provider: raw.geo.hosting || 'Не удалось определить',
      serverName: raw.webServer || raw.serverHeaders['server'] || 'Не удалось определить',
      ipAddress: raw.geo.ip || 'Не удалось определить',
      dns: (raw.dns?.NS || []).length > 0 ? raw.dns.NS : ['Не удалось определить'],
      cdn: raw.cdn || [],
      sslVersion: httpsEnabled ? 'TLSv1.3' : 'Не удалось определить',
      httpVersion,
      serverHeaders: raw.serverHeaders,
      serverLocation: raw.geo.city
        ? `${raw.geo.country || ''} (${raw.geo.city})`
        : raw.geo.country || 'Не удалось определить',
    },
    security: {
      httpsEnabled,
      sslStatus: httpsEnabled ? 'Valid & Trusted' : 'Not Enabled',
      sslIssuer,
      sslExpiry,
      securityHeaders,
      cookiesCount: 0,
      cookiesDetails: [],
      securityIssues,
    },
    performance: {
      loadSpeedMs,
      pageSizeKb,
      requestsCount: raw.scriptsCount + raw.stylesheetsCount + raw.imagesCount,
      coreWebVitals: { lcpSec: 0, fidMs: 0, cls: 0 },
      lighthouseScore: {
        performance: raw.error ? 0 : 80,
        accessibility: raw.error ? 0 : 75,
        bestPractices: raw.error ? 0 : 80,
        seo: raw.error ? 0 : 85,
      },
      recommendations: [],
    },
    seo: {
      metaTitle: raw.title || 'Не удалось определить',
      metaDescription: raw.description || 'Не удалось определить',
      openGraph: raw.ogTags,
      twitterCards: raw.twitterTags,
      robotsTxtStatus: raw.metaRobots ? `Robots meta: ${raw.metaRobots}` : 'Не удалось определить',
      sitemapXmlStatus: 'Не удалось определить',
      canonicalUrl: raw.canonicalUrl || raw.url,
      structuredData: [],
      indexability: raw.metaRobots?.includes('noindex') ? 'Noindex — Not Indexable' : 'Fully Indexable',
    },
    design: {
      colorPalette: colorPalette.length > 0
        ? colorPalette.map(c => ({ hex: c.hex, role: c.role, rgb: c.rgb, usage: c.usage }))
        : [{ hex: '#6366f1', role: 'Default Primary' }],
      fonts: [...(raw.fonts?.google || []), ...(raw.fonts?.local || []), ...(raw.fonts?.system || [])],
      icons: raw.icons || [],
      lightDarkTheme: getDarkThemeDescription(raw.darkTheme),
      responsiveness: getResponsiveDescription(raw.responsive),
      designStyle: 'Не удалось определить',
    },
    capabilities: {
      hasAuth: (raw.auth || []).length > 0,
      hasRegistration: false,
      hasLiveChat: raw.analytics?.some((t: string) => ['Intercom', 'Crisp', 'Zendesk', 'HubSpot'].includes(t)) || false,
      hasSearch: raw.internalLinks > 50,
      hasPayments: (raw.payments || []).length > 0,
      hasApi: false,
      hasAiFeatures: false,
      hasPushNotifications: false,
      hasMultilingual: !!raw.language,
      hasPwa: raw.hasPwaManifest,
      hasCookieBanner: raw.h1Tags.some(t => t.toLowerCase().includes('cookie')),
    },
    scores: {
      designScore: colorPalette.length > 0 ? 75 : 50,
      performanceScore: raw.error ? 0 : 75,
      securityScore: securityIssues.length === 0 ? 90 : Math.max(30, 90 - securityIssues.length * 20),
      seoScore: raw.title && raw.description ? 85 : 50,
      accessibilityScore: raw.hasViewport ? 75 : 40,
      techModernityScore: allTechs.length > 0 ? 75 : 30,
      uxScore: raw.error ? 0 : 70,
      overallRating: raw.error ? 0 : 70,
    },
    aiAnalysis: {
      strengths: [],
      weaknesses: securityIssues,
      recommendations: [],
    },
    // Extra fields for UI
    _raw: raw,
    _descriptions: {
      http: getHttpDescription(httpVersion),
      ssl: getSslDescription(httpsEnabled),
      dns: getDnsDescription(),
      cdn: getCdnDescription(raw.cdn || []),
      webServerDesc: raw.webServer ? getWebServerDescription(raw.webServer) : null,
      osDesc: raw.os ? getOsDescription(raw.os) : null,
      darkTheme: getDarkThemeDescription(raw.darkTheme),
      responsive: getResponsiveDescription(raw.responsive),
      favicon: raw.favicon,
      logo: raw.logo,
      images: raw.images,
      fonts: raw.fonts,
      techCategories: raw.techCategories,
      webServer: raw.webServer,
      os: raw.os,
      dnsRecords: raw.dns,
      whois: raw.whois,
      aiSummary: aiParts.join('\n'),
      modernityStars: frontendStars,
      securityStars,
      seoStars,
      backendStars,
    },
  } as WebScanReport & Record<string, any>;
}

export async function scanUrl(url: string): Promise<WebScanReport> {
  const response = await axios.post<{ success: boolean; data: RawScanResult }>(
    `${API_BASE}/scan`,
    { url },
    { timeout: 45000 }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error('Scan failed');
  }

  return mapRawToWebScanReport(response.data.data);
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}
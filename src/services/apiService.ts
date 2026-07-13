import type { WebScanReport } from "../types/scan";
import { scanWebsite, type RawScanResult } from "./browserScanner";

export type { RawScanResult };

const COLOR_ROLES = [
  "Primary Brand Color",
  "Secondary Tone",
  "Accent Color",
  "Supporting Neutral",
  "Background Shade",
  "Text Color",
  "Border Color",
  "Hover State",
  "Gradient Start",
  "Gradient End",
];

const DESCRIPTIONS: Record<string, string> = {
  "HTTP/1.1":
    "Классический протокол передачи данных. Обеспечивает базовую скорость загрузки.",
  "HTTP/2":
    "Современный быстрый протокол передачи данных. Позволяет загружать несколько файлов одновременно.",
  "HTTP/3":
    "Новейший протокол на базе QUIC. Обеспечивает максимальную скорость и стабильность соединения.",
  "TLSv1.3":
    "Самая современная версия протокола шифрования. Обеспечивает высокую безопасность.",
  "TLSv1.2":
    "Надёжная версия протокола шифрования. Всё ещё считается безопасной.",
};

function getHttpDescription(version: string): string {
  return DESCRIPTIONS[version] || `Протокол передачи данных: ${version}`;
}

function getSslDescription(valid: boolean): string {
  return valid
    ? "✅ Сертификат безопасности действителен. Сайт использует HTTPS, данные передаются в зашифрованном виде."
    : "❌ Сертификат безопасности отсутствует или недействителен. Соединение не защищено.";
}

function getDnsDescription(): string {
  return "DNS (Domain Name System) отвечает за преобразование доменного имени в IP-адрес. Без DNS сайт был бы недоступен по обычному адресу.";
}

function getCdnDescription(cdns: string[]): string {
  if (cdns.length === 0)
    return "CDN не обнаружена. Контент может загружаться медленнее для удалённых пользователей.";
  return `Контент раздаётся через мировую сеть серверов (${cdns.join(", ")}), благодаря чему сайт открывается быстрее для посетителей из разных стран.`;
}

function getWebServerDescription(server: string): string {
  return `Веб-сервер обрабатывает входящие запросы и отдаёт страницы сайта. Используется: ${server}.`;
}

function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        h = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / delta + 2;
        break;
      default:
        h = (red - green) / delta + 4;
        break;
    }
  }

  h = Math.round(h * 60);
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${lightness}%)`;
}

function getDarkThemeDescription(val: string): string {
  if (val === "yes") return "✅ Сайт поддерживает тёмную тему.";
  if (val === "auto")
    return "✅ Сайт автоматически подстраивается под системную тему пользователя.";
  if (val === "light") return "❌ Сайт использует только светлую тему.";
  return "Не удалось определить поддержку тёмой темы.";
}

function getResponsiveDescription(val: string): string {
  if (val === "yes")
    return "✅ Сайт адаптирован для мобильных устройств. Корректно отображается на телефонах и планшетах.";
  return "❌ Не обнаружена мобильная адаптация. Сайт может некорректно отображаться на телефонах.";
}

function getModernityStars(techs: string[]): { stars: string; label: string } {
  const modern = [
    "React",
    "Vue",
    "Svelte",
    "Next.js",
    "Nuxt",
    "Astro",
    "Vite",
    "Tailwind CSS",
    "TypeScript",
    "Framer Motion",
    "GSAP",
  ];
  const modernCount = techs.filter((t) => modern.includes(t)).length;
  if (modernCount >= 4)
    return {
      stars: "⭐⭐⭐⭐⭐",
      label: "Современный стек. Используются передовые технологии.",
    };
  if (modernCount >= 2)
    return {
      stars: "⭐⭐⭐⭐",
      label: "Хороший стек. Используются современные технологии.",
    };
  if (modernCount >= 1)
    return {
      stars: "⭐⭐⭐",
      label: "Базовый стек. Есть потенциал для модернизации.",
    };
  return { stars: "⭐⭐", label: "Устаревший стек. Рекомендуется обновление." };
}

function getSecurityStars(issues: string[]): { stars: string; label: string } {
  if (issues.length === 0)
    return {
      stars: "⭐⭐⭐⭐⭐",
      label:
        "Высокий уровень защиты. Все основные заголовки безопасности присутствуют.",
    };
  if (issues.length <= 2)
    return {
      stars: "⭐⭐⭐⭐",
      label:
        "Хороший уровень защиты. Рекомендуется исправить несколько заголовков.",
    };
  return {
    stars: "⭐⭐⭐",
    label: "Средний уровень защиты. Требуется улучшение.",
  };
}

function getSeoStars(
  title: string | null,
  desc: string | null,
): { stars: string; label: string } {
  if (title && desc)
    return {
      stars: "⭐⭐⭐⭐⭐",
      label: "Хорошая SEO-оптимизация. Присутствуют title и description.",
    };
  if (title || desc)
    return {
      stars: "⭐⭐⭐⭐",
      label: "Средняя SEO-оптимизация. Отсутствует один из важных мета-тегов.",
    };
  return {
    stars: "⭐⭐⭐",
    label: "Слабая SEO-оптимизация. Отсутствуют title и description.",
  };
}

function getBackendStars(backends: string[]): { stars: string; label: string } {
  if (backends.length > 0)
    return {
      stars: "⭐⭐⭐⭐",
      label: `Используются технологии: ${backends.join(", ")}.`,
    };
  return {
    stars: "⭐⭐⭐",
    label: "Backend-технологии не определены (возможно, статический сайт).",
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function mapRawToWebScanReport(raw: RawScanResult): WebScanReport {
  const domain = raw.domain;
  const colorPalette = raw.colors.map((c, i) => ({
    hex: c.hex,
    role: COLOR_ROLES[i] || `Color ${i + 1}`,
    rgb: c.rgb,
    usage: c.usage,
  }));

  const httpsEnabled = raw.ssl.valid;
  const sslIssuer = raw.ssl.issuer || "Не удалось определить";
  const sslExpiry = raw.ssl.expires || "Не удалось определить";
  const httpVersion = raw.httpVersion || "HTTP/1.1";

  const serverHeadersLower: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw.serverHeaders)) {
    serverHeadersLower[k.toLowerCase()] = v;
  }

  const securityHeaders = {
    csp: !!serverHeadersLower["content-security-policy"],
    hsts: !!serverHeadersLower["strict-transport-security"],
    xFrameOptions: !!serverHeadersLower["x-frame-options"],
    xssProtection: !!serverHeadersLower["x-xss-protection"],
    cors: !!serverHeadersLower["access-control-allow-origin"],
    referrerPolicy: !!serverHeadersLower["referrer-policy"],
    permissionsPolicy: !!serverHeadersLower["permissions-policy"],
  };

  const securityIssues: string[] = [];
  if (!httpsEnabled)
    securityIssues.push("HTTPS не включён. Соединение не защищено.");
  if (!securityHeaders.csp)
    securityIssues.push("Content Security Policy (CSP) header is missing.");
  if (!securityHeaders.hsts)
    securityIssues.push(
      "HTTP Strict Transport Security (HSTS) header is missing.",
    );
  if (!securityHeaders.xFrameOptions)
    securityIssues.push(
      "X-Frame-Options header is missing - site may be vulnerable to clickjacking.",
    );
  if (!securityHeaders.referrerPolicy)
    securityIssues.push("Referrer-Policy header is missing.");
  if (!securityHeaders.permissionsPolicy)
    securityIssues.push("Permissions-Policy header is missing.");

  const loadSpeedMs =
    raw.pageSizeBytes > 0 ? Math.round((raw.pageSizeBytes / 1024) * 1.5) : 0;
  const pageSizeKb = Math.round(raw.pageSizeBytes / 1024);
  const securityHeaderCount =
    Object.values(securityHeaders).filter(Boolean).length;
  const availableMetaSignals = [
    raw.title,
    raw.description,
    raw.canonicalUrl,
  ].filter(Boolean).length;

  const allTechs = raw.technologies || [];
  const frontendStars = getModernityStars(allTechs);
  const backendStars = getBackendStars(raw.backend || []);
  const securityStars = getSecurityStars(securityIssues);
  const seoStars = getSeoStars(raw.title, raw.description);
  const modernTechScore = clampScore(Math.round((allTechs.length / 12) * 100));
  const designScore = clampScore(
    25 +
      Math.min(colorPalette.length * 5, 25) +
      Math.min((raw.fonts?.google?.length || 0) * 5, 15) +
      (raw.hasViewport ? 10 : 0) +
      (raw.darkTheme === "yes" || raw.darkTheme === "auto" ? 10 : 0) +
      (raw.responsive === "yes" ? 15 : 0),
  );
  const performanceScore = clampScore(
    60 -
      Math.min(pageSizeKb, 150) +
      Math.min(raw.scriptsCount + raw.stylesheetsCount + raw.imagesCount, 20) *
        2,
  );
  const securityScore = clampScore(
    100 - securityIssues.length * 12 + securityHeaderCount * 2,
  );
  const seoScore = clampScore(
    40 + availableMetaSignals * 20 + (raw.structuredData?.length ? 10 : 0),
  );
  const accessibilityScore = clampScore(
    100 -
      Math.max(0, raw.imagesWithoutAlt * 8) -
      Math.max(0, (raw.structuredData?.length || 0) * 2),
  );
  const uxScore = clampScore(
    35 +
      (raw.hasViewport ? 20 : 0) +
      (raw.responsive === "yes" ? 25 : 0) +
      (raw.hasPwaManifest ? 20 : 0),
  );
  const overallRating = clampScore(
    Math.round(
      (designScore +
        performanceScore +
        securityScore +
        seoScore +
        accessibilityScore +
        modernTechScore +
        uxScore) /
        7,
    ),
  );

  const aiParts: string[] = [];
  aiParts.push(`Оценка современности:`);
  aiParts.push(`Frontend: ${frontendStars.stars} — ${frontendStars.label}`);
  aiParts.push(`Backend: ${backendStars.stars} — ${backendStars.label}`);
  aiParts.push(`Безопасность: ${securityStars.stars} — ${securityStars.label}`);
  aiParts.push(`SEO: ${seoStars.stars} — ${seoStars.label}`);

  return {
    id: domain,
    url: raw.url,
    scanDate: new Date(raw.scanDate).toLocaleDateString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    title: raw.title || domain,
    description: raw.description || "Не удалось определить",
    purpose: raw.description || "Не удалось определить",
    topic: raw.h1Tags[0] || "Не удалось определить",
    category: "Website",
    targetAudience: "Не удалось определить",
    country: raw.geo.country || "Не удалось определить",
    primaryLanguage: raw.language || "Не удалось определить",
    supportedLanguages: raw.language
      ? [raw.language]
      : ["Не удалось определить"],
    domainCreationDate: "Недоступно без серверного анализа",
    domainAge: "Недоступно без серверного анализа",
    domainLastUpdated: "Недоступно без серверного анализа",
    company: undefined,
    technologies: {
      frontend: (raw.frontend || []).length > 0 ? raw.frontend : ["HTML5"],
      backend:
        (raw.backend || []).length > 0
          ? raw.backend
          : ["Не удалось определить"],
      cms: (raw.cms || []).length > 0 ? raw.cms : ["Не удалось определить"],
      databases:
        (raw.databases || []).length > 0
          ? raw.databases
          : ["Не удалось определить"],
      cssFramework:
        (raw.cssFramework || []).length > 0
          ? raw.cssFramework
          : ["Не удалось определить"],
      cssTech: raw.cssTech || [],
      bundler: raw.bundler || [],
      uiLibrary:
        (raw.uiLibrary || []).length > 0
          ? raw.uiLibrary
          : ["Не удалось определить"],
      jsLibraries: allTechs.filter((t) =>
        [
          "jQuery",
          "Lodash",
          "Axios",
          "Framer Motion",
          "GSAP",
          "Three.js",
          "D3.js",
          "Chart.js",
          "Moment.js",
          "Date-fns",
          "RxJS",
          "Zustand",
          "Redux",
          "React Query",
          "SWR",
          "Zod",
          "Prisma",
        ].includes(t),
      ),
      fonts: [...(raw.fonts?.google || []), ...(raw.fonts?.local || [])],
      icons: raw.icons || [],
      analytics: raw.analytics || [],
      cdn: raw.cdn || [],
      animations: raw.animations || [],
      cloud: raw.cloud || [],
      deployment: raw.deployment || [],
      packageManager: raw.packageManager || [],
      monitoring: raw.monitoring || [],
      payments: raw.payments || [],
    },
    server: {
      hosting: raw.geo.hosting || "Не удалось определить",
      provider: raw.geo.hosting || "Не удалось определить",
      serverName:
        raw.webServer || raw.serverHeaders["server"] || "Не удалось определить",
      ipAddress: raw.geo.ip || "Не удалось определить",
      dns:
        (raw.dns?.NS || []).length > 0 ? raw.dns.NS : ["Не удалось определить"],
      cdn: raw.cdn || [],
      sslVersion: httpsEnabled ? "TLSv1.3" : "Не удалось определить",
      httpVersion,
      serverHeaders: raw.serverHeaders,
      serverLocation: raw.geo.city
        ? `${raw.geo.country || ""} (${raw.geo.city})`
        : raw.geo.country || "Не удалось определить",
    },
    security: {
      httpsEnabled,
      sslStatus: httpsEnabled ? "Valid & Trusted" : "Not Enabled",
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
        performance: performanceScore,
        accessibility: accessibilityScore,
        bestPractices: clampScore(100 - Math.max(0, raw.imagesWithoutAlt * 5)),
        seo: seoScore,
      },
      recommendations: [
        ...securityIssues,
        ...(raw.imagesWithoutAlt
          ? [`Необходимо добавить alt для ${raw.imagesWithoutAlt} изображений.`]
          : []),
        ...(raw.canonicalUrl
          ? []
          : ["Добавьте canonical URL для усиления SEO."]),
      ],
    },
    seo: {
      metaTitle: raw.title || "Не удалось определить",
      metaDescription: raw.description || "Не удалось определить",
      openGraph: raw.ogTags,
      twitterCards: raw.twitterTags,
      robotsTxtStatus: raw.metaRobots
        ? `Robots meta: ${raw.metaRobots}`
        : "Не удалось определить",
      sitemapXmlStatus: "Недоступно без серверного анализа",
      canonicalUrl: raw.canonicalUrl || raw.url,
      structuredData: raw.structuredData || [],
      indexability: raw.metaRobots?.includes("noindex")
        ? "Noindex — Not Indexable"
        : "Fully Indexable",
    },
    design: {
      colorPalette:
        colorPalette.length > 0
          ? colorPalette.map((c) => ({
              hex: c.hex,
              role: c.role,
              rgb: c.rgb,
              hsl: hexToHsl(c.hex),
              usage: c.usage,
            }))
          : [
              {
                hex: "#6366f1",
                role: "Default Primary",
                hsl: "hsl(259, 94%, 61%)",
              },
            ],
      fonts: [
        ...(raw.fonts?.google || []),
        ...(raw.fonts?.local || []),
        ...(raw.fonts?.system || []),
      ],
      fontMetrics: raw.fontMetrics || [],
      cssVariables: raw.cssVariables || [],
      icons: raw.icons || [],
      lightDarkTheme: getDarkThemeDescription(raw.darkTheme),
      responsiveness: getResponsiveDescription(raw.responsive),
      designStyle: "Не удалось определить",
    },
    capabilities: {
      hasAuth: (raw.auth || []).length > 0,
      hasRegistration: false,
      hasLiveChat:
        raw.analytics?.some((t: string) =>
          ["Intercom", "Crisp", "Zendesk", "HubSpot"].includes(t),
        ) || false,
      hasSearch: raw.internalLinks > 50,
      hasPayments: (raw.payments || []).length > 0,
      hasApi: false,
      hasAiFeatures: false,
      hasPushNotifications: false,
      hasMultilingual: !!raw.language,
      hasPwa: raw.hasPwaManifest,
      hasCookieBanner: raw.h1Tags.some((t) =>
        t.toLowerCase().includes("cookie"),
      ),
    },
    scores: {
      designScore,
      performanceScore,
      securityScore,
      seoScore,
      accessibilityScore,
      techModernityScore: modernTechScore,
      uxScore,
      overallRating,
    },
    aiAnalysis: {
      strengths: [
        ...(raw.title && raw.description
          ? ["Есть title и description для SEO-поля."]
          : []),
        ...(raw.hasViewport
          ? ["Есть viewport meta для мобильной адаптивности."]
          : []),
        ...(raw.cssFramework?.length
          ? [`Определён CSS-фреймворк: ${raw.cssFramework.join(", ")}.`]
          : []),
        ...(raw.frontend?.length
          ? [`Определён frontend-стек: ${raw.frontend.join(", ")}.`]
          : []),
      ],
      weaknesses: [
        ...securityIssues,
        ...(raw.imagesWithoutAlt
          ? [`Изображения без alt: ${raw.imagesWithoutAlt}.`]
          : []),
        ...(raw.canonicalUrl ? [] : ["Canonical URL не найден."]),
      ],
      recommendations: [
        ...(securityIssues.length
          ? ["Исправьте заголовки безопасности и HTTPS-брейки."]
          : []),
        ...(raw.imagesWithoutAlt
          ? ["Добавьте alt-описания к изображениям для доступности."]
          : []),
        ...(raw.canonicalUrl
          ? []
          : ["Подключите canonical URL для правильной индексации."]),
      ],
    },
    _raw: raw,
    _descriptions: {
      http: getHttpDescription(httpVersion),
      ssl: getSslDescription(httpsEnabled),
      dns: getDnsDescription(),
      cdn: getCdnDescription(raw.cdn || []),
      webServerDesc: raw.webServer
        ? getWebServerDescription(raw.webServer)
        : null,
      darkTheme: getDarkThemeDescription(raw.darkTheme),
      responsive: getResponsiveDescription(raw.responsive),
      favicon: raw.favicon,
      logo: raw.logo,
      images: raw.images,
      fonts: raw.fonts,
      techCategories: raw.techCategories,
      webServer: raw.webServer,
      dnsRecords: raw.dns,
      geo: raw.geo,
      aiSummary: aiParts.join("\n"),
      modernityStars: frontendStars,
      securityStars,
      seoStars,
      backendStars,
      keywords: raw.keywords,
      author: raw.author,
      generator: raw.generator,
      headings: raw.headings,
      inlineScripts: raw.inlineScripts,
      imagesWithoutAlt: raw.imagesWithoutAlt,
      ariaLabels: raw.ariaLabels,
      semanticTags: raw.semanticTags,
      structuredData: raw.structuredData,
    },
  } as WebScanReport & Record<string, any>;
}

export async function scanUrl(url: string): Promise<WebScanReport> {
  const raw = await scanWebsite(url);
  return mapRawToWebScanReport(raw);
}

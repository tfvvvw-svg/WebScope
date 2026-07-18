import type { WebScanReport } from "../types/scan";

export interface AiMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  sections?: Array<{
    title: string;
    facts: string[];
    explanation: string;
    technical: string;
    recommendations: string[];
  }>;
  streaming?: boolean;
  isComplete?: boolean;
}

export interface RawScanResult {
  domain: string;
  url: string;
  scanDate: string;
  title?: string;
  description?: string;
  error?: string;
  message?: string;
  technologies: string[];
  fonts: {
    google?: string[];
    local?: string[];
    system?: string[];
  };
  colors: Array<{ hex: string; rgb?: string; usage?: number }>;
  serverHeaders: Record<string, string>;
  ssl: {
    valid: boolean;
    issuer?: string;
    organization?: string;
    country?: string;
    expires?: string;
  };
  httpVersion?: string;
  webServer?: string;
  geo: {
    ip?: string;
    country?: string;
    city?: string;
    hosting?: string;
    asn?: string;
  };
  dns?: {
    A?: string[];
    AAAA?: string[];
    MX?: string[];
    TXT?: string[];
    NS?: string[];
    CAA?: string[];
  };
  whois?: {
    registrar?: string;
    createdDate?: string;
    expiresDate?: string;
    updatedDate?: string;
    nameServers?: string[];
    country?: string;
    organization?: string;
  };
  darkTheme?: string;
  responsive?: string;
  hasViewport?: boolean;
  hasPwaManifest?: boolean;
  metaRobots?: string;
  canonicalUrl?: string;
  ogTags?: Record<string, string>;
  twitterTags?: Record<string, string>;
  structuredData?: any[];
  h1Tags: string[];
  internalLinks: number;
  scriptsCount: number;
  stylesheetsCount: number;
  imagesCount: number;
  imagesWithoutAlt: number;
  language?: string;
  frontend?: string[];
  backend?: string[];
  cms?: string[];
  databases?: string[];
  cssFramework?: string[];
  cssTech?: string[];
  bundler?: string[];
  uiLibrary?: string[];
  jsLibraries?: string[];
  analytics?: string[];
  cdn?: string[];
  animations?: string[];
  cloud?: string[];
  deployment?: string[];
  packageManager?: string[];
  monitoring?: string[];
  payments?: string[];
  auth?: string[];
  icons?: string[];
  fontMetrics?: any[];
  cssVariables?: any[];
  keywords?: string[];
  author?: string;
  generator?: string;
  headings?: any;
  inlineScripts?: any[];
  ariaLabels?: number;
  semanticTags?: number;
  favicon?: string;
  logo?: string;
  images?: string[];
  techCategories?: Record<string, string[]>;
  pageSizeBytes: number;
  robotsTxt?: string;
  sitemapXml?: string;
  compression?: {
    gzip: boolean;
    brotli: boolean;
    deflate: boolean;
  };
}

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function fetchApi(url: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Network error: ${error.message}. ` +
          `Ensure backend is running.`,
      );
    }
    throw error;
  }
}

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
    "Classic data transfer protocol. Provides basic loading speed.",
  "HTTP/2":
    "Modern fast data transfer protocol. Allows loading multiple files simultaneously.",
  "HTTP/3":
    "Latest protocol based on QUIC. Provides maximum speed and connection stability.",
  "TLSv1.3":
    "Most modern encryption protocol version. Provides high security.",
  "TLSv1.2":
    "Reliable encryption protocol version. Still considered secure.",
};

function getHttpDescription(version: string): string {
  return DESCRIPTIONS[version] || `Data transfer protocol: ${version}`;
}

function getSslDescription(valid: boolean): string {
  return valid
    ? "SSL certificate is valid. The site uses HTTPS, data is transmitted encrypted."
    : "SSL certificate is missing or invalid. Connection is not protected.";
}

function getDnsDescription(): string {
  return "DNS (Domain Name System) handles the conversion of domain names to IP addresses. Without DNS, the site would be inaccessible by its regular address.";
}

function getCdnDescription(cdns: string[]): string {
  if (cdns.length === 0)
    return "No CDN detected. Content may load slower for remote users.";
  return `Content is served through a global server network (${cdns.join(", ")}), making the site open faster for visitors from different countries.`;
}

function getWebServerDescription(server: string): string {
  return `Web server handles incoming requests and serves site pages. Uses: ${server}.`;
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
  if (val === "yes") return "Site supports dark theme.";
  if (val === "auto")
    return "Site automatically adapts to the user's system theme.";
  if (val === "light") return "Site uses only light theme.";
  return "Dark theme support not detected.";
}

function getResponsiveDescription(val: string): string {
  if (val === "yes")
    return "Site is adapted for mobile devices. Correctly displays on phones and tablets.";
  return "No mobile adaptation detected. Site may display incorrectly on phones.";
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
      label: "Modern stack. Uses cutting-edge technologies.",
    };
  if (modernCount >= 2)
    return {
      stars: "⭐⭐⭐⭐",
      label: "Good stack. Uses modern technologies.",
    };
  if (modernCount >= 1)
    return {
      stars: "⭐⭐⭐",
      label: "Basic stack. Has potential for modernization.",
    };
  return { stars: "⭐⭐", label: "Outdated stack. Update recommended." };
}

function getSecurityStars(issues: string[]): { stars: string; label: string } {
  if (issues.length === 0)
    return {
      stars: "⭐⭐⭐⭐⭐",
      label:
        "High level of protection. All main security headers are present.",
    };
  if (issues.length <= 2)
    return {
      stars: "⭐⭐⭐⭐",
      label:
        "Good level of protection. Recommended to fix a few headers.",
    };
  return {
    stars: "⭐⭐⭐",
    label: "Medium level of protection. Improvement required.",
  };
}

function getSeoStars(
  title: string | null | undefined,
  desc: string | null | undefined,
): { stars: string; label: string } {
  if (title && desc)
    return {
      stars: "⭐⭐⭐⭐⭐",
      label: "Good SEO optimization. Title and description present.",
    };
  if (title || desc)
    return {
      stars: "⭐⭐⭐⭐",
      label: "Medium SEO optimization. One of the important meta tags is missing.",
    };
  return {
    stars: "⭐⭐⭐",
    label: "Poor SEO optimization. Title and description are missing.",
  };
}

function getBackendStars(backends: string[]): { stars: string; label: string } {
  if (backends.length > 0)
    return {
      stars: "⭐⭐⭐⭐",
      label: `Uses technologies: ${backends.join(", ")}.`,
    };
  return {
    stars: "⭐⭐⭐",
    label: "Backend technologies not detected (possibly a static site).",
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function calculateDomainAge(createdDate: string): string {
  const years = Math.floor(
    (Date.now() - new Date(createdDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365),
  );
  return years + " years";
}

function mapRawToWebScanReport(raw: RawScanResult): WebScanReport {
  const domain = raw.domain;
  const colorPalette = raw.colors.map((c: any, i: number) => ({
    hex: c.hex,
    role: COLOR_ROLES[i] || `Color ${i + 1}`,
    rgb: c.rgb,
    usage: c.usage,
  }));

  const httpsEnabled = raw.ssl.valid;
  const sslIssuer = raw.ssl.issuer;
  const sslExpiry = raw.ssl.expires;
  const httpVersion = raw.httpVersion || "HTTP/1.1";

  const serverHeadersLower: Record<string, string> = {};
  const rawServerHeaders = raw.serverHeaders || {};
  for (const [k, v] of Object.entries(rawServerHeaders)) {
    serverHeadersLower[k.toLowerCase()] = String(v);
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
    securityIssues.push("HTTPS is not enabled. Connection is not protected.");
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
  aiParts.push(`Modernity assessment:`);
  aiParts.push(`Frontend: ${frontendStars.stars} — ${frontendStars.label}`);
  aiParts.push(`Backend: ${backendStars.stars} — ${backendStars.label}`);
  aiParts.push(`Security: ${securityStars.stars} — ${securityStars.label}`);
  aiParts.push(`SEO: ${seoStars.stars} — ${seoStars.label}`);

  // Use WHOIS data if available
  const domainCreationDate = raw.whois?.createdDate || undefined;
  const domainAge = raw.whois?.createdDate
    ? calculateDomainAge(raw.whois.createdDate)
    : undefined;
  const domainLastUpdated = raw.whois?.updatedDate || undefined;

  return {
    id: domain,
    url: raw.url,
    scanDate: new Date(raw.scanDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    title: raw.title || domain,
    description: raw.description || undefined,
    purpose: raw.description || undefined,
    topic:
      Array.isArray(raw.h1Tags) && raw.h1Tags.length > 0
        ? raw.h1Tags[0]
        : undefined,
    category: "Website",
    targetAudience: undefined,
    country: raw.geo.country || raw.whois?.country || undefined,
    primaryLanguage: raw.language || undefined,
    supportedLanguages: raw.language
      ? [raw.language]
      : [],
    domainCreationDate,
    domainAge,
    domainLastUpdated,
    company: undefined,
    technologies: {
      frontend: (raw.frontend || []).length > 0 ? raw.frontend : ["HTML5"],
      backend:
        (raw.backend || []).length > 0
          ? raw.backend
          : [],
      cms: (raw.cms || []).length > 0 ? raw.cms : [],
      databases:
        (raw.databases || []).length > 0
          ? raw.databases
          : [],
      cssFramework:
        (raw.cssFramework || []).length > 0
          ? raw.cssFramework
          : [],
      cssTech: raw.cssTech || [],
      bundler: raw.bundler || [],
      uiLibrary:
        (raw.uiLibrary || []).length > 0
          ? raw.uiLibrary
          : [],
      jsLibraries: allTechs.filter((t: string) =>
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
      hosting: raw.geo.hosting || undefined,
      provider: raw.geo.hosting || undefined,
      serverName: raw.webServer || raw.serverHeaders["server"] || undefined,
      ipAddress: raw.geo.ip || undefined,
      dns: raw.dns?.NS && raw.dns.NS.length > 0 ? raw.dns.NS : undefined,
      cdn: raw.cdn || [],
      sslVersion: httpsEnabled ? "TLSv1.3" : undefined,
      httpVersion,
      serverHeaders: raw.serverHeaders,
      serverLocation: raw.geo.city
        ? `${raw.geo.country || ""} (${raw.geo.city})`
        : raw.geo.country || undefined,
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
          ? [`Add alt descriptions for ${raw.imagesWithoutAlt} images.`]
          : []),
        ...(raw.canonicalUrl
          ? []
          : ["Add canonical URL for better SEO."]),
      ],
    },
    seo: {
      metaTitle: raw.title || undefined,
      metaDescription: raw.description || undefined,
      openGraph: raw.ogTags,
      twitterCards: raw.twitterTags,
      robotsTxtStatus: raw.metaRobots
        ? `Robots meta: ${raw.metaRobots}`
        : undefined,
      sitemapXmlStatus: undefined,
      canonicalUrl: raw.canonicalUrl || raw.url,
      structuredData: raw.structuredData || [],
      indexability: raw.metaRobots?.includes("noindex")
        ? "Noindex — Not Indexable"
        : "Fully Indexable",
    },
    design: {
      colorPalette:
        colorPalette.length > 0
          ? colorPalette.map((c: any) => ({
              hex: c.hex,
              role: c.role,
              rgb: c.rgb,
              hsl: hexToHsl(c.hex),
              usage: c.usage,
            }))
          : [],
      fonts: [
        ...(raw.fonts?.google || []),
        ...(raw.fonts?.local || []),
        ...(raw.fonts?.system || []),
      ],
      fontMetrics: raw.fontMetrics || [],
      cssVariables: raw.cssVariables || [],
      icons: raw.icons || [],
      lightDarkTheme: getDarkThemeDescription(raw.darkTheme || ""),
      responsiveness: getResponsiveDescription(raw.responsive || ""),
      designStyle: undefined,
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
      hasCookieBanner: (raw.h1Tags || []).some((t) =>
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
          ? ["Has title and description for SEO."]
          : []),
        ...(raw.hasViewport
          ? ["Has viewport meta for mobile responsiveness."]
          : []),
        ...(raw.cssFramework?.length
          ? [`CSS framework detected: ${raw.cssFramework.join(", ")}.`]
          : []),
        ...(raw.frontend?.length
          ? [`Frontend stack detected: ${raw.frontend.join(", ")}.`]
          : []),
      ],
      weaknesses: [
        ...securityIssues,
        ...(raw.imagesWithoutAlt
          ? [`Images without alt: ${raw.imagesWithoutAlt}.`]
          : []),
        ...(raw.canonicalUrl ? [] : ["Canonical URL not found."]),
      ],
      recommendations: [
        ...(securityIssues.length
          ? ["Fix security headers and HTTPS issues."]
          : []),
        ...(raw.imagesWithoutAlt
          ? ["Add alt descriptions to images for accessibility."]
          : []),
        ...(raw.canonicalUrl
          ? []
          : ["Add canonical URL for proper indexing."]),
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
      darkTheme: getDarkThemeDescription(raw.darkTheme || ""),
      responsive: getResponsiveDescription(raw.responsive || ""),
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

// Backend API functions
export async function scanUrlBackend(url: string): Promise<WebScanReport> {
  const response = await fetchApi(`${API_BASE}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  let raw;
  try {
    const text = await response.text();
    raw = text ? JSON.parse(text) : null;
  } catch (error) {
    if (!response.ok) {
      throw new Error(`Scan failed (${response.status}): Invalid response from server`);
    }
    throw new Error("Invalid response format from scanner");
  }

  if (!response.ok) {
    const message =
      raw?.message || raw?.error || `Scan failed (${response.status})`;
    throw new Error(message);
  }

  if (!raw || typeof raw !== "object" || !raw.url || !raw.domain) {
    throw new Error(
      "Invalid response from scanner. Ensure backend is running.",
    );
  }

  if (raw.error) {
    throw new Error(raw.message || raw.error);
  }

  return mapRawToWebScanReport(raw as RawScanResult);
}

export async function askAI(
  question: string,
  scanContext?: WebScanReport,
  history: AiMessage[] = [],
): Promise<{ answer: string; provider: string }> {
  const response = await fetchApi(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      history: history.map((msg) => ({
        role: msg.role,
        content: msg.text,
        timestamp: msg.timestamp,
      })),
      scanContext: scanContext
        ? {
            url: scanContext.url,
            technologies: scanContext.technologies,
            security: scanContext.security,
            performance: scanContext.performance,
            seo: scanContext.seo,
            design: scanContext.design,
            scores: scanContext.scores,
          }
        : undefined,
    }),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || "AI request failed");
    } catch (e) {
      throw new Error(`AI request failed (${response.status})`);
    }
  }

  try {
    const data = await response.json();
    return {
      answer: data.answer,
      provider: data.provider,
    };
  } catch (e) {
    throw new Error("Invalid response format from AI service");
  }
}

// Streaming AI response
export async function* askAIStream(
  question: string,
  scanContext?: WebScanReport,
  history: AiMessage[] = [],
): AsyncGenerator<string, void, unknown> {
  const response = await fetchApi(`${API_BASE}/ai/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      history: history.map((msg) => ({
        role: msg.role,
        content: msg.text,
        timestamp: msg.timestamp,
      })),
      scanContext: scanContext
        ? {
            url: scanContext.url,
            technologies: scanContext.technologies,
            security: scanContext.security,
            performance: scanContext.performance,
            seo: scanContext.seo,
            design: scanContext.design,
            scores: scanContext.scores,
          }
        : undefined,
    }),
  });

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || "AI request failed");
    } catch (e) {
      throw new Error(`AI request failed (${response.status})`);
    }
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body from AI stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process Server-Sent Events
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.done) {
            return;
          }
          if (data.chunk) {
            yield data.chunk;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

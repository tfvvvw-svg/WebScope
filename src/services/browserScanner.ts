/**
 * Browser-based website scanner using public APIs and direct HTML parsing.
 * No backend required - runs entirely in the browser (Vercel static deploy).
 */

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
  fontMetrics: {
    family: string;
    size: string;
    weight: string;
    lineHeight: string;
    letterSpacing: string;
    source: string;
  }[];
  cssVariables: { name: string; value: string }[];
  images: {
    webp: number;
    png: number;
    jpg: number;
    avif: number;
    svg: number;
    gif: number;
    ico: number;
  };
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
  dns: {
    A: string[];
    AAAA: string[];
    MX: string[];
    TXT: string[];
    NS: string[];
    DNSSEC: boolean;
  };
  whois: {
    creationDate: string | null;
    age: string | null;
    registrar: string | null;
  };
  geo: {
    ip: string | null;
    country: string | null;
    city: string | null;
    asn: string | null;
    hosting: string | null;
  };
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

  // Extended metadata
  keywords: string | null;
  author: string | null;
  generator: string | null;
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  inlineScripts: number;
  imagesWithoutAlt: number;
  ariaLabels: number;
  semanticTags: number;
  structuredData: { type: string; detected: boolean }[];
}

// CORS proxies for fetching cross-origin HTML (no backend needed)
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest=",
];

async function fetchWithProxy(target: string): Promise<Response> {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(target), {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml,*/*",
        },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) return res;
    } catch {
      /* try next proxy */
    }
  }
  throw new Error(
    "Не удалось загрузить сайт (все CORS-прокси недоступны). Попробуйте позже.",
  );
}

export function extractDomain(input: string): string {
  try {
    const u = new URL(input);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return input
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "");
  }
}

export async function scanWebsite(inputUrl: string): Promise<RawScanResult> {
  const domain = extractDomain(inputUrl);
  const fullUrl = inputUrl.startsWith("http")
    ? inputUrl
    : `https://${inputUrl}`;

  // Fetch HTML
  const response = await fetchWithProxy(fullUrl);
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  // ---- Basic metadata ----
  const title = doc.querySelector("title")?.textContent?.trim() || null;
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    null;
  const language = doc.documentElement.lang || null;
  const charset =
    doc.querySelector("meta[charset]")?.getAttribute("charset") || null;
  const viewport =
    doc.querySelector('meta[name="viewport"]')?.getAttribute("content") || null;
  const robots =
    doc.querySelector('meta[name="robots"]')?.getAttribute("content") || null;
  const canonical =
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || null;
  const author =
    doc.querySelector('meta[name="author"]')?.getAttribute("content") || null;
  const generator =
    doc.querySelector('meta[name="generator"]')?.getAttribute("content") ||
    null;
  const keywords =
    doc.querySelector('meta[name="keywords"]')?.getAttribute("content") || null;

  // ---- OG / Twitter ----
  const ogTags: Record<string, string> = {};
  doc.querySelectorAll('meta[property^="og:"]').forEach((t) => {
    const p = t.getAttribute("property")?.replace("og:", "") || "";
    const c = t.getAttribute("content") || "";
    if (p && c) ogTags[p] = c;
  });
  const twitterTags: Record<string, string> = {};
  doc.querySelectorAll('meta[name^="twitter:"]').forEach((t) => {
    const n = t.getAttribute("name")?.replace("twitter:", "") || "";
    const c = t.getAttribute("content") || "";
    if (n && c) twitterTags[n] = c;
  });

  // ---- Headings ----
  const h1Tags = Array.from(doc.querySelectorAll("h1"))
    .map((h) => h.textContent?.trim() || "")
    .filter(Boolean);
  const headings = {
    h1: doc.querySelectorAll("h1").length,
    h2: doc.querySelectorAll("h2").length,
    h3: doc.querySelectorAll("h3").length,
    h4: doc.querySelectorAll("h4").length,
    h5: doc.querySelectorAll("h5").length,
    h6: doc.querySelectorAll("h6").length,
  };

  // ---- Resource counts ----
  const scripts = Array.from(doc.querySelectorAll("script[src]"));
  const scriptsCount = scripts.length;
  const stylesheetsCount = doc.querySelectorAll(
    'link[rel="stylesheet"]',
  ).length;
  const imagesCount = doc.querySelectorAll("img").length;
  const inlineScripts = doc.querySelectorAll("script:not([src])").length;

  // ---- Server headers ----
  const serverHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => (serverHeaders[k.toLowerCase()] = v));

  // ---- Tech detection ----
  const technologies = detectTechnologies(doc, html, serverHeaders);
  const techCategories = categorizeTechnologies(technologies);

  // ---- Colors / Fonts / CSS variables / Images ----
  const colors = extractColors(doc, html);
  const fonts = extractFonts(doc, html);
  const cssVariables = extractCssVariables(doc, html);
  const fontMetrics = extractFontMetrics(doc, html);
  const images = analyzeImages(doc);
  const favicon = extractFavicon(doc, fullUrl);
  const logo = extractLogo(doc, fullUrl);
  const responsive = viewport ? "yes" : "no";
  const darkTheme = detectDarkTheme(doc, html);

  // ---- Links ----
  const links = Array.from(doc.querySelectorAll("a[href]"));
  const internalLinks = links.filter((l) => {
    const h = l.getAttribute("href") || "";
    return h.startsWith("/") || h.includes(domain);
  }).length;
  const externalLinks = links.length - internalLinks;

  const hasPwaManifest = !!doc.querySelector('link[rel="manifest"]');
  const pageSizeBytes = new Blob([html]).size;

  // ---- Parallel public API lookups ----
  const [dns, ssl, geo] = await Promise.all([
    lookupDNS(domain),
    checkSSL(domain),
    lookupGeo(domain),
  ]);

  // ---- Structured data ----
  const structuredData: { type: string; detected: boolean }[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      const json = JSON.parse(s.textContent || "{}");
      const type =
        json["@type"] || (Array.isArray(json["@graph"]) ? "Graph" : "Unknown");
      structuredData.push({ type: String(type), detected: true });
    } catch {
      structuredData.push({ type: "Invalid", detected: false });
    }
  });

  // ---- Accessibility quick checks ----
  const imagesWithoutAlt = Array.from(doc.querySelectorAll("img")).filter(
    (img) => !img.getAttribute("alt"),
  ).length;
  const ariaLabels = doc.querySelectorAll("[aria-label]").length;
  const semanticTags = doc.querySelectorAll(
    "header,nav,main,section,article,footer",
  ).length;

  return {
    domain,
    url: fullUrl,
    scanDate: new Date().toISOString(),
    title,
    description,
    language,
    charset,
    technologies,
    techCategories,
    fonts,
    fontMetrics,
    cssVariables,
    images,
    favicon,
    logo,
    darkTheme,
    responsive,
    colors,
    ogTags,
    twitterTags,
    h1Tags,
    metaRobots: robots,
    canonicalUrl: canonical,
    scriptsCount,
    stylesheetsCount,
    imagesCount,
    internalLinks,
    externalLinks,
    hasViewport: !!viewport,
    hasPwaManifest,
    pageSizeBytes,
    serverHeaders,
    ssl,
    dns,
    whois: { creationDate: null, age: null, registrar: null },
    geo,
    httpVersion: serverHeaders["x-powered-by"] || null,
    webServer: serverHeaders["server"] || null,
    os: null,
    cdn: detectCDN(serverHeaders, html),
    analytics: detectAnalytics(html),
    aiSummary: null,
    error: null,
    frontend: techCategories.frontend || [],
    backend: techCategories.backend || [],
    cssFramework: techCategories.cssFramework || [],
    cssTech: techCategories.cssTech || [],
    bundler: techCategories.bundler || [],
    uiLibrary: techCategories.uiLibrary || [],
    ssr: techCategories.ssr || [],
    cms: techCategories.cms || [],
    icons: techCategories.icons || [],
    animations: techCategories.animations || [],
    databases: techCategories.databases || [],
    devLanguage: techCategories.devLanguage || [],
    payments: techCategories.payments || [],
    cloud: techCategories.cloud || [],
    auth: techCategories.auth || [],
    monitoring: techCategories.monitoring || [],
    email: techCategories.email || [],
    maps: techCategories.maps || [],
    video: techCategories.video || [],
    storage: techCategories.storage || [],
    deployment: techCategories.deployment || [],
    packageManager: techCategories.packageManager || [],
    // extra metadata
    keywords: keywords || null,
    author: author || null,
    generator: generator || null,
    headings,
    inlineScripts,
    imagesWithoutAlt,
    ariaLabels,
    semanticTags,
    structuredData,
  } as RawScanResult & Record<string, any>;
}

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

function detectTechnologies(
  doc: Document,
  html: string,
  headers: Record<string, string>,
): string[] {
  const t: string[] = [];
  const has = (s: string) => html.includes(s);

  if (
    has("react") ||
    has("React") ||
    doc.querySelector("[data-reactroot]") ||
    doc.querySelector("#root") ||
    has("react-dom")
  )
    t.push("React");
  if (
    has("vue") ||
    has("Vue") ||
    doc.querySelector("#app") ||
    has("vue-router") ||
    has("__vue__")
  )
    t.push("Vue");
  if (has("angular") || has("ng-") || has("@angular")) t.push("Angular");
  if (has("svelte") || has("__svelte")) t.push("Svelte");
  if (has("solid-js") || has("SolidJS")) t.push("Solid");
  if (has("next.js") || has("__next") || has("/_next/")) t.push("Next.js");
  if (has("nuxt") || has("__nuxt") || has("/_nuxt/")) t.push("Nuxt");
  if (has("astro") || has("__astro")) t.push("Astro");
  if (has("vite") || has("/@vite/") || has("__vite")) t.push("Vite");

  if (
    has("tailwind") ||
    doc.querySelector('[class*="tw-"]') ||
    has("tailwindcss")
  )
    t.push("Tailwind CSS");
  if (
    has("bootstrap") ||
    doc.querySelector('[class*="bootstrap"]') ||
    has("btn-primary")
  )
    t.push("Bootstrap");
  if (has("bulma")) t.push("Bulma");
  if (has("material-ui") || has("@mui") || has("MuiButton"))
    t.push("Material UI");
  if (has("ant-design") || has("ant-btn") || has("@ant-design"))
    t.push("Ant Design");
  if (has("chakra") || has("@chakra")) t.push("Chakra UI");

  if (has("styled-components") || has("emotion") || has("css-in-js"))
    t.push("Styled Components");
  if (has("scss") || has("sass")) t.push("SCSS");
  if (has("less")) t.push("LESS");

  if (has("framer-motion") || has("Framer")) t.push("Framer Motion");
  if (has("gsap") || has("GreenSock")) t.push("GSAP");
  if (has("swiper") || has("swiper-slide")) t.push("Swiper");
  if (has("three.js") || has("THREE.")) t.push("Three.js");
  if (has("lenis") || has("@studio-freight/lenis")) t.push("Lenis");
  if (has("locomotive") || has("locomotive-scroll"))
    t.push("Locomotive Scroll");
  if (has("chart.js") || has("Chart")) t.push("Chart.js");
  if (has("echarts")) t.push("ECharts");
  if (has("recharts")) t.push("Recharts");
  if (has("d3") || has("d3-")) t.push("D3");

  if (has("lucide") || has("lucide-react")) t.push("Lucide");
  if (has("fontawesome") || has("fa-") || has("@fortawesome"))
    t.push("Font Awesome");
  if (has("heroicons")) t.push("Heroicons");
  if (has("material-icons") || has("@material-icons")) t.push("Material Icons");
  if (has("bootstrap-icons")) t.push("Bootstrap Icons");

  if (has("google-analytics") || has("gtag") || has("UA-") || has("G-"))
    t.push("Google Analytics");
  if (has("googletagmanager") || has("GTM-")) t.push("Google Tag Manager");
  if (has("hotjar")) t.push("Hotjar");
  if (has("clarity.ms") || has("microsoft-clarity"))
    t.push("Microsoft Clarity");
  if (has("plausible.io") || has("plausible")) t.push("Plausible");

  if (has("wordpress") || has("wp-content") || has("wp-includes"))
    t.push("WordPress");
  if (has("shopify") || has(".myshopify.com") || has("Shopify"))
    t.push("Shopify");
  if (has("webflow") || has("webflow.com")) t.push("Webflow");
  if (has("ghost") || has("ghost.io")) t.push("Ghost");
  if (has("strapi")) t.push("Strapi");
  if (has("contentful")) t.push("Contentful");
  if (has("sanity")) t.push("Sanity");

  if (has("stripe") || has("Stripe")) t.push("Stripe");
  if (has("paypal") || has("PayPal")) t.push("PayPal");

  if (has("firebase") || has("firebaseio")) t.push("Firebase");
  if (has("aws") || has("amazonaws") || has("cloudfront")) t.push("AWS");
  if (has("azure") || has("azureedge")) t.push("Azure");

  // Hosting / deployment
  if (headers["x-vercel-cache"] || headers["x-vercel-id"] || has("/_vercel/"))
    t.push("Vercel");
  if (headers["server"]?.includes("Netlify") || has("netlify"))
    t.push("Netlify");
  if (
    headers["cf-ray"] ||
    headers["server"]?.includes("cloudflare") ||
    has("cloudflare")
  )
    t.push("Cloudflare");
  if (has("github.io") || has("github pages")) t.push("GitHub Pages");

  if (has("typescript") || has(".tsx") || has("tsconfig")) t.push("TypeScript");

  return Array.from(new Set(t));
}

function categorizeTechnologies(techs: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {};
  const mapping: Record<string, string[]> = {
    frontend: ["React", "Vue", "Angular", "Svelte", "Solid"],
    backend: [
      "Node.js",
      "PHP",
      "Python",
      "Ruby",
      "Java",
      "Laravel",
      "Django",
      "Flask",
      "ASP.NET",
      "Spring",
      "Ruby on Rails",
    ],
    cssFramework: [
      "Tailwind CSS",
      "Bootstrap",
      "Bulma",
      "Material UI",
      "Chakra UI",
      "Ant Design",
    ],
    cssTech: ["SCSS", "LESS", "CSS Modules", "Styled Components", "Emotion"],
    bundler: ["Webpack", "Vite", "Parcel", "Rollup", "Rspack"],
    uiLibrary: ["Material UI", "Ant Design", "Chakra UI", "Mantine"],
    ssr: ["Next.js", "Nuxt", "SvelteKit", "Astro"],
    cms: [
      "WordPress",
      "Shopify",
      "Webflow",
      "Ghost",
      "Strapi",
      "Contentful",
      "Sanity",
    ],
    icons: [
      "Lucide",
      "Font Awesome",
      "Heroicons",
      "Material Icons",
      "Bootstrap Icons",
    ],
    animations: [
      "Framer Motion",
      "GSAP",
      "Swiper",
      "Three.js",
      "Lenis",
      "Locomotive Scroll",
    ],
    databases: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase"],
    devLanguage: ["TypeScript", "JavaScript"],
    payments: ["Stripe", "PayPal", "Square"],
    cloud: ["AWS", "Azure", "Google Cloud", "Firebase"],
    auth: ["Auth0", "Firebase Auth", "Passport.js"],
    monitoring: ["Sentry", "Datadog", "New Relic"],
    email: ["Mailgun", "SendGrid", "Postmark"],
    maps: ["Google Maps", "Mapbox", "Leaflet"],
    video: ["YouTube", "Vimeo", "Wistia"],
    storage: ["AWS S3", "Cloudinary", "Imgix"],
    deployment: ["Vercel", "Netlify", "AWS", "Azure", "GitHub Pages"],
    packageManager: ["npm", "yarn", "pnpm"],
  };
  for (const tech of techs) {
    for (const [cat, items] of Object.entries(mapping)) {
      if (items.includes(tech)) {
        (categories[cat] ||= []).push(tech);
      }
    }
  }
  return categories;
}

function extractColors(
  doc: Document,
  html: string,
): { hex: string; rgb: string; usage: number }[] {
  const map = new Map<string, number>();
  const re = /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/gi;
  const collect = (s: string) => {
    let m: RegExpExecArray | null;
    while ((m = re.exec(s)) !== null) {
      const c = m[0].toLowerCase();
      map.set(c, (map.get(c) || 0) + 1);
    }
  };
  doc
    .querySelectorAll("[style]")
    .forEach((el) => collect((el as HTMLElement).getAttribute("style") || ""));
  doc.querySelectorAll("style").forEach((s) => collect(s.textContent || ""));
  collect(html);
  return Array.from(map.entries())
    .map(([hex, usage]) => ({ hex, rgb: hexToRgb(hex), usage }))
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 30);
}

function hexToRgb(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? `rgb(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)})`
    : hex;
}

function extractFonts(
  doc: Document,
  html: string,
): { google: string[]; local: string[]; system: string[] } {
  const google: string[] = [];
  const local: string[] = [];
  const system = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "sans-serif",
    "serif",
    "monospace",
  ];
  doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach((l) => {
    const m = (l.getAttribute("href") || "").match(/family=([^:&]+)/);
    if (m) google.push(decodeURIComponent(m[1].replace(/\+/g, " ")));
  });
  const re = /font-family:\s*([^;{}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    m[1]
      .split(",")
      .map((f) => f.trim().replace(/['"]/g, ""))
      .forEach((f) => {
        if (
          f &&
          !system.includes(f) &&
          !local.includes(f) &&
          !google.includes(f)
        )
          local.push(f);
      });
  }
  return { google: [...new Set(google)], local: [...new Set(local)], system };
}

function extractCssVariables(
  doc: Document,
  html: string,
): { name: string; value: string }[] {
  const source = [
    html,
    ...Array.from(doc.querySelectorAll("style")).map(
      (style) => style.textContent || "",
    ),
  ].join("\n");
  const map = new Map<string, string>();
  const re = /(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(source)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    if (name && value) map.set(name, value);
  }

  return Array.from(map.entries())
    .slice(0, 12)
    .map(([name, value]) => ({ name, value }));
}

function extractFontMetrics(
  doc: Document,
  html: string,
): {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
  source: string;
}[] {
  const source = [
    html,
    ...Array.from(doc.querySelectorAll("style")).map(
      (style) => style.textContent || "",
    ),
  ].join("\n");
  const metrics: {
    family: string;
    size: string;
    weight: string;
    lineHeight: string;
    letterSpacing: string;
    source: string;
  }[] = [];
  const familyMatch = /font-family\s*:\s*([^;{}]+)/i.exec(source);
  const sizeMatch = /font-size\s*:\s*([^;{}]+)/i.exec(source);
  const weightMatch = /font-weight\s*:\s*([^;{}]+)/i.exec(source);
  const lineHeightMatch = /line-height\s*:\s*([^;{}]+)/i.exec(source);
  const letterSpacingMatch = /letter-spacing\s*:\s*([^;{}]+)/i.exec(source);

  const family =
    familyMatch?.[1]?.trim()?.replace(/['"]/g, "").split(",")[0] || "Unknown";
  if (family) {
    metrics.push({
      family,
      size: sizeMatch?.[1]?.trim() || "16px",
      weight: weightMatch?.[1]?.trim() || "400",
      lineHeight: lineHeightMatch?.[1]?.trim() || "1.5",
      letterSpacing: letterSpacingMatch?.[1]?.trim() || "normal",
      source: "CSS",
    });
  }

  return metrics.slice(0, 6);
}

function detectDarkTheme(doc: Document, html: string): string {
  if (
    html.includes("prefers-color-scheme: dark") ||
    html.includes('"dark"') ||
    html.includes("'dark'")
  )
    return "auto";
  if (
    doc.documentElement.classList.contains("dark") ||
    doc.documentElement.getAttribute("data-theme") === "dark"
  )
    return "yes";
  return "light";
}

function analyzeImages(doc: Document): {
  webp: number;
  png: number;
  jpg: number;
  avif: number;
  svg: number;
  gif: number;
  ico: number;
} {
  const r = { webp: 0, png: 0, jpg: 0, avif: 0, svg: 0, gif: 0, ico: 0 };
  doc.querySelectorAll("img").forEach((img) => {
    const src = (
      img.getAttribute("src") ||
      img.getAttribute("srcset") ||
      ""
    ).toLowerCase();
    if (src.includes("webp")) r.webp++;
    else if (src.includes("png")) r.png++;
    else if (src.includes("jpg") || src.includes("jpeg")) r.jpg++;
    else if (src.includes("avif")) r.avif++;
    else if (src.includes("svg")) r.svg++;
    else if (src.includes("gif")) r.gif++;
    else if (src.includes("ico")) r.ico++;
  });
  return r;
}

function extractFavicon(
  doc: Document,
  base: string,
): { href: string | null; size: string | null; format: string | null } {
  const link = doc.querySelector('link[rel*="icon"]') as HTMLLinkElement | null;
  if (link) {
    const href = link.href;
    return {
      href,
      size: link.sizes?.value || null,
      format: href.split(".").pop() || null,
    };
  }
  return { href: `${base}/favicon.ico`, size: null, format: "ico" };
}

function extractLogo(
  doc: Document,
  _base: string,
): { found: boolean; src: string | null; alt: string } {
  const selectors = [
    'img[alt*="logo" i]',
    'img[class*="logo" i]',
    'img[id*="logo" i]',
    ".logo img",
    "#logo img",
    "header img",
  ];
  for (const s of selectors) {
    const el = doc.querySelector(s) as HTMLImageElement | null;
    if (el) return { found: true, src: el.src || null, alt: el.alt || "Logo" };
  }
  return { found: false, src: null, alt: "" };
}

function detectCDN(headers: Record<string, string>, html: string): string[] {
  const c: string[] = [];
  if (headers["cf-ray"] || html.includes("cloudflare")) c.push("Cloudflare");
  if (html.includes("fastly")) c.push("Fastly");
  if (html.includes("akamai")) c.push("Akamai");
  if (html.includes("jsdelivr") || html.includes("cdn.jsdelivr.net"))
    c.push("jsDelivr");
  if (html.includes("unpkg.com")) c.push("UNPKG");
  return c;
}

function detectAnalytics(html: string): string[] {
  const a: string[] = [];
  if (
    html.includes("google-analytics") ||
    html.includes("gtag") ||
    html.includes("UA-") ||
    html.includes("G-")
  )
    a.push("Google Analytics");
  if (html.includes("googletagmanager") || html.includes("GTM-"))
    a.push("Google Tag Manager");
  if (html.includes("hotjar")) a.push("Hotjar");
  if (html.includes("clarity.ms") || html.includes("microsoft-clarity"))
    a.push("Microsoft Clarity");
  if (html.includes("plausible.io") || html.includes("plausible"))
    a.push("Plausible");
  return a;
}

async function lookupDNS(
  domain: string,
): Promise<{
  A: string[];
  AAAA: string[];
  MX: string[];
  TXT: string[];
  NS: string[];
  DNSSEC: boolean;
}> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${domain}&type=A`,
      { signal: AbortSignal.timeout(10000) },
    );
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    const out: {
      A: string[];
      AAAA: string[];
      MX: string[];
      TXT: string[];
      NS: string[];
      DNSSEC: boolean;
    } = {
      A: [],
      AAAA: [],
      MX: [],
      TXT: [],
      NS: [],
      DNSSEC: false,
    };
    (data.Answer || []).forEach((r: any) => {
      if (r.type === 1) out.A.push(String(r.data));
      else if (r.type === 28) out.AAAA.push(String(r.data));
      else if (r.type === 15) out.MX.push(String(r.data));
      else if (r.type === 16) out.TXT.push(String(r.data));
      else if (r.type === 2) out.NS.push(String(r.data));
    });
    return out;
  } catch {
    return { A: [], AAAA: [], MX: [], TXT: [], NS: [], DNSSEC: false };
  }
}

async function checkSSL(
  domain: string,
): Promise<{ issuer: string | null; expires: string | null; valid: boolean }> {
  try {
    const res = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&all=done`,
      {
        signal: AbortSignal.timeout(12000),
      },
    );
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (data.status === "READY" && data.endpoints?.[0]) {
      const ep = data.endpoints[0];
      const cert = ep.details?.cert || {};
      return {
        issuer: cert.issuerLabel || null,
        expires: cert.notAfter || null,
        valid: ep.status === "ACTIVE" && cert.issues === 0,
      };
    }
    return { issuer: null, expires: null, valid: false };
  } catch {
    return { issuer: null, expires: null, valid: false };
  }
}

async function lookupGeo(
  domain: string,
): Promise<{
  ip: string | null;
  country: string | null;
  city: string | null;
  asn: string | null;
  hosting: string | null;
}> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${domain}?fields=status,message,country,regionName,city,as,query`,
      {
        signal: AbortSignal.timeout(10000),
      },
    );
    const text = await res.text();
    const d = text ? JSON.parse(text) : {};
    if (d.status === "success") {
      const as = d.as || "";
      const hosting = as.includes("Cloudflare")
        ? "Cloudflare"
        : as.includes("Google")
          ? "Google"
          : as.includes("Amazon") || as.includes("AWS")
            ? "AWS"
            : as.includes("Microsoft")
              ? "Azure"
              : null;
      return {
        ip: d.query || null,
        country: d.country || null,
        city: d.city || null,
        asn: as || null,
        hosting,
      };
    }
    return { ip: null, country: null, city: null, asn: null, hosting: null };
  } catch {
    return { ip: null, country: null, city: null, asn: null, hosting: null };
  }
}

import axios, { AxiosResponse } from "axios";
import * as dns from "dns";
import * as tls from "tls";
import { URL } from "url";
import * as cheerio from "cheerio";
import whois from "whois-json";

const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function axiosRequestWithRetry<T>(
  config: any,
  attempt = 1,
): Promise<AxiosResponse<T>> {
  try {
    return await axios.request<T>(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const retryable = axios.isAxiosError(error)
      ? Boolean(
          (error.code &&
            [
              "ECONNABORTED",
              "ETIMEDOUT",
              "ECONNRESET",
              "ECONNREFUSED",
              "ENOTFOUND",
              "EAI_AGAIN",
            ].includes(error.code)) ||
          (error.response &&
            RETRY_STATUS_CODES.includes(error.response.status)),
        )
      : false;

    console.warn(
      `axiosRequestWithRetry attempt=${attempt} url=${config.url} retryable=${retryable} message=${message}`,
    );

    if (attempt < MAX_RETRIES && retryable) {
      const delay = BASE_RETRY_DELAY_MS * 2 ** (attempt - 1);
      await sleep(delay);
      return axiosRequestWithRetry(config, attempt + 1);
    }

    throw error;
  }
}

export interface ScanResult {
  domain: string;
  url: string;
  scanDate: string;
  title?: string;
  description?: string;
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
  error?: string;
  robotsTxt?: string;
  sitemapXml?: string;
  compression?: {
    gzip: boolean;
    brotli: boolean;
    deflate: boolean;
  };
}

// Fetch website HTML directly (backend has no CORS restrictions)
async function fetchWebsite(targetUrl: string): Promise<{
  html: string;
  finalUrl: string;
  responseHeaders: Record<string, string | string[]>;
  ip?: string;
}> {
  try {
    const response = await axiosRequestWithRetry<string>({
      method: "GET",
      url: targetUrl,
      timeout: 25000,
      maxRedirects: 5,
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
      },
      validateStatus: (status: number) => status < 400,
    });

    const finalUrl =
      response.request?.res?.responseUrl ||
      response.request?.res?.responseUrl ||
      targetUrl;
    const responseHeaders = response.headers as Record<
      string,
      string | string[]
    >;
    const ip = response.request?.res?.socket?.remoteAddress;

    if (
      response.data &&
      typeof response.data === "string" &&
      response.data.length > 0
    ) {
      return {
        html: response.data,
        finalUrl,
        responseHeaders,
        ip,
      };
    }

    if (response.data && typeof response.data === "object") {
      return {
        html: JSON.stringify(response.data),
        finalUrl,
        responseHeaders,
        ip,
      };
    }

    throw new Error(`Empty response received from ${targetUrl}`);
  } catch (error) {
    console.error(`fetchWebsite failed for ${targetUrl}:`, error);
    if (axios.isAxiosError(error)) {
      if (
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND" ||
        error.code === "EAI_AGAIN"
      ) {
        throw new Error(
          `Could not resolve or connect to ${targetUrl}. The domain may not exist or is unreachable.`,
        );
      }
      if (error.response) {
        const status = error.response.status;
        // Provide specific error messages for common HTTP errors
        if (status === 403) {
          throw new Error(
            `Access denied (HTTP 403) for ${targetUrl}. The server may be blocking automated requests.`,
          );
        }
        if (status === 404) {
          throw new Error(
            `Page not found (HTTP 404) for ${targetUrl}. The URL may be incorrect.`,
          );
        }
        if (status === 502) {
          throw new Error(
            `Bad gateway (HTTP 502) for ${targetUrl}. The server is temporarily unavailable.`,
          );
        }
        if (status === 503) {
          throw new Error(
            `Service unavailable (HTTP 503) for ${targetUrl}. The server is temporarily overloaded.`,
          );
        }
        throw new Error(
          `Server returned HTTP ${status} for ${targetUrl}`,
        );
      }
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        throw new Error(`Request to ${targetUrl} timed out after 25s`);
      }
      throw new Error(`Network error fetching ${targetUrl}: ${error.message}`);
    }
    throw error;
  }
}

// Extract domain from URL
function extractDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return urlStr
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "");
  }
}

// Detect technologies from HTML with evidence
export function detectTechnologies(
  html: string,
  headers: Record<string, string>,
): string[] {
  const techs: string[] = [];
  const lowerHtml = html.toLowerCase();
  const scriptContent = (
    html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []
  ).join(" ");

  const addTech = (name: string) => {
    if (!techs.includes(name)) {
      techs.push(name);
    }
  };

  // Frontend frameworks
  if (
    /(data-reactroot|react-dom|react\.production(?:\.min)?\.js|react\.development\.js|createRoot\s*\(|ReactDOM\.render|\/react(?:-dom)?(?:\.min)?\.js)/i.test(
      html,
    )
  ) {
    addTech("React");
  }
  if (
    /(?:__vue__|vue-router|vue\.js|vue\.min\.js|<script[^>]+src=["'][^"']*vue[^"']*)/i.test(
      html,
    )
  ) {
    addTech("Vue.js");
  }
  if (
    /(?:ng-app|ng-controller|ng-include|ng-init|ng-version|@angular|angular(?:\.min)?\.js|\/angular\/)/i.test(
      html,
    )
  ) {
    addTech("Angular");
  }
  if (/(?:__svelte|svelte(?:\.js|\.min\.js)|sveltekit)/i.test(html)) {
    addTech("Svelte");
  }
  if (
    /(?:__next|\/_next\/|next(?:\.js)?(?:\.min)?\.js|next\/dist)/i.test(html)
  ) {
    addTech("Next.js");
  }
  if (/(?:\/_nuxt\/|nuxt(?:\.js|\.min\.js))/i.test(html)) {
    addTech("Nuxt.js");
  }

  // CSS Frameworks
  if (/(?:tailwindcss|tailwind\.css|tailwind-config)/i.test(html)) {
    addTech("Tailwind CSS");
  }
  if (
    /(?:bootstrap(?:\.min)?\.css|bootstrap(?:\.min)?\.js|data-bs-|navbar-expand|btn btn-)/i.test(
      html,
    )
  ) {
    addTech("Bootstrap");
  }
  if (/(?:bulma(?:\.min)?\.css|bulma)/i.test(html)) {
    addTech("Bulma");
  }
  if (
    /(?:@vite\/|vite\/client|vite(?:\.js|\.min\.js)|vite\/client)/i.test(html)
  ) {
    addTech("Vite");
  }
  if (/(?:webpack(?:\.js|\.min\.js)?|webpackChunk|webpackJsonp)/i.test(html)) {
    addTech("Webpack");
  }

  // Analytics
  if (
    /(?:google-analytics\.com\/analytics\.js|googletagmanager\.com\/gtm\.js|gtag\(|ua-[0-9a-z-]+|googletagmanager)/i.test(
      html,
    )
  ) {
    addTech("Google Analytics");
  }
  if (/(?:googletagmanager\.com|gtm-[0-9a-z]+|googletagmanager)/i.test(html)) {
    addTech("Google Tag Manager");
  }

  // CMS
  if (
    /(?:wp-content|wp-includes|wp-json|wp-admin|<meta[^>]+name=["']generator["'][^>]*wordpress)/i.test(
      html,
    )
  ) {
    addTech("WordPress");
  }
  if (
    /(?:cdn\.shopify\.com|myshopify\.com|shopify-section|shopify-product|shopify-checkout|shopify\.app)/i.test(
      html,
    )
  ) {
    addTech("Shopify");
  }

  // Hosting detection
  if (headers["server"]?.includes("Netlify") || /netlify/i.test(lowerHtml)) {
    addTech("Netlify");
  }
  if (
    headers["cf-ray"] ||
    headers["server"]?.includes("cloudflare") ||
    /cloudflare/i.test(lowerHtml)
  ) {
    addTech("Cloudflare");
  }
  if (headers["x-vercel-cache"] || headers["x-vercel-id"]) {
    addTech("Vercel");
  }

  // Additional tech detection
  if (scriptContent && /(?:window\.__NEXT_DATA__|__NEXT_DATA__)/i.test(scriptContent)) {
    addTech("Next.js");
  }

  // jQuery
  if (/(?:jquery(?:\.min)?\.js|jquery\.com)/i.test(html)) {
    addTech("jQuery");
  }

  // Lodash
  if (/(?:lodash\.js|lodash\.min\.js)/i.test(html)) {
    addTech("Lodash");
  }

  // Framer Motion
  if (/(?:framer-motion|framermotion)/i.test(html)) {
    addTech("Framer Motion");
  }

  // GSAP
  if (/(?:gsap|greensock)/i.test(html)) {
    addTech("GSAP");
  }

  // Three.js
  if (/(?:three\.js|three\.min\.js)/i.test(html)) {
    addTech("Three.js");
  }

  // Chart.js
  if (/(?:chart\.js|chartjs)/i.test(html)) {
    addTech("Chart.js");
  }

  // Font Awesome
  if (/(?:fontawesome|fa-[a-z-]+|@fortawesome)/i.test(html)) {
    addTech("Font Awesome");
  }

  // Material Icons
  if (/(?:material-icons|google-material)/i.test(html)) {
    addTech("Material Icons");
  }

  // Hotjar
  if (/(?:hotjar|hotjar-[0-9]+)/i.test(html)) {
    addTech("Hotjar");
  }

  // Microsoft Clarity
  if (/(?:clarity\.ms|microsoft-clarity)/i.test(html)) {
    addTech("Microsoft Clarity");
  }

  // Plausible
  if (/(?:plausible\.io|plausible)/i.test(html)) {
    addTech("Plausible");
  }

  return techs;
}

// Extract colors from HTML with usage count
function extractColors(html: string): Array<{ hex: string; rgb?: string; usage?: number }> {
  const colorMap = new Map<string, number>();
  const regex = /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const color = match[0].toLowerCase();
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  }
  return Array.from(colorMap.entries())
    .map(([hex, usage]) => ({ hex, usage }))
    .sort((a, b) => (b.usage || 0) - (a.usage || 0))
    .slice(0, 10);
}

// Extract fonts from HTML
function extractFonts(html: string): { google?: string[]; local?: string[]; system?: string[] } {
  const fonts: { google?: string[]; local?: string[]; system?: string[] } = {};
  const regex = /font-family:\s*([^;{}]+)/gi;
  const systemFonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "sans-serif", "serif", "monospace"];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const fontFamilies = match[1]
      .split(",")
      .map((f) => f.trim().replace(/['"]/g, ""));
    fontFamilies.forEach((font) => {
      if (font && !systemFonts.includes(font)) {
        if (!fonts.local) fonts.local = [];
        if (!fonts.local.includes(font)) {
          fonts.local.push(font);
        }
      }
    });
  }
  const googleFontsMatch = html.match(/fonts\.googleapis\.com\/css[^"']*/);
  if (googleFontsMatch) {
    fonts.google = ["Google Fonts"];
  }
  return fonts;
}

// Get DNS records with all types
async function getDNSRecords(
  domain: string,
): Promise<{ A?: string[]; AAAA?: string[]; MX?: string[]; TXT?: string[]; NS?: string[]; CAA?: string[] }> {
  const records: { A?: string[]; AAAA?: string[]; MX?: string[]; TXT?: string[]; NS?: string[]; CAA?: string[] } = {};

  return new Promise((resolve) => {
    // A records
    dns.resolve4(domain, (err, addresses) => {
      if (!err && addresses) records.A = addresses.slice(0, 5);
    });

    // AAAA records
    dns.resolve6(domain, (err, addresses) => {
      if (!err && addresses) records.AAAA = addresses.slice(0, 5);
    });

    // MX records
    dns.resolveMx(domain, (err, mxRecords) => {
      if (!err && mxRecords)
        records.MX = mxRecords.slice(0, 5).map((r) => r.exchange);
    });

    // TXT records
    dns.resolveTxt(domain, (err, txtRecords) => {
      if (!err && txtRecords)
        records.TXT = txtRecords.slice(0, 5).map((r) => r.join(""));
    });

    // NS records - returns string array directly
    dns.resolveNs(domain, (err, nsRecords) => {
      if (!err && nsRecords)
        records.NS = nsRecords.slice(0, 5);
    });

// CAA records (may not be supported in all Node versions)
    try {
      (dns as any).resolveCaa?.(domain, (err: Error | null, caaRecords: any[]) => {
        if (!err && caaRecords && caaRecords.length > 0) {
          records.CAA = caaRecords.slice(0, 5).map((r: any) => {
            const type = r.type || "issue";
            const value = r.value || "";
            // CAA value is typically a tag like "letsencrypt.org" for issue type
            // The value field contains the CA identifier
            if (value) {
              return `${type}: ${value}`;
            }
            return `CAA ${type}`;
          }).filter((r: string) => r.length > 0);
        }
      });
    } catch {
      // CAA not supported
    }

    // Resolve after all lookups
    setTimeout(() => resolve(records), 2000);
  });
}

// Get WHOIS data
async function getWhoisData(domain: string): Promise<{
  registrar?: string;
  createdDate?: string;
  expiresDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  country?: string;
  organization?: string;
} | null> {
  try {
    const record = await whois(domain);
    if (record) {
      return {
        registrar: record.registrar,
        createdDate: record.createdDate,
        expiresDate: record.expiresDate,
        updatedDate: record.updatedDate,
        nameServers: record.nameServers,
        country: record.registrant?.country,
        organization: record.registrant?.organization,
      };
    }
    return null;
  } catch (error) {
    console.warn(`WHOIS lookup failed for ${domain}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

// Get SSL certificate info with more details
async function getSSLInfo(domain: string): Promise<{
  valid: boolean;
  issuer?: string;
  organization?: string;
  country?: string;
  expires?: string;
}> {
  return new Promise((resolve) => {
    const socket = tls.connect(443, domain, { servername: domain }, () => {
      try {
        const cert = socket.getPeerCertificate();
        if (cert && cert.valid_to) {
          const issuerOrg = typeof cert.issuer?.organization === "string" ? cert.issuer.organization : undefined;
          const issuerCN = typeof cert.issuer?.commonName === "string" ? cert.issuer.commonName : undefined;
          const issuerCountry = typeof cert.issuer?.country === "string" ? cert.issuer.country : undefined;
          resolve({
            valid: true,
            issuer: issuerOrg || issuerCN,
            organization: issuerOrg,
            country: issuerCountry,
            expires: cert.valid_to,
          });
        } else {
          resolve({ valid: false });
        }
      } catch (sslError) {
        console.error(
          `SSL lookup failed for ${domain}:`,
          sslError instanceof Error
            ? sslError.stack || sslError.message
            : sslError,
        );
        resolve({ valid: false });
      } finally {
        socket.end();
      }
    });
    socket.on("error", (err) => {
      console.warn(
        `SSL socket error for ${domain}:`,
        err instanceof Error ? err.message : err,
      );
      resolve({ valid: false });
    });
    setTimeout(() => {
      socket.destroy();
      resolve({ valid: false });
    }, 5000);
  });
}

// Get geo information from IP
async function getGeoInfo(ip: string | undefined): Promise<{
  country?: string;
  city?: string;
  hosting?: string;
  asn?: string;
}> {
  if (!ip) return {};

  try {
    // Use ip-api.com for geo lookup
    const response = await axiosRequestWithRetry<any>({
      method: "GET",
      url: `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,as,query`,
      timeout: 5000,
      validateStatus: (status: number) => status < 500,
    });

    const data = response.data as { status?: string; as?: string; country?: string; city?: string };
    if (data.status === "success") {
      const as = data.as || "";
      const hosting = as.includes("Cloudflare")
        ? "Cloudflare"
        : as.includes("Google")
          ? "Google"
          : as.includes("Amazon") || as.includes("AWS")
            ? "AWS"
            : as.includes("Microsoft")
              ? "Azure"
              : as.includes("DigitalOcean")
                ? "DigitalOcean"
                : as.includes("OVH")
                  ? "OVH"
                  : undefined;

      return {
        country: data.country,
        city: data.city,
        hosting,
        asn: as,
      };
    }
  } catch (error) {
    console.warn(`Geo lookup failed for ${ip}:`, error instanceof Error ? error.message : error);
  }

  return {};
}

// Detect hosting provider
function detectHosting(
  headers: Record<string, string | string[]>,
  html: string,
): string | undefined {
  const lowerHtml = html.toLowerCase();
  const serverHeader =
    typeof headers["server"] === "string"
      ? headers["server"]
      : Array.isArray(headers["server"])
        ? headers["server"][0]
        : "";
  if (serverHeader.includes("Netlify") || lowerHtml.includes("netlify"))
    return "Netlify";
  if (headers["cf-ray"] || serverHeader.includes("cloudflare"))
    return "Cloudflare";
  if (headers["x-vercel-cache"] || headers["x-vercel-id"]) return "Vercel";
  if (serverHeader.includes("GitHub") || lowerHtml.includes("github.io"))
    return "GitHub Pages";
  if (serverHeader.includes("nginx")) return "Nginx";
  if (serverHeader.includes("Apache")) return "Apache";
  return undefined;
}

// Check compression support
function checkCompression(headers: Record<string, string | string[]>): { gzip: boolean; brotli: boolean; deflate: boolean } {
  const contentEncoding = typeof headers["content-encoding"] === "string" ? headers["content-encoding"] : "";
  const acceptEncoding = typeof headers["accept-encoding"] === "string" ? headers["accept-encoding"] : "";

  return {
    gzip: contentEncoding.includes("gzip") || acceptEncoding.includes("gzip"),
    brotli: contentEncoding.includes("br") || acceptEncoding.includes("br"),
    deflate: contentEncoding.includes("deflate") || acceptEncoding.includes("deflate"),
  };
}

// Parse HTML and extract additional data
function parseHtmlData(html: string) {
  const $ = cheerio.load(html);

  // H1 tags
  const h1Tags: string[] = [];
  $("h1").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1Tags.push(text);
  });

  // Count scripts, stylesheets, images
  const scriptsCount = $("script").length;
  const stylesheetsCount = $("link[rel='stylesheet']").length;
  const imagesCount = $("img").length;
  const imagesWithoutAlt = $("img").filter((_, el) => !$(el).attr("alt")).length;

  // Internal links - count all links
  const internalLinks = $("a[href]").length;

  // Language
  const language = $("html").attr("lang") || undefined;

  // Viewport
  const hasViewport = $("meta[name='viewport']").length > 0;

  // PWA manifest
  const hasPwaManifest = $("link[rel='manifest']").length > 0;

  // Canonical
  const canonicalUrl = $("link[rel='canonical']").attr("href") || undefined;

  // Meta robots
  const metaRobots = $("meta[name='robots']").attr("content") || undefined;

  // OpenGraph tags
  const ogTags: Record<string, string> = {};
  $("meta[property^='og:']").each((_, el) => {
    const property = $(el).attr("property");
    const content = $(el).attr("content");
    if (property && content) {
      ogTags[property] = content;
    }
  });

  // Twitter tags
  const twitterTags: Record<string, string> = {};
  $("meta[name^='twitter:']").each((_, el) => {
    const name = $(el).attr("name");
    const content = $(el).attr("content");
    if (name && content) {
      twitterTags[name] = content;
    }
  });

  // Structured data (JSON-LD)
  const structuredData: any[] = [];
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      structuredData.push(json);
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  // Favicon
  const favicon = $("link[rel='icon'], link[rel='shortcut icon']").attr("href") || undefined;

  // Generator
  const generator = $("meta[name='generator']").attr("content") || undefined;

  // Author
  const author = $("meta[name='author']").attr("content") || undefined;

  // Dark theme detection
  let darkTheme: string | undefined;
  if (html.includes("prefers-color-scheme") || html.includes("dark") || html.includes("theme-dark")) {
    darkTheme = "yes";
  }

  // Responsive detection
  let responsive: string | undefined;
  if (hasViewport && html.includes("@media")) {
    responsive = "yes";
  }

  // Icons
  const icons: string[] = [];
  $("link[rel*='icon']").each((_, el) => {
    const href = $(el).attr("href");
    if (href) icons.push(href);
  });

  // ARIA labels count
  const ariaLabels = $("[aria-label]").length;

  // Semantic tags count
  const semanticTags = $("header,nav,main,section,article,footer,aside").length;

  // Headings count
  const headings = {
    h1: $("h1").length,
    h2: $("h2").length,
    h3: $("h3").length,
    h4: $("h4").length,
    h5: $("h5").length,
    h6: $("h6").length,
  };

  // Inline scripts
  const inlineScripts = $("script:not([src])").map((_, el) => $(el).html()).get();

  // Keywords
  const keywords = $("meta[name='keywords']").attr("content")?.split(",").map(k => k.trim()) || [];

  return {
    h1Tags,
    scriptsCount,
    stylesheetsCount,
    imagesCount,
    imagesWithoutAlt,
    language,
    hasViewport,
    hasPwaManifest,
    canonicalUrl,
    metaRobots,
    ogTags,
    twitterTags,
    structuredData,
    favicon,
    generator,
    author,
    darkTheme,
    responsive,
    icons,
    internalLinks,
    ariaLabels,
    semanticTags,
    headings,
    inlineScripts,
    keywords,
  };
}

// Fetch robots.txt
async function fetchRobotsTxt(domain: string): Promise<string | undefined> {
  try {
    const response = await axiosRequestWithRetry({
      method: "GET",
      url: `https://${domain}/robots.txt`,
      timeout: 5000,
      validateStatus: (status: number) => status < 400,
    });
    if (response.data) {
      return typeof response.data === "string" ? response.data : undefined;
    }
  } catch {
    // robots.txt not found or not accessible
  }
  return undefined;
}

// Fetch sitemap.xml
async function fetchSitemapXml(domain: string): Promise<string | undefined> {
  try {
    const response = await axiosRequestWithRetry({
      method: "GET",
      url: `https://${domain}/sitemap.xml`,
      timeout: 5000,
      validateStatus: (status: number) => status < 400,
    });
    if (response.data) {
      return typeof response.data === "string" ? response.data : undefined;
    }
  } catch {
    // sitemap.xml not found or not accessible
  }
  return undefined;
}

// Main scan function
export async function scanWebsite(url: string): Promise<ScanResult> {
  try {
    if (!url) {
      throw new Error("URL is required");
    }

    const domain = extractDomain(url);
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    console.log(`Scanning: ${fullUrl}`);

    let html: string;
    let finalUrl: string;
    let responseHeaders: Record<string, string | string[]> = {};
    let ip: string | undefined;

    try {
      const result = await fetchWebsite(fullUrl);
      html = result.html;
      finalUrl = result.finalUrl;
      responseHeaders = result.responseHeaders;
      ip = result.ip;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch website";
      return {
        domain,
        url: fullUrl,
        scanDate: new Date().toISOString(),
        error: message,
        technologies: [],
        fonts: {},
        colors: [],
        serverHeaders: {},
        ssl: { valid: false },
        geo: {},
        h1Tags: [],
        internalLinks: 0,
        scriptsCount: 0,
        stylesheetsCount: 0,
        imagesCount: 0,
        imagesWithoutAlt: 0,
        pageSizeBytes: 0,
      };
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    );

    let headers: Record<string, string | string[]> = { ...responseHeaders };
    try {
      const headResponse = await axiosRequestWithRetry({
        method: "HEAD",
        url: fullUrl,
        timeout: 10000,
        validateStatus: (status: number) => status < 500,
      });
      Object.entries(headResponse.headers).forEach(([key, value]) => {
        if (!(key.toLowerCase() in headers)) {
          headers[key.toLowerCase()] = value as string | string[];
        }
      });
    } catch (headError) {
      console.warn(
        `HEAD request failed for ${fullUrl}:`,
        headError instanceof Error ? headError.message : headError,
      );
    }

    // Parallel fetch of DNS, SSL, WHOIS, robots.txt, sitemap.xml
    const [dnsRecords, sslInfo, whoisData, robotsTxt, sitemapXml] = await Promise.all([
      getDNSRecords(domain),
      getSSLInfo(domain),
      getWhoisData(domain),
      fetchRobotsTxt(domain),
      fetchSitemapXml(domain),
    ]);

    // Get geo info from IP
    const geoInfo = await getGeoInfo(ip);

    const normalizedHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      normalizedHeaders[key] = Array.isArray(value) ? value[0] : value;
    });

    const technologies = detectTechnologies(html, normalizedHeaders);
    const colors = extractColors(html);
    const fonts = extractFonts(html);
    const hosting = detectHosting(headers, html);
    const htmlData = parseHtmlData(html);
    const compression = checkCompression(headers);

    const serverHeader =
      typeof headers["server"] === "string"
        ? headers["server"]
        : Array.isArray(headers["server"])
          ? headers["server"][0]
          : undefined;

    // HTTP version detection
    const httpVersion = headers["http-version"]
      ? (Array.isArray(headers["http-version"]) ? headers["http-version"][0] : headers["http-version"])
      : "HTTP/1.1";

    // Determine frontend/backend from technologies
    const frontend: string[] = [];
    const backend: string[] = [];
    const cms: string[] = [];
    const cssFramework: string[] = [];
    const jsLibraries: string[] = [];
    const analytics: string[] = [];
    const cdn: string[] = [];
    const animations: string[] = [];
    const cloud: string[] = [];
    const deployment: string[] = [];

    if (technologies.includes("React")) frontend.push("React");
    if (technologies.includes("Vue.js")) frontend.push("Vue.js");
    if (technologies.includes("Angular")) frontend.push("Angular");
    if (technologies.includes("Svelte")) frontend.push("Svelte");
    if (technologies.includes("Next.js")) frontend.push("Next.js");
    if (technologies.includes("Nuxt.js")) frontend.push("Nuxt.js");
    if (technologies.includes("WordPress")) cms.push("WordPress");
    if (technologies.includes("Shopify")) cms.push("Shopify");
    if (technologies.includes("Tailwind CSS")) cssFramework.push("Tailwind CSS");
    if (technologies.includes("Bootstrap")) cssFramework.push("Bootstrap");
    if (technologies.includes("Bulma")) cssFramework.push("Bulma");
    if (technologies.includes("Vite")) {
      frontend.push("Vite");
    }
    if (technologies.includes("Webpack")) {
      frontend.push("Webpack");
    }
    if (technologies.includes("Google Analytics")) analytics.push("Google Analytics");
    if (technologies.includes("Google Tag Manager")) analytics.push("Google Tag Manager");
    if (technologies.includes("Cloudflare")) cdn.push("Cloudflare");
    if (technologies.includes("Vercel")) cdn.push("Vercel");
    if (technologies.includes("Netlify")) cdn.push("Netlify");
    if (technologies.includes("Framer Motion")) animations.push("Framer Motion");
    if (technologies.includes("GSAP")) animations.push("GSAP");
    if (technologies.includes("Three.js")) animations.push("Three.js");
    if (technologies.includes("Cloudflare")) cloud.push("Cloudflare");
    if (technologies.includes("Vercel")) cloud.push("Vercel");
    if (technologies.includes("Netlify")) cloud.push("Netlify");
    if (technologies.includes("Vercel")) deployment.push("Vercel");
    if (technologies.includes("Netlify")) deployment.push("Netlify");
    if (technologies.includes("Cloudflare")) deployment.push("Cloudflare");
    if (technologies.includes("GitHub Pages")) deployment.push("GitHub Pages");

    // Categorize technologies
    const techCategories: Record<string, string[]> = {
      frontend: technologies.filter(t => ["React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js"].includes(t)),
      backend: [],
      cssFramework: technologies.filter(t => ["Tailwind CSS", "Bootstrap", "Bulma"].includes(t)),
      bundler: technologies.filter(t => ["Vite", "Webpack"].includes(t)),
      analytics: technologies.filter(t => ["Google Analytics", "Google Tag Manager", "Hotjar", "Microsoft Clarity", "Plausible"].includes(t)),
      cdn: technologies.filter(t => ["Cloudflare", "Vercel", "Netlify"].includes(t)),
      cms: technologies.filter(t => ["WordPress", "Shopify", "Webflow", "Ghost"].includes(t)),
      animations: technologies.filter(t => ["Framer Motion", "GSAP", "Three.js"].includes(t)),
    };

    const result: ScanResult = {
      domain,
      url: fullUrl,
      scanDate: new Date().toISOString(),
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      technologies,
      fonts,
      colors,
      serverHeaders: normalizedHeaders,
      ssl: sslInfo,
      httpVersion,
      webServer: serverHeader,
      geo: {
        ip,
        ...geoInfo,
        hosting: hosting || geoInfo.hosting,
      },
      dns: dnsRecords,
      whois: whoisData || undefined,
      darkTheme: htmlData.darkTheme,
      responsive: htmlData.responsive,
      hasViewport: htmlData.hasViewport,
      hasPwaManifest: htmlData.hasPwaManifest,
      metaRobots: htmlData.metaRobots,
      canonicalUrl: htmlData.canonicalUrl,
      ogTags: htmlData.ogTags,
      twitterTags: htmlData.twitterTags,
      structuredData: htmlData.structuredData,
      h1Tags: htmlData.h1Tags,
      internalLinks: htmlData.internalLinks,
      scriptsCount: htmlData.scriptsCount,
      stylesheetsCount: htmlData.stylesheetsCount,
      imagesCount: htmlData.imagesCount,
      imagesWithoutAlt: htmlData.imagesWithoutAlt,
      language: htmlData.language,
      frontend,
      backend,
      cms,
      databases: [],
      cssFramework,
      cssTech: [],
      bundler: technologies.filter(t => ["Vite", "Webpack", "Rollup", "Parcel"].includes(t)),
      uiLibrary: [],
      jsLibraries,
      analytics,
      cdn,
      animations,
      cloud,
      deployment,
      packageManager: [],
      monitoring: [],
      payments: [],
      auth: [],
      icons: htmlData.icons,
      fontMetrics: [],
      cssVariables: [],
      keywords: htmlData.keywords,
      author: htmlData.author,
      generator: htmlData.generator,
      headings: htmlData.headings,
      inlineScripts: htmlData.inlineScripts,
      ariaLabels: htmlData.ariaLabels,
      semanticTags: htmlData.semanticTags,
      favicon: htmlData.favicon,
      logo: undefined,
      images: [],
      techCategories,
      pageSizeBytes: Buffer.byteLength(html, 'utf8'),
      robotsTxt,
      sitemapXml,
      compression,
    };

    return result;
  } catch (error) {
    console.error("Scan error:", error);
    throw error;
  }
}
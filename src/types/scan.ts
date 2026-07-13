export interface CoreWebVitals {
  lcpSec: number; // Largest Contentful Paint (seconds)
  fidMs: number; // First Input Delay (milliseconds)
  cls: number; // Cumulative Layout Shift (0 to 1)
}

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface SecurityHeaders {
  csp: boolean;
  hsts: boolean;
  xFrameOptions: boolean;
  xssProtection: boolean;
  cors: boolean;
}

export interface CookieDetail {
  name: string;
  type: string;
  secure: boolean;
  httpOnly: boolean;
}

export interface CompanyInfo {
  companyName?: string;
  founders?: string[];
  ceo?: string;
  foundedYear?: number;
  hqLocation?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialMedia?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface TechnologyStack {
  frontend: string[];
  backend: string[];
  cms: string[];
  databases: string[];
  cssFramework: string[];
  cssTech?: string[];
  bundler?: string[];
  uiLibrary: string[];
  jsLibraries: string[];
  fonts: string[];
  icons: string[];
  analytics: string[];
  cdn: string[];
  animations?: string[];
  cloud?: string[];
  deployment?: string[];
  packageManager?: string[];
  monitoring?: string[];
  payments?: string[];
}

export interface ServerInfo {
  hosting: string;
  provider: string;
  serverName: string;
  ipAddress: string;
  dns: string[];
  cdn: string[];
  sslVersion: string;
  httpVersion: string;
  serverHeaders: Record<string, string>;
  serverLocation: string;
}

export interface SecurityAudit {
  httpsEnabled: boolean;
  sslStatus: string;
  sslIssuer: string;
  sslExpiry: string;
  securityHeaders: SecurityHeaders;
  cookiesCount: number;
  cookiesDetails: CookieDetail[];
  securityIssues: string[];
}

export interface PerformanceAudit {
  loadSpeedMs: number;
  pageSizeKb: number;
  requestsCount: number;
  coreWebVitals: CoreWebVitals;
  lighthouseScore: LighthouseScore;
  recommendations: string[];
}

export interface SeoAudit {
  metaTitle: string;
  metaDescription: string;
  openGraph: Record<string, string>;
  twitterCards: Record<string, string>;
  robotsTxtStatus: string;
  sitemapXmlStatus: string;
  canonicalUrl: string;
  structuredData: { type: string; detected: boolean }[];
  indexability: string;
}

export interface DesignColor {
  hex: string;
  role: string;
  rgb?: string;
  hsl?: string;
  tailwindName?: string;
  usage?: number;
}

export interface FontMetric {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
  source: string;
}

export interface CssVariable {
  name: string;
  value: string;
}

export interface DesignAudit {
  colorPalette: DesignColor[];
  fonts: string[];
  fontMetrics?: FontMetric[];
  icons: string[];
  cssVariables?: CssVariable[];
  lightDarkTheme: string;
  responsiveness: string;
  designStyle: string;
}

export interface SiteCapabilities {
  hasAuth: boolean;
  hasRegistration: boolean;
  hasLiveChat: boolean;
  hasSearch: boolean;
  hasPayments: boolean;
  hasApi: boolean;
  hasAiFeatures: boolean;
  hasPushNotifications: boolean;
  hasMultilingual: boolean;
  hasPwa: boolean;
  hasCookieBanner: boolean;
}

export interface GeneralScore {
  designScore: number;
  performanceScore: number;
  securityScore: number;
  seoScore: number;
  accessibilityScore: number;
  techModernityScore: number;
  uxScore: number;
  overallRating: number;
}

export interface AiAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface WebScanReport {
  id: string;
  url: string;
  scanDate: string;

  // 🌐 Primary Info
  title: string;
  description: string;
  purpose: string;
  topic: string;
  category: string;
  targetAudience: string;
  country: string;
  primaryLanguage: string;
  supportedLanguages: string[];
  domainCreationDate: string;
  domainAge: string;
  domainLastUpdated: string;

  // 🏢 Company Info
  company?: CompanyInfo;

  // 💻 Tech Stack
  technologies: TechnologyStack;

  // 🖥 Server Info
  server: ServerInfo;

  // 🔒 Security Audit
  security: SecurityAudit;

  // 🚀 Performance Audit
  performance: PerformanceAudit;

  // 🔍 SEO Audit
  seo: SeoAudit;

  // 🎨 Design Audit
  design: DesignAudit;

  // ⚙ Capabilities
  capabilities: SiteCapabilities;

  // 📊 Scores & AI Review
  scores: GeneralScore;
  aiAnalysis: AiAnalysis;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  scanDate: string;
  overallRating: number;
  primaryColor: string;
  category: string;
  isFavorite: boolean;
}

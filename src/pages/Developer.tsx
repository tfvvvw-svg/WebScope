import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Palette,
  Type,
  Code2,
  Boxes,
  BarChart3,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import type { WebScanReport } from "../types/scan";

type Tab =
  | "colors"
  | "typography"
  | "css"
  | "javascript"
  | "ui-libraries"
  | "icons"
  | "analytics"
  | "hosting"
  | "cms"
  | "images"
  | "accessibility";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "colors", label: "Colors", icon: <Palette className="w-4 h-4" /> },
  { id: "typography", label: "Typography", icon: <Type className="w-4 h-4" /> },
  { id: "css", label: "CSS", icon: <Code2 className="w-4 h-4" /> },
  {
    id: "javascript",
    label: "JavaScript",
    icon: <Boxes className="w-4 h-4" />,
  },
  {
    id: "ui-libraries",
    label: "UI Libraries",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { id: "icons", label: "Icons", icon: <ImageIcon className="w-4 h-4" /> },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  { id: "hosting", label: "Hosting", icon: <Shield className="w-4 h-4" /> },
  { id: "cms", label: "CMS", icon: <Code2 className="w-4 h-4" /> },
  { id: "images", label: "Images", icon: <ImageIcon className="w-4 h-4" /> },
  {
    id: "accessibility",
    label: "Accessibility",
    icon: <Shield className="w-4 h-4" />,
  },
];

export const Developer: React.FC = () => {
  const { currentReport } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("colors");

  if (!currentReport) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card variant="glass" className="p-12 text-center">
          <Code2 className="w-16 h-16 text-fuchsia-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No Analysis Data
          </h2>
          <p className="text-zinc-400">
            Scan a website first to view developer insights.
          </p>
        </Card>
      </div>
    );
  }

  const report = currentReport as WebScanReport & Record<string, any>;
  const raw = report._raw;

  const renderColors = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Color Palette</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {report.design?.colorPalette?.map((color: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center gap-2 p-3 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl hover:border-fuchsia-400/50 transition-all cursor-pointer group"
            >
              <div
                className="w-full aspect-square rounded-lg shadow-lg border border-fuchsia-500/15 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color.hex }}
              />
              <div className="text-center">
                <p className="text-xs font-bold text-white font-mono">
                  {color.hex}
                </p>
                <p className="text-[10px] text-zinc-500">{color.rgb}</p>
                <p className="text-[9px] text-fuchsia-400 mt-1">{color.role}</p>
              </div>
            </motion.div>
          )) || (
            <p className="text-zinc-500 col-span-full">No colors detected</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Font Families</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.design?.fonts?.length > 0 ? (
            report.design.fonts.map((font: string, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl"
              >
                <p className="text-sm text-zinc-400 mb-1">Font {idx + 1}</p>
                <p
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: font }}
                >
                  {font}
                </p>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 col-span-full">
              No custom fonts detected
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderCSS = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          CSS Frameworks & Technologies
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "Tailwind CSS",
            "Bootstrap",
            "Bulma",
            "Material UI",
            "Chakra UI",
            "Ant Design",
            "Styled Components",
            "Emotion",
            "SCSS",
            "LESS",
            "CSS Modules",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.cssFramework?.includes(tech) ||
              report.technologies?.cssTech?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderJavaScript = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          JavaScript Frameworks & Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "React",
            "Vue",
            "Angular",
            "Svelte",
            "Solid",
            "Next.js",
            "Nuxt",
            "Astro",
            "Vite",
            "Webpack",
            "Parcel",
            "Rollup",
            "Rspack",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.frontend?.includes(tech) ||
              report.technologies?.bundler?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderUILibraries = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          UI Libraries & Animation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "Framer Motion",
            "GSAP",
            "Swiper",
            "Three.js",
            "Lenis",
            "Locomotive Scroll",
            "Chart.js",
            "ECharts",
            "Recharts",
            "D3",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.animations?.includes(tech) ||
              report.technologies?.uiLibrary?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderIcons = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Icon Libraries</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "Lucide",
            "Font Awesome",
            "Heroicons",
            "Material Icons",
            "Bootstrap Icons",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.icons?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Analytics & Monitoring
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "Google Analytics",
            "Google Tag Manager",
            "Microsoft Clarity",
            "Hotjar",
            "Plausible",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.analytics?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderHosting = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Hosting & Deployment
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "Vercel",
            "Netlify",
            "Cloudflare",
            "GitHub Pages",
            "Firebase",
            "AWS",
            "Azure",
            "DigitalOcean",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.cloud?.includes(tech) ||
              report.technologies?.deployment?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCMS = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Content Management Systems
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            "WordPress",
            "Shopify",
            "Webflow",
            "Ghost",
            "Strapi",
            "Sanity",
            "Contentful",
          ].map((tech) => {
            const detected =
              raw?.technologies?.includes(tech) ||
              report.technologies?.cms?.includes(tech);
            return (
              <div
                key={tech}
                className={`p-3 rounded-xl border ${
                  detected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{tech}</p>
                {detected && (
                  <Badge variant="success" size="sm" className="mt-1">
                    Detected
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Image Formats & Optimization
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { name: "WebP", key: "webp" },
            { name: "PNG", key: "png" },
            { name: "JPEG", key: "jpg" },
            { name: "AVIF", key: "avif" },
            { name: "SVG", key: "svg" },
            { name: "GIF", key: "gif" },
            { name: "ICO", key: "ico" },
          ].map((format) => {
            const count = raw?.images?.[format.key] || 0;
            return (
              <div
                key={format.key}
                className={`p-3 rounded-xl border ${
                  count > 0
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-zinc-950/40 border-fuchsia-500/10 text-zinc-500"
                }`}
              >
                <p className="text-xs font-semibold">{format.name}</p>
                <p className="text-lg font-bold mt-1">{count}</p>
                <p className="text-[10px] text-zinc-400">images</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAccessibility = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Accessibility Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Images without alt</p>
            <p className="text-2xl font-bold text-white">
              {raw?.imagesWithoutAlt || 0}
            </p>
          </div>
          <div className="p-4 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">ARIA labels</p>
            <p className="text-2xl font-bold text-white">
              {raw?.ariaLabels || 0}
            </p>
          </div>
          <div className="p-4 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Semantic tags</p>
            <p className="text-2xl font-bold text-white">
              {raw?.semanticTags || 0}
            </p>
          </div>
          <div className="p-4 bg-zinc-950/40 border border-fuchsia-500/10 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Structured data</p>
            <p className="text-2xl font-bold text-white">
              {raw?.structuredData?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "colors":
        return renderColors();
      case "typography":
        return renderTypography();
      case "css":
        return renderCSS();
      case "javascript":
        return renderJavaScript();
      case "ui-libraries":
        return renderUILibraries();
      case "icons":
        return renderIcons();
      case "analytics":
        return renderAnalytics();
      case "hosting":
        return renderHosting();
      case "cms":
        return renderCMS();
      case "images":
        return renderImages();
      case "accessibility":
        return renderAccessibility();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" glow size="md">
            <Code2 className="w-3 h-3 mr-1" /> Developer
          </Badge>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          <span className="animate-gradient-text">Developer Insights</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Comprehensive frontend analysis: colors, fonts, frameworks, libraries,
          and more.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-fuchsia-500/20 border border-fuchsia-400 text-white"
                : "bg-zinc-950/40 border border-fuchsia-500/10 text-zinc-400 hover:text-white hover:border-fuchsia-400/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="glass">
          <CardContent className="p-6">{renderContent()}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Developer;

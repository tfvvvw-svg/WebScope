import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "ru" | "uz";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  // Navbar
  landing: {
    en: "Home",
    ru: "Главная",
    uz: "Bosh sahifa"
  },
  dashboard: {
    en: "Dashboard",
    ru: "Панель",
    uz: "Panel"
  },
  history: {
    en: "History",
    ru: "История",
    uz: "Tarix"
  },
  compare: {
    en: "Compare",
    ru: "Сравнение",
    uz: "Taqqoslash"
  },
  scansCached: {
    en: "Scans Cached",
    ru: "В кэше",
    uz: "Keshda"
  },
  demoUser: {
    en: "Demo User",
    ru: "Пользователь",
    uz: "Foydalanuvchi"
  },
  // Home Page
  badgeTitle: {
    en: "Core Analytics Dashboard",
    ru: "Панель веб-аналитики",
    uz: "Tahliliy Boshqaruv Paneli"
  },
  heroTitle: {
    en: "Deep Website Analytics & Tech Scan",
    ru: "Глубокая веб-аналитика и сканирование технологий",
    uz: "Chuqur Veb-Tahlil va Texnologik Skanerlash"
  },
  heroSub: {
    en: "Unlock the structural DNA of any domain. Inspect front-end libraries, backend frameworks, security headers, server geolocations, and CSS color styles in seconds.",
    ru: "Раскройте структурную ДНК любого сайта. Анализируйте библиотеки фронтенда, серверные технологии, заголовки безопасности, реальное расположение серверов и цвета за секунды.",
    uz: "Har qanday domennig tarkibiy DNK-sini bilib oling. Frontend kutubxonalari, backend texnologiyalari, xavfsizlik sarlavhalari, server joylashuvi va ranglarini soniyalarda tahlil qiling."
  },
  placeholder: {
    en: "Insert domain (e.g. google.com)",
    ru: "Введите домен (например, google.com)",
    uz: "Domenni kiriting (masalan, google.com)"
  },
  analyzeButton: {
    en: "Analyze Website",
    ru: "Анализировать сайт",
    uz: "Tahlil qilish"
  },
  tryScanning: {
    en: "Try scanning",
    ru: "Рекомендуем попробовать",
    uz: "Skanerlab ko'ring"
  },
  scanningTitle: {
    en: "Analyzing",
    ru: "Анализируем",
    uz: "Tahlil qilinmoqda"
  },
  completed: {
    en: "completed",
    ru: "выполнено",
    uz: "bajarildi"
  },
  featureTitle: {
    en: "Full-Spectrum Diagnostics",
    ru: "Полный спектр веб-диагностики",
    uz: "To'liq Spektrli Diagnostika"
  },
  featureSub: {
    en: "Everything you need to audit website performance, design systems, and software architectures",
    ru: "Все, что вам нужно для аудита производительности, дизайн-систем и архитектуры программного обеспечения сайта",
    uz: "Veb-sayt samaradorligi, dizayn tizimlari va dasturiy ta'minot arxitekturasini audit qilish uchun zarur bo'lgan barcha narsalar"
  },
  techTitle: {
    en: "Technology Stack Discovery",
    ru: "Анализ стека технологий",
    uz: "Texnologiyalar Stekini Aniqlash"
  },
  techDesc: {
    en: "Detect frontend framework variants (React, Vue), server engines (Node, Go), CSS components, CDNs, custom fonts, icons, and analytics trackers.",
    ru: "Определяйте фреймворки фронтенда (React, Vue), серверные технологии (Node, Go), CSS-модули, сети CDN, используемые шрифты, иконки и счетчики веб-аналитики.",
    uz: "Frontend freymvorklari (React, Vue), server texnologiyalari (Node, Go), CSS-komponentlar, CDN tarmoqlari, shriftlar, piktogrammalar va tahliliy trekerlarni aniqlang."
  },
  perfTitle: {
    en: "Performance & Core Web Vitals",
    ru: "Производительность и скорость работы",
    uz: "Samaradorlik va Tezlik Metriklari"
  },
  perfDesc: {
    en: "Get instant Lighthouse scores for performance, accessibility, SEO, and best practices. Real-time LCP, FID, and CLS layout shift metrics.",
    ru: "Получайте мгновенные оценки Lighthouse для производительности, доступности, SEO. Реальные показатели LCP, FID и сдвигов макета CLS.",
    uz: "Samaradorlik, qulaylik, SEO uchun tezkor Lighthouse ko'rsatkichlarini oling. Haqiqiy vaqtdagi LCP, FID va CLS siljish ko'rsatkichlari."
  },
  serverTitle: {
    en: "Server IP & Real Geolocation",
    ru: "Серверный IP и реальная геолокация",
    uz: "Server IP va Haqiqiy Geopozitsiya"
  },
  serverDesc: {
    en: "Fetch actual hosting providers, A-records, IP addresses, nameservers, SSL statuses, and exact server locations using DNS and GeoIP queries.",
    ru: "Получайте реальных хостинг-провайдеров, A-записи, IP-адреса, серверы имен (NS), статус SSL и физическое расположение серверов по GeoIP.",
    uz: "DNS va GeoIP so'rovlari yordamida haqiqiy xosting provayderlari, A-yozuvlar, IP-manzillar, nom serverlari, SSL holati va server joylashuvini oling."
  },
  // Audit/Dashboard details
  overallRating: {
    en: "Overall Audit Rating",
    ru: "Общий рейтинг аудита",
    uz: "Umumiy Audit Reytingi"
  },
  favorite: {
    en: "Favorite",
    ru: "В избранное",
    uz: "Sevimlilarga qo'shish"
  },
  unfavorite: {
    en: "Remove Favorite",
    ru: "Из избранного",
    uz: "Sevimlilardan o'chirish"
  },
  overviewTab: {
    en: "Primary Info",
    ru: "Основная информация",
    uz: "Asosiy Ma'lumotlar"
  },
  techTab: {
    en: "Tech Stack",
    ru: "Стек технологий",
    uz: "Texnologiya Steki"
  },
  perfTab: {
    en: "Speed/Performance",
    ru: "Скорость/Ресурсы",
    uz: "Tezlik/Samaradorlik"
  },
  secTab: {
    en: "Security Audit",
    ru: "Безопасность",
    uz: "Xavfsizlik Auditi"
  },
  designTab: {
    en: "Design Palette",
    ru: "Дизайн и палитра",
    uz: "Dizayn va Ranglar"
  },
  aiTab: {
    en: "AI Analysis",
    ru: "ИИ-Анализ",
    uz: "Sun'iy Intellekt Tahlili"
  },
  serverInfo: {
    en: "Server Details",
    ru: "Информация о сервере",
    uz: "Server Tafsilotlari"
  },
  companyInfo: {
    en: "Company & Founders",
    ru: "Организация и основатели",
    uz: "Kompaniya va Asoschilar"
  },
  ipAddress: {
    en: "IP Address",
    ru: "IP-адрес",
    uz: "IP Manzili"
  },
  serverLoc: {
    en: "Server Location",
    ru: "Локация сервера",
    uz: "Server Joylashuvi"
  },
  hosting: {
    en: "Hosting / ISP",
    ru: "Хостинг / Провайдер",
    uz: "Xosting / Provayder"
  },
  founders: {
    en: "Founders",
    ru: "Основатели",
    uz: "Asoschilar"
  },
  ceo: {
    en: "CEO",
    ru: "Генеральный директор",
    uz: "Bosh direktor (CEO)"
  },
  foundedYear: {
    en: "Founded Year",
    ru: "Год основания",
    uz: "Tashkil etilgan yili"
  },
  companyName: {
    en: "Company Name",
    ru: "Название организации",
    uz: "Kompaniya nomi"
  },
  notFound: {
    en: "Information not found in public HTML/DNS metadata",
    ru: "Информация не найдена в открытых HTML/DNS метаданных",
    uz: "Ochiq HTML/DNS ma'lumotlaridan topilmadi"
  },
  noReportTitle: {
    en: "No Domain Loaded",
    ru: "Домен не загружен",
    uz: "Domen yuklanmagan"
  },
  noReportDesc: {
    en: "You must enter a URL to execute a technical scan audit and inspect design color systems.",
    ru: "Вы должны ввести URL-адрес для выполнения технического аудита и исследования цветов дизайна.",
    uz: "Veb-saytni tahlil qilish uchun uning manzilini (URL) kiritishingiz lozim."
  },
  historyTitle: {
    en: "Audit Logs History",
    ru: "История аудитов сайтов",
    uz: "Auditlar Tarixi"
  },
  compareTitle: {
    en: "Compare Website Diagnostics",
    ru: "Сравнение сайтов",
    uz: "Saytlarni Solishtirish"
  },
  about: {
    en: "About",
    ru: "О сайте",
    uz: "Platforma haqida"
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "ru"; // default to Russian
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key]["en"];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

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
  capabilities: {
    en: "Capabilities",
    ru: "Возможности",
    uz: "Imkoniyatlar"
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
  // FAQ
  faqTitle: {
    en: "Frequently Asked Questions",
    ru: "Часто задаваемые вопросы",
    uz: "Ko'p beriladigan savollar"
  },
  faqSubtitle: {
    en: "Answers about our scanning architecture",
    ru: "Ответы о нашей архитектуре сканирования",
    uz: "Skanerlar arxitekturasi haqida javoblar"
  },
  howItWorks: {
    en: "Process",
    ru: "Процесс",
    uz: "Jarayon"
  },
  stepsTitle: {
    en: "Audit in",
    ru: "Аудит за",
    uz: "Audit"
  },
  stepsSubtitle: {
    en: "3 simple steps",
    ru: "3 простых шага",
    uz: "3 oddiy qadam"
  },
  step1Title: {
    en: "Enter domain",
    ru: "Введите домен",
    uz: "Domenni kiriting"
  },
  step1Desc: {
    en: "Specify the URL of any public site. Subdomains and non-standard ports are supported.",
    ru: "Укажите URL любого публичного сайта. Поддерживаются поддомены и нестандартные порты.",
    uz: "Istalgan ochiq saytning URL manzilini kiriting. Subdomenlar va standart bo'lmagan portlar qo'llab-quvvatlanadi."
  },
  step2Title: {
    en: "AI Audit",
    ru: "AI-аудит",
    uz: "AI-audit"
  },
  step2Desc: {
    en: "Our engine analyzes over 120 parameters: stack, design, speed, security.",
    ru: "Наш движок анализирует более 120 параметров: стек, дизайн, скорость, безопасность.",
    uz: "Bizning dvigatel 120 dan ortiq parametrlarni tahlil qiladi: stek, dizayn, tezlik, xavfsizlik."
  },
  step3Title: {
    en: "Ready report",
    ru: "Готовый отчёт",
    uz: "Tayyor hisobot"
  },
  step3Desc: {
    en: "Get a detailed PDF-ready report with optimization recommendations.",
    ru: "Получите детальный PDF-ready отчёт с рекомендациями по оптимизации.",
    uz: "Optimizatsiya bo'yicha tavsiyalar bilan batafsil PDF-ready hisobot oling."
  },
  pricingTitle: {
    en: "Choose",
    ru: "Выберите",
    uz: "Tanlang"
  },
  pricingSubtitle: {
    en: "your plan",
    ru: "свой план",
    uz: "o'zingizning rejangizni"
  },
  pricingDesc: {
    en: "From free audit to enterprise SaaS solutions",
    ru: "От бесплатного аудита до корпоративных SaaS-решений",
    uz: "Bepul audittan korporativ SaaS yechimlarigacha"
  },
  starter: {
    en: "Starter",
    ru: "Starter",
    uz: "Starter"
  },
  pro: {
    en: "Pro",
    ru: "Pro",
    uz: "Pro"
  },
  enterprise: {
    en: "Enterprise",
    ru: "Enterprise",
    uz: "Enterprise"
  },
  popular: {
    en: "Popular",
    ru: "Популярный",
    uz: "Mashhur"
  },
  forever: {
    en: "forever",
    ru: "навсегда",
    uz: "abadiy"
  },
  perMonth: {
    en: "/ month",
    ru: "/ месяц",
    uz: "/ oy"
  },
  startFree: {
    en: "Start for free",
    ru: "Начать бесплатно",
    uz: "Bepul boshlash"
  },
  upgradePro: {
    en: "Upgrade to Pro",
    ru: "Upgrade to Pro",
    uz: "Pro versiyasiga o'tish"
  },
  contactSales: {
    en: "Contact Sales",
    ru: "Contact Sales",
    uz: "Sotuvlar bilan bog'lanish"
  },
  auditIn2Sec: {
    en: "Audit in 2 sec",
    ru: "Аудит за 2 сек",
    uz: "2 sekundda audit"
  },
  noRegistration: {
    en: "No registration",
    ru: "Без регистрации",
    uz: "Ro'yxatdan o'tmasdan"
  },
  aiPowered: {
    en: "AI-powered",
    ru: "AI-powered",
    uz: "AI asosida"
  },
  readyToSee: {
    en: "Ready to see",
    ru: "Готовы увидеть",
    uz: "Ko'rishga tayyormisiz"
  },
  hiddenDna: {
    en: "the hidden DNA",
    ru: "скрытую ДНК",
    uz: "yashirin DNK"
  },
  ofYourSite: {
    en: "of your site?",
    ru: "вашего сайта?",
    uz: "saytingizning?"
  },
  launchAudit: {
    en: "Launch audit",
    ru: "Запустить аудит",
    uz: "Auditni boshlash"
  },
  noEmailNoReg: {
    en: "No registration, no email, instant result.",
    ru: "Без регистрации, без email, мгновенный результат.",
    uz: "Ro'yxatdan o'tish, email yoki kutish talab qilinmaydi."
  },
  learnMore: {
    en: "Learn more",
    ru: "Подробнее",
    uz: "Batafsil"
  },
  // Error messages
  enterUrl: {
    en: "Please enter the site URL",
    ru: "Пожалуйста, введите URL сайта",
    uz: "Iltimos, sayt URL manzilini kiriting"
  },
  invalidUrl: {
    en: "Invalid URL format (e.g. vercel.com or https://google.com)",
    ru: "Неверный формат URL (например, vercel.com или https://google.com)",
    uz: "Noto'g'ri URL formati (masalan, vercel.com yoki https://google.com)"
  },
  scanFailed: {
    en: "Failed to scan the site. Please try again.",
    ru: "Не удалось просканировать сайт. Попробуйте снова.",
    uz: "Saytni skanerlash muvaffaqiyatsiz tugadi. Qayta urinib ko'ring."
  },
  // Scan steps
  scanStep1: {
    en: "Connecting to remote socket...",
    ru: "Подключение к удалённому сокету...",
    uz: "Masofaviy soketga ulanish..."
  },
  scanStep2: {
    en: "Performing DNS lookup & IP registration...",
    ru: "Выполнение DNS-запроса и регистрация IP...",
    uz: "DNS so'rovi va IP ro'yxatdan o'tkazish..."
  },
  scanStep3: {
    en: "Fetching HTTP response headers...",
    ru: "Получение заголовков HTTP-ответа...",
    uz: "HTTP javob sarlavhalarini olish..."
  },
  scanStep4: {
    en: "Parsing DOM content & SEO meta tags...",
    ru: "Парсинг DOM-контента и SEO-мета-тегов...",
    uz: "DOM kontent va SEO meta-teglarini tahlil qilish..."
  },
  scanStep5: {
    en: "Detecting JS frameworks & libraries...",
    ru: "Определение JS-фреймворков и библиотек...",
    uz: "JS freymvorklari va kutubxonalarini aniqlash..."
  },
  scanStep6: {
    en: "Analyzing security configurations (SSL & CSP)...",
    ru: "Анализ конфигураций безопасности (SSL и CSP)...",
    uz: "Xavfsizlik konfiguratsiyalarini tahlil qilish (SSL va CSP)..."
  },
  scanStep7: {
    en: "Extracting color system & font-families...",
    ru: "Извлечение цветовой системы и шрифтов...",
    uz: "Rang tizimi va shriftlarni ajratib olish..."
  },
  scanStep8: {
    en: "Generating performance audit (Lighthouse metrics)...",
    ru: "Генерация аудита производительности (метрики Lighthouse)...",
    uz: "Ishlash samaradorligi auditini yaratish (Lighthouse metrikalari)..."
  },
  scanStep9: {
    en: "Invoking AI analysis engine...",
    ru: "Запуск движка AI-анализа...",
    uz: "AI tahlil dvigatelini ishga tushirish..."
  },
  scanStep10: {
    en: "Finalizing diagnostic report...",
    ru: "Завершение диагностического отчёта...",
    uz: "Diagnostik hisobotni yakunlash..."
  },
  // FAQ
  faq1Question: {
    en: "How does the scanner work?",
    ru: "Как работает сканер?",
    uz: "Skaner qanday ishlaydi?"
  },
  faq1Answer: {
    en: "The scanner loads the site through a CORS proxy, parses HTML, extracts meta tags, technologies, colors, fonts, and analyzes security.",
    ru: "Сканер загружает сайт через CORS-прокси, парсит HTML, извлекает мета-теги, технологии, цвета, шрифты и анализирует безопасность.",
    uz: "Skaner CORS proksi orqali saytni yuklaydi, HTML-ni tahlil qiladi, meta-teglarni, texnologiyalarni, ranglar va shriftlarni ajratib oladi va xavfsizlikni tahlil qiladi."
  },
  faq2Question: {
    en: "Is it safe to use?",
    ru: "Безопасно ли использовать?",
    uz: "Foydalanish xavfsizmi?"
  },
  faq2Answer: {
    en: "Yes, all data is stored locally in your browser. We do not send data to third-party servers.",
    ru: "Да, все данные хранятся локально в вашем браузере. Мы не отправляем данные на сторонние серверы.",
    uz: "Ha, barcha ma'lumotlar brauzeringizda mahalliy saqlanadi. Biz uchinchi tomon serverlariga ma'lumot yubormaymiz."
  },
  faq3Question: {
    en: "What technologies are detected?",
    ru: "Какие технологии определяются?",
    uz: "Qanday texnologiyalar aniqlanadi?"
  },
  faq3Answer: {
    en: "Over 120 technologies: React, Vue, Angular, Next.js, Tailwind CSS, WordPress, Shopify, Cloudflare and many others.",
    ru: "Более 120 технологий: React, Vue, Angular, Next.js, Tailwind CSS, WordPress, Shopify, Cloudflare и многие другие.",
    uz: "120 dan ortiq texnologiyalar: React, Vue, Angular, Next.js, Tailwind CSS, WordPress, Shopify, Cloudflare va boshqalar."
  },
  // Stats
  auditsConducted: {
    en: "Audits conducted",
    ru: "Аудитов проведено",
    uz: "O'tkazilgan auditlar"
  },
  scannerUptime: {
    en: "Scanner uptime",
    ru: "Uptime сканера",
    uz: "Skaner ishlash vaqti"
  },
  techInDatabase: {
    en: "Technologies in database",
    ru: "Технологий в базе",
    uz: "Bazadagi texnologiyalar"
  },
  responseTime: {
    en: "Response time",
    ru: "Время ответа",
    uz: "Javob vaqti"
  },
  inSimpleSteps: {
    en: "in 3 simple steps",
    ru: "за 3 простых шага",
    uz: "3 oddiy qadamda"
  },
  forPersonalProjects: {
    en: "Ideal for personal projects and learning",
    ru: "Идеально для личных проектов и обучения",
    uz: "Shaxsiy loyihalar va o'rgatish uchun ideal"
  },
  forQATeams: {
    en: "For QA teams, designers and SEO specialists",
    ru: "Для QA-команд, дизайнеров и SEO-специалистов",
    uz: "QA jamoalari, dizaynerlar va SEO mutaxassislari uchun"
  },
  forAgencies: {
    en: "For agencies and web studios",
    ru: "Для агентств и веб-студий",
    uz: "Agentliklar va veb-studiylar uchun"
  },
  unlimitedScans: {
    en: "Unlimited scans",
    ru: "Безлимитные сканирования",
    uz: "Cheksiz skanerlash"
  },
  fullComparisonCharts: {
    en: "Full comparison charts",
    ru: "Полные графики сравнения",
    uz: "To'liq taqqoslash grafiklari"
  },
  detailedDesignPalettes: {
    en: "Detailed design palettes",
    ru: "Детальные дизайн-палитры",
    uz: "Batafsil dizayn palitralari"
  },
  pdfExport: {
    en: "PDF export of reports",
    ru: "PDF-экспорт отчётов",
    uz: "Hisobotlarni PDF eksport qilish"
  },
  prioritySupport: {
    en: "Priority support",
    ru: "Приоритетная поддержка",
    uz: "Ustuvor qo'llab-quvvatlash"
  },
  highFrequencyCrawler: {
    en: "High-frequency crawler API",
    ru: "High-frequency crawler API",
    uz: "Yuqori chastotali crawler API"
  },
  webhookIntegrations: {
    en: "Webhook integrations",
    ru: "Webhook-интеграции",
    uz: "Webhook integratsiyalar"
  },
  teamWorkspaces: {
    en: "Team workspaces",
    ru: "Командные workspace-ы",
    uz: "Jamoa ish maydonlari"
  },
  support247: {
    en: "24/7 SLA support",
    ru: "SLA-поддержка 24/7",
    uz: "24/7 SLA qo'llab-quvvatlash"
  },
  customReports: {
    en: "Custom reports",
    ru: "Кастомные отчёты",
    uz: "Maxsus hisobotlar"
  },
  fiveScansPerDay: {
    en: "5 scans per day",
    ru: "5 сканирований в день",
    uz: "Kuniga 5 ta skanerlash"
  },
  basicStackAssessment: {
    en: "Basic stack assessment",
    ru: "Базовая оценка стека",
    uz: "Asosiy stek baholash"
  },
  historyUpTo10: {
    en: "History up to 10 records",
    ru: "История до 10 записей",
    uz: "10 tagacha yozuvlar tarixi"
  },
  basicDesignAudit: {
    en: "Basic design audit",
    ru: "Базовый дизайн-аудит",
    uz: "Asosiy dizayn audit"
  },
  // Dashboard
  dashboardTitle: {
    en: "Workspace Dashboard",
    ru: "Рабочая панель",
    uz: "Ish paneli"
  },
  dashboardSubtitle: {
    en: "Monitoring audits, comparing performance profiles and analyzing technology stacks",
    ru: "Мониторинг аудитов, сравнение профилей производительности и анализ технологических стеков",
    uz: "Auditlarni monitoring qilish, ishlash profillarini taqqoslash va texnologiya steklarini tahlil qilish"
  },
  newScan: {
    en: "New scan",
    ru: "Новое сканирование",
    uz: "Yangi skanerlash"
  },
  totalAudits: {
    en: "Total audits",
    ru: "Всего аудитов",
    uz: "Jami auditlar"
  },
  averageRating: {
    en: "Average rating",
    ru: "Средний рейтинг",
    uz: "O'rtacha reyting"
  },
  favorites: {
    en: "Favorites",
    ru: "Избранное",
    uz: "Sevimlilar"
  },
  topScan: {
    en: "Top scan",
    ru: "Топ-скан",
    uz: "Eng yaxshi skan"
  },
  auditHistory: {
    en: "Audit History",
    ru: "История аудитов",
    uz: "Auditlar tarixi"
  },
  auditHistorySubtitle: {
    en: "All your scans are stored locally in your browser",
    ru: "Все ваши сканирования хранятся локально в браузере",
    uz: "Barcha skanerlashlar brauzeringizda mahalliy saqlanadi"
  },
  searchPlaceholder: {
    en: "Search by domain, name, category...",
    ru: "Поиск по домену, названию, категории...",
    uz: "Domen, nom, kategoriya bo'yicha qidirish..."
  },
  noAuditsFound: {
    en: "No audits found",
    ru: "Аудиты не найдены",
    uz: "Auditlar topilmadi"
  },
  noAuditsSubtitle: {
    en: "Start a new scan from the home page to see results here",
    ru: "Запустите новое сканирование с главной страницы, чтобы увидеть результаты здесь",
    uz: "Natijalarni bu yerda ko'rish uchun bosh sahifadan yangi skanerlashni boshlang"
  },
  startScanning: {
    en: "Start scanning",
    ru: "Начать сканирование",
    uz: "Skanerlashni boshlash"
  },
  domain: {
    en: "Domain",
    ru: "Домен",
    uz: "Domen"
  },
  category: {
    en: "Category",
    ru: "Категория",
    uz: "Kategoriya"
  },
  rating: {
    en: "Rating",
    ru: "Рейтинг",
    uz: "Reyting"
  },
  date: {
    en: "Date",
    ru: "Дата",
    uz: "Sana"
  },
  actions: {
    en: "Actions",
    ru: "Действия",
    uz: "Amallar"
  },
  // Compare page
  comparison: {
    en: "Comparison",
    ru: "Сравнение",
    uz: "Solishtirish"
  },
  domainComparisonMatrix: {
    en: "Domain Comparison Matrix",
    ru: "Матрица сравнения доменов",
    uz: "Domenlarni solishtirish matritsa"
  },
  comparisonSubtitle: {
    en: "Compare technical parameters, design palettes and performance indicators",
    ru: "Сравните технические параметры, дизайн-палитры и индикаторы производительности",
    uz: "Texnik parametrlar, dizayn palitralari va ishlash indikatorlarini taqqoslang"
  },
  clearSlots: {
    en: "Clear slots",
    ru: "Очистить слоты",
    uz: "Slotlarni tozalash"
  },
  slot: {
    en: "Slot",
    ru: "Слот",
    uz: "Slot"
  },
  selectScannedDomain: {
    en: "Select a scanned domain",
    ru: "Выберите просканированный домен",
    uz: "Skanerlangan domenni tanlang"
  },
  fromCachedScans: {
    en: "from cached scans",
    ru: "из кэшированных веб-сканов",
    uz: "keshdan olingan skanerlashlardan"
  },
  selectDomain: {
    en: "Select domain",
    ru: "Выбрать домен",
    uz: "Domenni tanlash"
  },
  cacheEmpty: {
    en: "Cache is empty. Perform a scan first.",
    ru: "Кэш пуст. Сначала выполните сканирование.",
    uz: "Kesh bo'sh. Avval skanerlashni bajaring."
  },
  auditLeader: {
    en: "Audit Leader",
    ru: "Лидер аудита",
    uz: "Audit yetakchisi"
  },
  hasTechnicalAdvantage: {
    en: "has technical advantage",
    ru: "имеет техническое преимущество",
    uz: "texnik ustunlikka ega"
  },
  selectTwoDomains: {
    en: "Select two domains to compare",
    ru: "Выберите два домена для сравнения",
    uz: "Solishtirish uchun ikkita domen tanlang"
  },
  comparisonSubtitle2: {
    en: "Load domains into both slots to see detailed comparison across 7 metrics",
    ru: "Загрузите домены в оба слота, чтобы увидеть детальное сравнение по 7 метрикам",
    uz: "7 metrika bo'yicha batafsil taqqoslashni ko'rish uchun domenlarni ikkala slotga yuklang"
  },
  slot1: {
    en: "Slot 1",
    ru: "Слот 1",
    uz: "Slot 1"
  },
  slot2: {
    en: "Slot 2",
    ru: "Слот 2",
    uz: "Slot 2"
  },
  close: {
    en: "Close",
    ru: "Закрыть",
    uz: "Yopish"
  },
  draw: {
    en: "Draw",
    ru: "Ничья",
    uz: "Durrang"
  },
  // Score labels
  designScore: {
    en: "Design",
    ru: "Дизайн",
    uz: "Dizayn"
  },
  performanceScore: {
    en: "Performance",
    ru: "Производительность",
    uz: "Samaradorlik"
  },
  securityScore: {
    en: "Security",
    ru: "Безопасность",
    uz: "Xavfsizlik"
  },
  seoScore: {
    en: "SEO",
    ru: "SEO",
    uz: "SEO"
  },
  accessibilityScore: {
    en: "Accessibility",
    ru: "Доступность",
    uz: "Qulaylik"
  },
  techModernityScore: {
    en: "Stack Modernity",
    ru: "Современность стека",
    uz: "Stek zamonaviyligi"
  },
  uxScore: {
    en: "UX",
    ru: "UX",
    uz: "UX"
  },
  // Developer page
  developerTitle: {
    en: "Developer Insights",
    ru: "Для разработчиков",
    uz: "Dasturchi uchun"
  },
  developerSubtitle: {
    en: "Comprehensive frontend analysis: colors, fonts, frameworks, libraries, and more.",
    ru: "Полный фронтенд анализ: цвета, шрифты, фреймворки, библиотеки и другое.",
    uz: "Batafsli frontend tahlil: ranglar, shriftlar, freymvorklar, kutubxonalar va boshqalar."
  },
  // History page
  historyTitle: {
    en: "Scan History",
    ru: "История сканирований",
    uz: "Skanerlash tarixi"
  },
  historySubtitle: {
    en: "All your scans are stored locally in your browser",
    ru: "Все сканирования сохраняются локально в браузере",
    uz: "Barcha skanerlashlar brauzerda mahalliy saqlanadi"
  },
  recordsCount: {
    en: "records",
    ru: "записей",
    uz: "yozuvlar"
  },
  categoryFilter: {
    en: "Category",
    ru: "Категория",
    uz: "Kategoriya"
  },
  ratingFilter: {
    en: "Rating",
    ru: "Рейтинг",
    uz: "Reyting"
  },
  all: {
    en: "All",
    ru: "Все",
    uz: "Barchasi"
  },
  excellent: {
    en: "Excellent",
    ru: "Отлично",
    uz: "A'lo"
  },
  good: {
    en: "Good",
    ru: "Хорошо",
    uz: "Yaxshi"
  },
  warnings: {
    en: "Warnings",
    ru: "Предупреждения",
    uz: "Ogohlantirishlar"
  },
  historyEmpty: {
    en: "No scans in history",
    ru: "Нет сканирований в истории",
    uz: "Tarixda skanerlash yo'q"
  },
  historyEmptySubtitle: {
    en: "Start a new scan to see results here",
    ru: "Начните новое сканирование, чтобы увидеть результаты здесь",
    uz: "Natijalarni bu yerda ko'rish uchun yangi skanerlashni boshlang"
  },
  scanNewSite: {
    en: "Scan a new site",
    ru: "Сканировать новый сайт",
    uz: "Yangi sayt skanerlash"
  },
  title: {
    en: "Title",
    ru: "Заголовок",
    uz: "Sarlavha"
  },
  inFavorites: {
    en: "In favorites",
    ru: "В избранном",
    uz: "Sevimlilar ichida"
  },
  addToFavorites: {
    en: "Add to favorites",
    ru: "Добавить в избранное",
    uz: "Sevimlilarga qo'shish"
  },
  open: {
    en: "Open",
    ru: "Открыть",
    uz: "Ochish"
  },
  delete: {
    en: "Delete",
    ru: "Удалить",
    uz: "O'chirish"
  },
  // Footer
  footerText: {
    en: "WebScope - Advanced website analytics platform",
    ru: "WebScope - Платформа для продвинутой веб-аналитики",
    uz: "WebScope - Web-sayt tahlil platformasi"
  },
  // Empty states
  notAvailable: {
    en: "Not available",
    ru: "Недоступно",
    uz: "Mavjud emas"
  },
  noData: {
    en: "No data",
    ru: "Нет данных",
    uz: "Ma'lumot yo'q"
  }
};

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}>({
  language: "en",
  setLanguage: () => {},
  t: () => ""
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const entry = translations[key as keyof typeof translations];
    if (!entry) return key;
    return entry[language] || entry.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
import type { WebScanReport } from "../types/scan";

export interface AiMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  sections?: AiSection[];
  streaming?: boolean;
  isComplete?: boolean;
}

export interface AiSection {
  title: string;
  facts: string[];
  explanation: string;
  technical: string;
  recommendations: string[];
}

type ExpertMode = "general" | "fullstack" | "uiux" | "seo" | "security";

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function containsAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

function unique(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function getSslDescription(valid: boolean): string {
  return valid
    ? "✅ Сертификат безопасности действителен. HTTPS работает корректно."
    : "❌ Сертификат отсутствует или недействителен.";
}

function getExpertMode(question: string): ExpertMode {
  const q = normalize(question);

  if (
    containsAny(q, [
      "seo",
      "поисков",
      "ранжир",
      "canonical",
      "robots",
      "sitemap",
    ])
  ) {
    return "seo";
  }

  if (
    containsAny(q, [
      "security",
      "безопас",
      "ssl",
      "https",
      "csp",
      "cookie",
      "auth",
      "xss",
      "csrf",
    ])
  ) {
    return "security";
  }

  if (
    containsAny(q, [
      "design",
      "дизайн",
      "ui",
      "ux",
      "color",
      "цвет",
      "font",
      "шрифт",
      "interface",
      "интерфейс",
    ])
  ) {
    return "uiux";
  }

  if (
    containsAny(q, [
      "html",
      "css",
      "javascript",
      "typescript",
      "react",
      "next",
      "node",
      "vite",
      "tailwind",
      "sql",
      "код",
      "помоги написать",
      "исправь",
      "объясни",
    ])
  ) {
    return "fullstack";
  }

  return "general";
}

function buildConversationContext(history: AiMessage[]): string {
  const relevantMessages = history.slice(-6);
  const lastUser = [...relevantMessages]
    .reverse()
    .find((item) => item.role === "user")?.text;
  const lastAssistant = [...relevantMessages]
    .reverse()
    .find((item) => item.role === "assistant")?.text;

  if (!lastUser && !lastAssistant) {
    return "";
  }

  const summary = [
    lastUser ? `Последний пользовательский вопрос: ${lastUser}` : "",
    lastAssistant ? `Предыдущий ответ: ${lastAssistant.slice(0, 220)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return summary;
}

function buildSiteContextSummary(report: WebScanReport): string {
  const frontend = unique(report.technologies?.frontend || []);
  const backend = unique(report.technologies?.backend || []);
  const cssFramework = unique(report.technologies?.cssFramework || []);
  const jsLibraries = unique(report.technologies?.jsLibraries || []);
  const analytics = unique(report.technologies?.analytics || []);
  const fonts = unique(report.design?.fonts || []);
  const colors =
    report.design?.colorPalette?.slice(0, 5).map((entry) => entry.hex) || [];

  return [
    `Технологии: ${[...frontend, ...backend, ...cssFramework, ...jsLibraries].slice(0, 12).join(", ") || "не удалось подтвердить"}`,
    `SEO: title=${report.seo?.metaTitle ? "есть" : "нет"}; description=${report.seo?.metaDescription ? "есть" : "нет"}; canonical=${report.seo?.canonicalUrl ? "есть" : "нет"}`,
    `Безопасность: HTTPS=${report.security?.httpsEnabled ? "включён" : "отключён"}; issues=${report.security?.securityIssues?.length || 0}`,
    `Производительность: pageSize=${report.performance?.pageSizeKb || 0}KB; requests=${report.performance?.requestsCount || 0}; lighthouse=${report.performance?.lighthouseScore?.performance || 0}/100`,
    `Дизайн: цвета=${colors.join(", ") || "не подтверждены"}; шрифты=${fonts.join(", ") || "не подтверждены"}`,
    `Analytics: ${analytics.join(", ") || "не подтверждены"}`,
  ].join("\n");
}

function buildGeneralAssistantReply(
  question: string,
  history: AiMessage[],
): { text: string; sections: AiSection[] } {
  const q = normalize(question);
  const mode = getExpertMode(q);
  const memory = buildConversationContext(history);
  const expertLabel =
    mode === "seo"
      ? "SEO Engineer"
      : mode === "security"
        ? "Security Engineer"
        : mode === "uiux"
          ? "Senior UI/UX Designer"
          : mode === "fullstack"
            ? "Senior Full Stack Developer"
            : "Universal Assistant";

  const intro = `## ${expertLabel}\n\nЯ могу помогать в режиме живого диалога, а не только по отчёту.\n\n${memory ? `> Контекст текущей сессии: ${memory}` : ""}`;

  if (containsAny(q, ["привет", "hello", "hi"])) {
    return {
      text: `${intro}\n\nПривет! Я WebScope AI — встроенный помощник для веб-разработки, SEO, безопасности, дизайна и кодинга. Чем могу помочь прямо сейчас?`,
      sections: [
        {
          title: "Общий режим",
          facts: [
            "Live assistant",
            "Память сессии enabled",
            "Поддержка веб-разработки и дизайна",
          ],
          explanation:
            "AI работает как универсальный помощник и может отвечать без предварительного анализа сайта.",
          technical: "Режим: общение, экспертная поддержка, кодирование.",
          recommendations: [
            "Задайте любой вопрос о WebScope, коде, SEO, дизайне или безопасности.",
          ],
        },
      ],
    };
  }

  if (
    containsAny(q, [
      "html",
      "css",
      "javascript",
      "typescript",
      "react",
      "next",
      "node",
      "vite",
      "tailwind",
      "sql",
    ])
  ) {
    const snippetLanguage = q.includes("html")
      ? "html"
      : q.includes("css")
        ? "css"
        : q.includes("typescript") || q.includes("ts")
          ? "typescript"
          : q.includes("react") || q.includes("next")
            ? "tsx"
            : q.includes("sql")
              ? "sql"
              : q.includes("node")
                ? "javascript"
                : "javascript";

    const snippet =
      snippetLanguage === "html"
        ? `<section class="card">\n  <h1>WebScope UI</h1>\n  <p>Современная, чистая и концентрированная структура.</p>\n</section>`
        : snippetLanguage === "css"
          ? `.card {\n  border-radius: 18px;\n  background: linear-gradient(135deg, #0f172a, #1f2937);\n  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.25);\n}`
          : snippetLanguage === "typescript"
            ? `type SiteAudit = {\n  title: string;\n  score: number;\n};\n\nconst audit: SiteAudit = { title: "WebScope", score: 92 };`
            : snippetLanguage === "tsx"
              ? `export function AuditCard() {\n  return <div className="glass-card">WebScope</div>;\n}`
              : snippetLanguage === "sql"
                ? `SELECT title, score FROM audits ORDER BY score DESC LIMIT 5;`
                : `const auditSite = async (url: string) => {\n  console.log("Scanning", url);\n  return { ok: true };\n};`;

    return {
      text: `${intro}\n\n## Пример решения\n\n\`\`\`${snippetLanguage}\n${snippet}\n\`\`\`\n\n### Что важно\n- делайте структуру читаемой;\n- используйте реальные данные;\n- проверяйте доступность и безопасность;\n- не добавляйте абстракции без необходимости.`,
      sections: [
        {
          title: "Кодинг",
          facts: ["Поддержка HTML/CSS/JS/TS/React/Node/Vite/Tailwind/SQL"],
          explanation:
            "AI помогает писать и объяснять код в реальном контексте веб-проекта.",
          technical: "Режим: code generation + review.",
          recommendations: [
            "Опишите задачу и я подготовлю готовый рабочий фрагмент.",
          ],
        },
      ],
    };
  }

  if (
    containsAny(q, ["как работает dns", "dns", "ssl", "https", "certificate"])
  ) {
    return {
      text: `${intro}\n\n## ${mode === "security" ? "Security" : "Networking"}\n\nDNS переводит доменное имя в IP-адрес. HTTPS и SSL защищают соединение, шифруют трафик и подтверждают подлинность сертификата.\n\n### На практике\n- DNS нужен для маршрутизации домена;\n- SSL нужен для шифрования и доверия пользователя;\n- при проблемах сначала проверяйте DNS, затем сертификат, затем заголовки безопасности.`,
      sections: [
        {
          title: "Networking",
          facts: ["DNS", "SSL", "HTTPS"],
          explanation:
            "Основные сетевые и безопасностные абстракции объясняются простым языком.",
          technical: "Пример: DNS → IP → TLS → безопасный обмен.",
          recommendations: [
            "Если хотите, могу показать схему работы DNS/HTTPS на конкретном кейсе.",
          ],
        },
      ],
    };
  }

  return {
    text: `${intro}\n\n## Ответ\n\nЯ готов помогать как универсальный помощник: объяснять концепции, писать код, предлагать архитектуру, помогать с SEO, безопасностью и интерфейсом.\n\n### Что я могу сделать прямо сейчас\n- объяснить технологию;\n- написать фрагмент HTML/CSS/JS/TS;\n- подсказать улучшения UX/SEO/безопасности;\n- помочь с отладкой и рефакторингом.`,
    sections: [
      {
        title: "Общее общение",
        facts: ["Приветствия", "Дизайн", "SEO", "Безопасность", "Кодинг"],
        explanation:
          "В обычном режиме AI работает как интеллектуальный ассистент без привязки к конкретному сайту.",
        technical:
          "Контекст: текущая сессия, общая экспертная логика и кодовая помощь.",
        recommendations: [
          "Сформулируйте задачу чётко — и я дам ответ в нужном формате.",
        ],
      },
    ],
  };
}

function buildSiteAnalysisReply(
  question: string,
  report: WebScanReport,
  history: AiMessage[],
): { text: string; sections: AiSection[] } {
  const q = normalize(question);
  const memory = buildConversationContext(history);
  const issues = report.security?.securityIssues || [];
  const scoreDescription =
    report.scores?.overallRating >= 85
      ? "сильный"
      : report.scores?.overallRating >= 70
        ? "средний"
        : "требует улучшений";

  const siteContext = buildSiteContextSummary(report);

  const sections: AiSection[] = [];

  const addSection = (
    title: string,
    facts: string[],
    explanation: string,
    technical: string,
    recommendations: string[] = [],
  ) => {
    sections.push({ title, facts, explanation, technical, recommendations });
  };

  if (containsAny(q, ["технологи", "стек", "библиотек", "framework"])) {
    addSection(
      "Технологии сайта",
      [
        `Frontend: ${(report.technologies?.frontend || []).join(", ") || "не подтвержден"}`,
        `Backend: ${(report.technologies?.backend || []).join(", ") || "не подтвержден"}`,
        `CSS framework: ${(report.technologies?.cssFramework || []).join(", ") || "не подтвержден"}`,
        `JS libraries: ${(report.technologies?.jsLibraries || []).slice(0, 5).join(", ") || "не подтверждены"}`,
        `CMS: ${(report.technologies?.cms || []).join(", ") || "не подтвержден"}`,
      ],
      "Технологический стек собирается только из данных сканирования текущего отчёта.",
      `Подтверждённый стек: ${siteContext.split("\n")[0].replace("Технологии: ", "")}.`,
      ["Сравните стек с современными безопасными версиями зависимостей."],
    );
  }

  if (containsAny(q, ["цвет", "цвета", "дизайн", "шрифт", "font"])) {
    addSection(
      "Дизайн и типографика",
      [
        `Цвета: ${
          (report.design?.colorPalette || [])
            .slice(0, 5)
            .map((entry) => entry.hex)
            .join(", ") || "не подтверждены"
        }`,
        `Шрифты: ${(report.design?.fonts || []).slice(0, 5).join(", ") || "не подтверждены"}`,
        `Тема: ${report.design?.lightDarkTheme || "не подтверждена"}`,
        `Responsive: ${report.design?.responsiveness || "не подтвержден"}`,
      ],
      "Цветовая палитра и набор шрифтов извлечены из HTML/CSS метаданных страницы.",
      `На основе отчёта видно ${report.design?.colorPalette?.length || 0} цветовых сигнала и ${(report.design?.fonts || []).length || 0} шрифтов.`,
      ["Проверьте согласованность токенов и типографики по всем страницам."],
    );
  }

  if (
    containsAny(q, [
      "скорост",
      "быст",
      "медлен",
      "производительн",
      "почему сайт медленный",
    ])
  ) {
    addSection(
      "Производительность",
      [
        `Размер страницы: ${report.performance?.pageSizeKb || 0} KB`,
        `Запросов: ${report.performance?.requestsCount || 0}`,
        `Lighthouse performance: ${report.performance?.lighthouseScore?.performance || 0}/100`,
        `Core Web Vitals: LCP=${report.performance?.coreWebVitals?.lcpSec || 0}s; CLS=${report.performance?.coreWebVitals?.cls || 0}`,
      ],
      report.performance?.lighthouseScore?.performance >= 80
        ? "По данным отчёта производительность выглядит относительно сильной."
        : "По данным отчёта есть заметные ограничения по размеру и объёму ресурсов.",
      `Сайт сейчас оценивается как ${scoreDescription}. Основные маркеры: размер ${report.performance?.pageSizeKb || 0}KB, запросы ${report.performance?.requestsCount || 0}.`,
      [
        "Оптимизируйте изображения и уменьшите количество запросов.",
        "Проверьте раскладку и кэширование статических активов.",
      ],
    );
  }

  if (containsAny(q, ["seo", "поисков", "ранжир", "улучшить seo"])) {
    addSection(
      "SEO",
      [
        `Title: ${report.seo?.metaTitle || "не найден"}`,
        `Description: ${report.seo?.metaDescription || "не найден"}`,
        `Canonical: ${report.seo?.canonicalUrl || "не найден"}`,
        `Robots status: ${report.seo?.robotsTxtStatus || "не подтверждён"}`,
        `Indexability: ${report.seo?.indexability || "не подтверждена"}`,
      ],
      report.seo?.metaTitle && report.seo?.metaDescription
        ? "SEO-маска выглядит частично заполненной, но это ещё не гарантия полной оптимизации."
        : "В отчёте не подтверждены ключевые SEO-поля, поэтому продвижение может быть ограниченным.",
      `SEO-поля: title=${report.seo?.metaTitle ? "✅" : "❌"}; description=${report.seo?.metaDescription ? "✅" : "❌"}; canonical=${report.seo?.canonicalUrl ? "✅" : "❌"}.`,
      [
        "Добавьте уникальные title/description на ключевых страницах.",
        "Подключите canonical и structured data.",
      ],
    );
  }

  if (
    containsAny(q, [
      "безопас",
      "ssl",
      "https",
      "защит",
      "проблемы безопасности",
    ])
  ) {
    addSection(
      "Безопасность",
      [
        `HTTPS enabled: ${report.security?.httpsEnabled ? "yes" : "no"}`,
        `SSL status: ${report.security?.sslStatus || "не подтверждён"}`,
        `Issuer: ${report.security?.sslIssuer || "не подтверждён"}`,
        `Expiry: ${report.security?.sslExpiry || "не подтверждён"}`,
        `Security issues: ${issues.length}`,
      ],
      getSslDescription(Boolean(report.security?.httpsEnabled)),
      `CSP=${report.security?.securityHeaders?.csp ? "✅" : "❌"}; HSTS=${report.security?.securityHeaders?.hsts ? "✅" : "❌"}; X-Frame-Options=${report.security?.securityHeaders?.xFrameOptions ? "✅" : "❌"}.`,
      issues.length
        ? issues.slice(0, 3)
        : ["Поддерживайте действующий SSL и актуальные security headers."],
    );
  }

  if (
    containsAny(q, [
      "что можно улучшить",
      "улучшить",
      "рекомендац",
      "как исправить",
    ])
  ) {
    addSection(
      "Приоритеты улучшений",
      [
        `Общий рейтинг: ${report.scores?.overallRating || 0}/100`,
        `Performance: ${report.performance?.lighthouseScore?.performance || 0}/100`,
        `SEO: ${report.scores?.seoScore || 0}/100`,
        `Accessibility: ${report.scores?.accessibilityScore || 0}/100`,
      ],
      "Следующие рекомендации строятся только по данным текущего отчёта, без домыслов.",
      `Самые заметные области: ${issues.length ? "безопасность" : "безопасность не критична"}; SEO=${report.seo?.metaTitle && report.seo?.metaDescription ? "частично подтвержден" : "требует внимания"}.`,
      [
        "Начните с SEO meta и безопасности.",
        "Потом оптимизируйте фото, шрифты и число запросов.",
      ],
    );
  }

  if (!sections.length) {
    return buildFallbackSiteAnswer(question);
  }

  const text = [
    "## Анализ сайта по отчёту WebScope",
    memory ? `> Контекст диалога: ${memory}` : "",
    "",
    "### Подтверждённые факты",
    ...sections.map(
      (section) => `- **${section.title}**: ${section.facts.join("; ")}`,
    ),
    "",
    "### Рекомендация",
    "Используйте этот ответ как основу для дальнейших действий, но всегда сверяйте его с фактическим состоянием сайта на реальном домене.",
    "",
    "### Контекст отчёта",
    `\`\`\`text\n${siteContext}\n\`\`\``,
  ].join("\n");

  return { text, sections };
}

function buildFallbackSiteAnswer(question: string): {
  text: string;
  sections: AiSection[];
} {
  return {
    text: `## Проблема с данными\n\nПо вашему вопросу «${question}» не хватает подтверждённых сигналов в текущем отчёте.\n\n### Что я могу сделать\n- уточнить вопрос по конкретному полю отчёта;\n- предложить безопасные шаги устранения;\n- объяснить, что именно не удалось подтвердить.`,
    sections: [
      {
        title: "Недостаточно данных",
        facts: ["В отчёте нет подтверждённых фактов по этому вопросу"],
        explanation: "AI не должен ничего домысливать.",
        technical: "Статус: честный fallback на основании доступных данных.",
        recommendations: [
          "Задайте более точный вопрос или выполните повторное сканирование сайта.",
        ],
      },
    ],
  };
}

export async function sendAiQuestion(
  question: string,
  report: WebScanReport | Record<string, unknown>,
  history: AiMessage[] = [],
): Promise<{ text: string; sections: AiSection[] }> {
  const hasReport = Boolean(
    report &&
    typeof report === "object" &&
    "id" in report &&
    "url" in report &&
    "technologies" in report &&
    "seo" in report &&
    "security" in report,
  );

  if (hasReport) {
    const reportData = report as WebScanReport;
    const q = normalize(question);

    const isSiteQuestion = containsAny(q, [
      "технолог",
      "цвет",
      "шрифт",
      "скорост",
      "seo",
      "безопас",
      "ssl",
      "hostname",
      "сайт",
      "дизайн",
      "frontend",
      "backend",
      "библиотек",
      "проблем",
      "улучш",
    ]);

    if (isSiteQuestion) {
      return buildSiteAnalysisReply(question, reportData, history);
    }

    return buildSiteAnalysisReply(question, reportData, history);
  }

  return buildGeneralAssistantReply(question, history);
}

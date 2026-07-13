import type { WebScanReport } from "../types/scan";

export interface AiMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  sections?: AiSection[];
}

export interface AiSection {
  title: string;
  facts: string[];
  explanation: string;
  technical: string;
  recommendations: string[];
}

function getSslDescription(valid: boolean): string {
  return valid
    ? "✅ Сертификат безопасности действителен. HTTPS работает корректно."
    : "❌ Сертификат отсутствует или недействителен.";
}

function answerQuestion(
  question: string,
  report: WebScanReport | Record<string, unknown>,
): AiSection[] {
  const q = question.toLowerCase();
  const answers: AiSection[] = [];

  const addSection = (
    title: string,
    facts: string[],
    explanation: string,
    technical: string,
    recommendations?: string[],
  ) => {
    answers.push({
      title,
      facts,
      explanation,
      technical,
      recommendations: recommendations || [],
    });
  };

  const r = report as WebScanReport;
  const techList = [
    ...(r.technologies?.frontend || []),
    ...(r.technologies?.backend || []),
    ...(r.technologies?.cssFramework || []),
    ...(r.technologies?.jsLibraries || []),
    ...(r.technologies?.cms || []),
  ].filter(Boolean);
  const techSlice =
    techList.slice(0, 5).join(", ") ||
    "не удалось определить по данным сканирования";
  const issues = r.security?.securityIssues || [];

  if (
    q.includes("что это") ||
    q.includes("что за сайт") ||
    q.includes("для чего") ||
    q.includes("назначение")
  ) {
    addSection(
      "Что это за сайт",
      [
        `Домен: ${r.id || "Не удалось определить"}`,
        `Название: ${r.title || "Не удалось определить"}`,
        `Описание: ${r.description || "Не удалось определить"}`,
        `Язык: ${r.primaryLanguage || "Не удалось определить"}`,
        `Страна: ${r.country || "Не удалось определить"}`,
      ],
      "Сайт был просканирован и его метаданные сохранены в отчёте. Ответ полностью строится только по данным этого отчёта.",
      `В отчёте подтверждены технологии: ${techSlice}.`,
      r.description
        ? ["Рекомендуется уточнить meta description на уровне страниц."]
        : ["В отчёте не удалось подтвердить meaningful description."],
    );
  }

  if (q.includes("безопасн") || q.includes("доверять") || q.includes("защит")) {
    addSection(
      "Безопасность",
      [
        `HTTPS: ${r.security?.httpsEnabled ? "Включён" : "Отключён"}`,
        `SSL: ${r.security?.sslStatus || "Не удалось определить"}`,
        `Издатель: ${r.security?.sslIssuer || "Не удалось определить"}`,
        `Срок действия: ${r.security?.sslExpiry || "Не удалось определить"}`,
        `Проблем: ${issues.length}`,
      ],
      r.security?.httpsEnabled
        ? "По данным сканирования HTTPS включён. Это подтверждённый факт из отчёта."
        : "По данным сканирования HTTPS не включён. Это подтверждённый факт из отчёта.",
      `Заголовки безопасности: CSP=${r.security?.securityHeaders?.csp ? "✅" : "❌"}, HSTS=${r.security?.securityHeaders?.hsts ? "✅" : "❌"}, X-Frame-Options=${r.security?.securityHeaders?.xFrameOptions ? "✅" : "❌"}`,
      issues.length
        ? [
            `По отчёту обнаружено ${issues.length} сигналов безопасности для исправления.`,
          ]
        : ["В отчёте не найдено явных проблем безопасности."],
    );
  }

  if (
    q.includes("технологи") ||
    q.includes("написан") ||
    q.includes("стек") ||
    q.includes("библиотек")
  ) {
    addSection(
      "Технологии",
      [
        `Frontend: ${(r.technologies?.frontend || []).join(", ") || "Не удалось определить"}`,
        `Backend: ${(r.technologies?.backend || []).join(", ") || "Не удалось определить"}`,
        `CSS: ${(r.technologies?.cssFramework || []).join(", ") || "Не удалось определить"}`,
        `Библиотеки: ${(r.technologies?.jsLibraries || []).slice(0, 5).join(", ") || "Не удалось определить"}`,
        `Языки: ${r.primaryLanguage || "Не удалось определить"}`,
      ],
      "Технологии в ответе берутся только из артефактов, найденных при сканировании сайта.",
      `Подтвержденные технологии: ${techSlice}.`,
      [
        "Следует проверить устаревшие зависимости и поддерживаемые версии на стороне владельца сайта.",
      ],
    );
  }

  if (q.includes("цвет") || q.includes("шрифт") || q.includes("дизайн")) {
    addSection(
      "Дизайн",
      [
        `Цвета: ${
          r.design?.colorPalette
            ?.slice(0, 3)
            .map((c) => c.hex)
            .join(", ") || "Не удалось определить"
        }`,
        `Шрифты: ${(r.design?.fonts || []).slice(0, 3).join(", ") || "Не удалось определить"}`,
        `Иконки: ${(r.design?.icons || []).slice(0, 3).join(", ") || "Не удалось определить"}`,
        `Тема: ${r.design?.lightDarkTheme || "Не удалось определить"}`,
        `Responsive: ${r.design?.responsiveness || "Не удалось определить"}`,
      ],
      "Цветовые сигналы, шрифты и поведение адаптивности извлечены непосредственно из HTML/CSS анализа страницы.",
      `В отчёте найдено ${r.design?.colorPalette?.length || 0} цветов и ${(r.design?.fonts || []).length || 0} шрифтов.`,
      [
        "Если дизайн выглядит грубо, сначала проверьте систему токенов и размеры типографики.",
      ],
    );
  }

  if (
    q.includes("скорост") ||
    q.includes("производительн") ||
    q.includes("медленн") ||
    q.includes("быст")
  ) {
    addSection(
      "Производительность",
      [
        `Размер страницы: ${r.performance?.pageSizeKb || 0} KB`,
        `Запросов: ${r.performance?.requestsCount || 0}`,
        `Lighthouse Performance: ${r.performance?.lighthouseScore?.performance || 0}/100`,
      ],
      r.performance?.lighthouseScore?.performance >= 80
        ? "По данным оценки из отчёта производительность выглядит высокой."
        : "По данным отчёта производительность требует улучшения.",
      `Page size: ${r.performance?.pageSizeKb || 0}KB. Requests: ${r.performance?.requestsCount || 0}. Core Web Vitals: LCP=${r.performance?.coreWebVitals?.lcpSec || 0}s, CLS=${r.performance?.coreWebVitals?.cls || 0}.`,
      [
        "Оптимизируйте изображения и уменьшите размер страницы.",
        "Используйте кэширование и CDN для статических ресурсов.",
      ],
    );
  }

  if (q.includes("seo") || q.includes("поисков") || q.includes("ранжир")) {
    addSection(
      "SEO",
      [
        `Title: ${r.seo?.metaTitle || "Отсутствует"}`,
        `Description: ${r.seo?.metaDescription || "Отсутствует"}`,
        `Canonical: ${r.seo?.canonicalUrl || "Не указан"}`,
        `Robots: ${r.seo?.robotsTxtStatus || "Не удалось определить"}`,
        `Индексация: ${r.seo?.indexability || "Не удалось определить"}`,
      ],
      r.seo?.metaTitle && r.seo?.metaDescription
        ? "В отчёте подтверждены title и description, поэтому SEO-метаданные частично присутствуют."
        : "В отчёте не подтверждены ключевые SEO-поля, поэтому оценка требует улучшения.",
      `Meta tags: title=${r.seo?.metaTitle ? "✅" : "❌"}, description=${r.seo?.metaDescription ? "✅" : "❌"}, canonical=${r.seo?.canonicalUrl ? "✅" : "❌"}`,
      [
        "Добавьте title и description для всех значимых страниц.",
        "Подключите canonical и структурированные данные.",
        "Убедитесь, что sitemap.xml доступен для индексации.",
      ],
    );
  }

  if (
    q.includes("сервер") ||
    q.includes("хостинг") ||
    q.includes("где размещен") ||
    q.includes("ip") ||
    q.includes("страна")
  ) {
    addSection(
      "Сервер и хостинг",
      [
        `IP: ${r.server?.ipAddress || "Не удалось определить"}`,
        `Сервер: ${r.server?.serverName || "Не удалось определить"}`,
        `Хостинг: ${r.server?.hosting || "Не удалось определить"}`,
        `Страна: ${r.server?.serverLocation || "Не удалось определить"}`,
      ],
      "Эти данные получены из публичных DNS/геолокационных сигналов и заголовков ответа сервера.",
      `IP: ${r.server?.ipAddress}. Сервер: ${r.server?.serverName}. Провайдер: ${r.server?.hosting}.`,
      [
        "Если скорость из разных регионов низкая, рассмотрите CDN и более близкий edge-слой.",
      ],
    );
  }

  if (q.includes("dns") || q.includes("домен") || q.includes("регистрац")) {
    addSection(
      "DNS и домен",
      [
        `Домен: ${r.id || "Не удалось определить"}`,
        `NS-серверы: ${(r.server?.dns || []).slice(0, 2).join(", ") || "Не удалось определить"}`,
        `Возраст домена: ${r.domainAge || "Не удалось определить"}`,
      ],
      "DNS и доменные сигналы в этом ответе только из тех данных, которые смогли быть обнаружены на этапе сканирования.",
      `DNS-серверы: ${(r.server?.dns || []).join(", ") || "Не удалось определить"}.`,
      [
        "Используйте надёжных DNS-провайдеров и, при необходимости, добавьте DNSSEC.",
      ],
    );
  }

  if (q.includes("ssl") || q.includes("https") || q.includes("шифрован")) {
    addSection(
      "SSL/HTTPS",
      [
        `Статус: ${r.security?.httpsEnabled ? "Включён" : "Отключён"}`,
        `Издатель: ${r.security?.sslIssuer || "Не удалось определить"}`,
        `Срок: ${r.security?.sslExpiry || "Не удалось определить"}`,
      ],
      getSslDescription(r.security?.httpsEnabled),
      `SSL-сертификат: ${r.security?.sslIssuer}. Срок действия: ${r.security?.sslExpiry}.`,
      ["Если срок приближается к истечению — обновите сертификат заранее."],
    );
  }

  if (
    q.includes("слаб") ||
    q.includes("проблем") ||
    q.includes("улучш") ||
    q.includes("рекомендац")
  ) {
    addSection(
      "Слабые места и рекомендации",
      [
        `Проблем безопасности: ${issues.length}`,
        `SEO: ${r.seo?.metaTitle && r.seo?.metaDescription ? "✅" : "❌"}`,
        `HTTPS: ${r.security?.httpsEnabled ? "✅" : "❌"}`,
        `Responsive: ${r.design?.responsiveness?.includes("yes") ? "✅" : "❌"}`,
      ],
      "Рекомендации формируются исключительно из тех сигналов, которые уже были замечены в отчёте.",
      `Безопасность: ${issues.length} замечаний, SEO: ${r.seo?.metaTitle && r.seo?.metaDescription ? "обнаружены мета-теги" : "неполные мета-теги"}.`,
      issues.length
        ? issues.slice(0, 3)
        : ["Сайт выглядит достаточно здоровым по текущим признакам."],
    );
  }

  if (!answers.length) {
    addSection(
      "Нет подтверждённых данных",
      [
        "В отчёте не найдено достаточно фактов для корректного ответа на этот вопрос.",
      ],
      "Запрос не совпал с доступными полями в отчёте сканирования.",
      "Для точного ответа задайте более конкретный вопрос по уже полученным данным.",
      [
        "Снова выполните сканирование и уточните вопрос по конкретному полю отчёта.",
      ],
    );
  }

  return answers;
}

export async function sendAiQuestion(
  question: string,
  report: WebScanReport | Record<string, unknown>,
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

  if (!hasReport) {
    return {
      text: "Для точного ответа AI нужен уже выполненный отчёт по сайту. Сначала просканируйте домен на главной странице, а затем задавайте вопросы только по полученным данным.",
      sections: [
        {
          title: "Нет данных для анализа",
          facts: [
            "Сканирование ещё не выполнено",
            "Источником ответа должен быть отчёт сайта",
            "Вопросы без отчёта считаются неподтверждёнными",
          ],
          explanation: "WebScope отвечает только по фактам из текущего отчёта.",
          technical:
            "Без реального CSV/JSON-отчёта AI не должен придумывать выводы.",
          recommendations: [
            "Выполните сканирование сайта и вернитесь с конкретным вопросом.",
          ],
        },
      ],
    };
  }

  const sections = answerQuestion(question, report);

  let text = "";
  for (const section of sections) {
    text += `\n\n**${section.title}:**\n`;
    text += `Факты: ${section.facts.join("; ")}\n`;
    text += `Объяснение: ${section.explanation}\n`;
    text += `Технически: ${section.technical}\n`;
    if (section.recommendations?.length) {
      text += `Рекомендации: ${section.recommendations.join("; ")}\n`;
    }
  }

  return { text, sections };
}

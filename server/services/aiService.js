function getSslDescription(valid) {
  return valid
    ? '✅ Сертификат безопасности действителен. HTTPS работает корректно.'
    : '❌ Сертификат отсутствует или недействителен.';
}

function answerQuestion(question, report) {
  const q = question.toLowerCase();
  const answers = [];

  // Helper to add section
  const addSection = (title, facts, explanation, technical, recommendations) => {
    answers.push({ title, facts, explanation, technical, recommendations: recommendations || [] });
  };

  const techList = Array.isArray(report.technologies) ? report.technologies : [];
  const techSlice = techList.slice(0, 5).join(', ') || 'неопределённый стек технологий';
  const issues = report.security?.securityIssues || [];

  // What is this site?
  if (q.includes('что это') || q.includes('что за сайт') || q.includes('для чего') || q.includes('назначение')) {
    addSection(
      'Что это за сайт',
      [
        `Домен: ${report.domain}`,
        `Название: ${report.title || 'Не определено'}`,
        `Описание: ${report.description || 'Не определено'}`,
        `Язык: ${report.primaryLanguage || 'Не определен'}`,
        `Страна: ${report.country || 'Не определена'}`,
      ],
      'Этот сайт был просканирован и проанализирован. На основе данных можно понять его основное назначение и аудиторию.',
      `Домен ${report.domain} использует ${techSlice}.`,
      report.description ? ['Рекомендуется добавить более детальное meta-описание для улучшения SEO.'] : []
    );
  }

  // Security
  if (q.includes('безопасн') || q.includes('доверять') || q.includes('защит')) {
    addSection(
      'Безопасность',
      [
        `HTTPS: ${report.security?.httpsEnabled ? 'Включён' : 'Отключён'}`,
        `SSL: ${report.security?.sslStatus || 'Неизвестно'}`,
        `Издатель: ${report.security?.sslIssuer || 'Не определён'}`,
        `Срок действия: ${report.security?.sslExpiry || 'Не определён'}`,
        `Проблем: ${issues.length}`,
      ],
      report.security?.httpsEnabled
        ? 'Сайт использует защищённое соединение HTTPS. Данные передаются в зашифрованном виде.'
        : 'Сайт не использует HTTPS. Это небезопасно для передачи данных.',
      `Заголовки безопасности: CSP=${report.security?.securityHeaders?.csp ? '✅' : '❌'}, HSTS=${report.security?.securityHeaders?.hsts ? '✅' : '❌'}, X-Frame-Options=${report.security?.securityHeaders?.xFrameOptions ? '✅' : '❌'}`,
      issues.length ? [`Рекомендуется исправить ${issues.length} проблем(ы) безопасности.`] : ['Безопасность на хорошем уровне.']
    );
  }

  // Technologies
  if (q.includes('технологи') || q.includes('написан') || q.includes('стек') || q.includes('библиотек')) {
    addSection(
      'Технологии',
      [
        `Frontend: ${(report.technologies?.frontend || []).join(', ') || 'Не определены'}`,
        `Backend: ${(report.technologies?.backend || []).join(', ') || 'Не определен'}`,
        `CSS: ${(report.technologies?.cssFramework || []).join(', ') || 'Не определён'}`,
        `Библиотеки: ${(report.technologies?.jsLibraries || []).slice(0, 5).join(', ') || 'Не определены'}`,
        `Языки: ${(report.technologies?.language || []).join(', ') || 'Не определены'}`,
      ],
      'Сайт использует современный стек технологий для разработки.',
      `Определены технологии: ${techList.join(', ') || 'не определённые'}. Используются фреймворки, библиотеки и инструменты для разработки.`,
      ['Рассмотрите возможность обновления устаревших зависимостей.']
    );
  }

  // Colors and fonts
  if (q.includes('цвет') || q.includes('шрифт') || q.includes('дизайн')) {
    addSection(
      'Дизайн',
      [
        `Цвета: ${report.design?.colorPalette?.slice(0, 3).map(c => c.hex).join(', ') || 'Не определены'}`,
        `Шрифты: ${(report.design?.fonts || []).slice(0, 3).join(', ') || 'Не определены'}`,
        `Иконки: ${(report.design?.icons || []).slice(0, 3).join(', ') || 'Не определены'}`,
        `Тема: ${report.design?.lightDarkTheme || 'Не определена'}`,
        `Responsive: ${report.design?.responsiveness || 'Не определен'}`,
      ],
      'Сайт имеет определённую цветовую палитру и систему шрифтов.',
      `Цветовая палитра содержит ${report.design?.colorPalette?.length || 0} цветов. Шрифты: ${(report.design?.fonts || []).join(', ') || 'не определены'}.`,
      ['Рекомендуется использовать системные шрифты для лучшей производительности.']
    );
  }

  // Performance
  if (q.includes('скорост') || q.includes('производительн') || q.includes('медленн') || q.includes('быст')) {
    addSection(
      'Производительность',
      [
        `Размер страницы: ${report.performance?.pageSizeKb || 0} KB`,
        `Запросов: ${report.performance?.requestsCount || 0}`,
        `Lighthouse Performance: ${report.performance?.lighthouseScore?.performance || 0}/100`,
      ],
      report.performance?.lighthouseScore?.performance >= 80
        ? 'Сайт загружается быстро. Производительность на хорошем уровне.'
        : 'Сайт может загружаться медленно. Рекомендуется оптимизация.',
      `Page size: ${report.performance?.pageSizeKb || 0}KB. Requests: ${report.performance?.requestsCount || 0}. Core Web Vitals: LCP=${report.performance?.coreWebVitals?.lcpSec || 0}s, CLS=${report.performance?.coreWebVitals?.cls || 0}.`,
      ['Оптимизируйте изображения, используйте WebP/AVIF.', 'Включите кэширование на сервере.', 'Используйте CDN для статических ресурсов.']
    );
  }

  // SEO
  if (q.includes('seo') || q.includes('поисков') || q.includes('ранжир')) {
    addSection(
      'SEO',
      [
        `Title: ${report.seo?.metaTitle || 'Отсутствует'}`,
        `Description: ${report.seo?.metaDescription || 'Отсутствует'}`,
        `Canonical: ${report.seo?.canonicalUrl || 'Не указан'}`,
        `Robots: ${report.seo?.robotsTxtStatus || 'Не определен'}`,
        `Индексация: ${report.seo?.indexability || 'Не определена'}`,
      ],
      report.seo?.metaTitle && report.seo?.metaDescription
        ? 'SEO-оптимизация на хорошем уровне. Присутствуют основные мета-теги.'
        : 'SEO-оптимизация требует улучшения. Отсутствуют важные мета-теги.',
      `Meta tags: title=${report.seo?.metaTitle ? '✅' : '❌'}, description=${report.seo?.metaDescription ? '✅' : '❌'}, canonical=${report.seo?.canonicalUrl ? '✅' : '❌'}`,
      ['Добавьте title и description для всех страниц.', 'Используйте структурированные данные (Schema.org).', 'Создайте и отправьте sitemap.xml.']
    );
  }

  // Server/Hosting
  if (q.includes('сервер') || q.includes('хостинг') || q.includes('где размещен') || q.includes('ip') || q.includes('страна')) {
    addSection(
      'Сервер и хостинг',
      [
        `IP: ${report.server?.ipAddress || 'Не определён'}`,
        `Сервер: ${report.server?.serverName || 'Не определён'}`,
        `Хостинг: ${report.server?.hosting || 'Не определён'}`,
        `Страна: ${report.geo?.country || 'Не определена'}`,
        `Город: ${report.geo?.city || 'Не определён'}`,
        `ASN: ${report.geo?.asn || 'Не определён'}`,
      ],
      'Сайт размещён на сервере в определённом регионе. Это влияет на скорость загрузки для пользователей из разных стран.',
      `IP: ${report.server?.ipAddress}. Сервер: ${report.server?.serverName}. Провайдер: ${report.geo?.hosting}.`,
      ['Рассмотрите использование CDN для ускорения доступа из разных регионов.']
    );
  }

  // DNS
  if (q.includes('dns') || q.includes('домен') || q.includes('регистрац')) {
    addSection(
      'DNS и домен',
      [
        `Домен: ${report.domain}`,
        `A-записи: ${report.dns?.A?.join(', ') || 'Нет'}`,
        `NS-серверы: ${report.dns?.NS?.slice(0, 2).join(', ') || 'Не определены'}`,
        `Возраст домена: ${report.domainAge || 'Не определён'}`,
      ],
      'DNS отвечает за преобразование доменного имени в IP-адрес. Без DNS сайт был бы недоступен.',
      `DNS-записи: A=${report.dns?.A?.length || 0}, AAAA=${report.dns?.AAAA?.length || 0}, MX=${report.dns?.MX?.length || 0}, NS=${report.dns?.NS?.length || 0}.`,
      ['Настройте DNSSEC для повышения безопасности.', 'Используйте надёжных DNS-провайдеров.']
    );
  }

  // SSL
  if (q.includes('ssl') || q.includes('https') || q.includes('шифрован')) {
    addSection(
      'SSL/HTTPS',
      [
        `Статус: ${report.security?.httpsEnabled ? 'Включён' : 'Отключён'}`,
        `Издатель: ${report.security?.sslIssuer || 'Не определён'}`,
        `Срок: ${report.security?.sslExpiry || 'Не определён'}`,
      ],
      getSslDescription(report.security?.httpsEnabled),
      `SSL-сертификат: ${report.security?.sslIssuer}. Срок действия: ${report.security?.sslExpiry}.`,
      ['Обновите сертификат до истечения срока.', 'Используйте TLS 1.3 для максимальной безопасности.']
    );
  }

  // Weaknesses/Improvements
  if (q.includes('слаб') || q.includes('проблем') || q.includes('улучш') || q.includes('рекомендац')) {
    addSection(
      'Слабые места и рекомендации',
      [
        `Проблем безопасности: ${issues.length}`,
        `SEO: ${report.seo?.metaTitle && report.seo?.metaDescription ? '✅' : '❌'}`,
        `HTTPS: ${report.security?.httpsEnabled ? '✅' : '❌'}`,
        `Responsive: ${report.design?.responsiveness?.includes('yes') ? '✅' : '❌'}`,
      ],
      'На основе анализа выявлены следующие области для улучшения.',
      `Security issues: ${issues.length}. SEO score: ${report.seo?.metaTitle && report.seo?.metaDescription ? 'Good' : 'Needs improvement'}.`,
      issues.length ? issues.slice(0, 3) : ['Сайт выглядит хорошо. Продолжайте поддерживать текущий уровень.']
    );
  }

  // If no specific question matched, return general summary
  if (!answers.length) {
    addSection(
      'Общий анализ',
      [
        `Домен: ${report.domain}`,
        `Технологии: ${techSlice}`,
        `Безопасность: ${report.security?.httpsEnabled ? 'HTTPS ✅' : 'HTTPS ❌'}`,
        `SEO: ${report.seo?.metaTitle && report.seo?.metaDescription ? '✅' : '❌'}`,
        `Производительность: ${report.performance?.lighthouseScore?.performance || 0}/100`,
      ],
      'Это общий анализ сайта на основе сканирования.',
      `Сайт использует ${techList.length || 0} технологий. Безопасность: ${report.security?.httpsEnabled ? 'HTTPS включён' : 'HTTPS отключён'}.`,
      ['Задайте более конкретный вопрос для получения детальной информации.']
    );
  }

  return answers;
}

export function generateAiResponse(question, report) {
  const hasReport = report && Object.keys(report).length > 1;

  if (!hasReport) {
    const q = question.toLowerCase();
    if (q.includes('что такое') || q.includes('что это') || q.includes('webscope') || q.includes('о себе') || q.includes('что умеешь')) {
      return {
        text: 'WebScope — это инструмент для анализа сайтов. Я могу ответить на вопросы о веб-разработке, SEO, безопасности и технологиях. Для анализа конкретного сайта выполните сканирование на главной странице.',
        sections: [
          {
            title: 'О WebScope',
            facts: ['Инструмент для анализа сайтов', 'Анализ технологий, SEO, безопасности', 'AI-ассистент для вопросов'],
            explanation: 'WebScope помогает быстро оценить сайт по множеству параметров.',
            technical: 'Frontend: React + Vite. Backend: Node.js + Express.',
            recommendations: ['Выполните сканирование сайта для получения детального анализа.']
          }
        ]
      };
    }

    return {
      text: 'Я — AI-ассистент WebScope. Я могу отвечать на вопросы о веб-разработке, SEO, безопасности, технологиях и дизайне. Для анализа конкретного сайта выполните сканирование на главной странице и задавайте вопросы по его данным.',
      sections: [
        {
          title: 'Общий ответ',
          facts: ['Режим: без сканирования', 'Тема: веб-разработка/SEO/безопасность', 'Источник: общие знания'],
          explanation: 'Вы находитесь в общем режиме. Я отвечаю на вопросы без привязки к конкретному сайту.',
          technical: 'Ответ основан на общих знаниях. Для привязки к сайту выполните сканирование.',
          recommendations: ['Выполните сканирование сайта для получения детального анализа.']
        }
      ]
    };
  }

  const sections = answerQuestion(question, report);

  let text = '';
  for (const section of sections) {
    text += `\n\n**${section.title}:**\n`;
    text += `Факты: ${section.facts.join('; ')}\n`;
    text += `Объяснение: ${section.explanation}\n`;
    text += `Технически: ${section.technical}\n`;
    if (section.recommendations?.length) {
      text += `Рекомендации: ${section.recommendations.join('; ')}\n`;
    }
  }

  return { text, sections };
}
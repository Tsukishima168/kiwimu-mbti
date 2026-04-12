import React, { useEffect } from 'react';
import { applyRuntimeSeo } from '../utils/seo';
import { trackPageView, trackScreenEngagement, trackButtonClick } from '../utils/analytics';
import { answersHubContent } from '../data/answersHubContent';

const SITE_URL = 'https://kiwimu.com';

const AnswersHub: React.FC = () => {
  useEffect(() => {
    const { meta, quickAnswers, relatedGuides, authorityReferences } = answersHubContent;
    const canonical = `${SITE_URL}${meta.canonicalPath}`;
    const faqJsonLd = answersHubContent.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    }));

    applyRuntimeSeo({
      title: meta.title,
      description: meta.description,
      canonical,
      keywords: meta.keywords,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            name: meta.title,
            description: meta.description,
            url: canonical,
            inLanguage: 'zh-TW',
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumbs`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Kiwimu',
                item: SITE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'MBTI 答案中心',
                item: canonical,
              },
            ],
          },
          {
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            mainEntity: faqJsonLd,
          },
        ],
      },
    });
  }, []);

  useEffect(() => {
    const enteredAt = Date.now();
    trackPageView('/answers');
    return () => {
      trackScreenEngagement('/answers', Math.round((Date.now() - enteredAt) / 1000));
    };
  }, []);

  const handleGuideClick = (title: string, href: string) => {
    trackButtonClick(title, 'answers_hub', href);
  };

  const { hero, quickAnswers, fixedSections, authorityReferences, editorialViews, faqs, relatedGuides } = answersHubContent;

  return (
    <main className="min-h-screen bg-[#F6F2E9] text-[#111111]">
      <section className="relative overflow-hidden border-b border-black/10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(143,154,58,0.18), transparent 32%), radial-gradient(circle at 80% 15%, rgba(111,119,50,0.16), transparent 28%), linear-gradient(180deg, #F6F2E9 0%, #F8F7F1 100%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.4em] text-black/55 uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[#111111] md:text-6xl lg:text-7xl">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-black/72 md:text-lg">
              {hero.subtitle}
            </p>
            <blockquote className="mt-8 max-w-3xl border-l-2 border-black/15 pl-5 text-[15px] leading-8 text-black/80 md:text-base">
              {hero.summary}
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-3">
              {relatedGuides.map((guide) => (
                <a
                  key={guide.title}
                  href={guide.href}
                  onClick={() => handleGuideClick(guide.title, guide.href)}
                  className="inline-flex items-center gap-2 border border-black/12 bg-white/70 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
                >
                  <span>{guide.title}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>

          <aside className="border-t border-black/10 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-black/45 uppercase">核心</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">16 型</p>
                <p className="mt-2 text-sm leading-6 text-black/65">官方 MBTI 的基礎分類。</p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.3em] text-black/45 uppercase">延伸</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">32 變體</p>
                <p className="mt-2 text-sm leading-6 text-black/65">Kiwimu 的 16 × A/T 內容分層。</p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.3em] text-black/45 uppercase">定位</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">可引用</p>
                <p className="mt-2 text-sm leading-6 text-black/65">先把結論寫清楚，再讓搜尋知道來源。</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-18">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quickAnswers.map((item) => (
            <article key={item.label} className="border-t border-black/12 pt-5">
              <h2 className="text-sm font-semibold tracking-[0.12em] text-black/52 uppercase">
                {item.label}
              </h2>
              <p className="mt-3 text-[15px] leading-8 text-black/82">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-2">
          {fixedSections.map((section) => (
            <article key={section.title} className="border border-black/12 bg-white/55 p-6 md:p-8">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{section.title}</h2>
              <p className="mt-3 text-[15px] leading-8 text-black/72">{section.lead}</p>
              <ul className="mt-5 space-y-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-[15px] leading-7 text-black/84">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8F9A3A]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <article className="border-t border-black/12 pt-6">
            <p className="text-[11px] font-semibold tracking-[0.35em] text-black/45 uppercase">
              哪些有權威背書
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              官方框架和可引用來源，先站穩。
            </h2>
            <div className="mt-6 space-y-5">
              {authorityReferences.map((reference) => (
                <div key={reference.url} className="border-l-2 border-black/12 pl-4">
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[15px] font-semibold leading-7 text-black underline decoration-black/20 underline-offset-4 hover:decoration-black"
                  >
                    {reference.label}
                  </a>
                  <p className="mt-2 text-sm leading-7 text-black/68">{reference.supports}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border-t border-black/12 pt-6">
            <p className="text-[11px] font-semibold tracking-[0.35em] text-black/45 uppercase">
              哪些是我們的觀點
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              Kiwimu 只對自己的 editorial layer 負責。
            </h2>
            <ul className="mt-6 space-y-4">
              {editorialViews.map((view) => (
                <li key={view} className="border-b border-black/10 pb-4 text-[15px] leading-8 text-black/82 last:border-0 last:pb-0">
                  {view}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-18">
        <div className="border-t border-black/12 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.35em] text-black/45 uppercase">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                先回答最常被問到的問題。
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-black/62">
              這一段刻意保留成可被摘錄的短答格式，讓搜尋引擎、AI 摘要與使用者都能快速抓到結論。
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border border-black/12 bg-white/60 px-5 py-4">
                <summary className="cursor-pointer list-none text-[15px] font-semibold leading-7 text-black outline-none">
                  <span>{faq.question}</span>
                </summary>
                <p className="mt-3 pr-4 text-[15px] leading-8 text-black/78">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-6 md:pb-28">
        <div className="grid gap-8 border-t border-black/12 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <article>
            <p className="text-[11px] font-semibold tracking-[0.35em] text-black/45 uppercase">
              延伸導流
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              這個 hub 之後要接哪些內容。
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-8 text-black/72">
              目前這一頁先把通用答案固定下來。接下來要上線的內容，應該優先沿著「品項型 / 情境型 / 品牌型」三條線補齊，讓公開頁面有穩定的 evergreen 結構。
            </p>
          </article>

          <div className="grid gap-4">
            {relatedGuides.map((guide) => (
              <a
                key={guide.title}
                href={guide.href}
                onClick={() => handleGuideClick(guide.title, guide.href)}
                className="group border border-black/12 bg-[#FBFAF6] p-5 transition-colors hover:border-black/30 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-black">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-black/68">{guide.summary}</p>
                  </div>
                  <span className="mt-1 text-lg text-black/45 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AnswersHub;

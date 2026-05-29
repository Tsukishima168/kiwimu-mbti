import React, { useEffect } from 'react';
import { applyRuntimeSeo } from '../utils/seo';
import { trackButtonClick, trackPageView, trackScreenEngagement } from '../utils/analytics';
import { getAnswerArticleBySlug } from '../data/answerArticles';

const SITE_URL = 'https://kiwimu.com';

type AnswerArticleProps = {
  slug: string;
};

const AnswerArticle: React.FC<AnswerArticleProps> = ({ slug }) => {
  const article = getAnswerArticleBySlug(slug);

  useEffect(() => {
    const canonical = article ? `${SITE_URL}/answers/${article.slug}` : `${SITE_URL}/answers`;

    if (!article) {
      applyRuntimeSeo({
        title: '找不到這篇答案｜Kiwimu',
        description: '這篇 Kiwimu 答案不存在。請回到 MBTI 答案中心查看公開可引用內容。',
        canonical,
        robots: 'noindex,follow',
      });
      return;
    }

    const faqJsonLd = article.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    }));

    applyRuntimeSeo({
      title: `${article.title}｜Kiwimu`,
      description: article.description,
      canonical,
      keywords: article.keywords,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `${canonical}#article`,
            headline: article.title,
            description: article.description,
            dateModified: article.updatedAt,
            datePublished: article.updatedAt,
            author: {
              '@type': 'Organization',
              name: 'Kiwimu',
              url: SITE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Kiwimu',
              url: SITE_URL,
            },
            mainEntityOfPage: canonical,
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
                item: `${SITE_URL}/answers`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
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
  }, [article]);

  useEffect(() => {
    if (!article) return;

    const path = `/answers/${article.slug}`;
    const enteredAt = Date.now();
    trackPageView(path);

    return () => {
      trackScreenEngagement(path, Math.round((Date.now() - enteredAt) / 1000));
    };
  }, [article]);

  if (!article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F2E9] px-6 text-center text-[#111111]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-black/45">ANSWER NOT FOUND</p>
          <h1 className="mt-4 text-4xl font-semibold">找不到這篇答案</h1>
          <a href="/answers" className="mt-8 inline-flex border border-black bg-black px-5 py-3 text-sm font-semibold text-white">
            回到 MBTI 答案中心
          </a>
        </div>
      </main>
    );
  }

  const handleClick = (buttonName: string, destination: string) => {
    trackButtonClick(buttonName, 'answers_article_cta', destination);
  };

  return (
    <main className="min-h-screen bg-[#F6F2E9] text-[#111111]">
      <article className="mx-auto max-w-4xl px-6 py-14 md:py-24">
        <nav className="mb-10 text-sm text-black/52">
          <a href="/answers" className="underline decoration-black/20 underline-offset-4 hover:decoration-black">
            MBTI 答案中心
          </a>
          <span className="px-2">/</span>
          <span>{article.eyebrow}</span>
        </nav>

        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-black/45">
            {article.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
            {article.title}
          </h1>
          <p className="mt-5 text-sm text-black/48">
            更新日期：{article.updatedAt}
          </p>
          <p className="mt-8 border-l-2 border-black/15 pl-5 text-[17px] leading-9 text-black/82">
            {article.summary}
          </p>
        </header>

        <section className="mt-12 border-y border-black/12 py-6">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.28em] text-black/45">
            先記住這三件事
          </h2>
          <ul className="mt-5 grid gap-3">
            {article.takeaways.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-7 text-black/78">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8F9A3A]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 space-y-12">
          {article.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold md:text-3xl">{section.title}</h2>
              {section.body ? (
                <p className="mt-4 text-[16px] leading-9 text-black/76">{section.body}</p>
              ) : null}
              {section.bullets?.length ? (
                <ul className="mt-5 grid gap-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-[15px] leading-8 text-black/78">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-black/72" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-14 border-t border-black/12 pt-8">
          <h2 className="text-3xl font-semibold">FAQ</h2>
          <div className="mt-7 grid gap-4">
            {article.faqs.map((faq) => (
              <details key={faq.question} className="border border-black/12 bg-white/55 px-5 py-4">
                <summary className="cursor-pointer list-none text-[15px] font-semibold leading-7 outline-none">
                  {faq.question}
                </summary>
                <p className="mt-3 text-[15px] leading-8 text-black/76">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-black/12 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-black/45">
            下一步
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <a
              href="/quiz"
              onClick={() => handleClick('answers_article_start_v1', '/quiz')}
              className="border border-black bg-black px-5 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-[#CCFF00] hover:text-black"
            >
              開始 V1 完整測驗
            </a>
            <a
              href="/explore"
              onClick={() => handleClick('answers_article_start_v15', '/explore')}
              className="border border-black/16 bg-white/70 px-5 py-4 text-center text-sm font-semibold text-black transition-colors hover:border-black hover:bg-white"
            >
              進入 V1.5 快測
            </a>
            <a
              href="/read/quiz"
              onClick={() => handleClick('answers_article_start_v2', '/read/quiz')}
              className="border border-black/16 bg-white/70 px-5 py-4 text-center text-sm font-semibold text-black transition-colors hover:border-black hover:bg-white"
            >
              進入 V2 深度路徑
            </a>
          </div>
        </section>

        <section className="mt-14 border-t border-black/12 pt-8">
          <h2 className="text-2xl font-semibold">延伸閱讀</h2>
          <div className="mt-6 grid gap-4">
            {article.related.map((item) => (
              <a
                key={`${item.title}-${item.href}`}
                href={item.href}
                onClick={() => trackButtonClick('answers_article_related_article', 'answers_article_related', item.href)}
                className="group border border-black/12 bg-[#FBFAF6] p-5 transition-colors hover:border-black/30 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[17px] font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-black/66">{item.summary}</p>
                  </div>
                  <span className="mt-1 text-lg text-black/45 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
};

export default AnswerArticle;

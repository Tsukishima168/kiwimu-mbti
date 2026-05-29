import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'data', 'answerArticles.ts');
const outputDir = path.join(rootDir, 'docs', 'marketing', 'generated');
const siteUrl = 'https://kiwimu.com';
const campaign = '2026-q2-kiwimu-answers';

const normalizeSpaces = (value) => value.replace(/\s+/g, ' ').trim();

const sentence = (value) => {
  const normalized = normalizeSpaces(value);
  const match = normalized.match(/^(.{18,120}?[。！？!?])/);
  return match?.[1] || normalized.slice(0, 110);
};

const toUrl = (pathName, source, medium, content, extra = {}) => {
  const url = new URL(pathName.startsWith('http') ? pathName : `${siteUrl}${pathName}`);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', content);
  for (const [key, value] of Object.entries(extra)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
};

const loadArticles = async () => {
  const source = await fs.readFile(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: sourcePath,
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`;
  const mod = await import(dataUrl);
  return mod.answerArticles;
};

const buildTrackedUrls = (article) => ({
  article_buffer: toUrl(`/answers/${article.slug}`, 'buffer', 'social-post', `post01-${article.slug}-hook`),
  article_threads: toUrl(`/answers/${article.slug}`, 'threads', 'social-post', `thread-${article.slug}-question`),
  article_instagram_bio: toUrl(`/answers/${article.slug}`, 'instagram', 'social-post', `bio-${article.slug}-answer`),
  article_instagram_story: toUrl(`/answers/${article.slug}`, 'instagram', 'social-story', `story-${article.slug}-answer`),
  article_partner_referral: toUrl(`/answers/${article.slug}`, 'referral', 'referral', `partner-${article.slug}-collab`),
  article_chatgpt_context: toUrl(`/answers/${article.slug}`, 'chatgpt', 'ai-referral', `answer-${article.slug}-citation`),
  v1_quiz: toUrl('/quiz', 'buffer', 'answer-cta', `article-${article.slug}-v1`, {
    entry_surface: 'answers_article',
    destination_type: 'v1_quiz',
  }),
  v15_explore: toUrl('/explore', 'buffer', 'answer-cta', `article-${article.slug}-v15`, {
    entry_surface: 'answers_article',
    destination_type: 'v15_explore',
  }),
  v2_quiz: toUrl('/read/quiz', 'buffer', 'answer-cta', `article-${article.slug}-v2`, {
    entry_surface: 'answers_article',
    destination_type: 'v2_unlock',
  }),
});

const buildBufferPosts = (article, urls) => {
  const faq = article.faqs[0];
  const secondFaq = article.faqs[1] || faq;
  const firstSection = article.sections[0];
  const firstBullet = article.takeaways[0];
  const secondBullet = article.takeaways[1] || firstBullet;
  const sectionBullet = firstSection?.bullets?.[0] || firstSection?.body || firstBullet;

  return [
    {
      type: 'direct-answer',
      copy: `${sentence(article.summary)}\n\n完整整理：${urls.article_buffer}`,
    },
    {
      type: 'takeaway',
      copy: `${firstBullet}\n\n如果你是第一次接觸 Kiwimu，可以先從這篇開始：${urls.article_buffer}`,
    },
    {
      type: 'faq',
      copy: `Q：${faq.question}\nA：${faq.answer}\n\n延伸看這篇：${urls.article_buffer}`,
    },
    {
      type: 'misunderstanding',
      copy: `很多人會忽略這件事：${sectionBullet}\n\n我把完整判斷整理在這裡：${urls.article_threads}`,
    },
    {
      type: 'kiwimu-angle',
      copy: `Kiwimu 的角度是：${secondBullet}\n\n不是把人貼標籤，而是給你一個更好理解自己的入口。${urls.article_buffer}`,
    },
    {
      type: 'v1-cta',
      copy: `看完解釋後，最直接的下一步是做一次完整 V1 測驗。\n\n開始測驗：${urls.v1_quiz}`,
    },
    {
      type: 'v15-cta',
      copy: `如果你已經知道自己的類型，可以用 V1.5 看今天更像哪種狀態。\n\n5 題快速探索：${urls.v15_explore}`,
    },
    {
      type: 'v2-cta',
      copy: `想看更深的 A/T 變體、關係、職場與成長建議，可以進 V2 深度路徑。\n\n開始 V2：${urls.v2_quiz}`,
    },
    {
      type: 'interaction',
      copy: `${secondFaq.question}\n\n你會怎麼回答？我把 Kiwimu 的短答整理在這篇：${urls.article_threads}`,
    },
    {
      type: 'evergreen-repost',
      copy: `${article.title}\n\n這篇適合收藏，之後每次有人問都可以直接丟給他：${urls.article_buffer}`,
    },
  ];
};

const buildExternalChannelPlan = (article, urls) => {
  const canonical = `${siteUrl}/answers/${article.slug}`;
  const faq = article.faqs[0];
  const firstBullet = article.takeaways[0];
  const secondBullet = article.takeaways[1] || firstBullet;

  return [
    {
      channel: 'Google / organic search',
      action: `Index the canonical URL only: ${canonical}. Do not add UTM to sitemap or canonical tags.`,
      copy: `Primary query target: ${article.keywords.split(',')[0] || article.title}`,
    },
    {
      channel: 'ChatGPT Search / GEO',
      action: `Expose the canonical URL through sitemap and llms.txt: ${canonical}. Use the tracked ChatGPT URL only for controlled references, not canonical indexing.`,
      copy: `Citation answer: ${sentence(article.summary)}`,
    },
    {
      channel: 'Buffer',
      action: 'Queue the 10-post pack below, then rotate one CTA post every 2-3 evergreen reposts.',
      copy: urls.article_buffer,
    },
    {
      channel: 'Instagram',
      action: 'Use Story link sticker for direct response and bio link for longer campaigns.',
      copy: `Carousel hook: ${article.title}\nStory link: ${urls.article_instagram_story}\nBio link: ${urls.article_instagram_bio}`,
    },
    {
      channel: 'Threads',
      action: 'Post as a question-first thread, then reply with V1/V1.5/V2 CTA only after engagement.',
      copy: `${faq.question}\n\nKiwimu short answer: ${faq.answer}\n\n${urls.article_threads}`,
    },
    {
      channel: 'Partner / collaboration',
      action: 'Send this as the partner blurb when asking a creator, cafe, dessert brand, or MBTI account to share.',
      copy: `${article.title}\n${secondBullet}\nPartner link: ${urls.article_partner_referral}`,
    },
  ];
};

const buildPack = (article) => {
  const urls = buildTrackedUrls(article);
  const posts = buildBufferPosts(article, urls);
  const channelPlan = buildExternalChannelPlan(article, urls);
  const canonical = `${siteUrl}/answers/${article.slug}`;

  return `# Marketing Pack: ${article.title}

Generated from \`data/answerArticles.ts\`.

## Canonical

- ${canonical}
- Last modified: ${article.updatedAt}
- Campaign: \`${campaign}\`

## SEO

- Title: ${article.title}｜Kiwimu
- Meta description: ${article.description}
- AI summary: ${article.summary}
- Keywords: ${article.keywords}

## Tracked URLs

${Object.entries(urls).map(([key, value]) => `- \`${key}\`: ${value}`).join('\n')}

## External Channel Plan

${channelPlan.map((item) => `### ${item.channel}\n\n- Action: ${item.action}\n- Copy/link:\n\n${item.copy}`).join('\n\n')}

## Buffer Posts

${posts.map((post, index) => `### ${index + 1}. ${post.type}\n\n${post.copy}`).join('\n\n')}

## OG Image Brief

- Format: 1200 x 630
- Main title: ${article.title}
- Eyebrow: ${article.eyebrow}
- Visual direction: Kiwimu editorial paper background, black typography, small acid green accent, no generic stock image.
- CTA text: 開始 V1 完整測驗

## IndexNow Submission

\`\`\`text
${canonical}
\`\`\`

## GA4 Expected Events

- \`page_view\`: \`/answers/${article.slug}\`
- \`screen_engagement\`: \`/answers/${article.slug}\`
- \`button_click\`: \`answers_article_start_v1\`
- \`button_click\`: \`answers_article_start_v15\`
- \`button_click\`: \`answers_article_start_v2\`
- \`button_click\`: \`answers_article_related_article\`
`;
};

const ensureOutputDir = async () => {
  await fs.mkdir(outputDir, { recursive: true });
};

const writeGeneratedFiles = async (articles, options = {}) => {
  await ensureOutputDir();

  const updateGlobalIndex = options.updateGlobalIndex ?? true;
  const latestUpdatedAt = [...articles]
    .map((article) => article.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
  const indexLines = [
    '# Generated Answer Marketing Packs',
    '',
    `Generated from article data updated through: ${latestUpdatedAt || 'unknown'}`,
    '',
  ];
  const indexNowUrls = [];

  for (const article of articles) {
    const fileName = `${article.slug}.md`;
    const filePath = path.join(outputDir, fileName);
    const canonical = `${siteUrl}/answers/${article.slug}`;
    await fs.writeFile(filePath, buildPack(article), 'utf8');
    indexLines.push(`- [${article.title}](./${fileName})`);
    indexNowUrls.push(canonical);
  }

  if (updateGlobalIndex) {
    await fs.writeFile(path.join(outputDir, 'INDEX.md'), `${indexLines.join('\n')}\n`, 'utf8');
    await fs.writeFile(path.join(outputDir, 'indexnow-urls.txt'), `${indexNowUrls.join('\n')}\n`, 'utf8');
    await fs.rm(path.join(outputDir, 'indexnow-urls.selected.txt'), { force: true });
  } else {
    await fs.writeFile(path.join(outputDir, 'indexnow-urls.selected.txt'), `${indexNowUrls.join('\n')}\n`, 'utf8');
  }
};

const main = async () => {
  const requestedSlugs = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const articles = await loadArticles();
  const selected = requestedSlugs.length
    ? articles.filter((article) => requestedSlugs.includes(article.slug))
    : articles;

  const missing = requestedSlugs.filter((slug) => !selected.some((article) => article.slug === slug));
  if (missing.length) {
    throw new Error(`Unknown article slug(s): ${missing.join(', ')}`);
  }

  await writeGeneratedFiles(selected, { updateGlobalIndex: requestedSlugs.length === 0 });
  console.log(`Generated ${selected.length} marketing pack(s) in ${path.relative(rootDir, outputDir)}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import {
  dataBase,
  encodePathSegment,
  getDateDaysAgo,
  googleApiJson,
  loadConfig,
  printGoogleError,
  searchConsoleBase,
} from './common.mjs';

const funnelEvents = [
  'page_view',
  'screen_engagement',
  'button_click',
  'quiz_start',
  'quiz_completion',
  'result_view',
  'explore_start',
  'explore_complete',
  'view_item',
  'begin_checkout',
  'purchase',
];

const cleanupParamPattern = /[?&](utm_[^=]+|from|source|source_site|origin_path|entry_surface|destination_type|code|token|orderId|order_id|transactionId|transaction_id)=/i;

const main = async () => {
  const config = await loadConfig();
  const startDate = process.env.GOOGLE_STACK_START_DATE || getDateDaysAgo(30);
  const endDate = process.env.GOOGLE_STACK_END_DATE || getDateDaysAgo(2);
  const encodedSite = encodePathSegment(config.searchConsoleSiteUrl);

  console.log(`# Kiwimu Google Stack Report`);
  console.log(`\nRange: ${startDate} to ${endDate}`);
  console.log(`GA4 property: ${config.ga4PropertyName || config.ga4PropertyId} (${config.ga4PropertyId})`);
  console.log(`Search Console: ${config.searchConsoleSiteUrl}\n`);

  const gscSummary = await googleApiJson(`${searchConsoleBase}/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    body: {
      startDate,
      endDate,
      rowLimit: 1,
    },
  });
  const summary = gscSummary.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  console.log(`## Search Console Summary`);
  console.log(`- Clicks: ${summary.clicks || 0}`);
  console.log(`- Impressions: ${summary.impressions || 0}`);
  console.log(`- CTR: ${((summary.ctr || 0) * 100).toFixed(2)}%`);
  console.log(`- Avg position: ${(summary.position || 0).toFixed(1)}`);

  console.log(`\n## Search Rows By Site`);
  const cleanupRows = [];
  for (const siteConfig of config.sites) {
    const siteRows = await googleApiJson(`${searchConsoleBase}/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      body: {
        startDate,
        endDate,
        dimensions: ['page', 'query'],
        rowLimit: 10,
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'page',
                operator: 'contains',
                expression: siteConfig.contentUrlPrefix || siteConfig.baseUrl,
              },
            ],
          },
        ],
      },
    });

    console.log(`\n### ${siteConfig.name || siteConfig.id}`);
    for (const row of siteRows.rows || []) {
      const [page, query] = row.keys || [];
      if (cleanupParamPattern.test(page || '')) {
        cleanupRows.push({
          site: siteConfig.name || siteConfig.id,
          page,
          query,
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
        });
      }
      console.log(
        `- ${row.clicks || 0} clicks / ${row.impressions || 0} impressions / pos ${(row.position || 0).toFixed(
          1,
        )}: "${query || ''}" -> ${page || ''}`,
      );
    }
    if (!siteRows.rows?.length) console.log('- No rows returned for this range.');
  }

  console.log(`\n## Canonical Cleanup Watchlist`);
  if (cleanupRows.length) {
    for (const row of cleanupRows) {
      console.log(`- ${row.site}: ${row.clicks} clicks / ${row.impressions} impressions: "${row.query || ''}" -> ${row.page}`);
    }
  } else {
    console.log('- No tracked query URLs found in the top rows for this range.');
  }

  const ga4 = await googleApiJson(`${dataBase}/properties/${config.ga4PropertyId}:runReport`, {
    method: 'POST',
    body: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: funnelEvents,
          },
        },
      },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    },
  });

  console.log(`\n## GA4 Funnel Events`);
  const rows = ga4.rows || [];
  for (const eventName of funnelEvents) {
    const row = rows.find((item) => item.dimensionValues?.[0]?.value === eventName);
    const count = row?.metricValues?.[0]?.value || '0';
    console.log(`- ${eventName}: ${count}`);
  }
};

main().catch((error) => {
  printGoogleError(error);
  process.exitCode = 1;
});

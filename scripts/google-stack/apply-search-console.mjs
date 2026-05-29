import {
  encodePathSegment,
  getDateDaysAgo,
  googleApiJson,
  googleApiText,
  loadConfig,
  printGoogleError,
  searchConsoleBase,
} from './common.mjs';

const main = async () => {
  const config = await loadConfig();
  const encodedSite = encodePathSegment(config.searchConsoleSiteUrl);

  const sites = await googleApiJson(`${searchConsoleBase}/sites`);
  const site = (sites.siteEntry || []).find((entry) => entry.siteUrl === config.searchConsoleSiteUrl);
  if (!site) {
    throw new Error(
      `Search Console site ${config.searchConsoleSiteUrl} is not accessible. Add the authorized Google account to this property first.`,
    );
  }
  console.log(`OK Search Console site: ${site.siteUrl} (${site.permissionLevel})`);

  for (const siteConfig of config.sites) {
    await googleApiText(`${searchConsoleBase}/sites/${encodedSite}/sitemaps/${encodePathSegment(siteConfig.sitemapUrl)}`, {
      method: 'PUT',
    });
    console.log(`SUBMITTED sitemap [${siteConfig.id}]: ${siteConfig.sitemapUrl}`);
  }

  const startDate = process.env.GOOGLE_STACK_START_DATE || getDateDaysAgo(30);
  const endDate = process.env.GOOGLE_STACK_END_DATE || getDateDaysAgo(2);

  for (const siteConfig of config.sites) {
    const query = await googleApiJson(`${searchConsoleBase}/sites/${encodedSite}/searchAnalytics/query`, {
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

    const rows = query.rows || [];
    console.log(`\n${siteConfig.id} search rows (${startDate} to ${endDate}): ${rows.length}`);
    for (const row of rows.slice(0, 10)) {
      const [page, searchQuery] = row.keys || [];
      console.log(
        `- clicks=${row.clicks || 0} impressions=${row.impressions || 0} ctr=${((row.ctr || 0) * 100).toFixed(
          2,
        )}% position=${(row.position || 0).toFixed(1)} query="${searchQuery || ''}" page=${page || ''}`,
      );
    }
  }
};

main().catch((error) => {
  printGoogleError(error);
  process.exitCode = 1;
});

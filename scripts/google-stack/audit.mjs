import {
  adminBase,
  encodePathSegment,
  googleApiJson,
  loadConfig,
  printGoogleError,
  searchConsoleBase,
} from './common.mjs';

const checks = [];

const record = (name, ok, detail) => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? 'OK' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
};

const main = async () => {
  const config = await loadConfig();
  console.log(`Google Stack config: ${config.configPath}`);

  record('config.cloudProjectId', config.cloudProjectId === 'kiwimu-site', config.cloudProjectId);
  record('config.ga4PropertyId', config.ga4PropertyId === '526838967', config.ga4PropertyId);
  record('config.ga4MeasurementId', config.ga4MeasurementId === 'G-DM6F27KL8B', config.ga4MeasurementId);
  record('config.searchConsoleSiteUrl', config.searchConsoleSiteUrl === 'sc-domain:kiwimu.com', config.searchConsoleSiteUrl);

  for (const siteConfig of config.sites) {
    const sitemapResponse = await fetch(siteConfig.sitemapUrl, { method: 'GET' });
    record(
      `sitemap is readable: ${siteConfig.id}`,
      sitemapResponse.ok,
      `${siteConfig.sitemapUrl} (${sitemapResponse.status} ${sitemapResponse.statusText})`,
    );
  }

  const property = await googleApiJson(`${adminBase}/properties/${config.ga4PropertyId}`);
  record('GA4 property is readable', Boolean(property?.name), property?.displayName || property?.name);

  const streams = await googleApiJson(`${adminBase}/properties/${config.ga4PropertyId}/dataStreams`);
  const matchingStream = (streams.dataStreams || []).find(
    (stream) => stream.webStreamData?.measurementId === config.ga4MeasurementId,
  );
  record(
    'GA4 measurement ID matches a web data stream',
    Boolean(matchingStream),
    matchingStream?.displayName || config.ga4MeasurementId,
  );

  const sites = await googleApiJson(`${searchConsoleBase}/sites`);
  const site = (sites.siteEntry || []).find((entry) => entry.siteUrl === config.searchConsoleSiteUrl);
  record('Search Console site is readable', Boolean(site), site?.permissionLevel || config.searchConsoleSiteUrl);

  if (site) {
    for (const siteConfig of config.sites) {
      const sitemapUrl = `${searchConsoleBase}/sites/${encodePathSegment(
        config.searchConsoleSiteUrl,
      )}/sitemaps/${encodePathSegment(siteConfig.sitemapUrl)}`;
      try {
        const sitemap = await googleApiJson(sitemapUrl);
        record(`Search Console sitemap record exists: ${siteConfig.id}`, Boolean(sitemap), sitemap?.path || siteConfig.sitemapUrl);
      } catch (error) {
        if (error.status === 404) {
          record(`Search Console sitemap record exists: ${siteConfig.id}`, false, 'not submitted yet');
        } else {
          throw error;
        }
      }
    }
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    console.error(`\nAudit completed with ${failed.length} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log('\nAudit passed.');
  }
};

main().catch((error) => {
  printGoogleError(error);
  process.exitCode = 1;
});

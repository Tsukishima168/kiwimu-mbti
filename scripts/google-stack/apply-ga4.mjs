import {
  GoogleApiError,
  adminBase,
  googleApiJson,
  listAll,
  loadConfig,
  printGoogleError,
} from './common.mjs';

const customDimensions = [
  ['site_id', 'Canonical site identifier for the five-site Kiwimu universe.'],
  ['page_name', 'Virtual page path or screen path for Kiwimu funnel analysis.'],
  ['screen_name', 'Screen name used by screen_engagement events.'],
  ['mbti_type', 'MBTI type associated with quiz completion, result views, and V2 events.'],
  ['source', 'Internal source surface such as v1_result_card, v2_quiz, or answers_article.'],
  ['source_site', 'Originating site for cross-site journeys and Passport broker flows.'],
  ['target_site', 'Destination site for cross-site outbound journeys.'],
  ['unlock_type', 'V2 entitlement or unlock source.'],
  ['button_name', 'Canonical CTA button name.'],
  ['button_location', 'Canonical CTA button location.'],
  ['campaign_id', 'Campaign identifier for acquisition and quiz completion events.'],
  ['checkout_url', 'Checkout destination used by V2 unlock CTAs.'],
  ['reward_id', 'Reward identifier for Passport, Map, and Gacha reward flows.'],
  ['stamp_id', 'Passport stamp identifier for claim and unlock flows.'],
  ['prize_type', 'Prize category emitted by Gacha and reward experiences.'],
  ['entrance_source', 'Entry source for Passport and cross-site acquisition surfaces.'],
  ['method', 'Auth, claim, unlock, or checkout method.'],
  ['intent', 'User intent for identity, reward, checkout, or navigation flows.'],
];

const keyEvents = [
  'quiz_completion',
  'sign_up',
  'login',
  'passport_checkin',
  'stamp_claim',
  'reward_redeemed',
  'add_to_cart',
  'begin_checkout',
  'purchase',
];

const createOrSkip = async (label, createFn) => {
  try {
    await createFn();
    console.log(`CREATED ${label}`);
  } catch (error) {
    if (error instanceof GoogleApiError && [400, 409].includes(error.status)) {
      const message = error.body?.error?.message || '';
      if (/already exists|duplicate/i.test(message)) {
        console.log(`SKIP ${label} - already exists`);
        return;
      }
    }
    throw error;
  }
};

const main = async () => {
  const config = await loadConfig();
  const dimensionsUrl = `${adminBase}/properties/${config.ga4PropertyId}/customDimensions`;
  const keyEventsUrl = `${adminBase}/properties/${config.ga4PropertyId}/keyEvents`;

  console.log(`Applying GA4 setup to ${config.ga4PropertyName || config.ga4PropertyId} (${config.ga4PropertyId})`);

  const existingDimensions = await listAll(dimensionsUrl, 'customDimensions');
  const existingParameterNames = new Set(existingDimensions.map((dimension) => dimension.parameterName));

  for (const [parameterName, description] of customDimensions) {
    if (existingParameterNames.has(parameterName)) {
      console.log(`SKIP custom dimension ${parameterName} - already exists`);
      continue;
    }
    await createOrSkip(`custom dimension ${parameterName}`, () =>
      googleApiJson(dimensionsUrl, {
        method: 'POST',
        body: {
          parameterName,
          displayName: parameterName,
          description,
          scope: 'EVENT',
        },
      }),
    );
  }

  const existingKeyEvents = await listAll(keyEventsUrl, 'keyEvents');
  const existingEventNames = new Set(existingKeyEvents.map((event) => event.eventName));

  for (const eventName of keyEvents) {
    if (existingEventNames.has(eventName)) {
      console.log(`SKIP key event ${eventName} - already exists`);
      continue;
    }
    await createOrSkip(`key event ${eventName}`, () =>
      googleApiJson(keyEventsUrl, {
        method: 'POST',
        body: { eventName },
      }),
    );
  }

  console.log('GA4 setup complete.');
};

main().catch((error) => {
  printGoogleError(error);
  process.exitCode = 1;
});

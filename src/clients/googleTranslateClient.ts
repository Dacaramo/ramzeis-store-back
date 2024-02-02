import { Translate } from '@google-cloud/translate/build/src/v2';

const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY;

if (!apiKey) {
  throw new Error(
    'GOOGLE_CLOUD_TRANSLATION_API_KEY missing, it may be because the key is not defined on the Serverless Framework Dashboard. Since this value is a secret it must be defined on the dashboard.'
  );
}

export const googleTranslateClient = new Translate({
  key: apiKey,
});

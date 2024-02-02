import Stripe from 'stripe';

const apiKey = process.env.STRIPE_API_KEY;

if (!apiKey) {
  throw new Error(
    'STRIPE_API_KEY missing, it may be because the key is not defined on the Serverless Framework Dashboard. Since this value is a secret it must be defined on the dashboard.'
  );
}

export const stripeClient = new Stripe(apiKey);

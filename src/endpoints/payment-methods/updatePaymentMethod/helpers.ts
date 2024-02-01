import Stripe from 'stripe';
import { stripeClient } from '../../../clients/stripeClient';

export const updatePaymentMethodOnStripe = async (
  stripePaymentMethodId: string,
  patch: Stripe.PaymentMethodUpdateParams
): Promise<void> => {
  try {
    await stripeClient.paymentMethods.update(stripePaymentMethodId, patch);
  } catch (error) {
    throw error;
  }
};

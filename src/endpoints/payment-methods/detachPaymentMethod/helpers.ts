import { stripeClient } from '../../../clients/stripeClient';

/**
 * Detaches a Payment Method from a Stripe customer. This is equivalent to deleting the Payment Method, since Stripe does not let you delete Payment Methods directly.
 */
export const detachPaymentMethodFromStripeCustomer = async (
  stripePaymentMethodId: string
) => {
  try {
    await stripeClient.paymentMethods.detach(stripePaymentMethodId);
  } catch (error) {
    throw error;
  }
};

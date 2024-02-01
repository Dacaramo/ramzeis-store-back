import { stripeClient } from '../../../clients/stripeClient';
import { ThirdPartyServerError } from '../../../model/Error';

/**
 * Creates a Setup Intent on Stripe. A Setup Intent is used to save a Payment Method and link it to a customer. Keep in mind that in order to fully save the Payment Method and link it to the customer you must create the Payment Method on the front-end, pass it's id and the customer id to this endpoint and use the client secret returned by this endpoint on the front-end to confirm the Payment Method that was created previously on the front-end.
 */
export const createSetupIntentOnStripe = async (
  buyerStripeCustomerId: string,
  stripePaymentMethodId: string
): Promise<string> => {
  try {
    const clientSecret = (
      await stripeClient.setupIntents.create({
        customer: buyerStripeCustomerId,
        payment_method: stripePaymentMethodId,
      })
    ).client_secret;

    if (clientSecret === null) {
      throw new ThirdPartyServerError(
        'Invalid response from stripe when creating the Setup Intent, the client secret returned by Stripe is null'
      );
    }

    return clientSecret;
  } catch (error) {
    throw error;
  }
};

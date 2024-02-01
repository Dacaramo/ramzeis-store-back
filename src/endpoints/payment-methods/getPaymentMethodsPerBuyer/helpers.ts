import Stripe from 'stripe';
import { stripeClient } from '../../../clients/stripeClient';
import { ListResponse } from '../../../model/ListResponse';
import { ThirdPartyServerError } from '../../../model/Error';
import { decodeEsk } from '../../../utils/decodeEsk';

export const getPaymentMethodsPerBuyerFromStripe = async (
  buyerStripeCustomerId: string,
  limit: number,
  encodedExclusiveStartKey?: string
): Promise<ListResponse<Stripe.PaymentMethod>> => {
  try {
    const decodedEsk = encodedExclusiveStartKey
      ? decodeEsk(encodedExclusiveStartKey)
      : undefined;
    const paymentMethods = await stripeClient.customers.listPaymentMethods(
      buyerStripeCustomerId,
      {
        limit,
        starting_after: decodedEsk?.stripePaymentMethodId as string,
      }
    );

    if (paymentMethods.has_more && paymentMethods.data.length <= 0) {
      throw new ThirdPartyServerError(
        "Invalid response from Stripe, the has_more prop value is true but the data array is empty, meaning that apparently there's more data to be retrieved but there's not. With this response we can't know what's the lastEvaluatedKey to be used in the next request and we can't keep retrieving data from Stripe."
      );
    }

    return {
      items: paymentMethods.data,
      lastEvaluatedKey: paymentMethods.has_more
        ? {
            stripePaymentMethodId:
              paymentMethods.data[paymentMethods.data.length - 1].id,
          }
        : undefined,
      count: paymentMethods.data.length,
      scannedCount: paymentMethods.data.length,
    };
  } catch (error) {
    throw error;
  }
};

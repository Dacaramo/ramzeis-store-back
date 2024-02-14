import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { stripePaymentMethodIdSchema } from '../../../model/otherSchemas';
import { buyerStripeCustomerIdSchema } from '../../../model/Buyer';
import { createSetupIntentOnStripe } from './helpers';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const createSetupIntent = async (event: APIGatewayProxyEvent) => {
  try {
    const buyerStripeCustomerId =
      event.queryStringParameters?.buyerStripeCustomerId;
    const stripePaymentMethodId = (
      JSON.parse(event.body!) as {
        stripePaymentMethodId: string;
      }
    ).stripePaymentMethodId;

    const parsedBuyerStripeCustomerId = parse(
      buyerStripeCustomerIdSchema,
      buyerStripeCustomerId
    );
    const parsedStripePaymentMethodId = parse(
      stripePaymentMethodIdSchema,
      stripePaymentMethodId
    );

    const clientSecret = await createSetupIntentOnStripe(
      parsedBuyerStripeCustomerId,
      parsedStripePaymentMethodId
    );
    return {
      statusCode: 201,
      body: JSON.stringify({
        clientSecret,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(createSetupIntent);

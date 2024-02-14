import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { stripePaymentMethodIdSchema } from '../../../model/otherSchemas';
import { detachPaymentMethodFromStripeCustomer } from './helpers';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const detachPaymentMethod = async (event: APIGatewayProxyEvent) => {
  try {
    const stripePaymentMethodId = event.pathParameters?.stripePaymentMethodId;

    const parsedStripePaymentMethodId = parse(
      stripePaymentMethodIdSchema,
      stripePaymentMethodId
    );

    await detachPaymentMethodFromStripeCustomer(parsedStripePaymentMethodId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The Payment Method [${parsedStripePaymentMethodId}] was detached successfully from it's customer.`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(detachPaymentMethod);

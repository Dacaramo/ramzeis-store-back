import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { stripePaymentMethodIdSchema } from '../../../model/otherSchemas';
import { detachPaymentMethodFromStripeCustomer } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { stripePaymentMethodIdSchema } from '../../../model/otherSchemas';
import { updatePaymentMethodOnStripe } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const stripePaymentMethodId = event.pathParameters?.stripePaymentMethodId;
    const patch = JSON.parse(event.body!);

    const parsedStripePaymentMethodId = parse(
      stripePaymentMethodIdSchema,
      stripePaymentMethodId
    );

    await updatePaymentMethodOnStripe(parsedStripePaymentMethodId, patch);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Payment method [${parsedStripePaymentMethodId}] updated successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

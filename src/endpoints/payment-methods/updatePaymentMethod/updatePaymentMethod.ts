import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { stripePaymentMethodIdSchema } from '../../../model/otherSchemas';
import { updatePaymentMethodOnStripe } from './helpers';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const updatePaymentMethod = async (event: APIGatewayProxyEvent) => {
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

export const handler = middy().use(cors()).handler(updatePaymentMethod);

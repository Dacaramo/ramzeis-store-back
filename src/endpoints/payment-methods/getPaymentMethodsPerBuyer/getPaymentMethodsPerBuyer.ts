import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { buyerStripeCustomerIdSchema } from '../../../model/Buyer';
import { optional, parse } from 'valibot';
import {
  encodedExclusiveStartKeySchema,
  limitSchema,
} from '../../../model/otherSchemas';
import { getPaymentMethodsPerBuyerFromStripe } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const defaultLimit = 5;
    const buyerStripeCustomerId = event.pathParameters?.buyerStripeCustomerId;
    const limit =
      event.queryStringParameters && event.queryStringParameters.limit
        ? parseInt(event.queryStringParameters.limit)
        : defaultLimit;
    const encodedExclusiveStartKey =
      event.queryStringParameters?.encodedExclusiveStartKey;

    const parsedBuyerStripeCustomerId = parse(
      buyerStripeCustomerIdSchema,
      buyerStripeCustomerId
    );
    const parsedLimit = parse(limitSchema, limit);
    const parsedEncodedExclusiveStartKey = parse(
      optional(encodedExclusiveStartKeySchema),
      encodedExclusiveStartKey
    );

    const data = await getPaymentMethodsPerBuyerFromStripe(
      parsedBuyerStripeCustomerId,
      parsedLimit,
      parsedEncodedExclusiveStartKey
    );
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

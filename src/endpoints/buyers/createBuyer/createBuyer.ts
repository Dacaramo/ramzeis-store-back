import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { createBuyerOnDdbTable, createBuyerOnStripe } from './helpers';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { Buyer, buyerEmailSchema, buyerSchema } from '../../../model/Buyer';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const requestBody = JSON.parse(event.body!) as {
      buyerEmail: Buyer['pk'];
      buyerCartDetails?: Buyer['buyerCartDetails'];
      buyerAgreements: Omit<Buyer['buyerAgreements'], 'acceptanceIP'>;
    };
    const buyerEmail = requestBody.buyerEmail;

    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);

    const stripeCustomer = await createBuyerOnStripe(parsedBuyerEmail);

    let clientIP;
    if (event.headers && event.headers['X-Forwarded-For']) {
      const forwardedFor = event.headers['X-Forwarded-For'];
      clientIP = forwardedFor.split(',')[0].trim();
    } else {
      clientIP = event.requestContext.identity.sourceIp;
    }

    const buyer: Buyer = {
      pk: parsedBuyerEmail,
      sk: 'N/A',
      buyerCartDetails: requestBody.buyerCartDetails ?? {},
      buyerStripeCustomerId: stripeCustomer.id,
      buyerAgreements: [
        {
          ...requestBody.buyerAgreements[0],
          acceptanceIP: clientIP,
        },
      ],
    };
    /* Additional validation, since it is already validated by API Gateway */
    const parsedBuyer = parse(buyerSchema, buyer);

    await createBuyerOnDdbTable(parsedTableName, parsedBuyer);
    return {
      statusCode: 201,
      body: JSON.stringify({
        buyerStripeCustomerId: parsedBuyer.buyerStripeCustomerId,
        buyerAgreements: parsedBuyer.buyerAgreements,
      }),
    };
  } catch (error: unknown) {
    return inferRequestResponseFromError(error);
  }
};

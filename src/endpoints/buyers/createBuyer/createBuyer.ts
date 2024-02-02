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
    };
    const buyerEmail = requestBody.buyerEmail;

    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);

    const stripeCustomer = await createBuyerOnStripe(parsedBuyerEmail);

    const buyer: Buyer = {
      pk: parsedBuyerEmail,
      sk: 'N/A',
      buyerCartDetails: requestBody.buyerCartDetails ?? {},
      buyerStripeCustomerId: stripeCustomer.id,
    };
    /* Additional validation, since it is already validated by API Gateway */
    const parsedBuyer = parse(buyerSchema, buyer);

    await createBuyerOnDdbTable(parsedTableName, parsedBuyer);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: `The buyer [${buyerEmail}] was created successfully`,
      }),
    };
  } catch (error: unknown) {
    return inferRequestResponseFromError(error);
  }
};

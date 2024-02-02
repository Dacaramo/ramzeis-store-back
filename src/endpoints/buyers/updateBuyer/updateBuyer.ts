import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { BuyerPatch, buyerPatchSchema } from '../../../model/Buyer';
import { parse } from 'valibot';
import { buyerEmailSchema } from '../../../model/Buyer';
import { tableNameSchema } from '../../../model/otherSchemas';
import { updateBuyerOnDdbTable } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const buyerEmail = event.pathParameters?.buyerId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const patch = JSON.parse(event.body!) as BuyerPatch;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    /* Additional validation, since it is already validated by API Gateway */
    const parsedPatch = parse(buyerPatchSchema, patch);

    await updateBuyerOnDdbTable(parsedTableName, parsedBuyerEmail, parsedPatch);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The buyer [${buyerEmail}] was updated successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

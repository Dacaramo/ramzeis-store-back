import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { deleteAddressFromDdbTable } from './helpers';
import { buyerEmailSchema } from '../../../model/Buyer';
import { addressIdSchema } from '../../../model/Address';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const addressId = event.pathParameters?.addressId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedAddressId = parse(addressIdSchema, addressId);
    const parsedTableName = parse(tableNameSchema, tableName);

    await deleteAddressFromDdbTable(
      parsedTableName,
      parsedBuyerEmail,
      parsedAddressId
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The buyer [${buyerEmail}] address [${addressId}] was deleted successfully`,
      }),
    };
  } catch (error: unknown) {
    return inferRequestResponseFromError(error);
  }
};

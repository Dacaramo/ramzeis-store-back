import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import {
  ExclusiveStartKey,
  exclusiveStartKeySchema,
  limitSchema,
  tableNameSchema,
} from '../../../model/otherSchemas';
import { buyerEmailSchema } from '../../../model/Buyer';
import { getOrdersPerBuyerFromDdbTable } from './helpers';
import {
  OrderFilterValues,
  orderFilterValuesSchema,
} from '../../../model/Order';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const defaultLimit = 5;
    const buyerEmail = event.pathParameters?.buyerId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const orderFilterValues: OrderFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
    };

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedOrderFilterValues = parse(
      orderFilterValuesSchema,
      orderFilterValues
    );

    const data = await getOrdersPerBuyerFromDdbTable(
      parsedTableName,
      parsedBuyerEmail,
      parsedOrderFilterValues
    );
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

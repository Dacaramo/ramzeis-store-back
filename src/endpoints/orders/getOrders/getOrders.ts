import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import {
  OrderFilterValues,
  orderFilterValuesSchema,
} from '../../../model/Order';
import { getOrdersFromDdbTable } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const defaultLimit = 10;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const orderFilterValues: OrderFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
      lowerCreationDate: qsp.lowerCreationDate,
      upperCreationDate: qsp.upperCreationDate,
      lowerCompletionDate: qsp.lowerCompletionDate,
      upperCompletionDate: qsp.upperCompletionDate,
      statusId: qsp.statusId,
    };

    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedOrderFilterValues = parse(
      orderFilterValuesSchema,
      orderFilterValues
    );

    const data = await getOrdersFromDdbTable(
      parsedTableName,
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

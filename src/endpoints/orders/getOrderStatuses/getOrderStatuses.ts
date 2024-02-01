import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { getOrderStatusesFromDdbTable } from '../helpers';
import { localeIdSchema } from '../../../model/Locale';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const localeId = event.pathParameters?.localeId;
    const tableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;

    const parsedLocaleId = parse(localeIdSchema, localeId);
    const parsedTableName = parse(tableNameSchema, tableName);

    const languageCode = parsedLocaleId.split('-')[0];

    const statuses = await getOrderStatusesFromDdbTable(
      parsedTableName,
      languageCode
    );
    return {
      statusCode: 200,
      body: JSON.stringify(statuses),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

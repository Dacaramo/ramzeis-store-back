import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { getSupportedLocales } from './helpers';
import { tableNameSchema } from '../model/otherSchemas';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const tableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;

    const parsedTableName = parse(tableNameSchema, tableName);

    const supportedLocales = getSupportedLocales(parsedTableName);
    return {
      statusCode: 200,
      body: JSON.stringify(supportedLocales),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

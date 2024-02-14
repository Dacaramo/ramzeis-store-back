import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { getSupportedLocalesFromDdbTable } from './helpers';
import { tableNameSchema } from '../model/otherSchemas';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getSupportedLocales = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;

    const parsedTableName = parse(tableNameSchema, tableName);

    const supportedLocales = getSupportedLocalesFromDdbTable(parsedTableName);
    return {
      statusCode: 200,
      body: JSON.stringify(supportedLocales),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(getSupportedLocales);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { getProductCategoriesFromDdbTable } from '../helpers';
import { localeIdSchema } from '../../../model/Locale';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getProductCategories = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;
    const localeId = event.pathParameters?.localeId;

    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedLocaleId = parse(localeIdSchema, localeId);

    const languageCode = parsedLocaleId.split('-')[0];

    const categories = await getProductCategoriesFromDdbTable(
      parsedTableName,
      languageCode
    );
    return {
      statusCode: 200,
      body: JSON.stringify(categories),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(getProductCategories);

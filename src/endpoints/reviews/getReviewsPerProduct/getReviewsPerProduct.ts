import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { productIdSchema } from '../../../model/Product';
import { getReviewsPerProductFromDdbTable } from './helpers';
import {
  ReviewFilterValues,
  reviewFilterValuesSchema,
} from '../../../model/Review';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const defaultLimit = 10;
    const productId = event.pathParameters?.productId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const reviewFilterValues: ReviewFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
    };

    const parsedProductId = parse(productIdSchema, productId);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedReviewFilterValues = parse(
      reviewFilterValuesSchema,
      reviewFilterValues
    );

    const data = await getReviewsPerProductFromDdbTable(
      parsedTableName,
      parsedProductId,
      parsedReviewFilterValues
    );
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

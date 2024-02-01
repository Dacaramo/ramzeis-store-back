import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { Review, reviewSchema } from '../../../model/Review';
import { parse } from 'valibot';
import { productIdSchema } from '../../../model/Product';
import * as crypto from 'crypto';
import { tableNameSchema } from '../../../model/otherSchemas';
import { createReviewOnDdbTable } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const requestBody = JSON.parse(event.body!) as Omit<Review, 'pk' | 'sk'>;

    const parsedProductId = parse(productIdSchema, productId);
    const parsedTableName = parse(tableNameSchema, tableName);
    const item: Review = {
      pk: parsedProductId,
      sk: `review|${crypto.randomUUID()}`,
      ...requestBody,
    };
    const parsedItem = parse(reviewSchema, item);

    await createReviewOnDdbTable(parsedTableName, parsedItem);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'The Review was created successfully',
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

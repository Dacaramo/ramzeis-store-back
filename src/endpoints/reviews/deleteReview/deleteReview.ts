import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { productIdSchema } from '../../../model/Product';
import { reviewIdSchema } from '../../../model/Review';
import { tableNameSchema } from '../../../model/otherSchemas';
import { deleteReviewFromDdbTable } from './helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productId;
    const reviewId = event.pathParameters?.reviewId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;

    const parsedProductId = parse(productIdSchema, productId);
    const parsedReviewId = parse(reviewIdSchema, reviewId);
    const parsedTableName = parse(tableNameSchema, tableName);

    await deleteReviewFromDdbTable(
      parsedTableName,
      parsedProductId,
      parsedReviewId
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The review [${parsedReviewId}] from the product [${parsedProductId}] was deleted successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

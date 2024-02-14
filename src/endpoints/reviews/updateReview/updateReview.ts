import { APIGatewayProxyEvent } from 'aws-lambda';
import { parse } from 'valibot';
import {
  ReviewPatch,
  reviewIdSchema,
  reviewPatchSchema,
} from '../../../model/Review';
import { productIdSchema } from '../../../model/Product';
import { tableNameSchema } from '../../../model/otherSchemas';
import { updateReviewOnDdbTable } from './helpers';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const updateReview = async (event: APIGatewayProxyEvent) => {
  const productId = event.pathParameters?.productId;
  const reviewId = event.pathParameters?.reviewId;
  const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
  const patch = JSON.parse(event.body!) as ReviewPatch;

  const parsedProductId = parse(productIdSchema, productId);
  const parsedReviewId = parse(reviewIdSchema, reviewId);
  const parsedTableName = parse(tableNameSchema, tableName);
  /* Additional validation, since it is already validated by API Gateway */
  const parsedPatch = parse(reviewPatchSchema, patch);

  try {
    await updateReviewOnDdbTable(
      parsedTableName,
      parsedProductId,
      parsedReviewId,
      parsedPatch
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        msg: `The product [${parsedProductId}] review [${parsedReviewId}] was updated successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(updateReview);

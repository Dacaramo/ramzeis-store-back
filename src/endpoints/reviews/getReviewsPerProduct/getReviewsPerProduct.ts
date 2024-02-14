import { APIGatewayProxyEvent } from 'aws-lambda';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { productIdSchema } from '../../../model/Product';
import { getReviewsPerProductFromDdbTable } from './helpers';
import {
  ReviewFilterValues,
  reviewFilterValuesSchema,
} from '../../../model/Review';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getReviewsPerProduct = async (event: APIGatewayProxyEvent) => {
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

export const handler = middy().use(cors()).handler(getReviewsPerProduct);

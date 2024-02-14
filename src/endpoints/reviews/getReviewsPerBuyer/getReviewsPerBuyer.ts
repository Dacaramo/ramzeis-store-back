import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { buyerEmailSchema } from '../../../model/Buyer';
import { tableNameSchema } from '../../../model/otherSchemas';
import { getReviewsPerBuyerFromDdbTable } from './helpers';
import {
  ReviewFilterValues,
  reviewFilterValuesSchema,
} from '../../../model/Review';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getReviewsPerBuyer = async (event: APIGatewayProxyEvent) => {
  try {
    const defaultLimit = 5;
    const buyerEmail = event.pathParameters?.buyerEmail;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const reviewFilterValues: ReviewFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
    };

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedReviewFilterValues = parse(
      reviewFilterValuesSchema,
      reviewFilterValues
    );

    const data = await getReviewsPerBuyerFromDdbTable(
      parsedTableName,
      parsedBuyerEmail,
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

export const handler = middy().use(cors()).handler(getReviewsPerBuyer);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { buyerEmailSchema } from '../../../model/Buyer';
import { getOrdersPerBuyerFromDdbTable } from './helpers';
import {
  OrderFilterValues,
  orderFilterValuesSchema,
} from '../../../model/Order';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getOrdersPerBuyer = async (event: APIGatewayProxyEvent) => {
  try {
    const defaultLimit = 5;
    const buyerEmail = event.pathParameters?.buyerId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const orderFilterValues: OrderFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
    };

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedOrderFilterValues = parse(
      orderFilterValuesSchema,
      orderFilterValues
    );

    const data = await getOrdersPerBuyerFromDdbTable(
      parsedTableName,
      parsedBuyerEmail,
      parsedOrderFilterValues
    );
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(getOrdersPerBuyer);

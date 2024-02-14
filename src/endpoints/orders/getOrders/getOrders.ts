import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import {
  OrderFilterValues,
  orderFilterValuesSchema,
} from '../../../model/Order';
import { getOrdersFromDdbTable } from './helpers';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getOrders = async (event: APIGatewayProxyEvent) => {
  try {
    const defaultLimit = 10;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const orderFilterValues: OrderFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
      lowerCreationDate: qsp.lowerCreationDate,
      upperCreationDate: qsp.upperCreationDate,
      lowerCompletionDate: qsp.lowerCompletionDate,
      upperCompletionDate: qsp.upperCompletionDate,
      statusId: qsp.statusId,
    };

    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedOrderFilterValues = parse(
      orderFilterValuesSchema,
      orderFilterValues
    );

    const data = await getOrdersFromDdbTable(
      parsedTableName,
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

export const handler = middy().use(cors()).handler(getOrders);

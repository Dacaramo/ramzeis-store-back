import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { getAddressesPerBuyerFromDdbTable } from './helpers';
import { buyerEmailSchema } from '../../../model/Buyer';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import {
  AddressFilterValues,
  addressFilterValuesSchema,
} from '../../../model/Address';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const defaultLimit = 5;
    const buyerEmail = event.pathParameters?.buyerEmail;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const qsp = event.queryStringParameters ?? {};
    const addressFilterValues: AddressFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
    };

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedAddressFilterValues = parse(
      addressFilterValuesSchema,
      addressFilterValues
    );

    const data = await getAddressesPerBuyerFromDdbTable(
      parsedTableName,
      parsedBuyerEmail,
      parsedAddressFilterValues
    );
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

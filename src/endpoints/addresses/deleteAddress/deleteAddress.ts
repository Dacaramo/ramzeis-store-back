import { APIGatewayProxyEvent } from 'aws-lambda';
import { deleteAddressFromDdbTable } from './helpers';
import { buyerEmailSchema } from '../../../model/Buyer';
import { addressIdSchema } from '../../../model/Address';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const deleteAddress = async (event: APIGatewayProxyEvent) => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const addressId = event.pathParameters?.addressId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedAddressId = parse(addressIdSchema, addressId);
    const parsedTableName = parse(tableNameSchema, tableName);

    await deleteAddressFromDdbTable(
      parsedTableName,
      parsedBuyerEmail,
      parsedAddressId
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The buyer [${buyerEmail}] address [${addressId}] was deleted successfully`,
      }),
    };
  } catch (error: unknown) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(deleteAddress);

import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  deleteAllBuyerAddressesFromDdbTable,
  deleteBuyerFromDdbTable,
  deleteCustomerFromStripe,
  getBuyerCustomerIdFromStripe,
} from './helpers';
import {
  buyerEmailSchema,
  buyerStripeCustomerIdSchema,
} from '../../../model/Buyer';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const deleteBuyer = async (event: APIGatewayProxyEvent) => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);

    await deleteBuyerFromDdbTable(parsedTableName, parsedBuyerEmail);
    await deleteAllBuyerAddressesFromDdbTable(
      parsedTableName,
      parsedBuyerEmail
    );
    const buyerStripeCustomerId = await getBuyerCustomerIdFromStripe(
      parsedBuyerEmail
    );
    const parsedBuyerStripeCustomerId = parse(
      buyerStripeCustomerIdSchema,
      buyerStripeCustomerId
    );
    await deleteCustomerFromStripe(parsedBuyerStripeCustomerId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The buyer [${buyerEmail}] was successfully deleted`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(deleteBuyer);

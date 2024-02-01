import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import {
  calculateTotalAmountToPay,
  createOrderOnDdbTable,
  createPaymentIntentOnStripe,
} from './helpers';
import { Order, orderSchema } from '../../../model/Order';
import * as crypto from 'crypto';
import { validateOrderStatusId } from '../helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  try {
    const defaultCurrency = 'usd';
    const mainTableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const secondaryTableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;
    const requestBody = JSON.parse(event.body!) as Omit<Order, 'pk' | 'sk'>;
    const item: Order = {
      pk: `order|${crypto.randomUUID()}`,
      sk: 'N/A',
      ...requestBody,
    };

    const parsedMainTableName = parse(tableNameSchema, mainTableName);
    const parsedSecondaryTableName = parse(tableNameSchema, secondaryTableName);
    /* Additional validation, since it is already validated by API Gateway */
    const parsedItem = parse(orderSchema, item) as Order;

    /* The orderStatusId needs to be validated against the supported ids that are on dynamoDD */
    await validateOrderStatusId(
      parsedSecondaryTableName,
      parsedItem.orderStatusId
    );

    const totalAmountToPay = calculateTotalAmountToPay(
      item.orderProductsDetails
    );
    const clientSecret = await createPaymentIntentOnStripe(
      item.orderStripePaymentMethodId,
      totalAmountToPay,
      defaultCurrency
    );
    await createOrderOnDdbTable(parsedMainTableName, parsedItem);
    return {
      statusCode: 201,
      body: JSON.stringify({
        clientSecret,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

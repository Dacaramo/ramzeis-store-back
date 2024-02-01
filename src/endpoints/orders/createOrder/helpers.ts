import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Order } from '../../../model/Order';
import { ResponseMetadata } from '@aws-sdk/types';
import ddbDocClient from '../../../clients/ddbDocClient';
import { stripeClient } from '../../../clients/stripeClient';
import { ThirdPartyServerError } from '../../../model/Error';

export const createOrderOnDdbTable = async (
  tableName: string,
  item: Order
): Promise<ResponseMetadata> => {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

export const calculateTotalAmountToPay = (
  productDetails: Order['orderProductsDetails']
) => {
  return Object.values(productDetails).reduce((acc, curr) => {
    return acc + curr.price * curr.quantity;
  }, 0);
};

export const createPaymentIntentOnStripe = async (
  stripePaymentMethodId: string,
  amountToPay: number,
  currency: string
): Promise<string> => {
  try {
    const clientSecret = (
      await stripeClient.paymentIntents.create({
        amount: amountToPay,
        currency,
        payment_method: stripePaymentMethodId,
        confirm: true,
      })
    ).client_secret;

    if (clientSecret === null) {
      throw new ThirdPartyServerError(
        'Invalid response from stripe when creating the Setup Intent, the client secret returned by Stripe is null'
      );
    }

    return clientSecret;
  } catch (error) {
    throw error;
  }
};

import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Buyer } from '../../../model/Buyer';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ResponseMetadata } from '@aws-sdk/types';
import { stripeClient } from '../../../clients/stripeClient';
import Stripe from 'stripe';

export const createBuyerOnDdbTable = async (
  tableName: string,
  item: Buyer
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

export const createBuyerOnStripe = async (
  buyerEmail: string
): Promise<Stripe.Response<Stripe.Customer>> => {
  try {
    return await stripeClient.customers.create({
      email: buyerEmail,
    });
  } catch (error) {
    throw error;
  }
};

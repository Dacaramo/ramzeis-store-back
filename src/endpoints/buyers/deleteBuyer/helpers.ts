import {
  BatchWriteCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../../../clients/ddbDocClient';
import { Address } from '../../../model/Address';
import { ResponseMetadata } from '@aws-sdk/types';
import { stripeClient } from '../../../clients/stripeClient';
import { ThirdPartyServerError } from '../../../model/Error';

export const deleteBuyerFromDdbTable = async (
  tableName: string,
  buyerEmail: string
): Promise<ResponseMetadata> => {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: {
        pk: buyerEmail,
        sk: 'N/A',
      },
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

export const deleteAllBuyerAddressesFromDdbTable = async (
  tableName: string,
  buyerEmail: string
): Promise<boolean> => {
  try {
    let exclusiveStartKey: Record<string, unknown> | undefined = undefined;
    do {
      const queryCommand = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': buyerEmail,
          ':skPrefix': 'address|',
        },
        ExclusiveStartKey: exclusiveStartKey,
      });
      const output = await ddbDocClient.send(queryCommand);
      if (!output.Items || !output.Count || !output.ScannedCount) {
        throw new ThirdPartyServerError(
          'Invalid response from DynamoDB when executing Query, either Items, Count or ScannedCount is undefined.'
        );
      }
      exclusiveStartKey = output.LastEvaluatedKey;

      const deleteRequests = (output.Items as Array<Address>).map((item) => {
        return {
          DeleteRequest: {
            Key: {
              pk: item.pk,
              sk: item.sk,
            },
          },
        };
      });
      const batchWriteCommand = new BatchWriteCommand({
        RequestItems: {
          [tableName]: deleteRequests,
        },
      });
      if (deleteRequests.length > 0) {
        await ddbDocClient.send(batchWriteCommand);
        return true;
      } else {
        return false;
      }
    } while (exclusiveStartKey);
  } catch (error) {
    throw error;
  }
};

export const getBuyerCustomerIdFromStripe = async (
  buyerEmail: string
): Promise<string> => {
  try {
    const customers = await stripeClient.customers.list({ email: buyerEmail });

    if (customers.data.length > 1) {
      throw new ThirdPartyServerError(
        'Unexpected response from Stripe, more than one customer found with the same email. This is technically not possible since the email is unique for every buyer/customer.'
      );
    } else if (customers.data.length === 0) {
      throw new ThirdPartyServerError(
        'Unexpected response from Stripe, no customer found with the provided email. This is technically not possible since every buyer has a corresponding customer in Stripe that shares the same email.'
      );
    }

    return customers.data[0].id;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomerFromStripe = async (
  buyerStripeCustomerId: string
): Promise<void> => {
  try {
    await stripeClient.customers.del(buyerStripeCustomerId);
  } catch (error) {
    throw error;
  }
};

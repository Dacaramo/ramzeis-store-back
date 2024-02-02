import { Address } from '../../../model/Address';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ResponseMetadata } from '@aws-sdk/types';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ThirdPartyServerError } from '../../../model/Error';

export const createAddressOnDdbTable = async (
  tableName: string,
  item: Address
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

export const isAddressLimitUnreached = async (
  tableName: string,
  buyerEmail: string,
  limit: number
): Promise<boolean> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': buyerEmail,
        ':skPrefix': 'address|',
      },
      ConsistentRead: true,
    });
    const output = await ddbDocClient.send(command);
    if (
      output.Items === undefined ||
      output.Count === undefined ||
      output.ScannedCount === undefined
    ) {
      throw new ThirdPartyServerError(
        'Invalid response from DynamoDB when executing Query, either Items, Count or ScannedCount is undefined.'
      );
    }
    return output.Count < limit;
  } catch (error) {
    throw error;
  }
};

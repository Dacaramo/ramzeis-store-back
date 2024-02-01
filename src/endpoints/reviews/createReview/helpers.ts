import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Review } from '../../../model/Review';
import { ResponseMetadata } from '@aws-sdk/types';
import ddbDocClient from '../../../clients/ddbDocClient';

export const createReviewOnDdbTable = async (
  tableName: string,
  item: Review
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

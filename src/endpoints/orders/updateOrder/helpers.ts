import { ResponseMetadata } from '@aws-sdk/types';
import { OrderId, OrderPatch } from '../../../model/Order';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { generateUpdateProps } from '../../../utils/ddb';
import ddbDocClient from '../../../clients/ddbDocClient';

export const updateOrderOnDdbTable = async (
  tableName: string,
  orderId: OrderId,
  patch: OrderPatch
): Promise<ResponseMetadata> => {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        pk: orderId,
        sk: 'N/A',
      },
      ...generateUpdateProps(patch),
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

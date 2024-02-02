import { BuyerPatch } from '../../../model/Buyer';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ResponseMetadata } from '@aws-sdk/types';
import { generateUpdateProps } from '../../../utils/ddb';

export const updateBuyerOnDdbTable = async (
  tableName: string,
  buyerEmail: string,
  patch: BuyerPatch
): Promise<ResponseMetadata> => {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        pk: buyerEmail,
        sk: 'N/A',
      },
      ...generateUpdateProps(patch),
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

import ddbDocClient from '../../../clients/ddbDocClient';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ResponseMetadata } from '@aws-sdk/types';
import { AddressId } from '../../../model/Address';

export const deleteAddressFromDdbTable = async (
  tableName: string,
  buyerEmail: string,
  addressId: AddressId
): Promise<ResponseMetadata> => {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: {
        pk: buyerEmail,
        sk: addressId,
      },
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

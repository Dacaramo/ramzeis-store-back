import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { AddressId, AddressPatch } from '../../../model/Address';
import { generateUpdateProps } from '../../../utils/ddb';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ResponseMetadata } from '@aws-sdk/types';

export const updateAddressOnDdbTable = async (
  tableName: string,
  buyerEmail: string,
  addressId: AddressId,
  patch: AddressPatch
): Promise<ResponseMetadata> => {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        pk: buyerEmail,
        sk: addressId,
      },
      ...generateUpdateProps(patch),
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

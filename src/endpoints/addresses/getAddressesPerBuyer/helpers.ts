import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../../../clients/ddbDocClient';
import { Address, AddressFilterValues } from '../../../model/Address';
import { ListResponse } from '../../../model/ListResponse';
import { ThirdPartyServerError } from '../../../model/Error';
import { decodeEsk } from '../../../utils/decodeEsk';

export const getAddressesPerBuyerFromDdbTable = async (
  tableName: string,
  buyerEmail: string,
  addressFilterValues: AddressFilterValues
): Promise<ListResponse<Address>> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': buyerEmail,
        ':skPrefix': 'address|',
      },
      Limit: addressFilterValues.limit,
      ExclusiveStartKey: addressFilterValues.encodedExclusiveStartKey
        ? decodeEsk(addressFilterValues.encodedExclusiveStartKey)
        : undefined,
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
    return {
      items: output.Items as Array<Address>,
      lastEvaluatedKey: output.LastEvaluatedKey,
      count: output.Count,
      scannedCount: output.ScannedCount,
    };
  } catch (error) {
    throw error;
  }
};

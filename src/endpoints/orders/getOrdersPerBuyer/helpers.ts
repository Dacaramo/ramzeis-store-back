import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ListResponse } from '../../../model/ListResponse';
import { Order, OrderFilterValues } from '../../../model/Order';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ThirdPartyServerError } from '../../../model/Error';
import { decodeEsk } from '../../../utils/decodeEsk';

export const getOrdersPerBuyerFromDdbTable = async (
  tableName: string,
  buyerEmail: string,
  orderFilterValues: OrderFilterValues
): Promise<ListResponse<Order>> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: 'ordersPerBuyer',
      KeyConditionExpression: 'orderBuyerEmail = :buyerEmail',
      ExpressionAttributeValues: {
        ':buyerEmail': buyerEmail,
      },
      Limit: orderFilterValues.limit,
      ExclusiveStartKey: orderFilterValues.encodedExclusiveStartKey
        ? decodeEsk(orderFilterValues.encodedExclusiveStartKey)
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
      items: output.Items as Array<Order>,
      lastEvaluatedKey: output.LastEvaluatedKey,
      count: output.Count,
      scannedCount: output.ScannedCount,
    };
  } catch (error) {
    throw error;
  }
};

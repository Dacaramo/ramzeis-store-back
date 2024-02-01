import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ListResponse } from '../../../model/ListResponse';
import { ProductId } from '../../../model/Product';
import { Review, ReviewFilterValues } from '../../../model/Review';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ThirdPartyServerError } from '../../../model/Error';
import { decodeEsk } from '../../../utils/decodeEsk';

export const getReviewsPerProductFromDdbTable = async (
  tableName: string,
  productId: ProductId,
  reviewFilterValues: ReviewFilterValues
): Promise<ListResponse<Review>> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'pk = :productId',
      ExpressionAttributeValues: {
        ':productId': productId,
      },
      Limit: reviewFilterValues.limit,
      ExclusiveStartKey: reviewFilterValues.encodedExclusiveStartKey
        ? decodeEsk(reviewFilterValues.encodedExclusiveStartKey)
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
      items: output.Items as Array<Review>,
      lastEvaluatedKey: output.LastEvaluatedKey,
      count: output.Count,
      scannedCount: output.ScannedCount,
    };
  } catch (error) {
    throw error;
  }
};

import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ReviewId } from '../../../model/Review';
import { ResponseMetadata } from '@aws-sdk/types';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ProductId } from '../../../model/Product';

export const deleteReviewFromDdbTable = async (
  tableName: string,
  productId: ProductId,
  reviewId: ReviewId
): Promise<ResponseMetadata> => {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: {
        pk: productId,
        sk: reviewId,
      },
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

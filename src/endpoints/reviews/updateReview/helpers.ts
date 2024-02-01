import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ReviewId, ReviewPatch } from '../../../model/Review';
import { ProductId } from '../../../model/Product';
import { ResponseMetadata } from '@aws-sdk/types';
import ddbDocClient from '../../../clients/ddbDocClient';
import { generateUpdateProps } from '../../../utils/ddb';

export const updateReviewOnDdbTable = async (
  tableName: string,
  productId: ProductId,
  reviewId: ReviewId,
  patch: ReviewPatch
): Promise<ResponseMetadata> => {
  try {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: {
        pk: productId,
        sk: reviewId,
      },
      ...generateUpdateProps(patch),
    });
    return (await ddbDocClient.send(command)).$metadata;
  } catch (error) {
    throw error;
  }
};

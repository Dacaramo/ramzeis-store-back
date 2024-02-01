import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import {
  ProductPatch,
  productIdSchema,
  productPatchSchema,
} from '../../../model/Product';
import { bucketNameSchema, indexNameSchema } from '../../../model/otherSchemas';
import { updateProductOnOpenSearchIndex } from './helpers';
import {
  validateProductCategoryIdAndSubcategoryId,
  validateProductColorId,
} from '../helpers';
import { ClientError } from '../../../model/Error';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productId;
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;
    const bucketName = process.env.S3_BUCKET_NAME;
    const patch = JSON.parse(event.body!) as ProductPatch;

    const parsedProductId = parse(productIdSchema, productId);
    const parsedIndexName = parse(indexNameSchema, indexName);
    const parsedBucketName = parse(bucketNameSchema, bucketName);
    /* Additional validation, since it is already validated by API Gateway */
    const parsedPatch = parse(productPatchSchema, patch);

    if (
      (parsedPatch.categoryId && !parsedPatch.subcategoryId) ||
      (!parsedPatch.categoryId && parsedPatch.subcategoryId)
    ) {
      throw new ClientError(
        "Can't update categoryId without providing the subcategoryId or vice versa"
      );
    }

    if (parsedPatch.categoryId && parsedPatch.subcategoryId) {
      /* The categoryId and subcategoryId need to be validated against the available ids on the productCategories.json object on the S3 bucket */
      await validateProductCategoryIdAndSubcategoryId(
        parsedBucketName,
        parsedPatch.categoryId,
        parsedPatch.subcategoryId
      );
    }

    if (parsedPatch.colorId) {
      /* The colorId needs to be validated against the available ids on the productColors.json object on the S3 bucket */
      await validateProductColorId(parsedBucketName, parsedPatch.colorId);
    }

    await updateProductOnOpenSearchIndex(
      parsedIndexName,
      parsedProductId,
      parsedPatch
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The product [${parsedProductId}] has been updated successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

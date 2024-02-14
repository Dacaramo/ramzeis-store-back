import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { parse } from 'valibot';
import {
  ProductPatch,
  productIdSchema,
  productPatchSchema,
} from '../../../model/Product';
import { indexNameSchema, tableNameSchema } from '../../../model/otherSchemas';
import { updateProductOnOpenSearchIndex } from './helpers';
import {
  validateProductCategoryIdAndSubcategoryId,
  validateProductColorId,
} from '../helpers';
import { ClientError } from '../../../model/Error';
import { validateSupportedLocaleIds } from '../createProduct/helpers';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const updateProduct = async (event: APIGatewayProxyEvent) => {
  try {
    const productId = event.pathParameters?.productId;
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;
    const tableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;
    const patch = JSON.parse(event.body!) as ProductPatch;

    const parsedProductId = parse(productIdSchema, productId);
    const parsedIndexName = parse(indexNameSchema, indexName);
    const parsedTableName = parse(tableNameSchema, tableName);
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
      /* The categoryId and subcategoryId need to be validated against the available ids on dynamoDB */
      await validateProductCategoryIdAndSubcategoryId(
        parsedTableName,
        parsedPatch.categoryId,
        parsedPatch.subcategoryId
      );
    }

    if (parsedPatch.colorId) {
      /* The colorId needs to be validated against the available ids on dynamoDB */
      await validateProductColorId(parsedTableName, parsedPatch.colorId);
    }

    if (parsedPatch.supportedLocaleIds) {
      /* Every id inside supportedLocaleIds needs to be validated against the available ids on dynamoDB */
      await validateSupportedLocaleIds(
        parsedTableName,
        parsedPatch.supportedLocaleIds
      );
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

export const handler = middy().use(cors()).handler(updateProduct);

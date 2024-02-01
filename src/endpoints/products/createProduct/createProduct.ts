import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { Product, productSchema } from '../../../model/Product';
import * as crypto from 'crypto';
import { parse } from 'valibot';
import { bucketNameSchema, indexNameSchema } from '../../../model/otherSchemas';
import { createProductOnOpenSearchIndex } from './helpers';
import {
  validateProductCategoryIdAndSubcategoryId,
  validateProductColorId,
} from '../helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;
    const bucketName = process.env.S3_BUCKET_NAME;
    const requestBody = JSON.parse(event.body!) as Omit<Product, 'pk'>;
    const document: Product = {
      pk: `product|${crypto.randomUUID()}`,
      ...requestBody,
    };

    const parsedIndexName = parse(indexNameSchema, indexName);
    const parsedBucketName = parse(bucketNameSchema, bucketName);

    /* Additional validation, since it is already validated by API Gateway */
    const parsedDocument = parse(productSchema, document) as Product;

    /* The categoryId and subcategoryId need to be validated against the available ids on the productCategories.json object on the S3 bucket */
    await validateProductCategoryIdAndSubcategoryId(
      parsedBucketName,
      document.categoryId,
      document.subcategoryId
    );

    /* The colorId needs to be validated against the available ids on the productColors.json object on the S3 bucket */
    await validateProductColorId(parsedBucketName, document.colorId);

    await createProductOnOpenSearchIndex(parsedIndexName, parsedDocument);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'The product was created successfully',
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

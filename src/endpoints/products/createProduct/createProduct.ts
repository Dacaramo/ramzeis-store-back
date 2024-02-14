import { APIGatewayProxyEvent } from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { Product, productSchema } from '../../../model/Product';
import * as crypto from 'crypto';
import { parse } from 'valibot';
import { indexNameSchema, tableNameSchema } from '../../../model/otherSchemas';
import {
  createProductOnOpenSearchIndex,
  validateSupportedLocaleIds,
} from './helpers';
import {
  validateProductCategoryIdAndSubcategoryId,
  validateProductColorId,
} from '../helpers';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const createProduct = async (event: APIGatewayProxyEvent) => {
  try {
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;
    const tableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;
    const requestBody = JSON.parse(event.body!) as Omit<Product, 'pk'>;
    const document: Product = {
      pk: `product|${crypto.randomUUID()}`,
      ...requestBody,
    };

    const parsedIndexName = parse(indexNameSchema, indexName);
    const parsedTableName = parse(tableNameSchema, tableName);
    /* Additional validation, since it is already validated by API Gateway */
    const parsedDocument = parse(productSchema, document) as Product;

    /* The categoryId and subcategoryId needs to be validated against the available ids on dynamoDB */
    await validateProductCategoryIdAndSubcategoryId(
      parsedTableName,
      parsedDocument.categoryId,
      parsedDocument.subcategoryId
    );

    /* The colorId needs to be validated against the available ids on dynamoDB */
    await validateProductColorId(parsedTableName, parsedDocument.colorId);

    /* All of the ids inside supportedLocaleIds needs to be validated against the ids on dynamoDB */
    await validateSupportedLocaleIds(
      parsedTableName,
      parsedDocument.supportedLocaleIds
    );

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

export const handler = middy().use(cors()).handler(createProduct);

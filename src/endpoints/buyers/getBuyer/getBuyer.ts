import { APIGatewayProxyEvent } from 'aws-lambda';
import { parse } from 'valibot';
import { buyerEmailSchema } from '../../../model/Buyer';
import { indexNameSchema, tableNameSchema } from '../../../model/otherSchemas';
import {
  getBuyerFromDdbTable,
  getCartProductsFromOpenSearchIndex,
} from './helpers';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { ProductId } from '../../../model/Product';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getBuyer = async (event: APIGatewayProxyEvent) => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedIndexName = parse(indexNameSchema, indexName);

    const buyer = await getBuyerFromDdbTable(parsedTableName, parsedBuyerEmail);
    const productIds = Object.keys(buyer.buyerCartDetails) as Array<ProductId>;
    const buyerCartProducts = await getCartProductsFromOpenSearchIndex(
      parsedIndexName,
      productIds
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        buyer,
        buyerCartProducts,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(getBuyer);

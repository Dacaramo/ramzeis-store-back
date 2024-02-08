import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { parse } from 'valibot';
import { buyerEmailSchema } from '../../../model/Buyer';
import { indexNameSchema, tableNameSchema } from '../../../model/otherSchemas';
import {
  getBuyerFromDdbTable,
  getCartProductsFromOpenSearchIndex,
} from './helpers';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { ProductId } from '../../../model/Product';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const parsedIndexName = parse(indexNameSchema, indexName);

    const buyer = await getBuyerFromDdbTable(parsedTableName, parsedBuyerEmail);
    const productIds = Object.keys(
      buyer.buyerCartDetails ?? {}
    ) as Array<ProductId>;
    const buyerCartProducts =
      productIds.length > 0
        ? await getCartProductsFromOpenSearchIndex(parsedIndexName, productIds)
        : [];
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

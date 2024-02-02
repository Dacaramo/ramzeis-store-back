import { GetCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../../../clients/ddbDocClient';
import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { Product, ProductId } from '../../../model/Product';
import { openSearchClient } from '../../../clients/openSearchClient';
import {
  MsearchResponse,
  SearchResponse,
} from '@opensearch-project/opensearch/api/types';
import { Buyer } from '../../../model/Buyer';
import { ThirdPartyServerError } from '../../../model/Error';

export const getBuyerFromDdbTable = async (
  tableName: string,
  buyerEmail: string
): Promise<Buyer> => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        pk: buyerEmail,
        sk: 'N/A',
      },
    });
    const output = await ddbDocClient.send(command);
    if (!output.Item) {
      throw new ThirdPartyServerError(
        'Invalid response from DynamoDB when executing GetItem: Item is undefined'
      );
    }
    return output.Item as Buyer;
  } catch (error) {
    throw error;
  }
};

export const getCartProductsFromOpenSearchIndex = async (
  indexName: string,
  productIds: Array<ProductId>
): Promise<Array<Product>> => {
  try {
    const apiResponse = await openSearchClient.msearch({
      index: indexName,
      body: productIds.flatMap((productId) => [
        {},
        { query: { match: { pk: productId } } },
      ]),
    });

    const msearchResponse = apiResponse.body as MsearchResponse<Product>;
    const data = (msearchResponse.responses as Array<SearchResponse<Product>>)
      .map((response) => {
        return response?.hits?.hits[0]?._source;
      })
      .filter(Boolean) as Array<Product>;
    return data;
  } catch (error) {
    throw error;
  }
};

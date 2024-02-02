import { ListResponse } from '../../../model/ListResponse';
import { Product, ProductFilterValues } from '../../../model/Product';
import { openSearchClient } from '../../../clients/openSearchClient';
import { SearchResponse } from '@opensearch-project/opensearch/api/types';
import { googleTranslateClient } from '../../../clients/googleTranslateClient';
import { decodeEsk } from '../../../utils/decodeEsk';

export const getProductsFromOpenSearchIndex = async (
  indexName: string,
  productFilterValues: ProductFilterValues,
  locale: string
): Promise<ListResponse<Product>> => {
  try {
    const decodedEsk = productFilterValues.encodedExclusiveStartKey
      ? decodeEsk(productFilterValues.encodedExclusiveStartKey)
      : undefined;
    const mustConditions = [
      { term: { supportedLocales: locale } },
      productFilterValues.search
        ? {
            match: {
              name: {
                query: productFilterValues.search,
                operator: 'or',
                fuzziness: 'AUTO',
                case_insensitive: true,
              },
            },
          }
        : undefined,
      productFilterValues.categoryId
        ? { match: { categoryId: productFilterValues.categoryId } }
        : undefined,
      productFilterValues.subcategoryId
        ? { match: { subcategoryId: productFilterValues.subcategoryId } }
        : undefined,
      productFilterValues.colorId
        ? { match: { colorId: productFilterValues.colorId } }
        : undefined,
      productFilterValues.minPrice && !productFilterValues.maxPrice
        ? { range: { price: { gte: productFilterValues.minPrice } } }
        : undefined,
      !productFilterValues.minPrice && productFilterValues.maxPrice
        ? { range: { price: { lte: productFilterValues.maxPrice } } }
        : undefined,
      productFilterValues.minPrice && productFilterValues.maxPrice
        ? {
            range: {
              price: {
                gte: productFilterValues.minPrice,
                lte: productFilterValues.maxPrice,
              },
            },
          }
        : undefined,
      productFilterValues.isVisible !== undefined
        ? { match: { isVisible: productFilterValues.isVisible } }
        : undefined,
      productFilterValues.isForDropshipping !== undefined
        ? {
            match: { isForDropshipping: productFilterValues.isForDropshipping },
          }
        : undefined,
    ].filter((condition) => condition !== undefined);

    const apiResponse = await openSearchClient.search({
      index: indexName,
      body: {
        query: {
          bool: {
            must: mustConditions,
          },
        },
        size: productFilterValues.limit,
        sort: [{ price: productFilterValues.sort }, 'pk'],
        ...(decodedEsk !== undefined
          ? {
              search_after: [decodedEsk.price, decodedEsk.pk],
            }
          : {}),
      },
    });
    const searchResponse = apiResponse.body as SearchResponse<Product>;
    const hits = searchResponse.hits.hits;
    const items = hits.map((hit) => hit._source) as Array<Product>;
    let lastEvaluatedKey: Record<string, unknown> | undefined = undefined;
    const count = hits.length;
    const scannedCount = hits.length;

    if (hits.length === productFilterValues.limit) {
      const lastHit = hits[hits.length - 1];
      if (lastHit.sort !== undefined && lastHit.sort.length === 2) {
        lastEvaluatedKey = {
          price: hits[hits.length - 1].sort![0],
          pk: hits[hits.length - 1].sort![1],
        };
      }
    }

    return {
      items,
      lastEvaluatedKey,
      count,
      scannedCount,
    };
  } catch (error) {
    throw error;
  }
};

export const translateToEnglish = async (text: string) => {
  try {
    const [translatedText] = await googleTranslateClient.translate(text, 'en');
    return translatedText;
  } catch (error) {
    throw error;
  }
};

export const translateProductsNames = async (
  products: Array<Product>,
  languageCode: string
): Promise<Array<Product>> => {
  try {
    const names = products.map(({ name }) => name);
    const [translatedNames] = await googleTranslateClient.translate(
      names,
      languageCode
    );
    const translatedProducts = translatedNames.map((translatedName, i) => {
      return {
        ...products[i],
        name: translatedName,
      } as Product;
    });

    return translatedProducts;
  } catch (error) {
    throw error;
  }
};

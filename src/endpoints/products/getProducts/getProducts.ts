import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import {
  Product,
  ProductFilterValues,
  ProductSort,
  productFilterValuesSchema,
} from '../../../model/Product';
import { parse } from 'valibot';
import { indexNameSchema, localeSchema } from '../../../model/otherSchemas';
import {
  getProductsFromOpenSearchIndex,
  translateProductsNames,
  translateToEnglish,
} from './helpers';
import { ListResponse } from '../../../model/ListResponse';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const defaultLimit = 20;
    const defaultSort = 'asc';
    const defaultIsVisible = true;
    const defaultIsForDropshipping = false;
    const locale = event.pathParameters?.locale;
    const qsp = event.queryStringParameters ?? {};
    const productFilterValues: ProductFilterValues = {
      limit: qsp.limit ? parseInt(qsp.limit) : defaultLimit,
      encodedExclusiveStartKey: qsp.encodedExclusiveStartKey,
      sort: qsp.sort ? (qsp.sort as ProductSort) : defaultSort,
      search: qsp.search ? decodeURIComponent(qsp.search) : undefined,
      categoryId: qsp.categoryId,
      subcategoryId: qsp.subcategoryId,
      colorId: qsp.colorId,
      minPrice: qsp.minPrice ? parseInt(qsp.minPrice) : undefined,
      maxPrice: qsp.maxPrice ? parseInt(qsp.maxPrice) : undefined,
      isVisible: qsp.isVisible
        ? qsp.isVisible === 'true'
          ? true
          : false
        : defaultIsVisible,
      isForDropshipping: qsp.isForDropshipping
        ? qsp.isForDropshipping === 'true'
          ? true
          : false
        : defaultIsForDropshipping,
    };
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;

    const parsedLocale = parse(localeSchema, locale);
    const parsedProductFilterValues = parse(
      productFilterValuesSchema,
      productFilterValues
    );
    const parsedIndexName = parse(indexNameSchema, indexName);

    const languageCode = parsedLocale.split('-')[0];

    /* If the search comes in a different language it must be translated to english before looking for the matching products on the index since everything on the index is stored in english */
    if (
      parsedProductFilterValues.search !== undefined &&
      languageCode !== 'en'
    ) {
      parsedProductFilterValues.search = await translateToEnglish(
        parsedProductFilterValues.search
      );
    }

    const untranslatedData = await getProductsFromOpenSearchIndex(
      parsedIndexName,
      parsedProductFilterValues,
      parsedLocale
    );
    let translatedData = undefined;

    /* Translate only if the language code is not english, since all of the products are already in english in our database */
    if (languageCode !== 'en') {
      /* Translates only product names. The product details must be translated on the front-end since translating the details for all of the products is unnecessary and will increment Cloud Translation API costs*/
      translatedData = await translateProductsNames(
        untranslatedData.items,
        languageCode
      );
    }

    const readyData: ListResponse<Product> = {
      ...untranslatedData,
      items: translatedData ?? untranslatedData.items,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(readyData),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

import { APIGatewayProxyEvent } from 'aws-lambda';
import { parse } from 'valibot';
import { productIdSchema } from '../../../model/Product';
import { indexNameSchema, localeSchema } from '../../../model/otherSchemas';
import {
  getSingleProductFromOpenSearchIndex,
  translateProductNameAndDetails,
} from './helpers';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import middy from '@middy/core';
import cors from '@middy/http-cors';

const getSingleProduct = async (event: APIGatewayProxyEvent) => {
  try {
    const locale = event.pathParameters?.locale;
    const productId = event.pathParameters?.productId;
    const indexName = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;

    const parsedLocale = parse(localeSchema, locale);
    const parsedProductId = parse(productIdSchema, productId);
    const parsedIndexName = parse(indexNameSchema, indexName);

    const languageCode = parsedLocale.split('-')[0];

    const untranslatedProduct = await getSingleProductFromOpenSearchIndex(
      parsedIndexName,
      parsedProductId
    );
    let translatedProduct = undefined;

    /* Translate only if the language code is not english, since all of the products are already in english in our database */
    if (languageCode !== 'en') {
      /* Name and details are the only 2 props that needs to be translated with the Cloud Translation API */
      translatedProduct = await translateProductNameAndDetails(
        untranslatedProduct,
        languageCode
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify(translatedProduct ?? untranslatedProduct),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

export const handler = middy().use(cors()).handler(getSingleProduct);

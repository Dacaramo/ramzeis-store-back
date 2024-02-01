import { Product, ProductId } from '../../../model/Product';
import { openSearchClient } from '../../../clients/openSearchClient';
import { googleTranslateClient } from '../../../clients/googleTranslateClient';
import { ThirdPartyServerError } from '../../../model/Error';

export const getSingleProductFromOpenSearchIndex = async (
  indexName: string,
  productId: ProductId
): Promise<Product> => {
  try {
    const apiResponse = await openSearchClient.search({
      index: indexName,
      body: {
        query: {
          match: {
            pk: productId,
          },
        },
      },
    });

    if (apiResponse.body.hits.total.value === 0) {
      throw new ThirdPartyServerError(
        `Invalid response from OpenSearch after executing search request, no hits found: The product [${productId}] does not exist.`
      );
    } else if (apiResponse.body.hits.total.value > 1) {
      throw new ThirdPartyServerError(
        `Invalid response from OpenSearch after executing search request, more than one hit found: The are ${apiResponse.body.hits.total.value} products with the [${productId}] id.`
      );
    }

    return apiResponse.body.hits.hits[0]._source as Product;
  } catch (error) {
    throw error;
  }
};

export const translateProductNameAndDetails = async (
  product: Product,
  languageCode: string
): Promise<Product> => {
  try {
    const [[translatedName, ...flattenedTranslatedDetails]] =
      await googleTranslateClient.translate(
        [
          product.name,
          ...product.details.flatMap((detail) => {
            return [detail.title, detail.description];
          }),
        ],
        languageCode
      );

    const translatedDetails: Product['details'] = [];
    for (let i = 0, j = 0; i < flattenedTranslatedDetails.length; i += 2, j++) {
      const title = flattenedTranslatedDetails[i];
      const description = flattenedTranslatedDetails[i + 1];

      translatedDetails.push({
        title,
        description,
        image: product.details[j].image,
      });
    }

    return {
      ...product,
      name: translatedName,
      details: product.details.map(({ image }, i) => {
        return {
          title: flattenedTranslatedDetails[i],
          description: flattenedTranslatedDetails[i + 1],
          image,
        };
      }),
    };
  } catch (error) {
    throw error;
  }
};

import { ProductId, ProductPatch } from '../../../model/Product';
import { openSearchClient } from '../../../clients/openSearchClient';

export const updateProductOnOpenSearchIndex = async (
  indexName: string,
  productId: ProductId,
  patch: ProductPatch
) => {
  try {
    const apiResponse = await openSearchClient.update({
      index: indexName,
      id: productId,
      body: {
        doc: patch,
      },
    });
    return apiResponse.meta;
  } catch (error) {
    throw error;
  }
};

import { Product } from '../../../model/Product';
import { openSearchClient } from '../../../clients/openSearchClient';

export const createProductOnOpenSearchIndex = async (
  indexName: string,
  document: Product
) => {
  try {
    const apiResponse = await openSearchClient.index({
      index: indexName,
      id: document.pk,
      body: document,
      refresh: true,
    });
    return apiResponse.meta;
  } catch (error) {
    throw error;
  }
};

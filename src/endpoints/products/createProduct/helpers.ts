import { Product } from '../../../model/Product';
import { openSearchClient } from '../../../clients/openSearchClient';
import { getSupportedLocales } from '../../helpers';
import { ClientError } from '../../../model/Error';

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

export const validateSupportedLocaleIds = async (
  tableName: string,
  idsToValidate: Array<string>
): Promise<Array<string>> => {
  try {
    const supportedLocales = await getSupportedLocales(tableName);
    const supportedLocaleIds = supportedLocales.map(({ id }) => id);
    if (idsToValidate.every((id) => supportedLocaleIds.includes(id))) {
      throw new ClientError(
        'Some of the supportedLocaleIds are not supported. In order to be successfully create a product all of the localeIds inside the supportedLocaleIds of the product must be supported.'
      );
    }
    return idsToValidate;
  } catch (error) {
    throw error;
  }
};

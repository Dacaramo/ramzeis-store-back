import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ProductCategory } from '../../model/Product';
import { ClientError } from '../../model/Error';
import { ProductColor } from '../../model/Product';
import ddbDocClient from '../../clients/ddbDocClient';

export const getProductCategoriesFromDdbTable = async (
  tableName: string,
  languageCode: string
): Promise<Array<ProductCategory>> => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        pk: languageCode,
        sk: 'doc|productCategories',
      },
    });
    const output = await ddbDocClient.send(command);
    return (
      (
        output.Item as {
          pk: string;
          sk: 'doc|productCategories';
          docContent: Array<ProductCategory>;
        }
      )?.docContent ?? []
    );
  } catch (error) {
    throw error;
  }
};

export const validateProductCategoryIdAndSubcategoryId = async (
  tableName: string,
  categoryId: string,
  subcategoryId: string,
  languageCode: string = 'en'
): Promise<{ parsedCategoryId: string; parsedSubcategoryId: string }> => {
  try {
    const validProductCategories = await getProductCategoriesFromDdbTable(
      tableName,
      languageCode
    );
    const validProductCategoryIds = validProductCategories.map(
      (category) => category.id
    );
    const targetCategoryIndex = validProductCategoryIds.findIndex((id) => {
      return id === categoryId;
    });
    if (targetCategoryIndex === -1) {
      throw new ClientError(
        'The categoryId of the product is not valid. To be created or updated, the product must have a categoryId available on one of the categories inside the productCategories.json files on the AWS S3 Bucket'
      );
    }
    const validProductSubcategoryIds = validProductCategories[
      targetCategoryIndex
    ].subcategories.map((subcategory) => subcategory.id);
    if (!validProductSubcategoryIds.includes(subcategoryId)) {
      throw new ClientError(
        'The subcategoryId of the product is not valid. To be created or updated, the product must have a subcategoryId available on one of subcategories of the targeted category inside the productCategories.json files on the AWS S3 Bucket'
      );
    }
    return {
      parsedCategoryId: categoryId,
      parsedSubcategoryId: subcategoryId,
    };
  } catch (error) {
    throw error;
  }
};

export const getProductColorsFromDdbTable = async (
  tableName: string,
  languageCode: string
): Promise<Array<ProductColor>> => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        pk: languageCode,
        sk: 'doc|productColors',
      },
    });
    const output = await ddbDocClient.send(command);
    return (
      (
        output.Item as {
          pk: string;
          sk: 'doc|productColors';
          docContent: Array<ProductColor>;
        }
      )?.docContent ?? []
    );
  } catch (error) {
    throw error;
  }
};

export const validateProductColorId = async (
  tableName: string,
  colorId: string,
  languageCode: string = 'en'
): Promise<string> => {
  try {
    const validProductColors = await getProductColorsFromDdbTable(
      tableName,
      languageCode
    );
    const validProductColorIds = validProductColors.map((color) => color.id);
    const targetColorIndex = validProductColorIds.findIndex((id) => {
      return id === colorId;
    });
    if (targetColorIndex === -1) {
      throw new ClientError(
        'The colorId of the product is not valid. To be created or updated, the product must have a colorId available on one of the categories inside the productColors.json files on the AWS S3 Bucket'
      );
    }

    return colorId;
  } catch (error) {
    throw error;
  }
};

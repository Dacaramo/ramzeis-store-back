import { GetCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../clients/ddbDocClient';
import { ClientError, ThirdPartyServerError } from '../model/Error';
import { Locale } from '../model/Locale';

export const getSupportedLocalesFromDdbTable = async (
  tableName: string
): Promise<Array<Locale>> => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        pk: 'supportedLocales',
        sk: 'N/A',
      },
    });
    const output = await ddbDocClient.send(command);
    if (!output.Item) {
      throw new ThirdPartyServerError(
        'Invalid response from DynamoDB when executing GetItem: Item is undefined'
      );
    }
    return (
      output.Item as {
        pk: 'supportedLocales';
        sk: 'N/A';
        docContent: Array<Locale>;
      }
    ).docContent;
  } catch (error) {
    throw error;
  }
};

export const validateLocaleId = async (
  tableName: string,
  localeId: string
): Promise<string> => {
  try {
    const supportedLocales = await getSupportedLocalesFromDdbTable(tableName);
    const supportedLocaleIds = supportedLocales.map(({ id }) => id);
    if (!supportedLocaleIds.includes(localeId)) {
      throw new ClientError(
        "The localeId is not supported. The API will always reject requests to endpoints that require a localeId on their path if that localeId is not inside the item with pk 'supportedLocales' and sk 'N/A' on the secondary table of dynamoDB"
      );
    }
    return localeId;
  } catch (error) {
    throw error;
  }
};

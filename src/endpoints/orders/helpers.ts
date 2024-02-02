import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { OrderStatus } from '../../model/Order';
import { ClientError } from '../../model/Error';
import ddbDocClient from '../../clients/ddbDocClient';

export const getOrderStatusesFromDdbTable = async (
  tableName: string,
  languageCode: string
): Promise<Array<OrderStatus>> => {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        pk: languageCode,
        sk: 'doc|orderStatuses',
      },
    });
    const output = await ddbDocClient.send(command);
    return (
      (
        output.Item as {
          pk: string;
          sk: 'doc|orderStatuses';
          docContent: Array<OrderStatus>;
        }
      )?.docContent ?? []
    );
  } catch (error) {
    throw error;
  }
};

export const validateOrderStatusId = async (
  tableName: string,
  statusId: string,
  languageCode: string = 'en'
): Promise<string> => {
  try {
    const validOrderStatuses = await getOrderStatusesFromDdbTable(
      tableName,
      languageCode
    );
    const validOrderStatusIds = validOrderStatuses.map((status) => status.id);
    if (!validOrderStatusIds.includes(statusId)) {
      throw new ClientError(
        'The statusId is not valid. To be created or updated, the status must have an available statusId on one of the statuses inside dynamoDB'
      );
    }
    return statusId;
  } catch (error) {
    throw error;
  }
};

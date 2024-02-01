import { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { Order, OrderFilterValues } from '../../../model/Order';
import ddbDocClient from '../../../clients/ddbDocClient';
import { ListResponse } from '../../../model/ListResponse';
import { ThirdPartyServerError } from '../../../model/Error';
import { decodeEsk } from '../../../utils/decodeEsk';

export const getOrdersFromDdbTable = async (
  tableName: string,
  orderFilterValues: OrderFilterValues
): Promise<ListResponse<Order>> => {
  try {
    let commandInput: QueryCommandInput = {
      TableName: tableName,
      Limit: orderFilterValues.limit,
      ExclusiveStartKey: orderFilterValues.encodedExclusiveStartKey
        ? decodeEsk(orderFilterValues.encodedExclusiveStartKey)
        : undefined,
    };

    if (
      'lowerCreationDate' in orderFilterValues &&
      'upperCreationDate' in orderFilterValues
    ) {
      /* Query the data using the ordersByCreationDate GSI */
      commandInput = {
        ...commandInput,
        ...generateQueryCommandInputPropsForOrdersByCreationDateGSI(
          orderFilterValues
        ),
      };
    } else if (
      /* Query the data using the ordersByCompletionDate GSI */
      'lowerCompletionDate' in orderFilterValues &&
      'upperCompletionDate' in orderFilterValues
    ) {
      commandInput = {
        ...commandInput,
        ...generateQueryCommandInputPropsForOrdersByCompletionDateGSI(
          orderFilterValues
        ),
      };
    } else if ('status' in orderFilterValues) {
      /* Query the data using the ordersByStatus GSI */
      commandInput = {
        ...commandInput,
        ...generateQueryCommandInputPropsForOrdersByStatusGSI(
          orderFilterValues
        ),
      };
    }

    const command = new QueryCommand(commandInput);
    const output = await ddbDocClient.send(command);
    if (
      output.Items === undefined ||
      output.Count === undefined ||
      output.ScannedCount === undefined
    ) {
      throw new ThirdPartyServerError(
        'Invalid response from DynamoDB when executing Query, either Items, Count or ScannedCount is undefined.'
      );
    }
    return {
      items: output.Items as Array<Order>,
      lastEvaluatedKey: output.LastEvaluatedKey,
      count: output.Count,
      scannedCount: output.ScannedCount,
    };
  } catch (error) {
    throw error;
  }
};

const generateQueryCommandInputPropsForOrdersByCreationDateGSI = (
  orderFilterValues: OrderFilterValues
): Partial<QueryCommandInput> => {
  const queryCommandInputProps: Partial<QueryCommandInput> = {};

  queryCommandInputProps.IndexName = 'ordersByCreationDate';
  queryCommandInputProps.KeyConditionExpression =
    'belongsTo = :belongsTo AND orderCreationDate BETWEEN :lowerCreationDate AND :upperCreationDate';
  queryCommandInputProps.ExpressionAttributeValues = {
    ':belongsTo': 'order',
    ':lowerCreationDate': orderFilterValues.lowerCreationDate,
    ':upperCreationDate': orderFilterValues.upperCreationDate,
  };
  if (
    'lowerCompletionDate' in orderFilterValues &&
    'upperCompletionDate' in orderFilterValues
  ) {
    queryCommandInputProps.FilterExpression =
      'orderCompletionDate BETWEEN :lowerCompletionDate AND :upperCompletionDate';
    queryCommandInputProps.ExpressionAttributeValues[':lowerCompletionDate'] =
      orderFilterValues.lowerCompletionDate;
    queryCommandInputProps.ExpressionAttributeValues[':upperCompletionDate'] =
      orderFilterValues.upperCompletionDate;
  }
  if ('statusId' in orderFilterValues) {
    if (queryCommandInputProps.FilterExpression === undefined) {
      queryCommandInputProps.FilterExpression =
        'orderStatusId = :orderStatusId';
    } else {
      queryCommandInputProps.FilterExpression +=
        ' AND orderStatusId = :orderStatusId';
    }
    queryCommandInputProps.ExpressionAttributeValues[':orderStatusId'] =
      orderFilterValues.statusId;
  }

  return queryCommandInputProps;
};

const generateQueryCommandInputPropsForOrdersByCompletionDateGSI = (
  orderFilterValues: OrderFilterValues
): Partial<QueryCommandInput> => {
  const queryCommandInputProps: Partial<QueryCommandInput> = {};

  queryCommandInputProps.IndexName = 'ordersByCompletionDate';
  queryCommandInputProps.KeyConditionExpression =
    'belongsTo = :belongsTo AND orderCompletionDate BETWEEN :lowerCompletionDate AND :upperCompletionDate';
  queryCommandInputProps.ExpressionAttributeValues = {
    ':belongsTo': 'order',
    ':lowerCompletionDate': orderFilterValues.lowerCompletionDate,
    ':upperCompletionDate': orderFilterValues.upperCompletionDate,
  };
  if (
    'lowerCreationDate' in orderFilterValues &&
    'upperCreationDate' in orderFilterValues
  ) {
    queryCommandInputProps.FilterExpression =
      'orderCreationDate BETWEEN :lowerCreationDate AND :upperCreationDate';
    queryCommandInputProps.ExpressionAttributeValues[':lowerCreationDate'] =
      orderFilterValues.lowerCreationDate;
    queryCommandInputProps.ExpressionAttributeValues[':upperCreationDate'] =
      orderFilterValues.upperCreationDate;
  }
  if ('statusId' in orderFilterValues) {
    if (queryCommandInputProps.FilterExpression === undefined) {
      queryCommandInputProps.FilterExpression =
        'orderStatusId = :orderStatusId';
    } else {
      queryCommandInputProps.FilterExpression +=
        ' AND orderStatusId = :orderStatusId';
    }
    queryCommandInputProps.ExpressionAttributeValues[':orderStatusId'] =
      orderFilterValues.statusId;
  }

  return queryCommandInputProps;
};

const generateQueryCommandInputPropsForOrdersByStatusGSI = (
  orderFilterValues: OrderFilterValues
): Partial<QueryCommandInput> => {
  const queryCommandInputProps: Partial<QueryCommandInput> = {};

  queryCommandInputProps.IndexName = 'ordersByStatusId';
  queryCommandInputProps.KeyConditionExpression =
    'orderStatusId = :orderStatusId';
  queryCommandInputProps.ExpressionAttributeValues = {
    ':orderStatusId': orderFilterValues.statusId,
  };
  if (
    'lowerCreationDate' in orderFilterValues &&
    'upperCreationDate' in orderFilterValues
  ) {
    queryCommandInputProps.FilterExpression =
      'orderCreationDate BETWEEN :lowerCreationDate AND :upperCreationDate';
    queryCommandInputProps.ExpressionAttributeValues[':lowerCreationDate'] =
      orderFilterValues.lowerCreationDate;
    queryCommandInputProps.ExpressionAttributeValues[':upperCreationDate'] =
      orderFilterValues.upperCreationDate;
  }
  if (
    'lowerCompletionDate' in orderFilterValues &&
    'upperCompletionDate' in orderFilterValues
  ) {
    if (queryCommandInputProps.FilterExpression === undefined) {
      queryCommandInputProps.FilterExpression =
        'orderCompletionDate BETWEEN :lowerCompletionDate AND :upperCompletionDate';
    } else {
      queryCommandInputProps.FilterExpression +=
        ' AND orderCompletionDate BETWEEN :lowerCompletionDate AND :upperCompletionDate';
    }
    queryCommandInputProps.ExpressionAttributeValues[':lowerCompletionDate'] =
      orderFilterValues.lowerCompletionDate;
    queryCommandInputProps.ExpressionAttributeValues[':upperCompletionDate'] =
      orderFilterValues.upperCompletionDate;
  }

  return queryCommandInputProps;
};

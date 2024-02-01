import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import {
  OrderPatch,
  orderIdSchema,
  orderPatchSchema,
} from '../../../model/Order';
import { parse } from 'valibot';
import { tableNameSchema } from '../../../model/otherSchemas';
import { updateOrderOnDdbTable } from './helpers';
import { validateOrderStatusId } from '../helpers';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const orderId = event.pathParameters?.orderId;
    const mainTableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const secondaryTableName = process.env.DYNAMODB_SECONDARY_TABLE_NAME;
    const patch = JSON.parse(event.body!) as OrderPatch;

    const parsedOrderId = parse(orderIdSchema, orderId);
    const parsedTableName = parse(tableNameSchema, mainTableName);
    const parsedBucketName = parse(tableNameSchema, secondaryTableName);
    /* Additional validation, since it is already validated by API Gateway */
    const parsedPatch = parse(orderPatchSchema, patch);

    if (parsedPatch.orderStatusId) {
      /* The orderStatusId needs to be validated against the available ids on dynamoDB */
      await validateOrderStatusId(parsedBucketName, parsedPatch.orderStatusId);
    }

    await updateOrderOnDdbTable(parsedTableName, parsedOrderId, parsedPatch);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The order [${parsedOrderId}] has been updated successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

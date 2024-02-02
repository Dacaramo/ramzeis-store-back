import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { Address, addressSchema } from '../../../model/Address';
import * as crypto from 'crypto';
import { createAddressOnDdbTable, isAddressLimitUnreached } from './helpers';
import { buyerEmailSchema } from '../../../model/Buyer';
import { tableNameSchema } from '../../../model/otherSchemas';
import { parse } from 'valibot';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';
import { ClientError } from '../../../model/Error';

const MAX_ADDRESSES = 5;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const requestBody = JSON.parse(event.body!) as Omit<Address, 'pk' | 'sk'>;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedTableName = parse(tableNameSchema, tableName);
    const item: Address = {
      pk: parsedBuyerEmail,
      sk: `address|${crypto.randomUUID()}`,
      ...requestBody,
    };
    /* Additional validation, since it is already validated by API Gateway */
    const parsedItem = parse(addressSchema, item) as Address;

    if (
      await isAddressLimitUnreached(
        parsedTableName,
        parsedBuyerEmail,
        MAX_ADDRESSES
      )
    ) {
      await createAddressOnDdbTable(parsedTableName, parsedItem);
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: `The address for buyer [${buyerEmail}] was created successfully`,
        }),
      };
    } else {
      throw new ClientError(
        `Forbidden request: The address limit of ${MAX_ADDRESSES} addresses per buyer has been reached and no more addresses can be created for the specified buyer`,
        403
      );
    }
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

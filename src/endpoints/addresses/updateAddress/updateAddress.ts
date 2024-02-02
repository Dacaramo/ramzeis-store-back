import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { updateAddressOnDdbTable } from './helpers';
import {
  AddressPatch,
  addressIdSchema,
  addressPatchSchema,
} from '../../../model/Address';
import { parse } from 'valibot';
import { buyerEmailSchema } from '../../../model/Buyer';
import { tableNameSchema } from '../../../model/otherSchemas';
import { inferRequestResponseFromError } from '../../../utils/inferRequestResponseFromError';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  try {
    const buyerEmail = event.pathParameters?.buyerEmail;
    const addressId = event.pathParameters?.addressId;
    const tableName = process.env.DYNAMODB_MAIN_TABLE_NAME;
    const patch = JSON.parse(event.body!) as AddressPatch;

    const parsedBuyerEmail = parse(buyerEmailSchema, buyerEmail);
    const parsedAddressId = parse(addressIdSchema, addressId);
    const parsedTableName = parse(tableNameSchema, tableName);
    /* Additional validation, since it is already validated by API Gateway */
    const parsedPatch = parse(addressPatchSchema, patch);

    await updateAddressOnDdbTable(
      parsedTableName,
      parsedBuyerEmail,
      parsedAddressId,
      parsedPatch
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The buyer [${parsedBuyerEmail}] address [${parsedAddressId}] was updated successfully`,
      }),
    };
  } catch (error) {
    return inferRequestResponseFromError(error);
  }
};

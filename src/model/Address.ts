import {
  maxLength,
  object,
  optional,
  startsWith,
  string,
  Input,
  partial,
  omit,
  special,
} from 'valibot';
import { buyerEmailSchema } from './Buyer';
import { encodedExclusiveStartKeySchema, limitSchema } from './otherSchemas';

export const addressIdSchema = special<`address|${string}`>(
  (value) => (value as string).startsWith('address|'),
  "The addressId must starts with 'address|'"
);

export const addressSchema = object(
  {
    pk: buyerEmailSchema,
    sk: addressIdSchema,
    buyerCountry: string('The buyerCountry must be a string'),
    buyerAdministrativeDivision: string(
      'The buyerAdministrativeDivision must be a string'
    ),
    buyerCity: string('The buyerCity must be a string'),
    buyerZipCode: string('The buyerZipCode must be a string'),
    buyerRecipientName: string('The buyerRecipientName must be a string'),
    buyerPhoneNumber: string('The buyerPhoneNumber must be a string', [
      startsWith('+', 'The buyerPhoneNumber must starts with "+"'),
    ]),
    buyerDeliveryInstructions: optional(
      string('The buyerDeliveryInstructions must be a string', [
        maxLength(
          2000,
          'The buyerDeliveryInstructions must have at most 2000 characters'
        ),
      ])
    ),
  },
  'The address must be an object'
);

export const addressFilterValuesSchema = partial(
  object({
    limit: limitSchema,
    encodedExclusiveStartKey: encodedExclusiveStartKeySchema,
  })
);

export const addressPatchSchema = partial(omit(addressSchema, ['pk', 'sk']));

export type Address = Input<typeof addressSchema>;
export type AddressId = Input<typeof addressIdSchema>;
export type AddressFilterValues = Input<typeof addressFilterValuesSchema>;
export type AddressPatch = Input<typeof addressPatchSchema>;

import {
  string,
  object,
  email,
  Input,
  optional,
  record,
  number,
  integer,
  minValue,
  value,
  partial,
  omit,
  array,
  isoTimestamp,
  ip,
  unknown,
} from 'valibot';

export const buyerEmailSchema = string('The buyerEmail must be a string', [
  email('The buyerEmail must be a valid email address'),
]);

export const buyerStripeCustomerIdSchema = string(
  'The buyerStripeCustomerId must be a string'
);

export const buyerSchema = object(
  {
    pk: buyerEmailSchema,
    sk: string('The sk must be a string', [
      value('N/A', 'The value of sk must always be N/A'),
    ]),
    buyerCartDetails: record(
      string(),
      object({
        quantity: number('The quantity must be a number', [
          integer('The quantity must be an integer'),
          minValue(1, 'The quantity must be greater than 0'),
        ]),
        size: optional(string('The size must be a string')),
      })
    ),
    buyerStripeCustomerId: buyerStripeCustomerIdSchema,
    buyerAgreements: array(
      object({
        documentName: string('The documentName must be a string'),
        documentVersion: string('The documentVersion must be a string'),
        acceptanceTimestamp: string(
          'The acceptanceTimestamp must be a string',
          [
            isoTimestamp(
              'The acceptanceTimestamp must be a valid ISO timestamp'
            ),
          ]
        ),
        acceptanceIP: string('The acceptanceIP must be a string', [
          ip('The acceptanceIP must follow a valid IP address format'),
        ]),
        acceptanceDeviceDetails: record(
          string(),
          unknown(),
          'The acceptanceDeviceDetails must be of type Record<string, unknown>'
        ),
      })
    ),
  },
  'The buyer must be an object'
);

export const buyerPatchSchema = partial(
  omit(buyerSchema, ['pk', 'sk', 'buyerStripeCustomerId'])
);

export type Buyer = Input<typeof buyerSchema>;
export type BuyerPatch = Input<typeof buyerPatchSchema>;

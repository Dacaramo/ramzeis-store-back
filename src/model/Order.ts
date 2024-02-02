import { addressSchema } from './Address';
import { buyerEmailSchema } from './Buyer';
import {
  object,
  string,
  value,
  isoDate,
  custom,
  maxLength,
  record,
  optional,
  url,
  number,
  integer,
  minValue,
  omit,
  Input,
  forward,
  partial,
  special,
  minLength,
} from 'valibot';
import { productPriceSchema } from './Product';
import { isDate1LessOrEqualThanDate2 } from '../utils/valibot';
import {
  encodedExclusiveStartKeySchema,
  limitSchema,
  stripePaymentMethodIdSchema,
} from './otherSchemas';

export const orderIdSchema = special<`order|${string}`>(
  (value) => (value as string).startsWith('order|'),
  "The orderId must starts with 'order|'"
);

export const orderSchema = object(
  {
    pk: orderIdSchema,
    sk: string('The sk must be a string', [
      value('N/A', "The sk must be equal to 'N/A'"),
    ]),
    orderCreationDate: string('The orderCreationDate must be a string', [
      isoDate('The orderCreationDate must be a valid ISO date (YYYY-DD-MM)'),
    ]),
    orderCompletionDate: optional(
      string('The orderCompletionDate must be a string', [
        isoDate(
          'The orderCompletionDate must be a valid ISO date (YYYY-DD-MM)'
        ),
      ])
    ),
    orderStatusId:
      string() /* Advanced schema obtained at execution time from S3 bucket json file */,
    orderNotes: string('The orderNotes must be a string', [
      maxLength(2000, 'The orderNotes must have at most 2000 characters'),
    ]),
    orderProductsDetails: record(
      string(),
      object({
        previewImage: string('The previewImage must be a string', [
          url('The previewImage must be a valid URL'),
        ]),
        quantity: number('The quantity must be a string', [
          integer('The quantity must be an integer'),
          minValue(1, 'The quantity must be greater than 0'),
        ]),
        size: optional(string('The size must be a string')),
        price: productPriceSchema,
      })
    ),
    orderAddressData: omit(addressSchema, ['pk', 'sk']),
    belongsTo: string('The belongsTo must be a string', [
      value('order', "The belongsTo must be equal to 'order'"),
    ]),
    orderBuyerEmail: buyerEmailSchema,
    orderStripePaymentMethodId: stripePaymentMethodIdSchema,
  },
  'The order must be an object'
);

export const orderFilterValuesSchema = partial(
  object(
    {
      limit: limitSchema,
      encodedExclusiveStartKey: encodedExclusiveStartKeySchema,
      lowerCreationDate: string('The lowerCreationDate must be a string', [
        isoDate(
          'The lowerCreationDate must be an ISO date string (YYYY-MM-DD)'
        ),
      ]),
      upperCreationDate: string('The upperCreationDate must be a string', [
        isoDate(
          'The lowerCreationDate must be an ISO date string (YYYY-MM-DD)'
        ),
      ]),
      lowerCompletionDate: string('The lowerCompletionDate must be a string', [
        isoDate(
          'The lowerCreationDate must be an ISO date string (YYYY-MM-DD)'
        ),
      ]),
      upperCompletionDate: string('The upperCompletionDate must be a string', [
        isoDate(
          'The lowerCreationDate must be an ISO date string (YYYY-MM-DD)'
        ),
      ]),
      statusId:
        string() /* Advanced schema obtained at execution time from S3 bucket json file */,
    },
    'orderFilteringParams must be an object',
    [
      forward(
        custom(
          (obj) =>
            isDate1LessOrEqualThanDate2(
              obj.lowerCreationDate,
              obj.upperCreationDate
            ),
          'The lowerCreationDate must be before the upperCreationDate'
        ),
        /* @ts-ignore */
        ['upperCreationDate']
      ),
      forward(
        custom(
          (obj) =>
            isDate1LessOrEqualThanDate2(
              obj.lowerCompletionDate,
              obj.upperCompletionDate
            ),
          'The lowerCompletionDate must be before the upperCompletionDate'
        ),
        ['upperCompletionDate']
      ),
    ]
  )
);

export const orderPatchSchema = partial(
  omit(orderSchema, [
    'pk',
    'sk',
    'orderCreationDate',
    'orderProductsDetails',
    'orderAddressData',
    'belongsTo',
    'orderBuyerEmail',
    'orderStripePaymentMethodId',
  ])
);

export const orderStatusSchema = object({
  id: string('The id must be a string', [
    minLength(1, 'The id must have at least 1 character'),
  ]),
  name: string('The name must be a string', [
    minLength(1, 'The name must have at least 1 character'),
  ]),
  description: string('The description must be a string', [
    minLength(1, 'The description must have at least 1 character'),
    maxLength(2000, 'The description most have at most 2000 characters'),
  ]),
});

export type Order = Input<typeof orderSchema>;
export type OrderId = Input<typeof orderIdSchema>;
export type OrderFilterValues = Input<typeof orderFilterValuesSchema>;
export type OrderPatch = Input<typeof orderPatchSchema>;
export type OrderStatus = Input<typeof orderStatusSchema>;

import {
  Input,
  array,
  integer,
  isoDate,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  string,
  url,
  special,
  partial,
  omit,
} from 'valibot';
import { productIdSchema } from './Product';
import { buyerEmailSchema } from './Buyer';
import { encodedExclusiveStartKeySchema, limitSchema } from './otherSchemas';

export const reviewIdSchema = special<`review|${string}`>(
  (value) => (value as string).startsWith('review|'),
  "The reviewId must starts with 'review|'"
);

export const reviewSchema = object(
  {
    pk: productIdSchema,
    sk: reviewIdSchema,
    reviewTitle: string('The reviewTitle must be a string', [
      maxLength(200, 'The reviewTitle must have at most 200 characters'),
    ]),
    reviewDescription: string('The reviewDescription must be a string', [
      maxLength(
        2000,
        'The reviewDescription must have at most 2000 characters'
      ),
    ]),
    reviewScore: number('The reviewScore must be a number', [
      integer('The reviewScore must be an integer'),
      minValue(1, 'The reviewScore must be greater than or equal to 1'),
      maxValue(5, 'The reviewScore must be less than or equal to 5'),
    ]),
    reviewDate: string('The reviewDate must be a string', [
      isoDate('The reviewDate must be a valid ISO date (YYYY-DD-MM)'),
    ]),
    reviewBuyerEmail: buyerEmailSchema,
    reviewImages: optional(
      array(
        string('The reviewImages must be an array of strings', [
          url('each reviewImage must be a valid URL'),
        ]),
        'The reviewImages must be an array of strings',
        [
          minLength(1, 'The images must have at least 1 item'),
          maxLength(3, 'The images must have at most 3 items'),
        ]
      )
    ),
  },
  'The review must be an object'
);

export const reviewFilterValuesSchema = partial(
  object({
    limit: limitSchema,
    encodedExclusiveStartKey: encodedExclusiveStartKeySchema,
  })
);

export const reviewPatchSchema = partial(
  omit(reviewSchema, ['pk', 'sk', 'reviewDate', 'reviewBuyerEmail'])
);

export type Review = Input<typeof reviewSchema>;
export type ReviewId = Input<typeof reviewIdSchema>;
export type ReviewFilterValues = Input<typeof reviewFilterValuesSchema>;
export type ReviewPatch = Input<typeof reviewPatchSchema>;

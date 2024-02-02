import {
  string,
  minLength,
  number,
  integer,
  minValue,
  maxValue,
  regex,
} from 'valibot';

export const tableNameSchema = string(
  'The tableName coming from the env variable must de a defined string',
  [
    minLength(
      1,
      'The tableName coming from the env variable must have at least 1 character'
    ),
  ]
);

export const bucketNameSchema = string(
  'The S3_BUCKET_NAME environment variable must be a defined string',
  [
    minLength(
      1,
      'The S3_BUCKET_NAME environment variable must have at least 1 character'
    ),
  ]
);

export const indexNameSchema = string(
  'The OPENSEARCH_PRODUCTS_INDEX_NAME environment variable must be a defined string',
  [
    minLength(
      1,
      'The OPENSEARCH_PRODUCTS_INDEX_NAME environment variable must have at least 1 character'
    ),
  ]
);

export const limitSchema = number('The limit must be a number', [
  integer('The limit must be an integer'),
  minValue(1, 'The limit must be greater than 0'),
  maxValue(100, 'The limit must be less or equal to 100'),
]);

export const encodedExclusiveStartKeySchema = string(
  'The encodedExclusiveStartKey must be a string'
);

export const localeSchema = string('The locale must be a string', [
  regex(
    /^[a-z]{2}(-[A-Z]{2})?$/,
    'The locale must come in the format of an ISO 639-1 language code optionally followed by a hyphen and an ISO 3166-1 Alpha-2 country code (regex: /^[a-zA-Z]{2}-[a-zA-Z]{2}$/, example: en-US)'
  ),
]);

export const stripePaymentMethodIdSchema = string(
  'The stripePaymentMethodId must be a string'
);

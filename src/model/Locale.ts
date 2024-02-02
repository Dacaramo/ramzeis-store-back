import {
  string,
  object,
  regex,
  minLength,
  maxLength,
  emoji,
  Input,
} from 'valibot';

/* Advanced schema obtained at execution time from dynamoDB table*/
export const localeIdSchema = string('The localeId must be a defined string', [
  regex(
    /^[a-z]{2}(-[A-Z]{2})?$/,
    'The localeId must come in the format of an ISO 639-1 language code optionally followed by a hyphen and an ISO 3166-1 Alpha-2 country code (regex: /^[a-zA-Z]{2}-[a-zA-Z]{2}$/, example: en-US)'
  ),
]);

export const localeSchema = object({
  id: localeIdSchema,
  name: string('The name must be a defined string', [
    minLength(1, 'The name must have at least 1 character'),
    maxLength(200, 'The name must have at most 200 characters'),
  ]),
  emoji: string('The emoji must be a defined string', [
    emoji('The emoji must be a valid emoji character'),
  ]),
});

export type Locale = Input<typeof localeSchema>;

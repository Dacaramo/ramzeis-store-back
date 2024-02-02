import {
  Input,
  array,
  boolean,
  integer,
  maxLength,
  minLength,
  minValue,
  number,
  object,
  optional,
  partial,
  string,
  url,
  special,
  omit,
  maxValue,
  merge,
  length,
  picklist,
} from 'valibot';
import { encodedExclusiveStartKeySchema, limitSchema } from './otherSchemas';
import { localeIdSchema } from './Locale';

export const productIdSchema = special<`product|${string}`>(
  (value) => (value as string).startsWith('product|'),
  "The productId must starts with 'product|'"
);

export const productPriceSchema = number('The price must be a number', [
  minValue(1000, 'The price must be greater than or equal to 1000 cents'),
  maxValue(50000, 'The price must be less or equal to 50000 cents'),
]);

export const productIsVisibleSchema = boolean(
  'The isVisible must be a boolean'
);

export const productIsForDropshippingSchema = boolean(
  'The isForDropshipping must be a boolean'
);

export const productSortSchema = picklist(
  ['asc', 'desc'],
  'The sort must be one of the following values: asc, desc'
);

export const productSchema = object(
  {
    pk: productIdSchema,
    name: string('The name must be a string', [
      minLength(1, 'The name must have at least 1 character'),
      maxLength(200, 'The name must have at most 200 characters'),
    ]),
    slides: array(
      object(
        {
          productSlide: string('The slides productSlide must be a string', [
            url('The slides productSlide must be a valid URL'),
          ]),
          effectSlide: string('The slides effectSlide must be a valid string', [
            url('The slides effectSlide must be a valid URL'),
          ]),
        },
        'Every object inside the slides array must be of type Record<string, {productSlide: string; effectSlide: string;}>'
      ),
      'The slides must be an array',
      [
        minLength(1, 'The slides array must have at least 1 item'),
        maxLength(3, 'The slides array must have at most 3 items'),
      ]
    ),
    details: array(
      object(
        {
          title: string('The details title must be a string', [
            minLength(1, 'The details title must have at least 1 character'),
            maxLength(
              200,
              'The details title must have at most 200 characters'
            ),
          ]),
          description: string('The details description must be a string', [
            minLength(
              1,
              'The details description must have at least 1 character'
            ),
            maxLength(
              2000,
              'The details description must have at most 2000 characters'
            ),
          ]),
          image: string('The details image must be a string', [
            url('The details image must be a valid URL'),
          ]),
        },
        'Every object inside the details array must be of type Record<string, {title: string; description: string; image: string;}>'
      ),
      'The details must be an array',
      [
        minLength(2, 'The details array must have at least 2 items'),
        maxLength(8, 'The details array must have 8 items or less'),
      ]
    ),
    previewImages: array(
      string('Every item inside the previewImages array must be an string', [
        url(
          'Every item inside the previewImages array must come in a valid url format'
        ),
      ]),
      [length(2, 'The previewImages array must always have 2 items')]
    ),
    colorId: string(),
    price: productPriceSchema,
    isVisible: productIsVisibleSchema,
    availableSizes: optional(
      array(
        string('The items inside the availableSizes array must be strings'),
        'The availableSizes must be an array of strings',
        [minLength(2, 'The availableSizes array must contain at least 2 items')]
      )
    ),
    categoryId: string(),
    subcategoryId: string(),
    stock: number('The stock must be a string', [
      integer('The stock must be an integer'),
      minValue(
        -1,
        'The stock must be greater than or equal to -1 (-1 means that the product has unlimited stock)'
      ),
    ]),
    supportedLocaleIds: array(localeIdSchema, [
      minLength(1, 'The supportedLocaleIds must have at least 1 item'),
    ]),
    isForDropshipping: productIsForDropshippingSchema,
  },
  'The product must be an object of type Record<string, {pk: string; name: string; slides: Array<Object>; details: Object; hexColor: string; price: number; isVisible: boolean; availableSizes?: Array<Object>; categoryId: string; subcategoryId: string; stock: number; supportedLocales: Array<string>; isForDropshipping: boolean}>'
);

export const productFilterValuesSchema = partial(
  object({
    limit: limitSchema,
    encodedExclusiveStartKey: encodedExclusiveStartKeySchema,
    sort: productSortSchema,
    search: string('The search must be a string'),
    categoryId: string(),
    subcategoryId: string(),
    colorId: string(),
    minPrice: number('The minPrice must be a number', [
      minValue(0, 'The minPrice must be greater than or equal to 0 cents'),
      maxValue(50000, 'The minPrice must be less or equal to 50000 cents'),
    ]),
    maxPrice: number('The maxPrice must be a number', [
      minValue(0, 'The maxPrice must be greater than or equal to 0 cents'),
      maxValue(50000, 'The maxPrice must be less or equal to 50000 cents'),
    ]),
    isVisible: productIsVisibleSchema,
    isForDropshipping: productIsForDropshippingSchema,
  })
);

export const productPatchSchema = partial(omit(productSchema, ['pk']));

export const productSubcategorySchema = object(
  {
    id: string('The id must be a string', [
      minLength(1, 'The id must have at least 1 character'),
    ]),
    name: string('The name must be a string', [
      minLength(1, 'The name must have at least 1 character'),
      maxLength(200, 'The name must have at most 200 characters'),
    ]),
    href: string('The href must be a string', [
      minLength(1, 'The href must have at least 1 character'),
    ]),
  },
  'The product subcategory must be of type Record<string; {id: string; name: string; href: string}>'
);

export const productCategorySchema = merge([
  productSubcategorySchema,
  object({
    subcategories: array(
      productSubcategorySchema,
      'The subcategories must be an array',
      [minLength(1, 'The subcategories array must have at least 1 item')]
    ),
  }),
]);

export const hexCodeSchema = special<`#${string}`>(
  (value) => /^#[0-9a-fA-F]{6}$/i.test(value as string),
  'The hexColor must be a string representing a hexadecimal color'
);

export const productColorSchema = object(
  {
    id: string('The id must be a string'),
    name: string('The name must be a string', [
      minLength(1, 'The name must have at least 1 character'),
      maxLength(200, 'The name must have at most 200 characters'),
    ]),
    hexCode: hexCodeSchema,
  },
  'The color must be an object of type Record<string, {name: string; hexColor: string}>'
);

export type Product = Input<typeof productSchema>;
export type ProductId = Input<typeof productIdSchema>;
export type ProductFilterValues = Input<typeof productFilterValuesSchema>;
export type ProductPatch = Input<typeof productPatchSchema>;
export type ProductCategory = Input<typeof productCategorySchema>;
export type ProductSubcategory = Input<typeof productSubcategorySchema>;
export type ProductSort = Input<typeof productSortSchema>;
export type ProductColor = Input<typeof productColorSchema>;
export type HexCode = Input<typeof hexCodeSchema>;

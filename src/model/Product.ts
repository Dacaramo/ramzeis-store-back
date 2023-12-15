import { HexColor } from './Colors';
import { ProductIdentifier } from './identifiers';

type ProductCategory = 'clothes' | 'decoration' | 'peripherals' | 'other';

export default interface Product {
  pk: ProductIdentifier;
  name: string;
  description: string;
  images: Array<string>;
  color: HexColor;
  price: number;
  isVisible: boolean;
  availableSizes: Array<string>;
  category: ProductCategory;
  stock: number;
}

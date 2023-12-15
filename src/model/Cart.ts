import { BuyerIdentifier, ProductIdentifier } from './identifiers';

interface CartProductDetails {
  previewImage: string;
  quantity: number;
  size?: string;
}

interface Cart {
  pk: BuyerIdentifier;
  sk: 'cart';
  cartDetails: Record<ProductIdentifier, CartProductDetails>;
}

export default Cart;

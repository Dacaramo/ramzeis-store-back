import {
  BuyerIdentifier,
  OrderIdentifier,
  ProductIdentifier,
} from './identifiers';
import Address from './address';
import Buyer from './Buyer';

interface OrderProductDetails {
  previewImage: string;
  quantity: number;
  size?: string;
  price: number;
}

type OrderStatus = 'pending' | 'delivered' | 'refunded';

export default interface Order {
  pk: OrderIdentifier;
  sk: 'N/A';
  orderCreationDate: string;
  orderCompletionDate: string;
  orderStatus: OrderStatus;
  orderNotes?: string;
  orderProductsDetails: Record<ProductIdentifier, OrderProductDetails>;
  orderBuyerData: Omit<Buyer, 'pk'>;
  orderAddressData: Omit<Address, 'pk' | 'sk'>;
  belongsTo: 'order';
  orderBuyerId: BuyerIdentifier;
}

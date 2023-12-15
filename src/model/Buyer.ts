import { BuyerIdentifier } from './identifiers';

export default interface Buyer {
  pk: BuyerIdentifier;
  name: string;
  email: string;
  phoneNumber: string;
}

import { AddressIdentifier, BuyerIdentifier } from './identifiers';

export default interface Address {
  pk: BuyerIdentifier;
  sk: AddressIdentifier;
  buyerCountry: string;
  buyerAdministrativeDivision: string;
  buyerCity: string;
  buyerZipCode: string;
  buyerRecipientName: string;
  buyerPhoneNumber: string;
  buyerDeliveryInstructions?: string;
}

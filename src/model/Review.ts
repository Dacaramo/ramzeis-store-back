export default interface Review {
  pk: string;
  sk: string;
  reviewTitle: string;
  reviewDescription: string;
  reviewScore: number;
  reviewDate: string;
  reviewBuyerId: string;
  reviewImages?: Array<string>;
}

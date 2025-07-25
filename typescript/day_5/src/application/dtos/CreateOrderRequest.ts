export interface CreateOrderRequest {
  id: string;
  userId: string;
  productIds: string[];
  total: number;
}

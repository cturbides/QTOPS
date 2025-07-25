export interface Order {
  id: string;
  userId: string;
  productIds: string[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

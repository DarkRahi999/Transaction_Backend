import { Expose } from 'class-transformer';

export class TransactionRes {
  @Expose()
  id: number;

  @Expose()
  amount: number;

  @Expose()
  type: string;

  @Expose()
  category: string;

  @Expose()
  description?: string;

  @Expose()
  transactionDate: Date;

  @Expose()
  balance?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
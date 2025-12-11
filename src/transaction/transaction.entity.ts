import { Entity, Enum, Property } from "@mikro-orm/core";
import { Table } from "../config/base.entity";
import { TransactionType, TransactionCategory } from "../utils/enums";

@Entity()
export class Transaction extends Table {
  @Property({ type: "datetime", index: true })
  transactionDate!: Date;

  @Property({ type: "numeric" })
  amount!: number;

  @Enum(() => TransactionType)
  type!: TransactionType;

  @Enum(() => TransactionCategory)
  category!: TransactionCategory;

  @Property({ length: 191, nullable: true })
  description?: string;

  @Property({ type: "numeric", nullable: true })
  balance?: number;
}
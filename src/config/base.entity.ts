import { BaseEntity, PrimaryKey, Property } from "@mikro-orm/core";

export abstract class Table extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ defaultRaw: "now()" })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: "now()",
    onUpdate: () => "now()",
    onCreate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
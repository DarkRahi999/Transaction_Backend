import * as dotenv from "dotenv";
import { defineConfig } from "@mikro-orm/postgresql";
import { Table } from "./base.entity";
import { Transaction } from "../transaction/transaction.entity";

dotenv.config();

export default defineConfig({
  clientUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:root@localhost:5432/learn",
  entities: [Transaction, Table],
  debug: false, // Disable debug logs
  allowGlobalContext: true,
  pool: {
    min: 2,
    max: 10,
  },
  driverOptions: {
    connection: {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      ssl:
        process.env.NODE_ENV === "production" ||
          process.env.DATABASE_URL?.includes("neon.tech")
          ? { rejectUnauthorized: false }
          : false,
    },
  },
  // seeder: {
  //   path: "./src/config",
  //   defaultSeeder: "Seed",
  // },
});
import * as dotenv from "dotenv";
import mikroOrmConfig from "./mikro-orm.config";
import { MikroORM } from "@mikro-orm/postgresql";

// Load environment variables
dotenv.config();

// Simple seeding script for development
export async function runSeeding(refresh = true) {
  console.log(`🌱 ${refresh ? "Refreshing" : "Syncing"} database...`);

  // Validate environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error("❌ DATABASE_URL environment variable is required");
  }

  let orm: MikroORM | undefined;

  try {
    // Connect to database silently
    orm = await MikroORM.init({
      ...mikroOrmConfig,
      debug: false, // Disable query logging
      logger: () => {}, // Disable all logging
    });
    console.log("✅ Database connection established");

    const em = orm.em.fork();

    if (refresh) {
      // Create schema (fresh installation) - drops all data
      await orm.getSchemaGenerator().ensureDatabase();
      await orm.getSchemaGenerator().dropSchema();
      await orm.getSchemaGenerator().createSchema();
      console.log("✅ Database schema created");
    } else {
      // Update schema (sync mode) - preserves existing data
      await orm.getSchemaGenerator().ensureDatabase();
      await orm.getSchemaGenerator().updateSchema();
      console.log("✅ Database schema synced");
    }

    // Refresh the EntityManager metadata after schema changes
    em.clear();

    console.log("✅ Seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    if (orm) {
      await orm.close();
      console.log("🔒 Database connection closed");
    }
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  const refresh = process.argv.includes("--refresh");
  runSeeding(refresh).catch(console.error);
}
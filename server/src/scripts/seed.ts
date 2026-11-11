import { connectToDatabase, disconnectFromDatabase } from "../config/database.js";
import { logger } from "../lib/logger.js";
import { seedContent } from "../content/seed.js";

await connectToDatabase();
try {
  const counts = await seedContent();
  logger.info(counts, "Content seed completed");
} finally {
  await disconnectFromDatabase();
}

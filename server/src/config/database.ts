import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

const maxAttempts = 5;

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function connectToDatabase() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info("Connected to MongoDB");
      return;
    } catch (error) {
      logger.warn(
        { err: error, attempt, maxAttempts },
        "MongoDB connection attempt failed"
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await wait(Math.min(1000 * 2 ** (attempt - 1), 5000));
    }
  }
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  }
}

import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";
const maxAttempts = 5;
function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
let listenersAttached = false;
function attachConnectionListeners() {
    if (listenersAttached)
        return;
    listenersAttached = true;
    mongoose.connection.on("connected", () => {
        logger.info("Mongoose connected to MongoDB");
    });
    mongoose.connection.on("disconnected", () => {
        logger.warn("Mongoose disconnected from MongoDB");
    });
    mongoose.connection.on("reconnected", () => {
        logger.info("Mongoose reconnected to MongoDB");
    });
    mongoose.connection.on("error", (error) => {
        logger.error({ err: error }, "Mongoose connection encountered an error");
    });
}
export async function connectToDatabase() {
    attachConnectionListeners();
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await mongoose.connect(env.MONGODB_URI, {
                serverSelectionTimeoutMS: 15000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                heartbeatFrequencyMS: 10000,
            });
            logger.info("Connected to MongoDB");
            return;
        }
        catch (error) {
            logger.warn({ err: error, attempt, maxAttempts }, "MongoDB connection attempt failed");
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

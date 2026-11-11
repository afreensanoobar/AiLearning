import { connectToDatabase, disconnectFromDatabase } from "../config/database.js";
import { logger } from "../lib/logger.js";
import { User } from "../models/user.js";
const email = process.argv
    .slice(2)
    .map((value) => value.trim().toLowerCase())
    .find((value) => value.includes("@"));
if (!email) {
    logger.error("Usage: npm run make-admin -w server -- email@example.com");
    process.exitCode = 1;
}
else {
    await connectToDatabase();
    try {
        const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin", deactivated: false } }, { returnDocument: "after" });
        if (!user) {
            logger.error({ email }, "No account found for that email. Register the user first, then rerun this command.");
            process.exitCode = 1;
        }
        else {
            logger.info({ email: user.email, role: user.role }, "User is now an admin");
        }
    }
    finally {
        await disconnectFromDatabase();
    }
}

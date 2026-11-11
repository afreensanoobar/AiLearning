import { Router } from "express";
import { requireAuth, requireRole } from "../auth/require-auth.js";
import { ai } from "../services/ai/gateway.js";
import { registerAdminContentRoutes } from "./admin-content.js";
import { registerAdminQuestionRoutes } from "./admin-questions.js";
import { registerAdminUserRoutes } from "./admin-users.js";
export function createAdminRouter(gateway = ai) {
    const router = Router();
    router.use(requireAuth, requireRole("admin"));
    registerAdminContentRoutes(router);
    registerAdminQuestionRoutes(router, gateway);
    registerAdminUserRoutes(router);
    return router;
}
export const adminRouter = createAdminRouter();

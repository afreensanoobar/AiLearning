import { Router } from "express";
import { requireAuth } from "../auth/require-auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { UserBadge } from "../models/user-badge.js";
import { badgeDefinitions } from "../services/gamification.js";

export const badgesRouter = Router();

badgesRouter.use(requireAuth);

badgesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const awards = await UserBadge.find({ userId: res.locals.auth!.userId })
      .sort({ awardedAt: -1 })
      .lean();
    const awardsByKey = new Map(awards.map((award) => [award.badgeKey, award]));
    res.json({
      badges: badgeDefinitions.map((definition) => {
        const award = awardsByKey.get(definition.key);
        return {
          key: definition.key,
          name: definition.name,
          description: definition.description,
          awardedAt: award?.awardedAt ?? null,
        };
      }),
    });
  })
);

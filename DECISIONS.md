# Decisions Log

This file records ambiguous architectural, implementation, or design decisions made during the LearnAI upgrade.

| Date       | Module | Decision                                                                                                             | Rationale                                                                                                |
| ---------- | ------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2026-11-11 | M0     | Set client workspace package name to `client` and server to `server` with npm workspaces                             | Matches Section 2 target architecture and npm workspace conventions                                      |
| 2026-11-11 | M0     | Initialize server workspace with TypeScript, ESLint, and a placeholder test/build script                             | Ensures root `npm run lint`, `npm run test`, and `npm run build` work across both workspaces immediately |
| 2026-11-11 | M1     | Retry MongoDB connection five times with exponential backoff capped at five seconds                                  | Provides bounded startup recovery without leaving a failed API process running indefinitely              |
| 2026-11-11 | M1     | Store parsed body, query, and params under `res.locals.validated`                                                    | Keeps validated inputs together without mutating Express request getters                                 |
| 2026-11-11 | M2     | Reject passwords longer than bcrypt's 72-byte input limit and use a dummy hash for unknown-email login attempts      | Avoids silent bcrypt truncation and reduces account-enumeration timing differences                       |
| 2026-11-11 | M2     | Store one signed JWT in an httpOnly cookie with a seven-day default lifetime; omit refresh-token rotation            | Follows the user's request for basic cookie JWT authentication; users sign in again after token expiry   |
| 2026-11-11 | M2     | Scope the httpOnly auth cookie to `/api` and set `SameSite=Lax`                                                      | Makes the cookie available to protected API routes while limiting cross-site cookie sending              |
| 2026-11-11 | M2     | Logout and password changes clear the browser cookie but do not revoke copied JWTs                                   | Keeps authentication stateless; a copied token remains valid until its expiry                            |
| 2026-11-11 | M3     | Seed placeholder lessons with one code sample and a 10-minute estimate                                               | The source app provides titles only, so initial lesson bodies use the requested placeholder format       |
| 2026-11-11 | M4     | Round course completion percentages to the nearest whole percent                                                     | Matches the existing `getCourseProgress` behavior in the client                                          |
| 2026-11-11 | M5     | Derive the next challenge stage from the highest stage passed with 100%                                              | Keeps challenge unlock state in submitted attempts instead of adding a separate progress record          |
| 2026-11-11 | M6     | Record a timestamped activity only when a lesson is newly completed                                                  | Preserves future streak history; older progress has no completion dates to backfill                      |
| 2026-11-11 | M7     | Use Node's built-in fetch for Gemini instead of adding an SDK                                                        | Keeps the provider layer small and avoids another runtime dependency                                     |
| 2026-11-11 | M8     | Create tutor sessions with the title "New chat" and rename them on the first sent message                            | Lets the UI create an empty conversation while ensuring saved sessions become identifiable after use     |
| 2026-11-11 | M9     | Store AI study plans per user until their next submitted attempt and compare normalized question text for duplicates | Keeps plans stable between assessments and rejects generated questions with near-identical wording       |
| 2026-11-11 | M10    | Keep legacy page data in memory only until M11 connects each page to the API                                         | Removes localStorage persistence now without mixing the page-by-page API migration into routing work     |
| 2026-11-11 | M13    | Soft-delete questions by setting `status: "archived"`; load role and deactivation from the database on each request | Keeps drafts/rejects distinct from removed items and makes role or deactivation changes take effect without waiting for JWT expiry |
| 2026-11-11 | M14    | Keep default course UI metadata in the admin create flow while exposing description, level, and skills               | The learner catalog currently styles cards by category; course lessons and all visible course content remain manageable in the admin flow |
| 2026-11-12 | M15    | Show a course in My Progress only when all of its current lessons are completed                                      | Keeps course completion separate from assessment-topic performance and excludes stale lesson completions |
<<<<<<< HEAD
| 2026-11-12 | M16    | Generate three lesson quiz questions on demand from saved content and displayed notes, then grade on the server       | Avoids AI calls on every course load, adapts questions to each video lesson, and keeps answer keys out of browser responses |
=======
>>>>>>> ff8f4750a4cb8f47d76bd42040a446262d82de69

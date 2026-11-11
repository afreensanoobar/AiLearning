# Decisions Log

This file records ambiguous architectural, implementation, or design decisions made during the LearnAI upgrade.

| Date       | Module | Decision                                                                                                        | Rationale                                                                                                |
| ---------- | ------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2026-11-11 | M0     | Set client workspace package name to `client` and server to `server` with npm workspaces                        | Matches Section 2 target architecture and npm workspace conventions                                      |
| 2026-11-11 | M0     | Initialize server workspace with TypeScript, ESLint, and a placeholder test/build script                        | Ensures root `npm run lint`, `npm run test`, and `npm run build` work across both workspaces immediately |
| 2026-11-11 | M1     | Retry MongoDB connection five times with exponential backoff capped at five seconds                             | Provides bounded startup recovery without leaving a failed API process running indefinitely              |
| 2026-11-11 | M1     | Store parsed body, query, and params under `res.locals.validated`                                               | Keeps validated inputs together without mutating Express request getters                                 |
| 2026-11-11 | M2     | Store one hashed refresh token per user; a new login or password change invalidates prior refresh sessions      | Keeps token revocation simple and ensures a password change requires signing in again                    |
| 2026-11-11 | M2     | Keep the access token valid until its short expiry after password change                                        | Avoids coupling password updates to client token replacement; refresh is revoked immediately             |
| 2026-11-11 | M2     | Reject passwords longer than bcrypt's 72-byte input limit and use a dummy hash for unknown-email login attempts | Avoids silent bcrypt truncation and reduces account-enumeration timing differences                       |
| 2026-11-11 | M2     | Scope the httpOnly refresh cookie to `/api/auth` with `SameSite=Lax`                                            | Limits cookie exposure to auth endpoints while retaining same-site CSRF protection                       |

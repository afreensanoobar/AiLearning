# Decisions Log

This file records ambiguous architectural, implementation, or design decisions made during the LearnAI upgrade.

| Date       | Module | Decision                                                                                 | Rationale                                                                                                |
| ---------- | ------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2026-11-11 | M0     | Set client workspace package name to `client` and server to `server` with npm workspaces | Matches Section 2 target architecture and npm workspace conventions                                      |
| 2026-11-11 | M0     | Initialize server workspace with TypeScript, ESLint, and a placeholder test/build script | Ensures root `npm run lint`, `npm run test`, and `npm run build` work across both workspaces immediately |

# Design Artifacts

This directory contains detailed design documents for each planned phase of the ai-css-kit roadmap.  
Unlike ADRs (which record *decisions already made*), design documents are **forward-looking artefacts** — they specify architecture, interfaces, and behaviour *before* implementation begins.

## Document Index

| # | Phase | Title | Version Target | Status |
|---|-------|-------|----------------|--------|
| [4.1](phase-4.1-cli-architecture.md) | Phase 4 — CLI Agent | CLI Architecture: Core & API Communication | v0.8.0 | Draft |

## Relationship to ADRs

```
Design Doc  →  (implemented)  →  ADR  →  (integrated into)  →  AI_CONTEXT.md
    ↑                                                                  ↓
  Planning                                                        AI Agents
```

- **Design docs** are written *before* implementation; they describe the full intended architecture.
- **ADRs** are written *after* the key decision is confirmed; they capture what was decided and why.
- **AI_CONTEXT.md** reflects the final accepted state, consumed by AI agents as a system prompt.

## Conventions

- Each document maps to one roadmap sub-item (e.g., `4.1`, `4.2`, `5.1`).
- File naming: `phase-{N}.{M}-{slug}.md`.
- All diagrams use ASCII/plain-text for maximum portability (no external rendering tools required).
- TypeScript-like syntax is used for type annotations (the project is JS-native; types are documentation only).

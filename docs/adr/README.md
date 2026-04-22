# Architectural Decision Records

This directory contains all ADRs (Architectural Decision Records) for the ai-css-kit project.

An ADR is a short document that captures a specific architectural decision: what was decided, why, and which alternatives were rejected.

## ADR Format

```markdown
# NNNN — Decision title
## Status: [Proposed | Accepted | Deprecated | Superseded by NNNN]
## Context
## Decision
## Consequences
## Alternatives considered
```

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [0001](0001-atomic-decoupling.md) | Atomic Decoupling — ban parent-selector mutations | Accepted | 2026-04-02 |
| [0002](0002-context-modifier-pattern.md) | Context Modifier Pattern for icons and contextual padding | Accepted | 2026-04-04 |
| [0003](0003-ai-token-naming.md) | `--ai-[component]-[prop]` naming standard: component tokens | Accepted | 2026-04-04 |
| [0004](0004-theme-mapper-and-presets.md) | Theme Mapper, cascade layers, and preset library | Accepted | 2026-04-07 |
| [0005](0005-cli-agent-architecture.md) | CLI Agent Architecture: split pipeline and provider abstraction | Accepted | 2026-04-09 |

## Creating a New ADR

1. Copy the latest file as a template
2. Increment the number by 1
3. Fill in all sections
4. Set status to `Proposed`
5. Update this table
6. After discussion, change status to `Accepted` or `Rejected`

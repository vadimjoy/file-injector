# Start Here

> **Language:** English | [Русский](../ru/START_HERE.md)

If you only read one file before touching the project, read this one.

## In One Sentence

`ai-css-kit` is a deterministic visual platform for building precise interfaces from constrained CSS primitives, themes, schemas, and reusable component contracts.

## The Problem It Solves

Most UI generation workflows fail in one of two ways:

1. they generate raw markup and CSS that quickly drifts and falls apart;
2. they rely on a generic UI kit that is too loose to guarantee visual precision.

`ai-css-kit` takes the opposite approach:

- define the component contract once;
- define the allowed variations once;
- expose them through schemas and tokens;
- assemble interfaces from those constraints instead of reinventing UI every time.

## Mental Model

Read the system like this:

```text
CSS kit -> themes -> showcase/playground -> CLI
```

### 1. CSS kit

The canonical layer:

- tokens
- foundations
- utilities
- components

This is where visual correctness starts.

### 2. Theme system

The layer that maps token sets and JSON theme descriptions into usable CSS themes.

### 3. Showcase / playground

The visual lab and control stand.

This is where a component proves that it survives:

- size variations
- state changes
- token overrides
- theme switching
- future validator / CLI integration

If the playground is unstable, the visual contract is unstable.

### 4. CLI

The future top layer.

It should not invent raw CSS. It should compose valid HTML from already stable contracts, schemas, and resolver rules.

## What The Project Is Not

- not a free-form design tool
- not an LLM that writes arbitrary CSS from scratch
- not just a demo gallery
- not primarily a CLI project

## Current Status

### Ready now

- CSS kit
- tokens and themes
- audit/lint scripts
- component contract direction

### Actively being stabilized

- `showcase-app`
- schema-driven playground
- schema coverage across components

### Depends on playground maturity

- CLI end-to-end generation flow

This is important: the playground is a blocker for the CLI, not a side feature.

## Safe Contribution Areas

If you are new to the project, start here:

1. tokens and theme mapping
2. utilities, grid, and layout primitives
3. CSS contract cleanup in existing components
4. schema-driven playground coverage
5. documentation and onboarding

## Read Next

1. [README.md](./README.md)
2. [CONTRIBUTING.md](./CONTRIBUTING.md)
3. [MASTER_PLAN.md](./MASTER_PLAN.md)
4. [DEMO_PLAYGROUND.md](../../plans/DEMO_PLAYGROUND.md)

## Short Answer For A Friend

If someone asks “what is this project?”, answer like this:

> It is a constrained visual system for building accurate interfaces fast.  
> The CSS kit defines the building blocks, the playground validates controlled variations, and the CLI later assembles HTML from those validated contracts.

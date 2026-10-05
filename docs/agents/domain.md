# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`docs/CONTEXT.md`**: the domain glossary (single context for the whole repo).
- **`docs/adr/negocio/`** (business decisions) and **`docs/adr/tecnico/`** (technical decisions): read the ADRs that touch the area you're about to work in.
- **`docs/ERS.md`**: requirements (RF-XX / RNF-XX), when the work maps to a requirement.

If a file you expect doesn't exist, **proceed silently**. The `/domain-modeling` skill creates and updates these docs when terms or decisions actually get resolved.

## File structure

```
/
├── docs/
│   ├── CONTEXT.md
│   ├── ERS.md
│   └── adr/
│       ├── negocio/0001-precios-en-ars.md
│       └── tecnico/0001-typescript-en-el-frontend.md
├── backend/
├── frontend/
└── db/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids (its `_Avoid_` lines).

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradice el ADR de negocio 0005 (saldo calculado), pero vale la pena reabrirlo porque…_

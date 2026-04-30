# Project Conventions

## Source Layout

- Keep runtime code under `src/`.
- Put routes and Next.js files under `src/app/`.
- Put reusable UI and client/server components under `src/components/`.
- Put shared non-UI code under `src/utility/`.

## Utility Layout

- `src/utility/constants/`: static keys, configuration maps, registry-style data.
- `src/utility/enums/`: string/number enumerators shared across features.
- `src/utility/helpers/`: helper functions, hooks, storage adapters, formatting helpers.
- `src/utility/types/`: shared interfaces, classes, and domain types.

## Import Rules

- Use the `@/` alias for all internal imports.
- Prefer the most specific import path available.
- Do not create a new top-level `lib/` folder. Extend `src/utility/` instead.

## Naming

- Use `constants` for immutable shared values.
- Use `enums` for named enumerators.
- Use `helpers` for reusable logic that is not a React component.
- Use `types` for shared interfaces, domain models, and related type definitions.

## Adding New Code

- New tools should live in `src/app/tools/<tool-id>/`.
- Shared tool metadata should be registered through `src/utility/constants/tools.ts`.
- If a new feature introduces reusable storage keys, enums, or types, place them in the matching `src/utility/` subfolder instead of keeping them inline.

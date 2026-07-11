# AGENTS.md

Instructions for AI assistants (Claude Code, Cursor, Copilot, etc.) working in
this repo. Read before making changes.

## What this is

`@letstri/oxc-config` — a shared [oxlint](https://oxc.rs) + [oxfmt](https://oxc.rs)
config library, in the spirit of `@antfu/eslint-config`.

A pnpm workspace (`pnpm-workspace.yaml`):

- `src/index.ts` — the library (root package `@letstri/oxc-config`). Exports
  `oxlintConfig()` and `oxfmtConfig()`. Build with `tsdown` → `dist/`.
- `oxlint.config.ts` / `oxfmt.config.ts` — the root dogfoods its own config and
  ignores `playground` (each workspace member lints/formats itself).
- `playground/` — `@playground/next`, a Next.js app consuming the config via
  `workspace:*`. Real-world test bed for plugin auto-detection (react, nextjs,
  typescript, tailwind). After changing `src/`, run `pnpm run build`, then
  `pnpm --filter @playground/next run lint` to smoke-test.

## Golden rule: keep the README in sync

**After any change that affects how the library is used, update `README.md` in
the same change.** The README is the public contract — it must never drift from
the code.

Update the README whenever you change:

- the public API — `oxlintConfig` / `oxfmtConfig` signatures, options, or defaults;
- the plugin auto-detection map or the manual toggles (`typescript`, `react`,
  `vue`, `next`, `vitest`, `jest`, `tailwind`);
- install steps, peer dependencies (e.g. `eslint-plugin-better-tailwindcss` is
  an optional peer the user installs themselves), or supported editors;
- the editor setup (`.vscode/settings.json`, `.zed/settings.json`).

If a change has no user-facing effect (internal refactor, comments, tests), the
README does not need to change — but say so explicitly in your summary.

## Keep this file in sync too

**When a change alters the project structure, workflow, conventions, or the
rules above, update `AGENTS.md` in the same change.** This file is the shared
source of truth for every AI assistant — keep it accurate. Examples: a new
script, a renamed entry file, a new check to run before finishing, a changed
convention.

## Before finishing a task

Run and make sure all pass:

```bash
pnpm build
pnpm check # run-p lint + check-types + format:check in parallel
```

A husky `pre-commit` hook runs `pnpm check` — a commit fails if any task does.
`prepublishOnly` builds `dist/` before `pnpm publish`.

## Conventions

- Keep `pluginToggles` and `basePlugins` typed with `OxlintPlugin` (derived from
  oxlint's own config type) so invalid plugin names fail at compile time.
- Framework-specific rules stay inert when their plugin is not registered —
  oxlint ignores rules for unregistered plugins. Do not gate rule blocks.
- Formatting/lint style is defined by this repo's own config. Run `pnpm format`
  before committing.

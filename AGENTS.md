# AGENTS.md

Instructions for AI assistants (Claude Code, Cursor, Copilot, etc.) working in
this repo. Read before making changes.

## What this is

A shared [oxlint](https://oxc.rs) + [oxfmt](https://oxc.rs) config library, in
the spirit of `@antfu/eslint-config`. It is a **pnpm monorepo**
(`pnpm-workspace.yaml`: `packages/*` + `playground`). The repo root is a private,
unpublished workspace root (`@letstri/oxc-config-monorepo`); it owns the shared
tooling (husky, taze, root lint/format) and orchestrates the packages with
`pnpm -r`.

Published packages live under `packages/` (currently one — the layout is a
monorepo so more can be added without another restructure):

- `packages/oxc-config/` — the core library `@letstri/oxc-config`. `src/` is
  split by concern: `oxlint.ts` (`oxlintConfig` + plugin auto-detection),
  `oxfmt.ts` (`oxfmtConfig`), `tailwind.ts` (`tailwindPlugin()`), `utils.ts`
  (shared `getInstalledPackages`), and `index.ts` (barrel). `cli.ts` is the
  `oxc-config` bin — a single `init` command (hand-parsed argv, no CLI framework)
  that scaffolds the TS configs and deep-merges the VS Code + Zed configs from
  the templates in `editors.ts`. It prompts interactively (`@clack/prompts`
  multiselect) when run with no flags in a TTY; per-target flags (`--oxlint`,
  `--oxfmt`, `--vscode`, `--zed`) skip the prompt, and CI/non-TTY with no flags
  falls back to all. Two tsdown entries (`index`, `cli`) → `dist/`.

Shared TS compiler options live in `tsconfig.base.json`; each package (and the
root, for the two config files) extends it.

- `oxlint.config.ts` / `oxfmt.config.ts` — the root dogfoods the core config
  (imported from `packages/oxc-config/src`, so linting needs no build) and
  ignores `playground` for formatting. Do **not** switch these to import built
  `dist` — that would make `pnpm check` require a build first.
- `playground/` — `@playground/next`, a Next.js app consuming the config via
  `workspace:*`. Real-world test bed for plugin auto-detection (react, nextjs,
  typescript, tailwind). After changing a package, run `pnpm run build`, then
  `pnpm --filter @playground/next run lint` to smoke-test.

## Golden rule: keep the READMEs in sync

**After any change that affects how the package is used, update the root
`README.md` in the same change.** The root `README.md` is the single source of
truth and the public contract — it must never drift from the code. It is **not**
committed inside the package: `packages/oxc-config/scripts/copy-readme.ts` copies
it into `packages/oxc-config/README.md` on `prepublishOnly`, and that in-package
copy is gitignored (`packages/oxc-config/.gitignore`). Edit the root README, never
the generated copy.

Update the root README whenever you change:

- the public API — `oxlintConfig` / `oxfmtConfig` signatures, options, or defaults;
- the plugin auto-detection map (`pluginDetectors`), or the `tailwindPlugin()` helper;
- install steps, peer dependencies (e.g. `oxlint-tailwindcss` is
  an optional peer the user installs themselves), or supported editors;
- the editor setup (`.vscode/settings.json`, `.zed/settings.json`).

If a change has no user-facing effect (internal refactor, comments, tests), the
README does not need to change — but say so explicitly in your summary.

The publish flow copies the README, so `packages/oxc-config/README.md` may exist
locally as an untracked, gitignored artifact — that is expected; don't commit it.

## Keep this file in sync too

**When a change alters the project structure, workflow, conventions, or the
rules above, update `AGENTS.md` in the same change.** This file is the shared
source of truth for every AI assistant — keep it accurate. Examples: a new
script, a renamed entry file, a new check to run before finishing, a changed
convention.

## Before finishing a task

Run and make sure all pass:

```bash
pnpm build   # pnpm -r run build — every package, in topological order
pnpm check   # run-p lint + check-types + format:check in parallel
```

All commands run from the repo root. `check-types` runs a root `tsc` (the two
root config files) then `pnpm -r run check-types`. A husky `pre-commit` hook runs
`pnpm check` — a commit fails if any task does. `oxc-config`'s `prepublishOnly`
builds its `dist/` then copies the root README in (`copy-readme`); the publish
workflow runs `pnpm -r publish`.

## Conventions

- Keep `pluginDetectors` and `basePlugins` typed with `OxlintPlugin` (derived from
  oxlint's own config type) so invalid plugin names fail at compile time.
- Framework-specific rules stay inert when their plugin is not registered —
  oxlint ignores rules for unregistered plugins. Do not gate rule blocks.
- Formatting/lint style is defined by this repo's own config. Run `pnpm format`
  before committing.

## Known non-goals

- **Porting [`eslint-plugin-pnpm`](https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm)
  (catalog enforcement etc.) to an oxlint plugin is not possible.** Those rules
  lint `package.json` and `pnpm-workspace.yaml`, which needs a custom parser.
  oxlint (1.73) plugins run on JS/TS/JSX only — `Language` is
  `"js" | "jsx" | "ts" | "tsx" | "dts"`, no JSON/YAML AST, and it offers no
  parser services. Don't re-attempt as an oxlint plugin. If revisited, port the
  rules to a standalone CLI checker (own jsonc/yaml parsing) instead.

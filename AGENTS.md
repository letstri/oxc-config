# AGENTS.md

Instructions for AI assistants (Claude Code, Cursor, Copilot, etc.) working in
this repo. Read before making changes.

## What this is

A shared [oxlint](https://oxc.rs) + [oxfmt](https://oxc.rs) config library, in
the spirit of `@antfu/eslint-config`. It is a **pnpm monorepo**
(`pnpm-workspace.yaml`: `packages/*` + `playground`). The repo root is a private,
unpublished workspace root (`@letstri/oxlint-config-monorepo`); it owns the shared
tooling (husky, taze, root lint/format) and orchestrates the packages with
`pnpm -r`.

Published packages live under `packages/` (currently one — the layout is a
monorepo so more can be added without another restructure):

- `packages/oxlint-config/` — the core library `@letstri/oxlint-config`. `src/` is
  split by concern: `oxlint.ts` (the oxlint `config()` + plugin auto-detection),
  `utils.ts` (shared `getInstalledPackages`), and `index.ts` (the barrel — it
  exports **only** `config`). Two modules are deliberately kept off the
  barrel and shipped as subpaths: `oxfmt.ts` (the oxfmt `config()`) as
  `@letstri/oxlint-config/oxfmt`, and `tailwind.ts` (`tailwindConfig()`) as
  `@letstri/oxlint-config/tailwind`. `cli.ts` is the
  `oxlint-config` bin — a single `init` command (hand-parsed argv, no CLI framework)
  that scaffolds the TS configs and deep-merges the VS Code + Zed configs from
  the templates in `editors.ts`. It prompts interactively (`@clack/prompts`
  multiselect) when run with no flags in a TTY; per-target flags (`--oxlint`,
  `--oxfmt`, `--vscode`, `--zed`) skip the prompt, and CI/non-TTY with no flags
  falls back to all. Four tsdown entries (`index`, `cli`, `oxfmt`, `tailwind`) →
  `dist/`. If you add a subpath, it needs a tsdown entry **and** an `exports` entry
  — and `cli.ts`'s `SPECIFIER` map must emit the right import in scaffolded configs.

Each package is self-contained: `packages/oxlint-config/tsconfig.json` holds its own
compiler options (no shared/root `tsconfig`).

- `oxlint.config.ts` / `oxfmt.config.ts` — the root dogfoods the core config
  (imported from `packages/oxlint-config/src`, so linting needs no build) and
  ignores `playground` for formatting. Do **not** switch these to import built
  `dist` — that would make `pnpm check` require a build first. The root has no
  `tsconfig`, so these two files are lint-checked but not type-checked.
- `playground/` — `@playground/next`, a Next.js app consuming the config via
  `workspace:*`. Real-world test bed for plugin auto-detection (react, nextjs,
  typescript, tailwind). After changing a package, run `pnpm run build`, then
  `pnpm --filter @playground/next run lint` to smoke-test.

## Golden rule: keep the READMEs in sync

**After any change that affects how the package is used, update the root
`README.md` in the same change.** The root `README.md` is the single source of
truth and the public contract — it must never drift from the code. It is **not**
committed inside the package: `packages/oxlint-config/scripts/copy-readme.ts` copies
it into `packages/oxlint-config/README.md` on `prepublishOnly`, and that in-package
copy is gitignored (`packages/oxlint-config/.gitignore`). Edit the root README, never
the generated copy.

Update the root README whenever you change:

- the public API — either `config()` (oxlint or oxfmt) signature, options, or defaults;
- the plugin auto-detection map (`pluginDetectors`), or the `tailwindConfig()` helper;
- install steps, peer dependencies (e.g. `oxlint-tailwindcss` is
  an optional peer the user installs themselves), or supported editors;
- the editor setup (`.vscode/settings.json`, `.zed/settings.json`).

If a change has no user-facing effect (internal refactor, comments, tests), the
README does not need to change — but say so explicitly in your summary.

The publish flow copies the README, so `packages/oxlint-config/README.md` may exist
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

All commands run from the repo root. `check-types` delegates to
`pnpm -r run check-types` (each package runs its own `tsc`). A husky `pre-commit` hook runs
`pnpm check` — a commit fails if any task does. `oxlint-config`'s `prepublishOnly`
builds its `dist/` then copies the root README in (`copy-readme`); the publish
workflow runs `pnpm -r publish`.

## Conventions

- **Both entry points export a function named `config`** — `oxlint.ts` (the barrel)
  and `oxfmt.ts` (the `/oxfmt` subpath). They never collide because they live on
  different specifiers and are used in different files.
- **`config()` deep-merges (defu); it is not a plain config object.** Consumers
  call it; we do the merging. Do not switch to objects consumed via oxlint's
  `extends` — that was tried and rejected. Two
  reasons it is a poor fit: oxfmt has **no** `extends` at all (absent from its
  types *and* its JSON schema), so the two halves cannot be symmetric; and
  oxlint's `extends` silently **drops `settings`**, which breaks `tailwindConfig()`
  (its `entryPoint` lives in `settings`) — the rules load but run unconfigured and
  every file errors with "`settings.tailwindcss.entryPoint` is required".
- Keep `pluginDetectors` and `basePlugins` typed with `OxlintPlugin` (derived from
  oxlint's own config type) so invalid plugin names fail at compile time.
- **The config is flat — one `rules` block, no `overrides`.** oxlint does not
  support extglob patterns (`?([cm])ts`, `*.?([cm])[jt]s?(x)`) in `overrides.files`;
  such a block silently never matches, so every rule in it is dead. The old
  per-language overrides were exactly that and did nothing. Rules that need TS/JSX
  syntax are no-ops elsewhere, so the root is usually right.
  Plain globs (`**/*.ts`, `**/*.vue`, `**/e2e/**`) *do* match, so an override is
  possible — but if you add one, prove the glob matches first: lint a file under it
  and confirm the rule is suppressed **and** that unrelated rules still fire there.
  Otherwise you are adding dead rules. Note `overrides.plugins` *replaces* the base
  plugin list rather than subtracting from it, and the list is only known after
  runtime detection — so any plugin-scoping override has to be built inside
  `config`, not in `baseOxlintConfig`.
- Do not add core-JS `'off'` entries meant only for TS files (`no-unused-vars`,
  `constructor-super`, …). Without working overrides they would disable the rule
  for JavaScript too, where nothing else catches it.
- **Never restate a rule at its category default.** `categories` already sets
  `correctness: error`, `suspicious: warn`, `perf: warn`, so listing a
  correctness rule as `'error'` is a no-op — as is `'off'` on a `restriction`/
  `style`/`pedantic`/`nursery` rule, which is off by default anyway. Only list a
  rule to *enable* one its category leaves off, to *deviate* from the category
  severity, or to pass options. Rule categories come from `declare_oxc_lint!` in
  oxc's source (`crates/oxc_linter/src/rules/**`), not the config.
- Ignore globs live once in `src/ignores.ts` and feed both the oxlint and oxfmt
  configs, so lint and format skip the same paths (incl. `**/*.md`,
  `**/skills`, and AI-assistant configs like `.cursor`/`.windsurf`/`AGENTS.md`).
  Edit that file, not the individual configs.
- Framework-specific rules stay inert when their plugin is not registered —
  oxlint ignores rules for unregistered plugins. Do not gate rule blocks.
- Formatting/lint style is defined by this repo's own config. Run `pnpm format`
  before committing.

## Planned: pnpm workspace rules (blocked on oxlint)

We want to port [`eslint-plugin-pnpm`](https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm)
(catalog enforcement and friends) as a second package in this monorepo — likely
`oxlint-pnpm-config`. **It is blocked, not rejected.**

Why it is blocked: those rules lint `package.json` and `pnpm-workspace.yaml`, so
they need JSON and YAML ASTs. antfu's plugin gets them by swapping in ESLint
parsers (`jsonc-eslint-parser`, `yaml-eslint-parser`) via `languageOptions.parser`.
oxlint has no equivalent — as of 1.73 its plugin `Language` is
`"js" | "jsx" | "ts" | "tsx" | "dts"`, the visitor only walks JS/TS/JSX nodes, and
it explicitly offers no parser services. A rule written against `package.json`
would simply never run.

**Trigger to revisit: oxlint gains YAML/JSON (custom-language or custom-parser)
plugin support.** When that lands, port the rules directly:

- JSON (`package.json`): `json-enforce-catalog`, `json-valid-catalog`,
  `json-prefer-workspace-settings`
- YAML (`pnpm-workspace.yaml`): `yaml-no-unused-catalog-item`,
  `yaml-no-duplicate-catalog-item`, `yaml-valid-packages`, `yaml-enforce-settings`

Until then, do **not** re-attempt this as an oxlint plugin — it cannot work. If
the rules are needed before oxlint catches up, the fallback is a standalone CLI
checker that parses jsonc/yaml itself, not an oxlint plugin.

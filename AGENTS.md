# AGENTS.md

Instructions for AI assistants working in this repo. Read before making changes.

## Layout

pnpm monorepo (`packages/*` + `playground`). The root is a private workspace root
that owns the shared tooling and orchestrates with `pnpm -r`.

- `packages/oxlint-config/` — `@letstri/oxlint-config`, the only published package.
  `index.ts` exports **only** `config` (from `oxlint.ts`). Two modules are kept off
  the barrel and shipped as subpaths: `oxfmt.ts` → `/oxfmt`, `plugins/tailwind.ts` → `/tailwind`.
  `cli/` is the `oxlint-config` bin (`init`) — `cli/index.ts` with the scaffolded
  config strings in `cli/templates.ts`. Its tsconfig is self-contained; there is no
  root `tsconfig`.
  A new subpath needs a tsdown entry **and** an `exports` entry — and the templates
  in `cli/templates.ts` must import from the right specifier in scaffolded configs.
- `oxlint.config.ts` / `oxfmt.config.ts` — the root dogfoods the config from
  `packages/oxlint-config/src`. Do **not** point these at built `dist`; that would
  make `pnpm check` require a build first.
- `playground/` — Next.js app consuming the config via `workspace:*`. Test bed for
  plugin auto-detection. Smoke-test with
  `pnpm --filter @letstri/oxlint-config build && pnpm --filter @playground/next run lint`.

## Before finishing

The root has no `build` script; build the package directly.

```bash
pnpm --filter @letstri/oxlint-config build
pnpm check   # lint + check-types + format:check
```

A husky `pre-commit` hook runs `pnpm check`.

## Golden rule: the root README is the contract

**Any change to how the package is used updates the root `README.md` in the same
change.** It is the single source of truth: the public API, the plugin detection
map, install steps, peer deps, editor setup.

The README is **not** committed inside the package — `scripts/copy-readme.ts`
copies it in on `prepublishOnly` and that copy is gitignored. Edit the root one.
An untracked `packages/oxlint-config/README.md` is an expected build artifact;
don't commit it.

Same for this file: if a change alters the structure, workflow, or rules here,
update it in the same change.

## Conventions

Rules and their reasons. Each of these was learned the hard way — don't undo one
without re-verifying it.

- **`config()` is a function that deep-merges (defu), not a config object.** Do not
  switch to objects consumed via oxlint's `extends`: oxfmt has **no** `extends` at
  all (absent from its types *and* schema), and oxlint's `extends` silently **drops
  `settings`** — which breaks `tailwindConfig()`, whose `entryPoint` lives there.
  Both entry points export a function named `config`; they never collide, being on
  different specifiers.
- **Keep the config flat — one `rules` block.** oxlint ignores extglob patterns
  (`?([cm])ts`) in `overrides.files`, so such a block never matches and every rule
  in it is dead. Plain globs *do* match: the only override is `**/*.cjs`, which
  turns off `typescript/no-require-imports`. Before adding another, prove the glob
  matches: confirm the rule is suppressed **and** unrelated rules still fire there.
  Note `overrides.plugins`
  *replaces* the base plugin list rather than subtracting from it, and that list is
  only known after runtime detection — so a plugin-scoping override must be built
  inside `config()`, not `baseOxlintConfig`.
- **Never restate a rule at its category default.** `categories` already sets
  `correctness: error`, `suspicious: warn`, `perf: warn`, so listing a correctness
  rule as `'error'` is a no-op — as is `'off'` on a `restriction`/`style`/`pedantic`/
  `nursery` rule, off by default anyway. List a rule only to enable one its category
  leaves off, deviate from the category severity, or pass options. Categories come
  from `declare_oxc_lint!` in oxc's source, not the config.
- **No core-JS `'off'` entries meant only for TS** (`no-unused-vars`,
  `constructor-super`, …). Without working overrides they disable the rule for
  JavaScript too, where nothing else catches it.
- Framework rules stay inert when their plugin isn't registered — oxlint ignores
  rules for unregistered plugins. Don't gate rule blocks.
- Keep `pluginDetectors` and `basePlugins` typed with `OxlintPlugin` so invalid
  plugin names fail at compile time.
- Ignore globs live once in `src/ignores.ts` and feed both configs, so lint and
  format skip the same paths. Edit that file, not the individual configs.
- **Don't add comments unless really needed — default to none.** A comment earns
  its place only by stating a constraint the code cannot show — *why* a value is
  what it is, or a non-obvious consequence. If in doubt, leave it out and let the
  code speak. Never restate the code (`// merge the configs` above a merge), narrate
  a change (`// renamed from X`), or re-describe a signature in prose. Usage examples
  belong in the README, not doc blocks; duplicated examples drift.
- Run `pnpm format` before committing.

## Blocked: pnpm workspace rules

Porting [`eslint-plugin-pnpm`](https://github.com/antfu/pnpm-workspace-utils/tree/main/packages/eslint-plugin-pnpm)
(catalog enforcement) is **blocked, not rejected**. Those rules lint `package.json`
and `pnpm-workspace.yaml`, so they need JSON/YAML ASTs — antfu gets them by swapping
in ESLint parsers. oxlint has no equivalent: its plugin `Language` is
`"js" | "jsx" | "ts" | "tsx" | "dts"` and it offers no parser services, so such a
rule would never run. **Do not re-attempt it as an oxlint plugin.**

Revisit when oxlint gains YAML/JSON plugin support, then port:

- `package.json`: `json-enforce-catalog`, `json-valid-catalog`, `json-prefer-workspace-settings`
- `pnpm-workspace.yaml`: `yaml-no-unused-catalog-item`, `yaml-no-duplicate-catalog-item`,
  `yaml-valid-packages`, `yaml-enforce-settings`

If needed sooner, the fallback is a standalone CLI checker that parses jsonc/yaml
itself — not an oxlint plugin.

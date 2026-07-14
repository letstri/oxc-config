# Oxlint and Oxfmt configs

Opinionated, shared [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [oxfmt](https://oxc.rs) config, in the spirit of [@antfu/eslint-config](https://github.com/antfu/eslint-config).

> [!NOTE]
> This is an **opinionated** config — it ships a curated set of rules and
> formatting defaults meant to work out of the box. [Override](#overrides)
> anything you disagree with.

## Install

```bash
npm i -D @letstri/oxlint-config oxlint oxfmt
```

Then scaffold everything with the `oxlint-config` CLI:

```bash
npx oxlint-config init
```

`init` prompts you to pick what to set up — oxlint config, oxfmt config, VS Code,
Zed. Pass flags to skip the prompt (useful in CI/scripts):

```bash
npx oxlint-config init --oxlint --oxfmt   # just the config files
npx oxlint-config init --vscode --zed     # just the editor settings
```

With flags, only the chosen targets run; with none in a non-interactive shell,
all four run. Config files are skipped if they already exist (`--force` to
overwrite); editor settings (VS Code + Zed) are deep-merged into any existing
files, so your other settings are kept.

### Editor extensions

The CLI writes the editor settings, but the extension that actually provides the
oxlint/oxfmt language servers has to be installed in the editor itself.

**VS Code** — install [`oxc.oxc-vscode`](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode).
The CLI adds it to `.vscode/extensions.json`, so VS Code will prompt you.

**Zed** — install the [**Oxc**](https://github.com/oxc-project/oxc-zed) extension:
open `zed: extensions`, search for _Oxc_, install. Zed has no equivalent of
`extensions.json`, so this step is manual — the `.zed/settings.json` the CLI
writes configures the `oxlint` and `oxfmt` language servers, but they only exist
once the extension is installed. Needs Zed >= `v0.205.0` and oxlint >= `v1.35.0`.

The generated `.zed/settings.json` sets oxlint to lint on type with safe fixes,
runs oxfmt on save, turns Prettier off, and makes oxfmt the formatter for
JavaScript, TypeScript and TSX.

## Usage

`oxlint.config.ts`:

```ts
import { config } from '@letstri/oxlint-config'

export default config()
```

`oxfmt.config.ts` — `config` ships from the `@letstri/oxlint-config/oxfmt`
subpath:

```ts
import { config } from '@letstri/oxlint-config/oxfmt'

export default config()
```

### Plugins

Plugins are enabled automatically by detecting dependencies in the nearest
`package.json`:

| Dependency   | Plugins enabled     |
| ------------ | ------------------- |
| `typescript` | `typescript`        |
| `react`      | `react`, `jsx-a11y` |
| `vue`        | `vue`               |
| `next`       | `nextjs`            |
| `vitest`     | `vitest`            |
| `jest`       | `jest`              |

Detection only reads the **nearest** `package.json`. If a dependency isn't found
there — e.g. it lives in a nested workspace like `apps/web/package.json`, or is
hoisted somewhere the scan doesn't see — its plugin won't be enabled. Add it
manually via `plugins`:

```ts
export default config({
  plugins: ['vue'],
})
```

### Overrides

Both `config` functions accept **any number of config objects**, all deep-merged
over the base config via [defu](https://github.com/unjs/defu) (arrays are
concatenated, so plugins from different pieces combine instead of overwriting):

```ts
export default config({ rules: { 'no-console': 'off' } }, { plugins: ['vue'] })
```

### Tailwind

`tailwindConfig({ entryPoint })` returns a config chunk for
[`oxlint-tailwindcss`](https://github.com/sergioazoc/oxlint-tailwindcss) (Tailwind v4).
It ships from the `@letstri/oxlint-config/tailwind` subpath — pass it as an argument
to `config`:

```ts
import { config } from '@letstri/oxlint-config'
import { tailwindConfig } from '@letstri/oxlint-config/tailwind'

export default config(
  { plugins: ['react', 'jsx-a11y'] },
  tailwindConfig({ entryPoint: 'app/globals.css' }),
)
```

Because arguments are merged (not spread), Tailwind's plugins combine with the
ones above rather than overwriting them.

Options:

- `entryPoint` (required) — your Tailwind entry CSS, so the plugin can resolve
  class names. In a monorepo, pass an array of glob → CSS mappings (last match
  wins, so end with a `'**'` catch-all):

  ```ts
  tailwindConfig({
    entryPoint: [
      { files: 'packages/ui/**', use: 'packages/ui/src/styles.css' },
      { files: '**', use: 'src/global.css' },
    ],
  })
  ```

- `ignoreClasses` — class names to exempt from `no-unknown-classes` (e.g. classes
  a component library generates that the plugin can't resolve):

  ```ts
  tailwindConfig({ entryPoint: 'app/globals.css', ignoreClasses: ['toaster'] })
  ```

The plugin is an **optional peer dependency** — install it yourself:

```bash
pnpm add -D oxlint-tailwindcss
```

If the plugin is missing, `tailwindConfig()` throws with an install hint.

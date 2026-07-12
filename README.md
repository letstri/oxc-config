# Oxlint and Oxfmt configs

Opinionated, shared [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [oxfmt](https://oxc.rs) config, in the spirit of [@antfu/eslint-config](https://github.com/antfu/eslint-config).

> [!NOTE]
> This is an **opinionated** config — it ships a curated set of rules and
> formatting defaults meant to work out of the box. [Override](#overrides)
> anything you disagree with.

## Install

```bash
npm i -D @letstri/oxc-config oxlint oxfmt
```

Then scaffold everything with the `oxc-config` CLI:

```bash
npx oxc-config init
```

`init` prompts you to pick what to set up — oxlint config, oxfmt config, VS Code,
Zed. Pass flags to skip the prompt (useful in CI/scripts):

```bash
npx oxc-config init --oxlint --oxfmt   # just the config files
npx oxc-config init --vscode --zed     # just the editor settings
```

With flags, only the chosen targets run; with none in a non-interactive shell,
all four run. Config files are skipped if they already exist (`--force` to
overwrite); editor settings are deep-merged into any existing files. See
[Editor setup](#editor-setup).

## Usage

`oxlint.config.ts`:

```ts
import { oxlintConfig } from '@letstri/oxc-config'

export default oxlintConfig()
```

`oxfmt.config.ts`:

```ts
import { oxfmtConfig } from '@letstri/oxc-config'

export default oxfmtConfig()
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
export default oxlintConfig({
  plugins: ['vue'],
})
```

### Overrides

`oxlintConfig` / `oxfmtConfig` accept **any number of config objects**, all
deep-merged over the base config via [defu](https://github.com/unjs/defu) (arrays
are concatenated, so plugins from different pieces combine instead of
overwriting):

```ts
export default oxlintConfig({ rules: { 'no-console': 'off' } }, { plugins: ['vue'] })
```

### Tailwind

`tailwindPlugin({ entryPoint })` returns a config chunk for
[`oxlint-tailwindcss`](https://github.com/sergioazoc/oxlint-tailwindcss) (Tailwind v4).
Pass it as an argument to `oxlintConfig`:

```ts
import { oxlintConfig, tailwindPlugin } from '@letstri/oxc-config'

export default oxlintConfig(
  { plugins: ['react', 'jsx-a11y'] },
  tailwindPlugin({ entryPoint: 'app/globals.css' }),
)
```

Because arguments are merged (not spread), Tailwind's plugins combine with the
ones above rather than overwriting them.

Options:

- `entryPoint` (required) — your Tailwind entry CSS, so the plugin can resolve
  class names. In a monorepo, pass an array of glob → CSS mappings (last match
  wins, so end with a `'**'` catch-all):

  ```ts
  tailwindPlugin({
    entryPoint: [
      { files: 'packages/ui/**', use: 'packages/ui/src/styles.css' },
      { files: '**', use: 'src/global.css' },
    ],
  })
  ```

- `ignoreClasses` — class names to exempt from `no-unknown-classes` (e.g. classes
  a component library generates that the plugin can't resolve):

  ```ts
  tailwindPlugin({ entryPoint: 'app/globals.css', ignoreClasses: ['toaster'] })
  ```

The plugin is an **optional peer dependency** — install it yourself:

```bash
pnpm add -D oxlint-tailwindcss
```

If the plugin is missing, `tailwindPlugin()` throws with an install hint.

## Editor setup

Both editors use the official [oxc](https://oxc.rs) tooling — `oxlint` for
linting and `oxfmt` for formatting — replacing ESLint and Prettier.

`oxc-config init` writes (or updates) the editor configs for you, deep-merging
into any existing files so your other settings are kept:

```bash
# both editors
pnpm exec oxc-config init --vscode --zed
```

It's idempotent — safe to re-run to pull the latest recommended settings.

### VS Code

Install the [`oxc.oxc-vscode`](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
extension (`init --vscode` also adds it to `.vscode/extensions.json`). It writes
`.vscode/settings.json` — oxlint as linter, oxfmt as the default formatter with
format-on-save, and Prettier's import organization turned off.

### Zed

Zed ships with the oxc language servers built in, so no extension is needed.
`init --zed` writes `.zed/settings.json` — oxfmt as the formatter (with
`source.fixAll.oxc` on save for JS/TS) and Prettier disabled, across the file
types oxfmt supports.

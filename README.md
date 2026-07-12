# Oxlint and Oxfmt configs

Opinionated, shared [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [oxfmt](https://oxc.rs) config, in the spirit of [@antfu/eslint-config](https://github.com/antfu/eslint-config).

> [!NOTE]
> This is an **opinionated** config — it ships a curated set of rules and
> formatting defaults meant to work out of the box. [Override](#overrides)
> anything you disagree with.

## Install

```bash
pnpm add -D @letstri/oxc-config oxlint oxfmt
```

## AI setup prompt

Paste this into Claude Code, Cursor, or any coding agent to wire everything up:

<details>
<summary>Show prompt</summary>

````text
Set up @letstri/oxc-config (oxlint + oxfmt) in this project:

1. Install dev deps: `@letstri/oxc-config oxlint oxfmt`.
2. Remove ESLint and Prettier: their configs, deps, and scripts.
3. Create `oxlint.config.ts`:
   ```ts
   import { oxlintConfig } from '@letstri/oxc-config'

   export default oxlintConfig()
   ```
4. Create `oxfmt.config.ts`:
   ```ts
   import { oxfmtConfig } from '@letstri/oxc-config'

   export default oxfmtConfig()
   ```
5. Add package.json scripts:
   - "lint": "oxlint"
   - "lint:fix": "oxlint --fix"
   - "format": "oxfmt"
   - "format:check": "oxfmt --check"
6. Framework plugins auto-enable from the nearest package.json. If a framework
   dep (react/vue/next/vitest/jest/typescript) lives in a nested workspace,
   enable it manually, e.g. `oxlintConfig({ plugins: ['vue'] })`.
7. Add the VS Code and Zed editor settings from the @letstri/oxc-config README.
8. Run `pnpm lint` and `pnpm format` and fix anything reported.
````

</details>

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

`tailwind({ entryPoint })` returns a config chunk for
[`eslint-plugin-better-tailwindcss`](https://github.com/schoero/eslint-plugin-better-tailwindcss).
Pass it as an argument to `oxlintConfig`:

```ts
import { oxlintConfig, tailwind } from '@letstri/oxc-config'

export default oxlintConfig(
  { plugins: ['react', 'jsx-a11y'] },
  tailwind({ entryPoint: 'app/globals.css' }),
)
```

Because arguments are merged (not spread), Tailwind's plugins combine with the
ones above rather than overwriting them. `entryPoint` (required) is your Tailwind
entry CSS, so the plugin can resolve class names. The plugin is an **optional
peer dependency** — install it yourself:

```bash
pnpm add -D eslint-plugin-better-tailwindcss
```

If the plugin is missing, `tailwind()` throws with an install hint.

## Editor setup

Both editors use the official [oxc](https://oxc.rs) tooling — `oxlint` for
linting and `oxfmt` for formatting — replacing ESLint and Prettier.

### VS Code

Install the [`oxc.oxc-vscode`](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
extension.

<details>
<summary>Show VS Code config</summary>

`.vscode/extensions.json`:

```json
{
  "recommendations": ["oxc.oxc-vscode"]
}
```

`.vscode/settings.json`:

```jsonc
{
  "oxc.configPath": "oxlint.config.ts",
  "oxc.fmt.configPath": "oxfmt.config.ts",
  "oxc.typeAware": true,
  "oxc.unusedDisableDirectives": "deny",
  "oxc.enable": true,
  "prettier.enable": false,
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file", // oxfmt can only format whole files
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.organizeImports": "never", // let oxfmt handle import organization
  },
}
```

</details>

### Zed

Zed ships with the oxc language servers built in.

<details>
<summary>Show Zed config</summary>

`.zed/settings.json`:

```jsonc
{
  "lsp": {
    "oxlint": {
      "initialization_options": {
        "settings": {
          "configPath": null,
          "run": "onType",
          "disableNestedConfig": false,
          "fixKind": "safe_fix",
          "unusedDisableDirectives": "deny",
        },
      },
    },
    "oxfmt": {
      "initialization_options": {
        "settings": {
          "fmt.configPath": null,
          "run": "onSave",
        },
      },
    },
  },
  "languages": {
    "TypeScript": {
      "format_on_save": "on",
      "prettier": { "allowed": false },
      "language_servers": ["...", "oxlint", "oxfmt"],
      "formatter": [
        { "language_server": { "name": "oxfmt" } },
        { "code_action": "source.fixAll.oxc" },
      ],
    },
    "TSX": {
      "format_on_save": "on",
      "prettier": { "allowed": false },
      "language_servers": ["...", "oxlint", "oxfmt"],
      "formatter": [
        { "language_server": { "name": "oxfmt" } },
        { "code_action": "source.fixAll.oxc" },
      ],
    },
    "JavaScript": {
      "format_on_save": "on",
      "prettier": { "allowed": false },
      "language_servers": ["...", "oxlint", "oxfmt"],
      "formatter": [
        { "language_server": { "name": "oxfmt" } },
        { "code_action": "source.fixAll.oxc" },
      ],
    },
    "JSON": {
      "format_on_save": "on",
      "prettier": { "allowed": false },
      "formatter": [{ "language_server": { "name": "oxfmt" } }],
    },
    "Markdown": {
      "format_on_save": "on",
      "prettier": { "allowed": false },
      "formatter": [{ "language_server": { "name": "oxfmt" } }],
    },
  },
}
```

Apply the same `languages` block to any other file types you want oxfmt to
format (`JSONC`, `CSS`, `HTML`, `YAML`, …).

</details>

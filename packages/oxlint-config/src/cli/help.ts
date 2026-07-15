import { readFileSync } from 'node:fs'

export const HELP = `oxlint-config — set up @letstri/oxlint-config in your project

Usage:
  oxlint-config [flags]

Flags (default: prompt for what to set up):
  --oxlint         create oxlint.config.ts
  --oxfmt          create oxfmt.config.ts
  --tailwind       include Tailwind linting in oxlint.config.ts
  --vscode         write .vscode settings
  --zed            write .zed settings
  --remove-eslint  uninstall ESLint and its plugins
  -f, --force      overwrite existing config files
  -h, --help       show this help
  -v, --version    show version`

export function version(): string {
  const url = new URL('../package.json', import.meta.url)
  return (JSON.parse(readFileSync(url, 'utf-8')) as { version: string }).version
}

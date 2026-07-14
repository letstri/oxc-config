#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import process from 'node:process'

import { cancel, isCancel, isCI, multiselect } from '@clack/prompts'
import { createDefu } from 'defu'
import { parse as parseJsonc } from 'jsonc-parser'

import { vscodeExtensions, vscodeSettings, zedSettings } from './editors.ts'

const log = (message: string) => process.stdout.write(`${message}\n`)

const merge = createDefu((obj, key, value) => {
  const current = (obj as Record<PropertyKey, unknown>)[key]
  if (Array.isArray(current) && Array.isArray(value)) {
    const union = [...value, ...current].map(item => JSON.stringify(item))
    ;(obj as Record<PropertyKey, unknown>)[key] = [...new Set(union)].map(item => JSON.parse(item))
    return true
  }
  return false
})

function mergeJson(path: string, base: object): string {
  const existed = existsSync(path)
  const current = existed
    ? parseJsonc(readFileSync(path, 'utf-8'), [], { allowTrailingComma: true })
    : {}
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(merge(base, current ?? {}), null, 2)}\n`)
  return existed ? 'updated' : 'created'
}

function writeConfig(path: string, content: string, force: boolean): string {
  const existed = existsSync(path)
  if (existed && !force) {
    return 'skipped'
  }
  writeFileSync(path, content)
  return existed ? 'overwritten' : 'created'
}

const template = (fn: 'oxlintConfig' | 'oxfmtConfig') =>
  `import { ${fn} } from '@letstri/oxc-config'\n\nexport default ${fn}()\n`

type Target = 'oxlint' | 'oxfmt' | 'vscode' | 'zed'

const TARGETS: Record<Target, { label: string; run: (force: boolean) => string }> = {
  oxlint: {
    label: 'oxlint.config.ts',
    run: force => `oxlint: ${writeConfig('oxlint.config.ts', template('oxlintConfig'), force)}`,
  },
  oxfmt: {
    label: 'oxfmt.config.ts',
    run: force => `oxfmt: ${writeConfig('oxfmt.config.ts', template('oxfmtConfig'), force)}`,
  },
  vscode: {
    label: 'VS Code settings (.vscode)',
    run: () =>
      `vscode: ${mergeJson('.vscode/settings.json', vscodeSettings)} settings, ` +
      `${mergeJson('.vscode/extensions.json', vscodeExtensions)} extensions`,
  },
  zed: {
    label: 'Zed settings (.zed)',
    run: () => `zed: ${mergeJson('.zed/settings.json', zedSettings)}`,
  },
}

const ALL = Object.keys(TARGETS) as Target[]

async function pickTargets(flags: Set<string>): Promise<Target[] | null> {
  const flagged = ALL.filter(target => flags.has(`--${target}`))
  if (flagged.length > 0) {
    return flagged
  }
  if (isCI() || !process.stdout.isTTY) {
    return ALL
  }
  const selected = await multiselect<Target>({
    message: 'What do you want to set up?',
    options: ALL.map(value => ({ value, label: TARGETS[value].label })),
    initialValues: ALL,
    required: true,
  })
  if (isCancel(selected)) {
    cancel('Cancelled.')
    return null
  }
  return selected
}

function version(): string {
  const url = new URL('../package.json', import.meta.url)
  return (JSON.parse(readFileSync(url, 'utf-8')) as { version: string }).version
}

const HELP = `oxc-config — set up @letstri/oxc-config in your project

Usage:
  oxc-config [flags]

Flags (default: prompt for what to set up):
  --oxlint       create oxlint.config.ts
  --oxfmt        create oxfmt.config.ts
  --vscode       write .vscode settings
  --zed          write .zed settings
  -f, --force    overwrite existing config files
  -h, --help     show this help
  -v, --version  show version`

const argv = process.argv.slice(2)

if (argv.includes('--help') || argv.includes('-h')) {
  log(HELP)
} else if (argv.includes('--version') || argv.includes('-v')) {
  log(version())
} else {
  const flags = new Set(argv)
  const force = flags.has('--force') || flags.has('-f')
  const targets = await pickTargets(flags)
  for (const target of targets ?? []) {
    log(TARGETS[target].run(force))
  }
}

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { createDefu } from 'defu'
import { parse as parseJsonc } from 'jsonc-parser'

import { vscodeExtensions, vscodeSettings, zedSettings } from '../editors.ts'
import { log } from './log.ts'
import type { Target } from './prompts.ts'
import { oxfmtTemplate, oxlintTemplate } from './templates.ts'

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

export function scaffold(
  targets: Target[],
  options: { entryPoint?: string; force: boolean },
): void {
  const { entryPoint, force } = options
  const run: Record<Target, () => string> = {
    oxlint: () => `oxlint: ${writeConfig('oxlint.config.ts', oxlintTemplate(entryPoint), force)}`,
    oxfmt: () => `oxfmt: ${writeConfig('oxfmt.config.ts', oxfmtTemplate, force)}`,
    vscode: () =>
      `vscode: ${mergeJson('.vscode/settings.json', vscodeSettings)} settings, ` +
      `${mergeJson('.vscode/extensions.json', vscodeExtensions)} extensions`,
    zed: () => `zed: ${mergeJson('.zed/settings.json', zedSettings)}`,
  }
  for (const target of targets) {
    log(run[target]())
  }
}

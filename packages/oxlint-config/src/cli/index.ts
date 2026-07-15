#!/usr/bin/env node
import process from 'node:process'

import { isCI } from '@clack/prompts'

import { ensureDeps, removeEslint } from './deps.ts'
import { HELP, version } from './help.ts'
import { log } from './log.ts'
import { pickTailwind, pickTargets } from './prompts.ts'
import type { Target } from './prompts.ts'
import { scaffold } from './scaffold.ts'

const argv = process.argv.slice(2)

if (argv.includes('--help') || argv.includes('-h')) {
  log(HELP)
} else if (argv.includes('--version') || argv.includes('-v')) {
  log(version())
} else {
  const flags = new Set(argv)
  const force = flags.has('--force') || flags.has('-f')
  const interactive = !isCI() && Boolean(process.stdout.isTTY)

  const targets = await pickTargets(flags, interactive)
  if (targets !== null) {
    const wantsOxlint = targets.includes('oxlint') || flags.has('--tailwind')
    const tailwind = wantsOxlint ? await pickTailwind(flags, interactive) : false

    if (tailwind !== null) {
      const deps = ['@letstri/oxlint-config', 'oxlint', 'oxfmt']
      if (tailwind) {
        deps.push('oxlint-tailwindcss')
      }
      await ensureDeps(deps, interactive)
      await removeEslint(flags, interactive)

      const chosen: Target[] =
        tailwind && !targets.includes('oxlint') ? ['oxlint', ...targets] : targets
      scaffold(chosen, { entryPoint: tailwind ? tailwind.entryPoint : undefined, force })
    }
  }
}

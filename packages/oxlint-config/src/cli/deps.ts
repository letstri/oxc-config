import process from 'node:process'

import { cancel, confirm, isCancel } from '@clack/prompts'
import { addDevDependency, detectPackageManager, removeDependency } from 'nypm'

import { getInstalledPackages } from '../utils.ts'
import { log } from './log.ts'

export async function ensureDeps(deps: string[], interactive: boolean): Promise<void> {
  const cwd = process.cwd()
  const installed = getInstalledPackages(cwd)
  const missing = deps.filter(dep => !installed.has(dep))
  if (missing.length === 0) {
    return
  }
  const pm = await detectPackageManager(cwd).catch(() => undefined)
  const hint = `${pm?.name ?? 'npm'} install -D ${missing.join(' ')}`

  if (!interactive) {
    log(`Missing dependencies: ${missing.join(', ')}. Install with:\n  ${hint}`)
    return
  }
  const install = await confirm({
    message: `Install missing dependencies${pm ? ` with ${pm.name}` : ''}?\n  ${missing.join(', ')}`,
    initialValue: true,
  })
  if (isCancel(install)) {
    cancel('Cancelled.')
    process.exit(0)
  }
  if (!install) {
    log(`Skipped. Install them yourself:\n  ${hint}`)
    return
  }
  try {
    await addDevDependency(missing, { cwd })
  } catch {
    log(`Install failed. Run it yourself:\n  ${hint}`)
  }
}

export async function removeEslint(flags: Set<string>, interactive: boolean): Promise<void> {
  const cwd = process.cwd()
  const found = [...getInstalledPackages(cwd)].filter(name => name.includes('eslint'))
  if (found.length === 0) {
    return
  }
  if (!flags.has('--remove-eslint') && !interactive) {
    log(`Found ESLint deps: ${found.join(', ')}. Remove with --remove-eslint.`)
    return
  }
  let remove = flags.has('--remove-eslint')
  if (!remove) {
    const answer = await confirm({
      message: `Remove ESLint and its plugins?\n  ${found.join(', ')}`,
      initialValue: true,
    })
    if (isCancel(answer)) {
      cancel('Cancelled.')
      process.exit(0)
    }
    remove = answer
  }
  if (!remove) {
    return
  }
  try {
    await removeDependency(found, { cwd })
    log(`removed: ${found.join(', ')}`)
  } catch {
    log(`Removal failed. Remove them yourself:\n  ${found.join(', ')}`)
  }
}

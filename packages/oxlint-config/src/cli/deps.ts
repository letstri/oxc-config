import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { cancel, confirm, isCancel } from '@clack/prompts'
import { addDevDependency, detectPackageManager, removeDependency } from 'nypm'

import { getInstalledPackages } from '../utils.ts'
import { log } from './log.ts'

// A workspace root: adding lands in the root, so it needs the `--workspace-root`
// (pnpm) / `--workspaces` (npm/yarn/bun) flag, else pnpm aborts with ADDING_TO_ROOT.
function isWorkspaceRoot(cwd: string): boolean {
  if (existsSync(resolve(cwd, 'pnpm-workspace.yaml'))) {
    return true
  }
  try {
    const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8')) as {
      workspaces?: unknown
    }
    return Boolean(pkg.workspaces)
  } catch {
    return false
  }
}

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
    await addDevDependency(missing, { cwd, workspace: isWorkspaceRoot(cwd) })
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
    await removeDependency(found, { cwd, workspace: isWorkspaceRoot(cwd) })
    log(`removed: ${found.join(', ')}`)
  } catch {
    log(`Removal failed. Remove them yourself:\n  ${found.join(', ')}`)
  }
}

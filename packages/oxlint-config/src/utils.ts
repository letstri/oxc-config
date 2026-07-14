import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function getInstalledPackages(cwd: string): Set<string> {
  const names = new Set<string>()
  try {
    const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf-8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      peerDependencies?: Record<string, string>
    }
    for (const field of [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies]) {
      for (const name of Object.keys(field ?? {})) {
        names.add(name)
      }
    }
  } catch {}

  return names
}

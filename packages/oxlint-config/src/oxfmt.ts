import { defu } from 'defu'
import { defineConfig as defineOxfmtConfig } from 'oxfmt'

import { ignorePatterns } from './ignores.ts'

type OxfmtOptions = Parameters<typeof defineOxfmtConfig>[0]

const baseOxfmtConfig = defineOxfmtConfig({
  printWidth: 100,
  singleQuote: true,
  semi: false,
  arrowParens: 'avoid',
  sortImports: true,
  quoteProps: 'consistent',
  ignorePatterns,
})

/**
 * Build an oxfmt config. Pass any number of config objects; they are deep-merged
 * over the base config via defu.
 */
export function config(...overrides: OxfmtOptions[]): OxfmtOptions {
  return defu({}, ...overrides, baseOxfmtConfig) as OxfmtOptions
}

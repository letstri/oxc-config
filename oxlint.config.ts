import { oxlintConfig } from './src/index.ts'

export default oxlintConfig({
  override: {
    ignorePatterns: ['playground'],
  },
})

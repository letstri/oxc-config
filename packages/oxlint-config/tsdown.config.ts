import { defineConfig } from 'tsdown'

export default defineConfig({
  name: 'oxlint-config',
  entry: ['./src/index.ts', './src/cli.ts', './src/oxfmt.ts', './src/tailwind.ts'],
  dts: {
    build: true,
  },
})

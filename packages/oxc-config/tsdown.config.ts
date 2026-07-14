import { defineConfig } from 'tsdown'

export default defineConfig({
  name: 'oxc-config',
  entry: ['./src/index.ts', './src/cli.ts', './src/tailwind.ts'],
  dts: {
    build: true,
  },
})

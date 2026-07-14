import { config } from './packages/oxlint-config/src/index.ts'
import { tailwindConfig } from './packages/oxlint-config/src/tailwind.ts'

export default config(
  tailwindConfig({
    entryPoint: [
      {
        files: 'playground/**',
        use: 'playground/app/globals.css',
      },
    ],
  }),
)

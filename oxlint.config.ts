import { oxlintConfig } from './packages/oxc-config/src/index.ts'
import { tailwindPlugin } from './packages/oxc-config/src/tailwind.ts'

export default oxlintConfig(
  tailwindPlugin({
    entryPoint: [
      {
        files: 'playground/**',
        use: 'playground/app/globals.css',
      },
    ],
  }),
)

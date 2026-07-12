import { oxlintConfig, tailwindPlugin } from './src/index.ts'

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

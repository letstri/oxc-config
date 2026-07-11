import { oxlintConfig } from '@letstri/oxc-config'

export default oxlintConfig({
  override: {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/globals.css',
      },
    },
  },
})

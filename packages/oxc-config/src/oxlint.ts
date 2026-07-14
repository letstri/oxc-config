import process from 'node:process'

import { defu } from 'defu'
import { defineConfig as defineOxlintConfig } from 'oxlint'

import { ignorePatterns } from './ignores.ts'
import { getInstalledPackages } from './utils.ts'

type OxlintOptions = Parameters<typeof defineOxlintConfig>[0]
type OxlintPlugin = NonNullable<NonNullable<OxlintOptions>['plugins']>[number]

const baseOxlintConfig = defineOxlintConfig({
  categories: {
    correctness: 'error',
    suspicious: 'warn',
    perf: 'warn',
  },
  env: {
    builtin: true,
    es2026: true,
    browser: true,
    node: true,
  },
  globals: {
    AudioPlaybackStats: 'readonly',
    CSSFontFaceDescriptors: 'readonly',
    CSSPseudoElement: 'readonly',
    LanguageModel: 'readonly',
    ModelContext: 'readonly',
    Sanitizer: 'readonly',
    TimelineTrigger: 'readonly',
    TimelineTriggerRange: 'readonly',
    TimelineTriggerRangeList: 'readonly',
    WebMCPEvent: 'readonly',
    XRCompositionLayer: 'readonly',
    XRCubeLayer: 'readonly',
    XRCylinderLayer: 'readonly',
    XREquirectLayer: 'readonly',
    XRLayerEvent: 'readonly',
    XRPlane: 'readonly',
    XRPlaneSet: 'readonly',
    XRProjectionLayer: 'readonly',
    XRQuadLayer: 'readonly',
    XRSubImage: 'readonly',
    XRWebGLSubImage: 'readonly',
  },
  ignorePatterns,
  rules: {
    'accessor-pairs': [
      'error',
      {
        enforceForClassMembers: true,
        setWithoutGet: true,
      },
    ],
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'default-case-last': 'error',
    'eqeqeq': ['error', 'smart'],
    'new-cap': [
      'error',
      {
        capIsNew: false,
        newIsCap: true,
        properties: true,
      },
    ],
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-case-declarations': 'error',
    'no-cond-assign': ['error', 'always'],
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-implied-eval': 'error',
    'no-labels': [
      'error',
      {
        allowLoop: false,
        allowSwitch: false,
      },
    ],
    'no-lone-blocks': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-proto': 'error',
    'no-prototype-builtins': 'error',
    'no-redeclare': [
      'error',
      {
        builtinGlobals: false,
      },
    ],
    'no-regex-spaces': 'error',
    'no-restricted-globals': [
      'error',
      {
        message: 'Use `globalThis` instead.',
        name: 'global',
      },
      {
        message: 'Use `globalThis` instead.',
        name: 'self',
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        message: 'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.',
        property: '__proto__',
      },
      {
        message: 'Use `Object.defineProperty` instead.',
        property: '__defineGetter__',
      },
      {
        message: 'Use `Object.defineProperty` instead.',
        property: '__defineSetter__',
      },
      {
        message: 'Use `Object.getOwnPropertyDescriptor` instead.',
        property: '__lookupGetter__',
      },
      {
        message: 'Use `Object.getOwnPropertyDescriptor` instead.',
        property: '__lookupSetter__',
      },
    ],
    'no-self-assign': [
      'error',
      {
        props: true,
      },
    ],
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': 'off',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-underscore-dangle': [
      'warn',
      {
        allow: ['__filename', '__dirname'],
      },
    ],
    'no-unexpected-multiline': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': [
      'error',
      {
        defaultAssignment: false,
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTaggedTemplates: true,
        allowTernary: true,
      },
    ],
    'no-unused-vars': [
      'error',
      {
        args: 'none',
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'no-use-before-define': [
      'error',
      {
        classes: false,
        functions: false,
        variables: true,
      },
    ],
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'object-shorthand': [
      'error',
      'always',
      {
        avoidQuotes: true,
        ignoreConstructors: false,
      },
    ],
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: true,
      },
    ],
    'prefer-exponentiation-operator': 'error',
    'prefer-promise-reject-errors': 'error',
    'prefer-regex-literals': [
      'error',
      {
        disallowRedundantWrapping: true,
      },
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'symbol-description': 'error',
    'unicode-bom': ['error', 'never'],
    'use-isnan': [
      'error',
      {
        enforceForIndexOf: true,
        enforceForSwitchCase: true,
      },
    ],
    'valid-typeof': [
      'error',
      {
        requireStringLiterals: true,
      },
    ],
    'vars-on-top': 'error',
    'yoda': ['error', 'never'],
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-default': 'error',
    'import/no-unassigned-import': 'off',
    'import/newline-after-import': [
      'error',
      {
        count: 1,
      },
    ],
    'no-unassigned-vars': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/control-has-associated-label': 'warn',
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/prefer-tag-over-role': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useIsomorphicLayoutEffect|useIsomorphicEffect|useUpdateEffect|useUpdateLayoutEffect|useDeepCompareEffect|useDeepCompareLayoutEffect|useDeepCompareEffectNoCheck|useShallowCompareEffect|useCustomCompareEffect|useMountEffect|useMountedEffect|useAsyncEffect|useDebounceEffect|useThrottleEffect|useEnhancedEffect)',
      },
    ],
    'typescript/no-explicit-any': 'error',
    'node/handle-callback-err': ['error', '^(err|error)$'],
    'node/no-exports-assign': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'jsdoc/check-access': 'warn',
    'jsdoc/check-property-names': 'warn',
    'jsdoc/empty-tags': 'warn',
    'jsdoc/implements-on-classes': 'warn',
    'jsdoc/no-defaults': 'warn',
    'jsdoc/require-param-name': 'warn',
    'jsdoc/require-property': 'warn',
    'jsdoc/require-property-description': 'warn',
    'jsdoc/require-property-name': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'unicorn/consistent-empty-array-spread': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-instanceof-builtins': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/number-literal-case': 'error',
    'unicorn/prefer-dom-node-text-content': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',
    'react/no-clone-element': 'warn',
    'react/only-export-components': [
      'error',
      {
        allowConstantExport: false,
        allowExportNames: [],
      },
    ],
    'vitest/consistent-test-it': [
      'error',
      {
        fn: 'it',
        withinDescribe: 'it',
      },
    ],
    'vitest/no-identical-title': 'error',
    'vitest/no-import-node-test': 'error',
    'vitest/prefer-hooks-in-order': 'error',
    'vitest/prefer-lowercase-title': 'error',
    'typescript/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
      },
    ],
    'typescript/consistent-type-definitions': ['error', 'interface'],
    'typescript/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports',
        prefer: 'type-imports',
      },
    ],
    'typescript/method-signature-style': ['error', 'property'],
    'typescript/no-empty-object-type': [
      'error',
      {
        allowInterfaces: 'always',
      },
    ],
    'typescript/no-extraneous-class': 'off',
    'typescript/no-import-type-side-effects': 'error',
    'typescript/no-namespace': 'error',
    'typescript/no-non-null-asserted-nullish-coalescing': 'error',
    'typescript/no-require-imports': 'error',
    'typescript/no-unnecessary-type-constraint': 'error',
    'typescript/no-unsafe-function-type': 'error',
    'typescript/prefer-literal-enum-member': 'error',
    'typescript/triple-slash-reference': 'off',
  },
  overrides: [
    {
      // Playwright fixtures take a `use` callback. The react plugin reads that
      // call as React's `use` hook and reports it outside a component.
      files: ['**/e2e/**'],
      rules: {
        'react/rules-of-hooks': 'off',
      },
    },
  ],
})

const basePlugins = [
  'import',
  'jsdoc',
  'node',
  'promise',
  'unicorn',
] as const satisfies readonly OxlintPlugin[]

type BasePlugin = (typeof basePlugins)[number]

/**
 * Oxlint config accepted by {@link oxlintConfig}. Same as oxlint's own config,
 * but `plugins` can't include the always-on base plugins.
 */
export type OxlintConfig = Omit<NonNullable<OxlintOptions>, 'plugins'> & {
  plugins?: Exclude<OxlintPlugin, BasePlugin>[]
}

const pluginDetectors = {
  typescript: { packages: ['typescript'], plugins: ['typescript'] },
  react: { packages: ['react'], plugins: ['react', 'jsx-a11y'] },
  vue: { packages: ['vue'], plugins: ['vue'] },
  next: { packages: ['next'], plugins: ['nextjs'] },
  vitest: { packages: ['vitest'], plugins: ['vitest'] },
  jest: { packages: ['jest'], plugins: ['jest'] },
} satisfies Record<string, { packages: string[]; plugins: OxlintPlugin[] }>

function resolvePlugins(cwd: string): OxlintPlugin[] {
  const installed = getInstalledPackages(cwd)
  const plugins: OxlintPlugin[] = [...basePlugins]
  for (const { packages, plugins: enabled } of Object.values(pluginDetectors)) {
    if (packages.some(pkg => installed.has(pkg))) {
      plugins.push(...enabled)
    }
  }
  return [...new Set(plugins)]
}

/**
 * Build an oxlint config.
 *
 * Plugins are auto-enabled by detecting their package (`typescript`, `react`,
 * `vue`, `next`, `vitest`, `jest`) in the nearest `package.json`. To enable a
 * plugin whose dependency lives elsewhere — e.g. a nested workspace like
 * `apps/web/package.json` — add it through `plugins`.
 *
 * Pass any number of config objects; they are deep-merged (arrays concatenated,
 * with `plugins` de-duplicated), so pieces like {@link tailwindPlugin} compose
 * without clobbering each other.
 *
 * @example
 * ```ts
 * // auto-detect from the current package.json
 * export default oxlintConfig()
 * ```
 * @example
 * ```ts
 * // enable a plugin by hand, tweak a rule
 * export default oxlintConfig({ plugins: ['vue'], rules: { 'no-console': 'off' } })
 * ```
 * @example
 * ```ts
 * // compose Tailwind — its plugins merge with the ones above, not overwrite
 * export default oxlintConfig(
 *   { plugins: ['react', 'jsx-a11y'] },
 *   tailwindPlugin({ entryPoint: 'app/globals.css' }),
 * )
 * ```
 */
export function oxlintConfig(...overrides: OxlintConfig[]): OxlintOptions {
  const merged = defu(
    {},
    ...overrides,
    { plugins: resolvePlugins(process.cwd()) },
    baseOxlintConfig,
  ) as OxlintOptions

  if (merged?.plugins) {
    merged.plugins = [...new Set(merged.plugins)]
  }

  return merged
}

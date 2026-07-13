/**
 * Editor config templates, adapted from the official oxc examples:
 * - https://github.com/oxc-project/oxc-vscode/blob/main/.vscode/settings.json
 * - https://github.com/oxc-project/oxc-zed/blob/main/examples/both/.zed/settings.json
 *
 * `configPath` values point at this library's TypeScript config files.
 */

export const vscodeExtensions = {
  recommendations: ['oxc.oxc-vscode'],
}

export const vscodeSettings = {
  'oxc.configPath': 'oxlint.config.ts',
  'oxc.fmt.configPath': 'oxfmt.config.ts',
  'oxc.typeAware': true,
  'oxc.unusedDisableDirectives': 'deny',
  'editor.defaultFormatter': 'oxc.oxc-vscode',
  'editor.formatOnSave': true,
  // oxfmt can only format whole files
  'editor.formatOnSaveMode': 'file',
  'editor.codeActionsOnSave': {
    // let oxfmt handle import organization
    'source.organizeImports': 'never',
  },
}

const oxfmtFormatter = { language_server: { name: 'oxfmt' } }

const codeFormatter = [oxfmtFormatter, { code_action: 'source.fixAll.oxc' }]

export const zedSettings = {
  lsp: {
    oxlint: {
      initialization_options: {
        settings: {
          configPath: null,
          run: 'onType',
          disableNestedConfig: false,
          fixKind: 'safe_fix',
          unusedDisableDirectives: 'deny',
        },
      },
    },
    oxfmt: {
      initialization_options: {
        settings: {
          'fmt.configPath': null,
          'run': 'onSave',
        },
      },
    },
  },
  format_on_save: 'on',
  prettier: { allowed: false },
  formatter: [oxfmtFormatter],
  languages: {
    JavaScript: { formatter: codeFormatter },
    TypeScript: { formatter: codeFormatter },
    TSX: { formatter: codeFormatter },
  },
}

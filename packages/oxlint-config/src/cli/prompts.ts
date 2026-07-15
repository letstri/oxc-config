import { cancel, confirm, isCancel, multiselect, text } from '@clack/prompts'

export type Target = 'oxlint' | 'oxfmt' | 'vscode' | 'zed'

const LABELS: Record<Target, string> = {
  oxlint: 'oxlint.config.ts',
  oxfmt: 'oxfmt.config.ts',
  vscode: 'VS Code settings (.vscode)',
  zed: 'Zed settings (.zed)',
}

export const ALL = Object.keys(LABELS) as Target[]

export async function pickTargets(
  flags: Set<string>,
  interactive: boolean,
): Promise<Target[] | null> {
  const flagged = ALL.filter(target => flags.has(`--${target}`))
  if (flagged.length > 0) {
    return flagged
  }
  if (!interactive) {
    return ALL
  }
  const selected = await multiselect<Target>({
    message: 'What do you want to set up?',
    options: ALL.map(value => ({ value, label: LABELS[value] })),
    initialValues: ALL,
    required: true,
  })
  if (isCancel(selected)) {
    cancel('Cancelled.')
    return null
  }
  return selected
}

const DEFAULT_ENTRY_POINT = 'src/global.css'

export async function pickTailwind(
  flags: Set<string>,
  interactive: boolean,
): Promise<{ entryPoint: string } | false | null> {
  if (!flags.has('--tailwind') && !interactive) {
    return false
  }
  if (!flags.has('--tailwind')) {
    const enable = await confirm({
      message: 'Add Tailwind linting (oxlint-tailwindcss)?',
      initialValue: false,
    })
    if (isCancel(enable)) {
      cancel('Cancelled.')
      return null
    }
    if (!enable) {
      return false
    }
  }
  if (!interactive) {
    return { entryPoint: DEFAULT_ENTRY_POINT }
  }
  const entryPoint = await text({
    message: 'Path to your Tailwind entry CSS',
    placeholder: DEFAULT_ENTRY_POINT,
    defaultValue: DEFAULT_ENTRY_POINT,
  })
  if (isCancel(entryPoint)) {
    cancel('Cancelled.')
    return null
  }
  return { entryPoint: entryPoint || DEFAULT_ENTRY_POINT }
}

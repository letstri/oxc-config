import process from 'node:process'

export const log = (message: string) => process.stdout.write(`${message}\n`)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
// repo root README -> package README (published, gitignored)
const readmePath = path.join(currentDir, '../../..', 'README.md')
const packageReadmePath = path.join(currentDir, '..', 'README.md')

fs.copyFileSync(readmePath, packageReadmePath)

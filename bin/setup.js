#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = join(__dirname, '..');
const entry = join(repoRoot, 'src/setup-sso.ts');

if (!fs.existsSync(entry)) {
  console.error('TS file not found at:', entry);
  process.exit(1);
}

const args = process.argv.slice(2);

const child = spawn(
  process.execPath,
  ['--import', 'tsx', entry, ...args],
  {
    stdio: 'inherit',
    cwd: repoRoot,
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

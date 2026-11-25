import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR;
if (!output) throw new Error('Set MAKEFUN_OUTPUT_DIR to a writable directory');
mkdirSync(output, { recursive: true });
// The deliverable is deterministic: only the bundled original image is copied.
copyFileSync(join(root, 'entry.png'), join(output, 'entry.png'));

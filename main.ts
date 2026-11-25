import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const PNG_END = new Uint8Array([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_EDGE = 1024;

const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR;
if (!outputDirectory) {
  throw new Error('MAKEFUN_OUTPUT_DIR must name a writable directory');
}

const source = resolve(dirname(fileURLToPath(import.meta.url)), 'entry.png');
const image = readFileSync(source);

if (image.length > MAX_IMAGE_BYTES || image.length < 33) {
  throw new Error(`Unexpected PNG size: ${image.length} bytes`);
}
if (!image.subarray(0, 8).equals(PNG_SIGNATURE) || image.toString('ascii', 12, 16) !== 'IHDR') {
  throw new Error('The bundled artwork is not a PNG with an IHDR header');
}
if (!image.subarray(-12).equals(PNG_END)) {
  throw new Error('The bundled PNG is incomplete: its IEND chunk is missing');
}

const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (!width || !height || width > MAX_EDGE || height > MAX_EDGE) {
  throw new Error(`PNG dimensions exceed the contest limit: ${width}x${height}`);
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(resolve(outputDirectory, 'entry.png'), image);

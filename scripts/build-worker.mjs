import { build } from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
await mkdir('dist/server', { recursive: true });
await build({ entryPoints: ['server/worker.js'], outfile: 'dist/server/index.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022' });
await mkdir('dist/.openai', { recursive: true });
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
await cp('drizzle', 'dist/.openai/drizzle', {recursive:true});

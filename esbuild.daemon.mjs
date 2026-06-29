// Bundles the standalone daemon (daemon/agent.ts) into a single ESM file
// dist/daemon.mjs that plain Node can run.
//
// - packages: 'external' keeps node_modules deps (incl. the native
//   better-sqlite3) as runtime imports — only our own source is bundled.
// - alias '@' -> repo root resolves the TypeScript path alias used across lib/.
//
// Run: node esbuild.daemon.mjs   (via `npm run build:daemon`)
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(root, 'daemon/agent.ts')],
  outfile: resolve(root, 'dist/daemon.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  alias: { '@': root },
  logLevel: 'info',
  // Native ESM bundles lose require/__dirname; shim them for any CJS dep that
  // expects them at runtime.
  banner: {
    js: "import{createRequire as __cr}from'node:module';import{fileURLToPath as __f}from'node:url';import{dirname as __d}from'node:path';const require=__cr(import.meta.url);const __filename=__f(import.meta.url);const __dirname=__d(__filename);",
  },
});

console.log('built dist/daemon.mjs');

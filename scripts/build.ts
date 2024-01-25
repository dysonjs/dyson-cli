import path from 'node:path';
import { rollup, RollupOptions, OutputOptions } from 'rollup';
import minimist from 'minimist';
import extensions from 'rollup-plugin-extensions';
import { execa } from 'execa';
import json from '@rollup/plugin-json';
import esbuild, { minify } from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

import { log } from './helpers';

const CWD = process.cwd();
const ARGS = minimist(process.argv.slice(2));
const TSCONFIG = path.join(CWD, 'tsconfig.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PKG = require(path.join(CWD, 'package.json'));
const DEPS = Object.keys(PKG.dependencies || {});
const PEER_DEPS = Object.keys(PKG.peerDependencies || {});

async function build() {
  const output: OutputOptions[] = [];
  if (PKG.main) {
    output.push({
      file: path.resolve(CWD, PKG.main),
      format: 'cjs',
      exports: 'auto',
      sourcemap: false,
      inlineDynamicImports: true,
    });
  }
  if (PKG.module) {
    output.push({
      file: path.resolve(CWD, PKG.module),
      format: 'es',
      exports: 'auto',
      sourcemap: false,
      inlineDynamicImports: true,
    });
  }
  const options: RollupOptions = {
    strictDeprecations: true,
    input: path.join(CWD, 'src/index.ts'),
    external: [...DEPS, ...PEER_DEPS],
    plugins: [
      extensions({
        resolveIndex: true,
        extensions: ['.tsx', '.ts'],
      }),
      esbuild({
        sourceMap: false,
        minify: true,
        target: 'es2015',
        tsconfig: TSCONFIG,
      }),
      json({
        exclude: 'node_modules/**',
        compact: true,
        namedExports: true,
      }),
      minify({
        legalComments: 'none',
      }),
    ],
  };
  const bundle = await rollup(options);
  await Promise.all(output.map((o) => bundle.write(o)));
  log.success('Build successfully!');
}

async function buildDts() {
  const output: OutputOptions[] = [];
  if (PKG.types) {
    output.push({
      file: path.resolve(CWD, PKG.types),
      format: 'es',
    });
  }
  const options: RollupOptions = {
    strictDeprecations: true,
    input: path.join(CWD, 'src/index.ts'),
    external: [...DEPS, ...PEER_DEPS],
    plugins: [dts()],
  };
  const bundle = await rollup(options);
  await Promise.all(output.map((o) => bundle.write(o)));
  log.success('Build dts successfully!');
}

async function buildTypeCheck() {
  await execa(
    'tsc',
    [
      '--incremental',
      '--noEmit',
      '--tsBuildInfoFile',
      './node_modules/.cache/tsconfig.tsbuildinfo',
    ],
    {
      stdio: 'inherit',
      cwd: CWD,
    },
  );
}

async function startup() {
  try {
    if (ARGS.dts) {
      await buildDts();
      return;
    }
    if (ARGS['type-check']) {
      await buildTypeCheck();
      return;
    }
    await build();
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
}

startup();

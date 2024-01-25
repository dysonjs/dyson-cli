import path from 'node:path';
import fs from 'fs-extra';
import yaml from 'yaml';

const PNPM_WORKSPACE_FILE_PATH = path.join(__dirname, '../../', './pnpm-workspace.yaml');
const PNPM_WORKSPACE_FILE_CONTENT = fs.readFileSync(PNPM_WORKSPACE_FILE_PATH, 'utf-8');
const PNPM_WORKSPACE_CONFIG: { packages: string[] } = yaml.parse(PNPM_WORKSPACE_FILE_CONTENT);

export const BASE_DIR = path.join(__dirname, '../../');
export const TEMPLATE_DIR = path.join(__dirname, '../templates');
export const PACKAGES_DIR = PNPM_WORKSPACE_CONFIG.packages
  .map((p) => p.replace('/*', ''))
  .filter((p) => !p.startsWith('!'));

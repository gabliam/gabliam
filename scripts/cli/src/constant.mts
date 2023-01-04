import path from 'path';
import { fileURLToPath } from 'url';
import { findMonorepoConfig } from './utils/workspace-utils.mjs';

const __filename = fileURLToPath(import.meta.url);


const __dirname = path.dirname(__filename);

export const APP_DIR = path.resolve(__dirname, '../../../');

export const DIST_DIR = path.resolve(APP_DIR, 'dist');

export const monoRepo = findMonorepoConfig(APP_DIR);
